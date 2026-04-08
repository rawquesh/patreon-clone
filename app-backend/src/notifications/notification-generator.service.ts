import { Injectable } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationType } from '@/schemas/notifications.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Subscription } from '@/schemas/subscribers.schema';
import { User } from '@/schemas/users.schema';

@Injectable()
export class NotificationGeneratorService {
  constructor(
    private readonly notificationsService: NotificationsService,
    @InjectModel(Subscription.name)
    private subscriptionModel: Model<Subscription>,
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  async generateLikeNotification(
    postId: string,
    actorId: string,
    recipientId: string,
  ): Promise<void> {
    if (actorId === recipientId) return;

    await this.notificationsService.create({
      recipient: recipientId,
      actor: actorId,
      type: NotificationType.LIKE,
      post: postId,
      userMode: 'creator',
      link: `/post/${postId}`,
    });
  }

  async generateCommentNotification(
    postId: string,
    actorId: string,
    recipientId: string,
    comment: string,
  ): Promise<void> {
    if (actorId === recipientId) return;

    const recipient = await this.userModel.findById(recipientId);

    if (!recipient || recipient.creatorNotifyOnComments === false) {
      return;
    }

    await this.notificationsService.create({
      recipient: recipientId,
      actor: actorId,
      type: NotificationType.COMMENT,
      post: postId,
      comment,
      userMode: 'creator',
      link: `/post/${postId}`,
    });
  }

  async generateNewMemberNotification(
    subscriberId: string,
    creatorId: string,
    membershipTier: string,
  ): Promise<void> {
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
      type: NotificationType.NEW_MEMBER,
      comment: `Subscribed to ${membershipTier} tier`,
      userMode: 'creator',
    });
  }

  async generateUpgradeNotification(
    subscriberId: string,
    creatorId: string,
    newTier: string,
    previousTier: string,
  ): Promise<void> {
    await this.notificationsService.create({
      recipient: creatorId,
      actor: subscriberId,
      type: NotificationType.UPGRADE,
      comment: `Upgraded from ${previousTier} to ${newTier} tier`,
      userMode: 'creator',
    });
  }

  async generateDowngradeNotification(
    subscriberId: string,
    creatorId: string,
    newTier: string,
    previousTier: string,
  ): Promise<void> {
    await this.notificationsService.create({
      recipient: creatorId,
      actor: subscriberId,
      type: NotificationType.DOWNGRADE,
      comment: `Downgraded from ${previousTier} to ${newTier} tier`,
      userMode: 'creator',
    });
  }

  async generateCancellationNotification(
    subscriberId: string,
    creatorId: string,
    tier: string,
  ): Promise<void> {
    await this.notificationsService.create({
      recipient: creatorId,
      actor: subscriberId,
      type: NotificationType.CANCELLATION,
      comment: `Cancelled subscription to ${tier} tier`,
      userMode: 'creator',
    });
  }

  async generateNewPostNotification(
    creatorId: string,
    postId: string,
    postTitle: string,
  ): Promise<void> {
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
        type: NotificationType.NEW_POST,
        post: postId,
        comment: `Published a new post: ${postTitle}`,
        userMode: 'member',
        link: `/post/${postId}`,
      });
    }
  }

  async generateCommentReplyNotification(
    postId: string,
    commentId: string,
    actorId: string,
    parentCommentUserId: string,
    replyText: string,
  ): Promise<void> {
    if (actorId === parentCommentUserId) return;

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
      type: NotificationType.COMMENT_REPLY,
      post: postId,
      comment: replyText,
      metadata: { commentId },
      userMode: 'creator',
      link: `/post/${postId}`,
    });
  }

  async generateChatMessageNotification(
    senderId: string,
    recipientId: string,
    chatId: string,
    messageContent: string,
    chatCreator: string,
  ): Promise<void> {
    console.log('generateChatMessageNotification'.toUpperCase());
    if (senderId === recipientId) return;

    const recipient = await this.userModel.findById(recipientId);

    if (!recipient) return;

    const shouldNotifyCreator =
      recipient.isCreator && recipient.creatorNotifyOnDirectMessages !== false;
    const shouldNotifyMember =
      !recipient.isCreator && recipient.memberNotifyOnDirectMessages !== false;

    if (!shouldNotifyCreator && !shouldNotifyMember) {
      return;
    }

    const recipientIsCreator = chatCreator === recipientId;
    console.log({ recipientId, recipientIsCreator });

    // console.log('generateChatMEssageNotif paylod', {
    //   recipient: recipientId,
    //   actor: senderId,
    //   type: NotificationType.CHAT_MESSAGE,
    //   comment:
    //     messageContent.substring(0, 100) +
    //     (messageContent.length > 100 ? '...' : ''),
    //   metadata: { chatId },
    //   userMode: recipientIsCreator ? 'creator' : 'member',

    //   link: recipientIsCreator
    //     ? `/profile/community/chat/${chatId}`
    //     : `/user/messages/chat/${chatId}`,
    // });
    await this.notificationsService.create({
      recipient: recipientId,
      actor: senderId,
      type: NotificationType.CHAT_MESSAGE,
      comment:
        messageContent.substring(0, 100) +
        (messageContent.length > 100 ? '...' : ''),
      metadata: { chatId },
      userMode: recipientIsCreator ? 'creator' : 'member',
      link: recipientIsCreator
        ? `/profile/community/chat/${chatId}`
        : `/user/messages/chat/${chatId}`,
    });
  }

  async generateGroupChatCreatedNotification({
    chatId,
    chatTitle,
    creatorId,
    participantIds,
  }: {
    creatorId: string;
    chatId: string;
    chatTitle: string;
    participantIds: (string | Types.ObjectId)[];
  }): Promise<void> {
    const creatorObjectId = new Types.ObjectId(creatorId);
    console.log(
      '==========generateGroupChatCreatedNotification==========='.toUpperCase(),
    );
    for (const recipientId of participantIds) {
      const recipientObjectId = new Types.ObjectId(recipientId);

      if (recipientObjectId.equals(creatorObjectId)) {
        continue;
      }

      console.log(`Sending notification to ${recipientObjectId.toString()}`);
      await this.notificationsService.create({
        recipient: recipientObjectId.toString(),
        actor: creatorId,
        type: NotificationType.GROUP_CHAT_CREATED,
        comment: `You have been added to the group chat: ${chatTitle}`,
        metadata: { chatId },
        userMode: 'member',
        link: `/user/messages/chat/${chatId}`,
      });
    }
  }

  async generateDirectMessageNotification({
    chatId,
    messageContent,
    recipientId,
    senderId,
    chatCreator,
  }: {
    senderId: string;
    recipientId: string;
    chatId: string;
    messageContent: string;
    chatCreator: string;
  }): Promise<void> {
    console.log('generateDirectMessageNotification'.toUpperCase());
    if (senderId === recipientId) return;

    const recipient = await this.userModel.findById(recipientId);

    console.log(recipient.displayName, recipient.creatorUsername);

    if (!recipient) return;

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
      type: NotificationType.DIRECT_MESSAGE,
      comment:
        messageContent.substring(0, 100) +
        (messageContent.length > 100 ? '...' : ''),
      metadata: { chatId },
      userMode: recipientIsCreator ? 'creator' : 'member',
      link: recipientIsCreator
        ? `/profile/community/direct-messages/${chatId}`
        : `/user/messages/direct-messages/${chatId}`,
    });
  }

  async generateDirectChatCreatedNotification(
    initiatorId: string,
    recipientId: string,
    chatId: string,
  ): Promise<void> {
    if (initiatorId === recipientId) return;

    const recipient = await this.userModel.findById(recipientId).lean();
    if (!recipient) return;

    const shouldNotify = recipient.isCreator
      ? recipient.creatorNotifyOnDirectMessages
      : recipient.memberNotifyOnDirectMessages;

    if (!shouldNotify) {
      return;
    }

    await this.notificationsService.create({
      recipient: recipientId,
      actor: initiatorId,
      type: NotificationType.DIRECT_CHAT_CREATED,
      comment: 'started a conversation with you.',
      metadata: { chatId },
      userMode: recipient.isCreator ? 'creator' : 'member',
      link: recipient.isCreator
        ? `/profile/community/chat/${chatId}`
        : `/user/messages/chat/${chatId}`,
    });
  }
}
