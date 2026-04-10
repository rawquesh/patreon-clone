import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Post, PostStatus } from '@/database/schemas/post';
import { User } from '@/database/schemas/user';
import { Notification, NotificationType } from '@/database/schemas/notification';
import { AuditLogService } from './audit-log.service';
import {
  AuditAction,
  AuditTargetType,
} from '../schemas/audit-log.schema';
import {
  GetContentQueryDto,
  WithholdContentDto,
  NotifyCreatorDto,
} from '../dto/content.dto';

@Injectable()
export class ContentService {
  constructor(
    @InjectModel(Post.name) private postModel: Model<Post>,
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Notification.name) private notificationModel: Model<Notification>,
    private readonly auditLogService: AuditLogService,
  ) {}

  async getPosts(query: GetContentQueryDto): Promise<{ posts: any[]; total: number }> {
    const {
      page = 1,
      limit = 20,
      search,
      creatorId,
      type,
      status,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = query;

    const filter: any = { isDeleted: { $ne: true } };
    if (creatorId) filter.creator = creatorId;
    if (type) filter.type = type;
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { textContent: { $regex: search, $options: 'i' } },
      ];
    }

    const sortObj: any = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };
    const skip = (page - 1) * limit;

    const [posts, total] = await Promise.all([
      this.postModel
        .find(filter)
        .populate('creator', 'displayName creatorUsername profilePicture')
        .sort(sortObj)
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      this.postModel.countDocuments(filter),
    ]);

    return {
      posts: posts.map((p: any) => ({
        ...p,
        id: p._id.toString(),
        creator: p.creator
          ? {
              ...p.creator,
              id: p.creator._id?.toString(),
            }
          : null,
      })),
      total,
    };
  }

  async getPostById(id: string): Promise<any> {
    const post = await this.postModel
      .findById(id)
      .populate('creator', 'displayName creatorUsername profilePicture email bio')
      .populate('comments.user', 'displayName profilePicture')
      .populate('likes.user', 'displayName profilePicture')
      .lean()
      .exec();

    if (!post) throw new NotFoundException('Post not found');

    return {
      ...post,
      id: post._id.toString(),
      creator: post.creator
        ? {
            ...post.creator,
            id: (post.creator as any)._id?.toString(),
          }
        : null,
    };
  }

  async withholdPost(
    postId: string,
    adminId: string,
    dto: WithholdContentDto,
  ): Promise<any> {
    const post = await this.postModel.findById(postId).lean();
    if (!post) throw new NotFoundException('Post not found');

    await this.postModel.findByIdAndUpdate(postId, {
      isActive: false,
      status: 'archived',
    });

    await this.auditLogService.log({
      action: AuditAction.POST_WITHHELD,
      targetType: AuditTargetType.POST,
      targetId: postId,
      performedBy: adminId,
      details: { reason: dto.reason, adminNotes: dto.adminNotes },
    });

    return {
      message: 'Post withheld successfully',
      postId,
    };
  }

  async restorePost(postId: string, adminId: string): Promise<any> {
    const post = await this.postModel.findById(postId);
    if (!post) throw new NotFoundException('Post not found');

    post.isActive = true;
    post.status = PostStatus.PUBLISHED;
    await post.save();

    await this.auditLogService.log({
      action: AuditAction.POST_RESTORED,
      targetType: AuditTargetType.POST,
      targetId: postId,
      performedBy: adminId,
    });

    return {
      message: 'Post restored successfully',
      postId,
    };
  }

  async deletePost(postId: string, adminId: string): Promise<any> {
    const post = await this.postModel.findById(postId);
    if (!post) throw new NotFoundException('Post not found');

    post.isDeleted = true;
    post.isActive = false;
    await post.save();

    await this.auditLogService.log({
      action: AuditAction.POST_DELETED,
      targetType: AuditTargetType.POST,
      targetId: postId,
      performedBy: adminId,
    });

    return {
      message: 'Post deleted successfully',
      postId,
    };
  }

  async notifyCreator(
    postId: string,
    adminId: string,
    dto: NotifyCreatorDto,
  ): Promise<any> {
    const post = await this.postModel.findById(postId).lean();
    if (!post) throw new NotFoundException('Post not found');

    const creatorId = (post.creator as any)?._id?.toString() || post.creator;
    if (!creatorId) throw new NotFoundException('Post has no associated creator');

    const creator = await this.userModel.findById(creatorId);
    if (!creator) throw new NotFoundException('Creator not found');

    const admin = await this.userModel.findById(adminId);
    const adminName = admin?.displayName || 'Admin';

    const notification = new this.notificationModel({
      recipient: new Types.ObjectId(creatorId),
      actor: new Types.ObjectId(adminId),
      type: NotificationType.ADMIN_CONTENT_NOTICE,
      post: new Types.ObjectId(postId),
      metadata: {
        message: dto.message,
        postTitle: post.title,
        adminName,
      },
      userMode: 'creator',
      isRead: false,
    });
    await notification.save();

    await this.auditLogService.log({
      action: AuditAction.POST_NOTIFIED,
      targetType: AuditTargetType.POST,
      targetId: postId,
      performedBy: adminId,
      details: { message: dto.message, creatorId },
    });

    return {
      message: 'Creator notified successfully',
      notificationId: notification._id.toString(),
    };
  }
}
