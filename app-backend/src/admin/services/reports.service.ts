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
import { AuditLogService } from './audit-log.service';
import {
  AuditAction,
  AuditTargetType,
} from '../schemas/audit-log.schema';
import {
  CreatePostReportDto,
  CreateUserReportDto,
  UpdateReportStatusDto,
  UpdateUserReportStatusDto,
  GetReportsQueryDto,
  GetUserReportsQueryDto,
} from '../dto/reports.dto';

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
    private readonly auditLogService: AuditLogService,
  ) {}

  // ==================== USER REPORTING (public) ====================

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

    await this.auditLogService.log({
      action: dto.status === 'resolved'
        ? AuditAction.REPORT_RESOLVED
        : AuditAction.REPORT_DISMISSED,
      targetType: AuditTargetType.REPORT,
      targetId: reportId,
      performedBy: reviewerId,
      details: {
        status: dto.status,
        adminNotes: dto.adminNotes,
        reportType: 'post',
      },
    });

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

    await this.auditLogService.log({
      action: dto.status === 'resolved'
        ? AuditAction.REPORT_RESOLVED
        : AuditAction.REPORT_DISMISSED,
      targetType: AuditTargetType.REPORT,
      targetId: reportId,
      performedBy: reviewerId,
      details: {
        status: dto.status,
        adminNotes: dto.adminNotes,
        reportType: 'user',
      },
    });

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
    ] = await Promise.all([
      this.postReportModel.countDocuments(),
      this.postReportModel.countDocuments({ status: 'pending' }),
      this.userReportModel.countDocuments(),
      this.userReportModel.countDocuments({ status: 'pending' }),
    ]);

    return {
      postReports: { total: totalPostReports, pending: pendingPostReports },
      userReports: { total: totalUserReports, pending: pendingUserReports },
    };
  }
}
