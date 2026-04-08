import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PostReport } from '@/schemas/post-reports.schema';
import { UserReport } from '@/schemas/user-reports.schema';
import { Post } from '@/schemas/posts.schema';
import { User } from '@/schemas/users.schema';
import { WithheldPost } from '@/schemas/withheld-posts.schema';
import { WithheldUser } from '@/schemas/withheld-users.schema';
import {
  CreatePostReportDto,
  CreateUserReportDto,
  UpdateReportStatusDto,
  UpdateUserReportStatusDto,
  GetReportsQueryDto,
  GetUserReportsQueryDto,
  WithholdPostDto,
  WithholdUserDto,
  RestorePostDto,
  RestoreUserDto,
} from './reports.dto';

@Injectable()
export class ReportsService {
  constructor(
    @InjectModel(PostReport.name)
    private readonly postReportModel: Model<PostReport>,
    @InjectModel(UserReport.name)
    private readonly userReportModel: Model<UserReport>,
    @InjectModel(Post.name)
    private readonly postModel: Model<Post>,
    @InjectModel(User.name)
    private readonly userModel: Model<User>,
    @InjectModel(WithheldPost.name)
    private readonly withheldPostModel: Model<WithheldPost>,
    @InjectModel(WithheldUser.name)
    private readonly withheldUserModel: Model<WithheldUser>,
  ) {}

  // ==================== POST REPORTS ====================

  async createPostReport(
    reportedBy: string,
    createPostReportDto: CreatePostReportDto,
  ): Promise<PostReport> {
    const { postId, reason, description, additionalContext } =
      createPostReportDto;

    // Verify the post exists
    const post = await this.postModel.findById(postId);
    if (!post) {
      throw new NotFoundException('Post not found');
    }

    // Verify the reporter exists
    const reporter = await this.userModel.findById(reportedBy);
    if (!reporter) {
      throw new NotFoundException('Reporter user not found');
    }

    // Check if user has already reported this post
    const existingReport = await this.postReportModel.findOne({
      post: postId,
      reportedBy,
    });

    if (existingReport) {
      throw new ConflictException('You have already reported this post');
    }

    // Create the report
    const report = new this.postReportModel({
      post: postId,
      reportedBy,
      reason,
      description,
      additionalContext,
    });

    const savedReport = await report.save();

    // Populate the references
    await savedReport.populate([
      {
        path: 'post',
        select: 'title type creator',
        populate: {
          path: 'creator',
          select: 'displayName email profilePicture',
        },
      },
      {
        path: 'reportedBy',
        select: 'displayName email profilePicture',
      },
    ]);

    return savedReport;
  }

  async getPostReports(
    query: GetReportsQueryDto,
  ): Promise<{ reports: PostReport[]; total: number }> {
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      status,
      reportedBy,
      postId,
    } = query;

    const filter: any = {};
    if (status) filter.status = status;
    if (reportedBy) filter.reportedBy = reportedBy;
    if (postId) filter.post = postId;

    const skip = (page - 1) * limit;
    const sortObj: any = {};
    sortObj[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const [reports, total] = await Promise.all([
      this.postReportModel
        .find(filter)
        .populate([
          {
            path: 'post',
            select: 'title type creator status',
            populate: {
              path: 'creator',
              select: 'displayName email profilePicture creatorUsername',
            },
          },
          {
            path: 'reportedBy',
            select: 'displayName email profilePicture',
          },
          {
            path: 'reviewedBy',
            select: 'displayName email',
          },
        ])
        .sort(sortObj)
        .skip(skip)
        .limit(limit)
        .exec(),
      this.postReportModel.countDocuments(filter),
    ]);

    return { reports, total };
  }

  async getPostReportById(reportId: string): Promise<PostReport> {
    const report = await this.postReportModel
      .findById(reportId)
      .populate([
        {
          path: 'post',
          select: 'title type creator status description',
          populate: {
            path: 'creator',
            select: 'displayName email profilePicture creatorUsername',
          },
        },
        {
          path: 'reportedBy',
          select: 'displayName email profilePicture',
        },
        {
          path: 'reviewedBy',
          select: 'displayName email',
        },
      ])
      .exec();

    if (!report) {
      throw new NotFoundException('Report not found');
    }

    return report;
  }

  async updatePostReportStatus(
    reportId: string,
    reviewerId: string,
    updateStatusDto: UpdateReportStatusDto,
  ): Promise<PostReport> {
    const { status, adminNotes } = updateStatusDto;

    const report = await this.postReportModel.findById(reportId);
    if (!report) {
      throw new NotFoundException('Report not found');
    }

    report.status = status;
    if (adminNotes) {
      report.adminNotes = adminNotes;
    }
    report.reviewedBy = reviewerId as any;
    report.reviewedAt = new Date();

    await report.save();

    // Populate the references
    await report.populate([
      {
        path: 'post',
        select: 'title type creator status',
        populate: {
          path: 'creator',
          select: 'displayName email profilePicture creatorUsername',
        },
      },
      {
        path: 'reportedBy',
        select: 'displayName email profilePicture',
      },
      {
        path: 'reviewedBy',
        select: 'displayName email',
      },
    ]);

    return report;
  }

  async deletePostReport(reportId: string): Promise<void> {
    const result = await this.postReportModel.findByIdAndDelete(reportId);
    if (!result) {
      throw new NotFoundException('Report not found');
    }
  }

  async getPostReportsByPostId(postId: string): Promise<PostReport[]> {
    const reports = await this.postReportModel
      .find({ post: postId })
      .populate([
        {
          path: 'reportedBy',
          select: 'displayName email profilePicture',
        },
        {
          path: 'reviewedBy',
          select: 'displayName email',
        },
      ])
      .sort({ createdAt: -1 })
      .exec();

    return reports;
  }

  async getPostReportsCount(postId: string): Promise<number> {
    return await this.postReportModel.countDocuments({ post: postId });
  }

  // ==================== USER REPORTS ====================

  async createUserReport(
    reportedBy: string,
    createUserReportDto: CreateUserReportDto,
  ): Promise<UserReport> {
    const { userId, reason, description, additionalContext } =
      createUserReportDto;

    // Verify the reported user exists
    const reportedUser = await this.userModel.findById(userId);
    if (!reportedUser) {
      throw new NotFoundException('Reported user not found');
    }

    // Verify the reporter exists
    const reporter = await this.userModel.findById(reportedBy);
    if (!reporter) {
      throw new NotFoundException('Reporter user not found');
    }

    // Prevent self-reporting
    if (userId === reportedBy) {
      throw new BadRequestException('You cannot report yourself');
    }

    // Check if user has already reported this user
    const existingReport = await this.userReportModel.findOne({
      reportedUser: userId,
      reportedBy,
    });

    if (existingReport) {
      throw new ConflictException('You have already reported this user');
    }

    // Create the report
    const report = new this.userReportModel({
      reportedUser: userId,
      reportedBy,
      reason,
      description,
      additionalContext,
    });

    const savedReport = await report.save();

    // Populate the references
    await savedReport.populate([
      {
        path: 'reportedUser',
        select:
          'displayName email profilePicture isCreator creatorUsername creatorCategory',
      },
      {
        path: 'reportedBy',
        select: 'displayName email profilePicture',
      },
    ]);

    return savedReport;
  }

  async getUserReports(
    query: GetUserReportsQueryDto,
  ): Promise<{ reports: UserReport[]; total: number }> {
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      status,
      reportedBy,
      userId,
    } = query;

    const filter: any = {};
    if (status) filter.status = status;
    if (reportedBy) filter.reportedBy = reportedBy;
    if (userId) filter.reportedUser = userId;

    const skip = (page - 1) * limit;
    const sortObj: any = {};
    sortObj[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const [reports, total] = await Promise.all([
      this.userReportModel
        .find(filter)
        .populate([
          {
            path: 'reportedUser',
            select:
              'displayName email profilePicture isCreator creatorUsername creatorCategory',
          },
          {
            path: 'reportedBy',
            select: 'displayName email profilePicture',
          },
          {
            path: 'reviewedBy',
            select: 'displayName email',
          },
        ])
        .sort(sortObj)
        .skip(skip)
        .limit(limit)
        .exec(),
      this.userReportModel.countDocuments(filter),
    ]);

    return { reports, total };
  }

  async getUserReportById(reportId: string): Promise<UserReport> {
    const report = await this.userReportModel
      .findById(reportId)
      .populate([
        {
          path: 'reportedUser',
          select:
            'displayName email profilePicture isCreator creatorUsername creatorCategory bio',
        },
        {
          path: 'reportedBy',
          select: 'displayName email profilePicture',
        },
        {
          path: 'reviewedBy',
          select: 'displayName email',
        },
      ])
      .exec();

    if (!report) {
      throw new NotFoundException('Report not found');
    }

    return report;
  }

  async updateUserReportStatus(
    reportId: string,
    reviewerId: string,
    updateStatusDto: UpdateUserReportStatusDto,
  ): Promise<UserReport> {
    const { status, adminNotes } = updateStatusDto;

    const report = await this.userReportModel.findById(reportId);
    if (!report) {
      throw new NotFoundException('Report not found');
    }

    report.status = status;
    if (adminNotes) {
      report.adminNotes = adminNotes;
    }
    report.reviewedBy = reviewerId as any;
    report.reviewedAt = new Date();

    await report.save();

    // Populate the references
    await report.populate([
      {
        path: 'reportedUser',
        select:
          'displayName email profilePicture isCreator creatorUsername creatorCategory',
      },
      {
        path: 'reportedBy',
        select: 'displayName email profilePicture',
      },
      {
        path: 'reviewedBy',
        select: 'displayName email',
      },
    ]);

    return report;
  }

  async deleteUserReport(reportId: string): Promise<void> {
    const result = await this.userReportModel.findByIdAndDelete(reportId);
    if (!result) {
      throw new NotFoundException('Report not found');
    }
  }

  async getUserReportsByUserId(userId: string): Promise<UserReport[]> {
    const reports = await this.userReportModel
      .find({ reportedUser: userId })
      .populate([
        {
          path: 'reportedBy',
          select: 'displayName email profilePicture',
        },
        {
          path: 'reviewedBy',
          select: 'displayName email',
        },
      ])
      .sort({ createdAt: -1 })
      .exec();

    return reports;
  }

  async getUserReportsCount(userId: string): Promise<number> {
    return await this.userReportModel.countDocuments({ reportedUser: userId });
  }

  // ==================== STATISTICS ====================

  async getReportStatistics(): Promise<any> {
    const [
      totalPostReports,
      pendingPostReports,
      totalUserReports,
      pendingUserReports,
      totalWithheldPosts,
      totalWithheldUsers,
    ] = await Promise.all([
      this.postReportModel.countDocuments(),
      this.postReportModel.countDocuments({ status: 'pending' }),
      this.userReportModel.countDocuments(),
      this.userReportModel.countDocuments({ status: 'pending' }),
      this.withheldPostModel.countDocuments(),
      this.withheldUserModel.countDocuments(),
    ]);

    return {
      postReports: {
        total: totalPostReports,
        pending: pendingPostReports,
      },
      userReports: {
        total: totalUserReports,
        pending: pendingUserReports,
      },
      withheld: {
        posts: totalWithheldPosts,
        users: totalWithheldUsers,
      },
    };
  }

  // ==================== WITHHOLD POST ====================

  async withholdPost(
    postId: string,
    adminId: string,
    withholdDto: WithholdPostDto,
  ): Promise<WithheldPost> {
    // Find the post
    const post = await this.postModel.findById(postId).lean();
    if (!post) {
      throw new NotFoundException('Post not found');
    }

    // Check if already withheld
    const existingWithheld = await this.withheldPostModel.findOne({
      originalPostId: postId,
    });
    if (existingWithheld) {
      throw new ConflictException('Post is already withheld');
    }

    // Create withheld post record
    const withheldPost = new this.withheldPostModel({
      postData: post,
      originalPostId: postId,
      withheldBy: adminId,
      reason: withholdDto.reason,
      adminNotes: withholdDto.adminNotes,
      relatedReport: withholdDto.relatedReportId,
    });

    await withheldPost.save();

    // Delete the post from posts collection
    await this.postModel.findByIdAndDelete(postId);

    // Populate the references
    await withheldPost.populate({
      path: 'withheldBy',
      select: 'displayName email',
    });

    return withheldPost;
  }

  async restorePost(
    withheldPostId: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    adminId: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    restoreDto: RestorePostDto,
  ): Promise<Post> {
    // Find the withheld post
    const withheldPost = await this.withheldPostModel.findById(withheldPostId);
    if (!withheldPost) {
      throw new NotFoundException('Withheld post not found');
    }

    // Check if post already exists (in case of duplicate restoration attempt)
    const existingPost = await this.postModel.findById(
      withheldPost.originalPostId,
    );
    if (existingPost) {
      throw new ConflictException('Post has already been restored');
    }

    // Restore the post to posts collection
    const postData = withheldPost.postData;
    const restoredPost = new this.postModel({
      ...postData,
      _id: withheldPost.originalPostId,
    });

    await restoredPost.save();

    // Delete from withheld collection
    await this.withheldPostModel.findByIdAndDelete(withheldPostId);

    return restoredPost;
  }

  async getWithheldPosts(
    page: number = 1,
    limit: number = 10,
  ): Promise<{ posts: WithheldPost[]; total: number }> {
    const skip = (page - 1) * limit;

    const [posts, total] = await Promise.all([
      this.withheldPostModel
        .find()
        .populate({
          path: 'withheldBy',
          select: 'displayName email',
        })
        .sort({ withheldAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.withheldPostModel.countDocuments(),
    ]);

    return { posts, total };
  }

  async getWithheldPostById(withheldPostId: string): Promise<WithheldPost> {
    const withheldPost = await this.withheldPostModel
      .findById(withheldPostId)
      .populate({
        path: 'withheldBy',
        select: 'displayName email',
      })
      .exec();

    if (!withheldPost) {
      throw new NotFoundException('Withheld post not found');
    }

    return withheldPost;
  }

  // ==================== WITHHOLD USER ====================

  async withholdUser(
    userId: string,
    adminId: string,
    withholdDto: WithholdUserDto,
  ): Promise<WithheldUser> {
    // Prevent withholding self
    if (userId === adminId) {
      throw new BadRequestException('Cannot withhold yourself');
    }

    // Find the user
    const user = await this.userModel.findById(userId).lean();
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Prevent withholding other admins
    if (user.isAdmin) {
      throw new BadRequestException('Cannot withhold admin users');
    }

    // Check if already withheld
    const existingWithheld = await this.withheldUserModel.findOne({
      originalUserId: userId,
    });
    if (existingWithheld) {
      throw new ConflictException('User is already withheld');
    }

    // Create withheld user record
    const withheldUser = new this.withheldUserModel({
      userData: user,
      originalUserId: userId,
      withheldBy: adminId,
      reason: withholdDto.reason,
      adminNotes: withholdDto.adminNotes,
      relatedReport: withholdDto.relatedReportId,
    });

    await withheldUser.save();

    // Delete the user from users collection
    await this.userModel.findByIdAndDelete(userId);

    // Populate the references
    await withheldUser.populate({
      path: 'withheldBy',
      select: 'displayName email',
    });

    return withheldUser;
  }

  async restoreUser(
    withheldUserId: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    adminId: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    restoreDto: RestoreUserDto,
  ): Promise<User> {
    // Find the withheld user
    const withheldUser = await this.withheldUserModel.findById(withheldUserId);
    if (!withheldUser) {
      throw new NotFoundException('Withheld user not found');
    }

    // Check if user already exists (in case of duplicate restoration attempt)
    const existingUser = await this.userModel.findById(
      withheldUser.originalUserId,
    );
    if (existingUser) {
      throw new ConflictException('User has already been restored');
    }

    // Restore the user to users collection
    const userData = withheldUser.userData;
    const restoredUser = new this.userModel({
      ...userData,
      _id: withheldUser.originalUserId,
    });

    await restoredUser.save();

    // Delete from withheld collection
    await this.withheldUserModel.findByIdAndDelete(withheldUserId);

    return restoredUser;
  }

  async getWithheldUsers(
    page: number = 1,
    limit: number = 10,
  ): Promise<{ users: WithheldUser[]; total: number }> {
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      this.withheldUserModel
        .find()
        .populate({
          path: 'withheldBy',
          select: 'displayName email',
        })
        .sort({ withheldAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.withheldUserModel.countDocuments(),
    ]);

    return { users, total };
  }

  async getWithheldUserById(withheldUserId: string): Promise<WithheldUser> {
    const withheldUser = await this.withheldUserModel
      .findById(withheldUserId)
      .populate({
        path: 'withheldBy',
        select: 'displayName email',
      })
      .exec();

    if (!withheldUser) {
      throw new NotFoundException('Withheld user not found');
    }

    return withheldUser;
  }
}
