import { NotificationsService } from './notifications.service';
import { Model, Types } from 'mongoose';
import { Subscription } from '@/database/schemas/subscription';
import { User } from '@/database/schemas/user';
export declare class NotificationGeneratorService {
    private readonly notificationsService;
    private subscriptionModel;
    private userModel;
    constructor(notificationsService: NotificationsService, subscriptionModel: Model<Subscription>, userModel: Model<User>);
    generateLikeNotification(postId: string, actorId: string, recipientId: string): Promise<void>;
    generateCommentNotification(postId: string, actorId: string, recipientId: string, comment: string): Promise<void>;
    generateNewMemberNotification(subscriberId: string, creatorId: string, membershipTier: string): Promise<void>;
    generateUpgradeNotification(subscriberId: string, creatorId: string, newTier: string, previousTier: string): Promise<void>;
    generateDowngradeNotification(subscriberId: string, creatorId: string, newTier: string, previousTier: string): Promise<void>;
    generateCancellationNotification(subscriberId: string, creatorId: string, tier: string): Promise<void>;
    generateNewPostNotification(creatorId: string, postId: string, postTitle: string): Promise<void>;
    generateCommentReplyNotification(postId: string, commentId: string, actorId: string, parentCommentUserId: string, replyText: string): Promise<void>;
    generateChatMessageNotification(senderId: string, recipientId: string, chatId: string, messageContent: string, chatCreator: string): Promise<void>;
    generateGroupChatCreatedNotification({ chatId, chatTitle, creatorId, participantIds, }: {
        creatorId: string;
        chatId: string;
        chatTitle: string;
        participantIds: (string | Types.ObjectId)[];
    }): Promise<void>;
    generateDirectMessageNotification({ chatId, messageContent, recipientId, senderId, chatCreator, }: {
        senderId: string;
        recipientId: string;
        chatId: string;
        messageContent: string;
        chatCreator: string;
    }): Promise<void>;
    generateDirectChatCreatedNotification(initiatorId: string, recipientId: string, chatId: string): Promise<void>;
}
