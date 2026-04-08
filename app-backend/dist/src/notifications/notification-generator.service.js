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
exports.NotificationGeneratorService = void 0;
const common_1 = require("@nestjs/common");
const notifications_service_1 = require("./notifications.service");
const notification_1 = require("../database/schemas/notification");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const subscription_1 = require("../database/schemas/subscription");
const user_1 = require("../database/schemas/user");
let NotificationGeneratorService = class NotificationGeneratorService {
    constructor(notificationsService, subscriptionModel, userModel) {
        this.notificationsService = notificationsService;
        this.subscriptionModel = subscriptionModel;
        this.userModel = userModel;
    }
    async generateLikeNotification(postId, actorId, recipientId) {
        if (actorId === recipientId)
            return;
        await this.notificationsService.create({
            recipient: recipientId,
            actor: actorId,
            type: notification_1.NotificationType.LIKE,
            post: postId,
            userMode: 'creator',
            link: `/post/${postId}`,
        });
    }
    async generateCommentNotification(postId, actorId, recipientId, comment) {
        if (actorId === recipientId)
            return;
        const recipient = await this.userModel.findById(recipientId);
        if (!recipient || recipient.creatorNotifyOnComments === false) {
            return;
        }
        await this.notificationsService.create({
            recipient: recipientId,
            actor: actorId,
            type: notification_1.NotificationType.COMMENT,
            post: postId,
            comment,
            userMode: 'creator',
            link: `/post/${postId}`,
        });
    }
    async generateNewMemberNotification(subscriberId, creatorId, membershipTier) {
        const creator = await this.userModel
            .findById(creatorId)
            .select('creatorNotifyOnNewMember')
            .lean();
        if (!creator || !creator.creatorNotifyOnNewMember) {
            return;
        }
        await this.notificationsService.create({
            recipient: creatorId,
            actor: subscriberId,
            type: notification_1.NotificationType.NEW_MEMBER,
            comment: `Subscribed to ${membershipTier} tier`,
            userMode: 'creator',
        });
    }
    async generateUpgradeNotification(subscriberId, creatorId, newTier, previousTier) {
        await this.notificationsService.create({
            recipient: creatorId,
            actor: subscriberId,
            type: notification_1.NotificationType.UPGRADE,
            comment: `Upgraded from ${previousTier} to ${newTier} tier`,
            userMode: 'creator',
        });
    }
    async generateDowngradeNotification(subscriberId, creatorId, newTier, previousTier) {
        await this.notificationsService.create({
            recipient: creatorId,
            actor: subscriberId,
            type: notification_1.NotificationType.DOWNGRADE,
            comment: `Downgraded from ${previousTier} to ${newTier} tier`,
            userMode: 'creator',
        });
    }
    async generateCancellationNotification(subscriberId, creatorId, tier) {
        await this.notificationsService.create({
            recipient: creatorId,
            actor: subscriberId,
            type: notification_1.NotificationType.CANCELLATION,
            comment: `Cancelled subscription to ${tier} tier`,
            userMode: 'creator',
        });
    }
    async generateNewPostNotification(creatorId, postId, postTitle) {
        const subscribers = await this.subscriptionModel
            .find({
            creator: creatorId,
            status: 'active',
        })
            .select('subscriber');
        const subscriberIds = subscribers.map((sub) => sub.subscriber);
        if (subscriberIds.length === 0) {
            return;
        }
        const optedInUsers = await this.userModel
            .find({
            _id: { $in: subscriberIds },
            memberNotifyOnNewPost: true,
        })
            .select('_id');
        const optedInUserIds = optedInUsers.map((user) => user._id.toString());
        for (const recipientId of optedInUserIds) {
            await this.notificationsService.create({
                recipient: recipientId,
                actor: creatorId,
                type: notification_1.NotificationType.NEW_POST,
                post: postId,
                comment: `Published a new post: ${postTitle}`,
                userMode: 'member',
                link: `/post/${postId}`,
            });
        }
    }
    async generateCommentReplyNotification(postId, commentId, actorId, parentCommentUserId, replyText) {
        if (actorId === parentCommentUserId)
            return;
        const recipient = await this.userModel
            .findById(parentCommentUserId)
            .select('creatorNotifyOnComments')
            .lean();
        if (!recipient || !recipient.creatorNotifyOnComments) {
            return;
        }
        await this.notificationsService.create({
            recipient: parentCommentUserId,
            actor: actorId,
            type: notification_1.NotificationType.COMMENT_REPLY,
            post: postId,
            comment: replyText,
            metadata: { commentId },
            userMode: 'creator',
            link: `/post/${postId}`,
        });
    }
    async generateChatMessageNotification(senderId, recipientId, chatId, messageContent, chatCreator) {
        console.log('generateChatMessageNotification'.toUpperCase());
        if (senderId === recipientId)
            return;
        const recipient = await this.userModel.findById(recipientId);
        if (!recipient)
            return;
        const shouldNotifyCreator = recipient.isCreator && recipient.creatorNotifyOnDirectMessages !== false;
        const shouldNotifyMember = !recipient.isCreator && recipient.memberNotifyOnDirectMessages !== false;
        if (!shouldNotifyCreator && !shouldNotifyMember) {
            return;
        }
        const recipientIsCreator = chatCreator === recipientId;
        console.log({ recipientId, recipientIsCreator });
        await this.notificationsService.create({
            recipient: recipientId,
            actor: senderId,
            type: notification_1.NotificationType.CHAT_MESSAGE,
            comment: messageContent.substring(0, 100) +
                (messageContent.length > 100 ? '...' : ''),
            metadata: { chatId },
            userMode: recipientIsCreator ? 'creator' : 'member',
            link: recipientIsCreator
                ? `/profile/community/chat/${chatId}`
                : `/user/messages/chat/${chatId}`,
        });
    }
    async generateGroupChatCreatedNotification({ chatId, chatTitle, creatorId, participantIds, }) {
        const creatorObjectId = new mongoose_2.Types.ObjectId(creatorId);
        console.log('==========generateGroupChatCreatedNotification==========='.toUpperCase());
        for (const recipientId of participantIds) {
            const recipientObjectId = new mongoose_2.Types.ObjectId(recipientId);
            if (recipientObjectId.equals(creatorObjectId)) {
                continue;
            }
            console.log(`Sending notification to ${recipientObjectId.toString()}`);
            await this.notificationsService.create({
                recipient: recipientObjectId.toString(),
                actor: creatorId,
                type: notification_1.NotificationType.GROUP_CHAT_CREATED,
                comment: `You have been added to the group chat: ${chatTitle}`,
                metadata: { chatId },
                userMode: 'member',
                link: `/user/messages/chat/${chatId}`,
            });
        }
    }
    async generateDirectMessageNotification({ chatId, messageContent, recipientId, senderId, chatCreator, }) {
        console.log('generateDirectMessageNotification'.toUpperCase());
        if (senderId === recipientId)
            return;
        const recipient = await this.userModel.findById(recipientId);
        console.log(recipient.displayName, recipient.creatorUsername);
        if (!recipient)
            return;
        const shouldNotify = recipient.isCreator
            ? recipient.creatorNotifyOnDirectMessages !== false
            : recipient.memberNotifyOnDirectMessages !== false;
        if (!shouldNotify) {
            return;
        }
        console.log({ chatCreator, recipientId });
        const recipientIsCreator = chatCreator === recipientId;
        await this.notificationsService.create({
            recipient: recipientId,
            actor: senderId,
            type: notification_1.NotificationType.DIRECT_MESSAGE,
            comment: messageContent.substring(0, 100) +
                (messageContent.length > 100 ? '...' : ''),
            metadata: { chatId },
            userMode: recipientIsCreator ? 'creator' : 'member',
            link: recipientIsCreator
                ? `/profile/community/direct-messages/${chatId}`
                : `/user/messages/direct-messages/${chatId}`,
        });
    }
    async generateDirectChatCreatedNotification(initiatorId, recipientId, chatId) {
        if (initiatorId === recipientId)
            return;
        const recipient = await this.userModel.findById(recipientId).lean();
        if (!recipient)
            return;
        const shouldNotify = recipient.isCreator
            ? recipient.creatorNotifyOnDirectMessages
            : recipient.memberNotifyOnDirectMessages;
        if (!shouldNotify) {
            return;
        }
        await this.notificationsService.create({
            recipient: recipientId,
            actor: initiatorId,
            type: notification_1.NotificationType.DIRECT_CHAT_CREATED,
            comment: 'started a conversation with you.',
            metadata: { chatId },
            userMode: recipient.isCreator ? 'creator' : 'member',
            link: recipient.isCreator
                ? `/profile/community/chat/${chatId}`
                : `/user/messages/chat/${chatId}`,
        });
    }
};
exports.NotificationGeneratorService = NotificationGeneratorService;
exports.NotificationGeneratorService = NotificationGeneratorService = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, mongoose_1.InjectModel)(subscription_1.Subscription.name)),
    __param(2, (0, mongoose_1.InjectModel)(user_1.User.name)),
    __metadata("design:paramtypes", [notifications_service_1.NotificationsService,
        mongoose_2.Model,
        mongoose_2.Model])
], NotificationGeneratorService);
//# sourceMappingURL=notification-generator.service.js.map