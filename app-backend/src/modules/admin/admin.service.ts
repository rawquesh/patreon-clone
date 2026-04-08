import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PostReport } from '@/database/schemas/report/post-report.schema';
import { UserReport } from '@/database/schemas/report/user-report.schema';
import { Post } from '@/database/schemas/post';
import { User } from '@/database/schemas/user';
import {
  WithheldPost,
  WithheldUser,
} from '@/database/schemas/report/withheld.schema';
import {
  CreatePostReportDto,
  CreateUserReportDto,
  UpdateReportStatusDto,
  UpdateUserReportStatusDto,
  WithholdPostDto,
  WithholdUserDto,
  GetReportsQueryDto,
  GetUserReportsQueryDto,
} from './admin.dto';

// Re-export DTOs used by both admin and public controllers
export {
  CreatePostReportDto,
  CreateUserReportDto,
  UpdateReportStatusDto,
  UpdateUserReportStatusDto,
  WithholdPostDto,
  WithholdUserDto,
  RestorePostDto,
  RestoreUserDto,
  GetReportsQueryDto,
  GetUserReportsQueryDto,
} from './admin.dto';

/**
 * Admin service -- handles all admin-only operations.
 * Endpoints: content moderation, user moderation, report management, statistics.
 */
@Injectable()
export class AdminService {
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

  // ==================== USER REPORTING (public) ====================

  /**
   * Any authenticated user can create a post report.
   * NOT admin-only.
   */
  async createPostReport(
    reportedBy: string,
    dto: CreatePostReportDto,
  ): Promise<PostReport> {
    const post = await this.postModel.findById(dto.postId);
    if (!post) throw new NotFoundException('Post not found');

    const reporter = await this.userModel.findById(reportedBy);
    if (!reporter) throw new NotFoundException('Reporter user not found');

    const existing = await this.postReportModel.findOne({
      post: dto.postId,
      reportedBy,
    });
    if (existing)
      throw new ConflictException('You have already reported this post');

    const report = new this.postReportModel({ ...dto, reportedBy });
    const saved = await report.save();

    await saved.populate([
      {
        path: 'post',
        select: 'title type creator',
        populate: {
          path: 'creator',
          select: 'displayName email profilePicture',
        },
      },
      { path: 'reportedBy', select: 'displayName email profilePicture' },
    ]);

    return saved;
  }

  /**
   * Any authenticated user can create a user report.
   * NOT admin-only.
   */
  async createUserReport(
    reportedBy: string,
    dto: CreateUserReportDto,
  ): Promise<UserReport> {
    if (dto.userId === reportedBy) {
      throw new BadRequestException('You cannot report yourself');
    }

    const reportedUser = await this.userModel.findById(dto.userId);
    if (!reportedUser) throw new NotFoundException('Reported user not found');

    const reporter = await this.userModel.findById(reportedBy);
    if (!reporter) throw new NotFoundException('Reporter user not found');

    const existing = await this.userReportModel.findOne({
      reportedUser: dto.userId,
      reportedBy,
    });
    if (existing)
      throw new ConflictException('You have already reported this user');

    const report = new this.userReportModel({ ...dto, reportedBy });
    const saved = await report.save();

    await saved.populate([
      {
        path: 'reportedUser',
        select:
          'displayName email profilePicture isCreator creatorUsername creatorCategory',
      },
      { path: 'reportedBy', select: 'displayName email profilePicture' },
    ]);

    return saved;
  }

  // ==================== POST REPORTS (admin) ====================

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

    const sortObj: any = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };
    const skip = (page - 1) * limit;

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
          { path: 'reportedBy', select: 'displayName email profilePicture' },
          { path: 'reviewedBy', select: 'displayName email' },
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
    const report = await this.postReportModel.findById(reportId).populate([
      {
        path: 'post',
        select: 'title type creator status description',
        populate: {
          path: 'creator',
          select: 'displayName email profilePicture creatorUsername',
        },
      },
      { path: 'reportedBy', select: 'displayName email profilePicture' },
      { path: 'reviewedBy', select: 'displayName email' },
    ]);
    if (!report) throw new NotFoundException('Report not found');
    return report;
  }

  async updatePostReportStatus(
    reportId: string,
    reviewerId: string,
    dto: UpdateReportStatusDto,
  ): Promise<PostReport> {
    const report = await this.postReportModel.findById(reportId);
    if (!report) throw new NotFoundException('Report not found');

    report.status = dto.status;
    if (dto.adminNotes) report.adminNotes = dto.adminNotes;
    report.reviewedBy = reviewerId as any;
    report.reviewedAt = new Date();
    await report.save();

    await report.populate([
      {
        path: 'post',
        select: 'title type creator status',
        populate: {
          path: 'creator',
          select: 'displayName email profilePicture creatorUsername',
        },
      },
      { path: 'reportedBy', select: 'displayName email profilePicture' },
      { path: 'reviewedBy', select: 'displayName email' },
    ]);

    return report;
  }

  async deletePostReport(reportId: string): Promise<void> {
    const result = await this.postReportModel.findByIdAndDelete(reportId);
    if (!result) throw new NotFoundException('Report not found');
  }

  async getPostReportsByPostId(postId: string): Promise<PostReport[]> {
    return this.postReportModel
      .find({ post: postId })
      .populate([
        { path: 'reportedBy', select: 'displayName email profilePicture' },
        { path: 'reviewedBy', select: 'displayName email' },
      ])
      .sort({ createdAt: -1 })
      .exec();
  }

  async getPostReportsCount(postId: string): Promise<number> {
    return this.postReportModel.countDocuments({ post: postId });
  }

  // ==================== USER REPORTS (admin) ====================

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

    const sortObj: any = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };
    const skip = (page - 1) * limit;

    const [reports, total] = await Promise.all([
      this.userReportModel
        .find(filter)
        .populate([
          {
            path: 'reportedUser',
            select:
              'displayName email profilePicture isCreator creatorUsername creatorCategory',
          },
          { path: 'reportedBy', select: 'displayName email profilePicture' },
          { path: 'reviewedBy', select: 'displayName email' },
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
    const report = await this.userReportModel.findById(reportId).populate([
      {
        path: 'reportedUser',
        select:
          'displayName email profilePicture isCreator creatorUsername creatorCategory bio',
      },
      { path: 'reportedBy', select: 'displayName email profilePicture' },
      { path: 'reviewedBy', select: 'displayName email' },
    ]);
    if (!report) throw new NotFoundException('Report not found');
    return report;
  }

  async updateUserReportStatus(
    reportId: string,
    reviewerId: string,
    dto: UpdateUserReportStatusDto,
  ): Promise<UserReport> {
    const report = await this.userReportModel.findById(reportId);
    if (!report) throw new NotFoundException('Report not found');

    report.status = dto.status;
    if (dto.adminNotes) report.adminNotes = dto.adminNotes;
    report.reviewedBy = reviewerId as any;
    report.reviewedAt = new Date();
    await report.save();

    await report.populate([
      {
        path: 'reportedUser',
        select:
          'displayName email profilePicture isCreator creatorUsername creatorCategory',
      },
      { path: 'reportedBy', select: 'displayName email profilePicture' },
      { path: 'reviewedBy', select: 'displayName email' },
    ]);

    return report;
  }

  async deleteUserReport(reportId: string): Promise<void> {
    const result = await this.userReportModel.findByIdAndDelete(reportId);
    if (!result) throw new NotFoundException('Report not found');
  }

  async getUserReportsByUserId(userId: string): Promise<UserReport[]> {
    return this.userReportModel
      .find({ reportedUser: userId })
      .populate([
        { path: 'reportedBy', select: 'displayName email profilePicture' },
        { path: 'reviewedBy', select: 'displayName email' },
      ])
      .sort({ createdAt: -1 })
      .exec();
  }

  async getUserReportsCount(userId: string): Promise<number> {
    return this.userReportModel.countDocuments({ reportedUser: userId });
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
      postReports: { total: totalPostReports, pending: pendingPostReports },
      userReports: { total: totalUserReports, pending: pendingUserReports },
      withheld: { posts: totalWithheldPosts, users: totalWithheldUsers },
    };
  }

  // ==================== WITHHELD POSTS (admin) ====================

  async withholdPost(
    postId: string,
    adminId: string,
    dto: WithholdPostDto,
  ): Promise<WithheldPost> {
    const post = await this.postModel.findById(postId).lean();
    if (!post) throw new NotFoundException('Post not found');

    const existing = await this.withheldPostModel.findOne({
      originalPostId: postId,
    });
    if (existing) throw new ConflictException('Post is already withheld');

    const withheldPost = new this.withheldPostModel({
      postData: post,
      originalPostId: postId,
      withheldBy: adminId,
      reason: dto.reason,
      adminNotes: dto.adminNotes,
      relatedReport: dto.relatedReportId,
    });
    await withheldPost.save();

    await this.postModel.findByIdAndDelete(postId);

    await withheldPost.populate({
      path: 'withheldBy',
      select: 'displayName email',
    });
    return withheldPost;
  }

  async restorePost(withheldPostId: string): Promise<Post> {
    const withheldPost = await this.withheldPostModel.findById(withheldPostId);
    if (!withheldPost) throw new NotFoundException('Withheld post not found');

    const existing = await this.postModel.findById(withheldPost.originalPostId);
    if (existing) throw new ConflictException('Post has already been restored');

    const postData = withheldPost.postData;
    const restoredPost = new this.postModel({
      ...postData,
      _id: withheldPost.originalPostId,
    });
    await restoredPost.save();

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
        .populate({ path: 'withheldBy', select: 'displayName email' })
        .sort({ withheldAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.withheldPostModel.countDocuments(),
    ]);
    return { posts, total };
  }

  async getWithheldPostById(id: string): Promise<WithheldPost> {
    const post = await this.withheldPostModel.findById(id).populate({
      path: 'withheldBy',
      select: 'displayName email',
    });
    if (!post) throw new NotFoundException('Withheld post not found');
    return post;
  }

  // ==================== WITHHELD USERS (admin) ====================

  async withholdUser(
    userId: string,
    adminId: string,
    dto: WithholdUserDto,
  ): Promise<WithheldUser> {
    if (userId === adminId)
      throw new BadRequestException('Cannot withhold yourself');

    const user = await this.userModel.findById(userId).lean();
    if (!user) throw new NotFoundException('User not found');
    if (user.isAdmin)
      throw new BadRequestException('Cannot withhold admin users');

    const existing = await this.withheldUserModel.findOne({
      originalUserId: userId,
    });
    if (existing) throw new ConflictException('User is already withheld');

    const withheldUser = new this.withheldUserModel({
      userData: user,
      originalUserId: userId,
      withheldBy: adminId,
      reason: dto.reason,
      adminNotes: dto.adminNotes,
      relatedReport: dto.relatedReportId,
    });
    await withheldUser.save();

    await this.userModel.findByIdAndDelete(userId);

    await withheldUser.populate({
      path: 'withheldBy',
      select: 'displayName email',
    });
    return withheldUser;
  }

  async restoreUser(withheldUserId: string): Promise<User> {
    const withheldUser = await this.withheldUserModel.findById(withheldUserId);
    if (!withheldUser) throw new NotFoundException('Withheld user not found');

    const existing = await this.userModel.findById(withheldUser.originalUserId);
    if (existing) throw new ConflictException('User has already been restored');

    const userData = withheldUser.userData;
    const restoredUser = new this.userModel({
      ...userData,
      _id: withheldUser.originalUserId,
    });
    await restoredUser.save();

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
        .populate({ path: 'withheldBy', select: 'displayName email' })
        .sort({ withheldAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.withheldUserModel.countDocuments(),
    ]);
    return { users, total };
  }

  async getWithheldUserById(id: string): Promise<WithheldUser> {
    const user = await this.withheldUserModel.findById(id).populate({
      path: 'withheldBy',
      select: 'displayName email',
    });
    if (!user) throw new NotFoundException('Withheld user not found');
    return user;
  }
}
