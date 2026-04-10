import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  Notification,
  NotificationType,
} from '@/database/schemas/notification';
import { User } from '@/database/schemas/user';
import { Post } from '@/database/schemas/post';
import {
  CreateNotificationDto,
  NotificationFilterDto,
  NotificationResponseDto,
  NotificationActorDto,
  NotificationPostDto,
  CommentDto,
} from './notifications.dto';
import { PushNotificationsService } from '@/push-notifications/push-notifications.service';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectModel(Notification.name)
    private notificationModel: Model<Notification>,
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Post.name) private postModel: Model<Post>,
    private pushNotificationsService: PushNotificationsService,
  ) {}

  async create(
    createNotificationDto: CreateNotificationDto,
  ): Promise<Notification> {
    console.log('create function');
    const { recipient, actor, type, post, comment, metadata, userMode } =
      createNotificationDto;

    const [recipientUser, actorUser] = await Promise.all([
      this.userModel.findById(recipient),
      this.userModel.findById(actor),
    ]);

    if (!recipientUser || !actorUser) {
      throw new NotFoundException('User not found');
    }
    let postDoc: Post | null = null;
    if (post) {
      postDoc = await this.postModel.findById(post);
      if (!postDoc) {
        throw new NotFoundException('Post not found');
      }
    }
    console.log('Setting notification');
    const notification = new this.notificationModel({
      recipient: new Types.ObjectId(recipient),
      actor: new Types.ObjectId(actor),
      type,
      post: post ? new Types.ObjectId(post) : undefined,
      comment: comment ? { content: comment } : undefined,
      metadata,
      isRead: false,
      userMode,
      link: createNotificationDto.link,
    });

    const actorName =
      actorUser.displayName ||
      `${actorUser.firstName} ${actorUser.lastName}` ||
      'Someone';
    const postTitle = postDoc?.title;
    let pushPayload: {
      title: string;
      body: string;
      data: { [key: string]: string };
    };
    console.log({ type });
    if (type === NotificationType.LIKE) {
      pushPayload = {
        title: 'Someone liked your post!',
        body: `${actorName} liked your post: "${postTitle}"`,
        data: {
          notification_type: 'POST_LIKE',
          user_type: 'CREATOR',
          postId: post,
          likerId: actor,
        },
      };
    } else if (
      type === NotificationType.COMMENT ||
      type === NotificationType.COMMENT_REPLY
    ) {
      pushPayload = {
        title: `${actorName} commented`,
        body: `"${comment.substring(0, 100)}..."`,
        data: {
          notification_type: 'NEW_COMMENT',
          user_type: 'CREATOR',
          postId: post,
          commentId: metadata?.commentId || '',
        },
      };
    } else if (type === NotificationType.NEW_MEMBER) {
      pushPayload = {
        title: 'You have a new member!',
        body: `${actorName} just joined your page.`,
        data: {
          notification_type: 'NEW_MEMBER',
          user_type: 'CREATOR',
          memberId: actor,
        },
      };
    } else if (type === NotificationType.DIRECT_MESSAGE) {
      pushPayload = {
        title: actorName,
        body: `"${comment.substring(0, 100)}..."`,
        data: {
          notification_type: 'DIRECT_MESSAGE',
          user_type: userMode.toUpperCase(),
          conversationId: metadata?.chatId || '',
          senderId: actor,
        },
      };
    } else if (type === NotificationType.GROUP_CHAT_CREATED) {
      pushPayload = {
        title: 'New Group Chat',
        body: `${actorName} added you to a new group chat.`,
        data: {
          notification_type: 'GROUP_CHAT_CREATED',
          user_type: 'MEMBER',
          conversationId: metadata?.chatId.toString() || '',
          creatorId: actor,
        },
      };
    } else if (type === NotificationType.CHAT_MESSAGE) {
      pushPayload = {
        title: `${actorName} sent a message`,
        body: comment,
        data: {
          notification_type: 'CHAT_MESSAGE',
          user_type: userMode.toUpperCase(),
          conversationId: metadata?.chatId || '',
          senderId: actor,
        },
      };
    } else if (type === NotificationType.NEW_POST) {
      pushPayload = {
        title: `${actorName} just posted`,
        body: `"${postTitle}"`,
        data: {
          notification_type: 'NEW_POST',
          user_type: 'MEMBER',
          postId: post,
          creatorId: actor,
        },
      };
    } else if (type === NotificationType.ADMIN_CONTENT_NOTICE) {
      const message = metadata?.message || 'You have received an administrative notice regarding your content.';
      pushPayload = {
        title: 'Administrative Notice',
        body: message.substring(0, 100),
        data: {
          notification_type: 'ADMIN_CONTENT_NOTICE',
          user_type: 'CREATOR',
          postId: post || '',
          actorId: actor,
        },
      };
    } else {
      pushPayload = {
        title: 'You have a new notification',
        body: `${actorName} ${type.replace(/_/g, ' ')}`,
        data: {
          notification_type: type.toUpperCase(),
          user_type: userMode.toUpperCase(),
          actorId: actor,
        },
      };
    }

    // console.log({ pushPayload });
    if (pushPayload) {
      await this.pushNotificationsService.sendPushNotification({
        userId: recipient,
        title: pushPayload.title,
        body: pushPayload.body,
        data: pushPayload.data,
      });
    }

    return notification.save();
  }

  async findAllForUser(
    userId: string,
    filter?: NotificationFilterDto,
  ): Promise<{
    notifications: NotificationResponseDto[];
    unreadCount: number;
  }> {
    const queryFilter: any = { recipient: new Types.ObjectId(userId) };
    const page = filter?.page || 1;
    const limit = filter?.limit || 10;
    const skip = (page - 1) * limit;

    if (filter) {
      if (filter.unreadOnly) {
        queryFilter.isRead = false;
      }

      if (filter.type && filter.type.length > 0) {
        queryFilter.type = { $in: filter.type };
      }

      if (filter.userMode) {
        queryFilter.userMode = filter.userMode;
      }
    }

    const [notifications, unreadCount] = await Promise.all([
      this.notificationModel
        .find(queryFilter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('actor', 'displayName firstName lastName profilePicture')
        .populate('post', 'title mediaUrls thumbnailUrl link')
        .exec(),
      this.notificationModel.countDocuments({
        ...queryFilter,
        isRead: false,
      }),
    ]);

    const transformedNotifications = notifications.map((notification) =>
      this.transformNotification(notification),
    );

    return {
      notifications: transformedNotifications,
      unreadCount,
    };
  }

  async markAsRead(
    userId: string,
    notificationIds: string[],
  ): Promise<boolean> {
    const objectIds = notificationIds.map((id) => new Types.ObjectId(id));

    const result = await this.notificationModel.updateMany(
      {
        _id: { $in: objectIds },
        recipient: new Types.ObjectId(userId),
      },
      {
        $set: {
          isRead: true,
          readAt: new Date(),
        },
      },
    );

    return result.modifiedCount > 0;
  }

  async markAllAsRead(userId: string): Promise<boolean> {
    const result = await this.notificationModel.updateMany(
      {
        recipient: new Types.ObjectId(userId),
        isRead: false,
      },
      {
        $set: {
          isRead: true,
          readAt: new Date(),
        },
      },
    );

    return result.modifiedCount > 0;
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.notificationModel.countDocuments({
      recipient: new Types.ObjectId(userId),
      isRead: false,
    });
  }

  async deleteNotification(
    userId: string,
    notificationId: string,
  ): Promise<boolean> {
    const result = await this.notificationModel.deleteOne({
      _id: new Types.ObjectId(notificationId),
      recipient: new Types.ObjectId(userId),
    });

    if (result.deletedCount === 0) {
      throw new NotFoundException(
        'Notification not found or you do not have permission to delete it',
      );
    }

    return result.deletedCount > 0;
  }

  private transformNotification(notification: any): NotificationResponseDto {
    const actor = notification.actor as User;
    const post = notification.post as Post;

    const actorData: NotificationActorDto = {
      id: actor?._id?.toString() || '',
      name: actor?.displayName || actor?.firstName || 'User',
      profilePicture: actor?.profilePicture || '',
    };

    let postData: NotificationPostDto | undefined = undefined;
    if (post) {
      postData = {
        id: post._id?.toString(),
        title: post.title || '',
        thumbnailUrl: this.getPostThumbnail(post),
      };
    }

    let commentData: CommentDto | undefined = undefined;
    if (notification.comment) {
      commentData = {
        content: notification.comment.content || '',
      };
    }

    return {
      id: notification._id.toString(),
      actor: actorData,
      type: notification.type,
      post: postData,
      comment: commentData,
      metadata: notification.metadata || {},
      isRead: notification.isRead,
      createdAt: notification.createdAt.toISOString(),
      timeStamp: notification.createdAt.toISOString(),
      userMode: notification.userMode,
      link: notification.link,
    };
  }

  private getPostThumbnail(post: Post): string {
    if (!post) return '/default-thumbnail.png';

    if (post.thumbnailUrl) {
      return post.thumbnailUrl;
    }

    if (post.mediaUrls && post.mediaUrls.length > 0) {
      return post.mediaUrls[0];
    }

    return '/default-thumbnail.png';
  }
}
