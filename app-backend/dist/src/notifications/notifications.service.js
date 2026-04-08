"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const notification_1 = require("../database/schemas/notification");
const user_1 = require("../database/schemas/user");
const post_1 = require("../database/schemas/post");
const push_notifications_service_1 = require("../push-notifications/push-notifications.service");
let NotificationsService = class NotificationsService {
    constructor(notificationModel, userModel, postModel, pushNotificationsService) {
        this.notificationModel = notificationModel;
        this.userModel = userModel;
        this.postModel = postModel;
        this.pushNotificationsService = pushNotificationsService;
    }
    async create(createNotificationDto) {
        console.log('create function');
        const { recipient, actor, type, post, comment, metadata, userMode } = createNotificationDto;
        const [recipientUser, actorUser] = await Promise.all([
            this.userModel.findById(recipient),
            this.userModel.findById(actor),
        ]);
        if (!recipientUser || !actorUser) {
            throw new common_1.NotFoundException('User not found');
        }
        let postDoc = null;
        if (post) {
            postDoc = await this.postModel.findById(post);
            if (!postDoc) {
                throw new common_1.NotFoundException('Post not found');
            }
        }
        console.log('Setting notification');
        const notification = new this.notificationModel({
            recipient: new mongoose_2.Types.ObjectId(recipient),
            actor: new mongoose_2.Types.ObjectId(actor),
            type,
            post: post ? new mongoose_2.Types.ObjectId(post) : undefined,
            comment: comment ? { content: comment } : undefined,
            metadata,
            isRead: false,
            userMode,
            link: createNotificationDto.link,
        });
        const actorName = actorUser.displayName ||
            `${actorUser.firstName} ${actorUser.lastName}` ||
            'Someone';
        const postTitle = postDoc?.title;
        let pushPayload;
        console.log({ type });
        if (type === notification_1.NotificationType.LIKE) {
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
        }
        else if (type === notification_1.NotificationType.COMMENT ||
            type === notification_1.NotificationType.COMMENT_REPLY) {
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
        }
        else if (type === notification_1.NotificationType.NEW_MEMBER) {
            pushPayload = {
                title: 'You have a new member!',
                body: `${actorName} just joined your page.`,
                data: {
                    notification_type: 'NEW_MEMBER',
                    user_type: 'CREATOR',
                    memberId: actor,
                },
            };
        }
        else if (type === notification_1.NotificationType.DIRECT_MESSAGE) {
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
        }
        else if (type === notification_1.NotificationType.GROUP_CHAT_CREATED) {
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
        }
        else if (type === notification_1.NotificationType.CHAT_MESSAGE) {
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
        }
        else if (type === notification_1.NotificationType.NEW_POST) {
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
        }
        else {
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
    async findAllForUser(userId, filter) {
        const queryFilter = { recipient: new mongoose_2.Types.ObjectId(userId) };
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
        const transformedNotifications = notifications.map((notification) => this.transformNotification(notification));
        return {
            notifications: transformedNotifications,
            unreadCount,
        };
    }
    async markAsRead(userId, notificationIds) {
        const objectIds = notificationIds.map((id) => new mongoose_2.Types.ObjectId(id));
        const result = await this.notificationModel.updateMany({
            _id: { $in: objectIds },
            recipient: new mongoose_2.Types.ObjectId(userId),
        }, {
            $set: {
                isRead: true,
                readAt: new Date(),
            },
        });
        return result.modifiedCount > 0;
    }
    async markAllAsRead(userId) {
        const result = await this.notificationModel.updateMany({
            recipient: new mongoose_2.Types.ObjectId(userId),
            isRead: false,
        }, {
            $set: {
                isRead: true,
                readAt: new Date(),
            },
        });
        return result.modifiedCount > 0;
    }
    async getUnreadCount(userId) {
        return this.notificationModel.countDocuments({
            recipient: new mongoose_2.Types.ObjectId(userId),
            isRead: false,
        });
    }
    async deleteNotification(userId, notificationId) {
        const result = await this.notificationModel.deleteOne({
            _id: new mongoose_2.Types.ObjectId(notificationId),
            recipient: new mongoose_2.Types.ObjectId(userId),
        });
        if (result.deletedCount === 0) {
            throw new common_1.NotFoundException('Notification not found or you do not have permission to delete it');
        }
        return result.deletedCount > 0;
    }
    transformNotification(notification) {
        const actor = notification.actor;
        const post = notification.post;
        const actorData = {
            id: actor?._id?.toString() || '',
            name: actor?.displayName || actor?.firstName || 'User',
            profilePicture: actor?.profilePicture || '',
        };
        let postData = undefined;
        if (post) {
            postData = {
                id: post._id?.toString(),
                title: post.title || '',
                thumbnailUrl: this.getPostThumbnail(post),
            };
        }
        let commentData = undefined;
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
    getPostThumbnail(post) {
        if (!post)
            return '/default-thumbnail.png';
        if (post.thumbnailUrl) {
            return post.thumbnailUrl;
        }
        if (post.mediaUrls && post.mediaUrls.length > 0) {
            return post.mediaUrls[0];
        }
        return '/default-thumbnail.png';
    }
};
exports.NotificationsService = NotificationsService;
exports.NotificationsService = NotificationsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(notification_1.Notification.name)),
    __param(1, (0, mongoose_1.InjectModel)(user_1.User.name)),
    __param(2, (0, mongoose_1.InjectModel)(post_1.Post.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        push_notifications_service_1.PushNotificationsService])
], NotificationsService);
//# sourceMappingURL=notifications.service.js.map