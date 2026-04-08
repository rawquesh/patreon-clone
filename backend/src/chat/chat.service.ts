/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  forwardRef,
  Inject,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, Document } from 'mongoose';
import {
  Chat,
  ChatAccessType,
  ChatParticipant,
  ChatType,
  Message,
} from '@/schemas/chat.schema';
import { User } from '@/schemas/users.schema';
import { Membership } from '@/schemas/membersip.schema';
import { Subscription } from '@/schemas/subscribers.schema';
import {
  ChatDto,
  ChatListItemDto,
  CreateDirectChatDto,
  CreateGroupChatDto,
  GetMessagesQueryDto,
  MarkMessagesReadDto,
  MessageDto,
  MessagesResponse,
  SendMessageDto,
  UpdateGroupChatDto,
  ChatParticipantDto,
  GetMessageDatesQueryDto,
  MessageDatesResponse,
} from './chat.dto';
import { S3Service } from '@/s3/s3.service';
import { NotificationGeneratorService } from '@/notifications/notification-generator.service';
import { ChatGateway } from './chat.gateway';

// Define types for populated documents to help with type checking
type PopulatedMessage = Message & Document & { sender: User & Document };
type PopulatedChat = Chat &
  Document & {
    creator: User & Document;
    participants: ((User & Document) | Types.ObjectId)[];
    lastMessage?: PopulatedMessage;
    accessTiers?: ((Membership & Document) | Types.ObjectId)[];
  };
type PopulatedChatParticipant = ChatParticipant &
  Document & { chat: PopulatedChat; user: User & Document };

// Helper to safely get ObjectId string
const getObjectIdString = (
  docOrId: Document | Types.ObjectId | string | null | undefined,
): string | null => {
  if (!docOrId) return null;
  if (docOrId instanceof Types.ObjectId) return docOrId.toString();
  if (typeof docOrId === 'string') return docOrId; // Assume it's already an ID string
  if (typeof docOrId === 'object' && '_id' in docOrId)
    return docOrId._id?.toString() ?? null;
  return null;
};

// Helper to safely get ObjectId
const getObjectId = (
  docOrId: Document | Types.ObjectId | string | null | undefined,
): Types.ObjectId | null => {
  if (!docOrId) return null;
  if (docOrId instanceof Types.ObjectId) return docOrId;
  if (typeof docOrId === 'string' && Types.ObjectId.isValid(docOrId))
    return new Types.ObjectId(docOrId);
  if (
    typeof docOrId === 'object' &&
    '_id' in docOrId &&
    docOrId._id instanceof Types.ObjectId
  )
    return docOrId._id;
  if (
    typeof docOrId === 'object' &&
    '_id' in docOrId &&
    typeof docOrId._id === 'string' &&
    Types.ObjectId.isValid(docOrId._id)
  )
    return new Types.ObjectId(docOrId._id);
  return null;
};

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);

  constructor(
    @InjectModel(Chat.name) private chatModel: Model<Chat>,
    @InjectModel(ChatParticipant.name)
    private chatParticipantModel: Model<ChatParticipant>,
    @InjectModel(Message.name) private messageModel: Model<Message>,
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Membership.name) private membershipModel: Model<Membership>,
    @InjectModel(Subscription.name)
    private subscriptionModel: Model<Subscription>,
    private s3Service: S3Service,
    private notificationGenerator: NotificationGeneratorService,
    @Inject(forwardRef(() => ChatGateway))
    private chatGateway: ChatGateway,
  ) {}

  async createGroupChat(
    userId: string,
    createChatDto: CreateGroupChatDto,
  ): Promise<ChatDto> {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.isCreator) {
      throw new ForbiddenException('Only creators can create group chats');
    }

    const creatorObjectId = new Types.ObjectId(userId);
    let participants = [creatorObjectId];
    console.log('line 122', { participants });
    let accessTierObjectIds: Types.ObjectId[] = [];

    if (createChatDto.accessType === ChatAccessType.SELECTED) {
      if (
        !createChatDto.accessTiers ||
        createChatDto.accessTiers.length === 0
      ) {
        throw new BadRequestException(
          'Access tiers must be provided when access type is "SELECTED"',
        );
      }

      accessTierObjectIds = createChatDto.accessTiers.map(
        (id) => new Types.ObjectId(id),
      );

      const membershipCount = await this.membershipModel.countDocuments({
        _id: { $in: accessTierObjectIds },
        creator: creatorObjectId,
      });

      if (membershipCount !== createChatDto.accessTiers.length) {
        throw new BadRequestException(
          'One or more tiers are invalid or do not belong to this creator',
        );
      }

      const subscribers = await this.subscriptionModel.find({
        creator: creatorObjectId,
        membership: { $in: accessTierObjectIds },
        status: 'active',
      });
      console.log({ subscribers });
      const subscriberIds = subscribers.map((sub) => {
        return sub.subscriber;
      });
      participants = [
        ...new Set([...participants, ...subscriberIds]),
      ] as Types.ObjectId[];
      console.log('line 159', { participants });
    } else if (createChatDto.accessType === ChatAccessType.ALL) {
      const subscribers = await this.subscriptionModel.find({
        creator: creatorObjectId,
        status: 'active',
      });
      const subscriberIds = subscribers.map((sub) => sub.subscriber);
      participants = [
        ...new Set([...participants, ...subscriberIds]),
      ] as Types.ObjectId[];
      console.log('line 179', { subscriberIds });
    } else if (createChatDto.accessType === ChatAccessType.PAID) {
      const subscribers = await this.subscriptionModel.find({
        creator: creatorObjectId,
        status: 'active',
        monthlyRate: { $gt: 0 },
      });
      const subscriberIds = subscribers.map((sub) => sub.subscriber);
      participants = [
        ...new Set([...participants, ...subscriberIds]),
      ] as Types.ObjectId[];
      console.log('line 190', { subscriberIds });
    }
    console.log('line 172', { participants });
    const chat = new this.chatModel({
      type: ChatType.GROUP,
      title: createChatDto.title,
      description: createChatDto.description,
      creator: creatorObjectId,
      participants: participants,
      accessType: createChatDto.accessType,
      accessTiers:
        createChatDto.accessType === ChatAccessType.SELECTED
          ? accessTierObjectIds
          : [],
    });

    const savedChat = await chat.save();

    const participantEntries = participants.map((participantId) => ({
      chat: savedChat._id,
      user: participantId,
      hasUnreadMessages: !participantId.equals(creatorObjectId),
      unreadCount: 0,
      isMuted: false,
      lastReadMessageId: null,
      isDeleted: false,
    }));

    await this.chatParticipantModel.insertMany(participantEntries);
    await this.notificationGenerator.generateGroupChatCreatedNotification({
      chatId: savedChat._id as string,
      chatTitle: savedChat.title,
      creatorId: userId,
      participantIds: participants,
    });
    return this.transformChatToDto(savedChat);
  }

  async createDirectChat(
    userId: string,
    createChatDto: CreateDirectChatDto,
  ): Promise<ChatDto> {
    const targetParticipantId = createChatDto.participantId;
    this.logger.log(
      `Attempting to create direct chat between requesting user ${userId} and target participant ${targetParticipantId}`,
    );

    const userObjectId = new Types.ObjectId(userId);
    const participantObjectId = new Types.ObjectId(targetParticipantId);

    // Validate users exist
    const [user, participant] = await Promise.all([
      this.userModel.findById(userObjectId),
      this.userModel.findById(participantObjectId),
    ]);

    if (!user || !participant) {
      this.logger.warn(
        `createDirectChat failed: Requesting user ${userId} or target participant ${targetParticipantId} not found.`,
      );
      throw new NotFoundException('User not found');
    }

    // --- Existing Chat Check ---
    const existingChat = await this.chatModel.findOne({
      type: ChatType.DIRECT,
      participants: { $all: [userObjectId, participantObjectId] },
      isDeleted: false,
    });

    if (existingChat) {
      this.logger.log(
        `Existing direct chat found (${existingChat._id}), returning it.`,
      );
      const populatedExistingChat = await this.chatModel
        .findById(existingChat._id)
        .populate(
          'creator',
          'displayName firstName lastName profilePicture isCreator',
        )
        .populate(
          'participants',
          'displayName firstName lastName profilePicture isCreator',
        )
        .populate({
          path: 'lastMessage',
          populate: {
            path: 'sender',
            select: 'displayName firstName lastName',
          },
        });
      return this.transformChatToDto(populatedExistingChat);
    }

    this.logger.log(`No existing direct chat found, creating a new one.`);

    const creatorUserIdForChat = createChatDto.creatorId;
    this.logger.log(
      `Assigning creator field in Chat schema to: ${creatorUserIdForChat}`,
    );

    const chat = new this.chatModel({
      type: ChatType.DIRECT,
      title: `${user.displayName || user.firstName || 'User'} & ${participant.displayName || participant.firstName || 'User'}`,
      creator: new Types.ObjectId(creatorUserIdForChat), // Assign determined creator
      participants: [userObjectId, participantObjectId],
    });

    const savedChat = await chat.save();
    this.logger.log(`New direct chat created: ${savedChat._id}`);

    // Create Participant Entries
    await Promise.all([
      this.chatParticipantModel.create({
        chat: savedChat._id,
        user: userObjectId,
        hasUnreadMessages: false,
      }),
      this.chatParticipantModel.create({
        chat: savedChat._id,
        user: participantObjectId,
        hasUnreadMessages: false,
      }),
    ]);
    this.logger.log(
      `ChatParticipant entries created for chat ${savedChat._id}`,
    );

    await this.notificationGenerator.generateDirectChatCreatedNotification(
      userId,
      targetParticipantId,
      savedChat._id.toString(),
    );

    const newChatId = savedChat._id.toString();
    this.chatGateway.joinUserToChatRoom(userId, newChatId);
    this.chatGateway.joinUserToChatRoom(targetParticipantId, newChatId);

    // Populate and return DTO
    const populatedNewChat = await this.chatModel
      .findById(savedChat._id)
      .populate(
        'creator',
        'displayName firstName lastName profilePicture isCreator',
      )
      .populate(
        'participants',
        'displayName firstName lastName profilePicture isCreator',
      )
      .populate({
        path: 'lastMessage',
        populate: { path: 'sender', select: 'displayName firstName lastName' },
      });

    return this.transformChatToDto(populatedNewChat);
  }

  async getUserChats(userId: string): Promise<{
    directChats: ChatListItemDto[];
    groupChats: ChatListItemDto[];
  }> {
    const chatParticipants = await this.chatParticipantModel
      .find({
        user: new Types.ObjectId(userId),
        isDeleted: false,
      })
      .populate({
        path: 'chat',
        populate: [
          {
            path: 'creator',
            select:
              'displayName firstName creatorUsername lastName profilePicture',
          },
          {
            path: 'participants',
            select:
              'displayName firstName creatorUsername lastName profilePicture',
          },
          {
            path: 'lastMessage',
            populate: {
              path: 'sender',
              select: 'displayName firstName lastName',
            },
          },
        ],
      });

    const directChats: ChatListItemDto[] = [];
    const groupChats: ChatListItemDto[] = [];

    for (const participant of chatParticipants) {
      if (!participant.chat || (participant.chat as any).isDeleted) {
        continue;
      }
      const chat = participant.chat as any;

      const chatDto: ChatListItemDto = {
        id: chat._id.toString(),
        title: chat.title,
        type: chat.type,
        unreadCount: participant.unreadCount,
        participants: chat.participants.map((p) => ({
          id: p._id?.toString(),
          name: p.displayName || p.firstName || 'User',
          profilePicture: p.profilePicture,
          creatorUsername: p.creatorUsername,
        })),
        creator: {
          id: chat.creator?._id?.toString(),
          name:
            chat.creator?.displayName || chat.creator?.firstName || 'Creator',
        },
      };

      if (chat.lastMessage) {
        chatDto.lastMessage = {
          content: chat.lastMessage.content,
          sender:
            chat.lastMessage.sender?.displayName ||
            chat.lastMessage.sender?.firstName ||
            'User',
          timestamp: chat.lastMessage.createdAt?.toISOString(),
        };
      }

      if (chat.type === ChatType.DIRECT) {
        directChats.push(chatDto);
      } else {
        groupChats.push(chatDto);
      }
    }

    return { directChats, groupChats };
  }

  async getChat(userId: string, chatId: string): Promise<ChatDto> {
    const chatParticipant = await this.chatParticipantModel.findOne({
      chat: new Types.ObjectId(chatId),
      user: new Types.ObjectId(userId),
      isDeleted: false,
    });

    if (!chatParticipant) {
      throw new NotFoundException(
        'Chat not found or you are not a participant',
      );
    }

    const chat = await this.chatModel
      .findById(chatId)
      .populate(
        'creator',
        'displayName firstName lastName profilePicture isCreator',
      )
      .populate(
        'participants',
        'displayName firstName lastName profilePicture isCreator',
      )
      .populate({
        path: 'lastMessage',
        populate: {
          path: 'sender',
          select: 'displayName firstName lastName',
        },
      })
      .populate('accessTiers', 'name');

    if (!chat || chat.isDeleted) {
      throw new NotFoundException('Chat not found');
    }

    const chatDto = this.transformChatToDto(chat);

    chatDto.unreadCount = chatParticipant.unreadCount;

    return chatDto;
  }

  async updateGroupChat(
    userId: string,
    chatId: string,
    updateChatDto: UpdateGroupChatDto,
  ): Promise<ChatDto> {
    const chat = await this.chatModel.findById(chatId);

    if (!chat || chat.isDeleted) {
      throw new NotFoundException('Chat not found');
    }

    if (chat.type !== ChatType.GROUP) {
      throw new BadRequestException(
        'This operation is only available for group chats',
      );
    }

    if (chat.creator.toString() !== userId) {
      throw new ForbiddenException('Only the creator can update the chat');
    }

    if (
      updateChatDto.accessType === ChatAccessType.SELECTED ||
      (chat.accessType === ChatAccessType.SELECTED &&
        !updateChatDto.accessType &&
        updateChatDto.accessTiers)
    ) {
      const tiersToCheck =
        updateChatDto.accessTiers || chat.accessTiers?.map((t) => t.toString());

      if (!tiersToCheck || tiersToCheck.length === 0) {
        throw new BadRequestException(
          'Access tiers must be provided when access type is set to "select"',
        );
      }

      const objectIdTiers = tiersToCheck.map((id) => new Types.ObjectId(id));
      const membershipCount = await this.membershipModel.countDocuments({
        _id: { $in: objectIdTiers },
        creator: new Types.ObjectId(userId),
      });

      if (membershipCount !== tiersToCheck.length) {
        throw new BadRequestException(
          'One or more tiers are invalid or do not belong to this creator',
        );
      }
    }

    const updateData: any = { ...updateChatDto };
    let accessChanged = false;

    if (updateChatDto.accessTiers) {
      updateData.accessTiers = updateChatDto.accessTiers.map(
        (id) => new Types.ObjectId(id),
      );
      if (
        JSON.stringify(updateData.accessTiers) !==
        JSON.stringify(chat.accessTiers?.map((t) => t.toString()))
      ) {
        accessChanged = true;
      }
    }

    if (
      updateChatDto.accessType &&
      updateChatDto.accessType !== chat.accessType
    ) {
      accessChanged = true;
    }

    const updatedChatDoc = await this.chatModel
      .findByIdAndUpdate(chatId, { $set: updateData }, { new: true })
      .populate(
        'creator',
        'displayName firstName lastName profilePicture isCreator',
      )
      .populate('participants', '_id')
      .populate('lastMessage')
      .populate('accessTiers', '_id name');

    if (!updatedChatDoc) {
      throw new NotFoundException('Chat update failed');
    }

    if (accessChanged) {
      console.log(
        `Access changed for chat ${chatId}, recalculating participants...`,
      );
      try {
        const currentParticipantIds = new Set(
          updatedChatDoc.participants.map((p) => p._id.toString()),
        );

        const newRequiredParticipantIds = new Set<string>([
          updatedChatDoc.creator._id.toString(),
        ]);

        if (
          updatedChatDoc.accessType === ChatAccessType.SELECTED &&
          updatedChatDoc.accessTiers?.length
        ) {
          const subscribers = await this.subscriptionModel
            .find({
              creator: updatedChatDoc.creator._id,
              membership: { $in: updatedChatDoc.accessTiers.map((t) => t._id) },
              status: 'active',
            })
            .select('subscriber');
          subscribers.forEach((sub) =>
            newRequiredParticipantIds.add(sub.subscriber.toString()),
          );
        } else if (updatedChatDoc.accessType === ChatAccessType.PAID) {
          const subscribers = await this.subscriptionModel
            .find({
              creator: updatedChatDoc.creator._id,
              status: 'active',
            })
            .select('subscriber');
          subscribers.forEach((sub) =>
            newRequiredParticipantIds.add(sub.subscriber.toString()),
          );
        } else if (updatedChatDoc.accessType === ChatAccessType.ALL) {
          const allSubscribers = await this.subscriptionModel
            .find({
              creator: updatedChatDoc.creator._id,
              status: 'active',
            })
            .select('subscriber');
          allSubscribers.forEach((sub) =>
            newRequiredParticipantIds.add(sub.subscriber.toString()),
          );
        }

        const participantsToAdd = [...newRequiredParticipantIds].filter(
          (id) => !currentParticipantIds.has(id),
        );
        const participantsToRemove = [...currentParticipantIds].filter(
          (id) =>
            !newRequiredParticipantIds.has(id) &&
            id !== updatedChatDoc.creator._id.toString(),
        );

        console.log('Participants to add:', participantsToAdd);
        console.log('Participants to remove:', participantsToRemove);

        if (participantsToAdd.length > 0) {
          const addOps = participantsToAdd.map((userIdToAdd) => ({
            chat: updatedChatDoc._id,
            user: new Types.ObjectId(userIdToAdd),
            hasUnreadMessages: true,
            unreadCount: 0,
          }));
          await this.chatParticipantModel
            .insertMany(addOps, { ordered: false })
            .catch((e) =>
              console.log(
                'Ignoring duplicate key errors on insertMany:',
                e.code,
              ),
            );

          await this.chatModel.findByIdAndUpdate(chatId, {
            $addToSet: {
              participants: {
                $each: participantsToAdd.map((id) => new Types.ObjectId(id)),
              },
            },
          });
          console.log(`Added ${participantsToAdd.length} participants to Chat`);
        }

        if (participantsToRemove.length > 0) {
          await this.chatParticipantModel.updateMany(
            {
              chat: updatedChatDoc._id,
              user: {
                $in: participantsToRemove.map((id) => new Types.ObjectId(id)),
              },
            },
            { $set: { isDeleted: true } },
          );
          await this.chatModel.findByIdAndUpdate(chatId, {
            $pull: {
              participants: {
                $in: participantsToRemove.map((id) => new Types.ObjectId(id)),
              },
            },
          });
          console.log(
            `Removed ${participantsToRemove.length} participants from Chat`,
          );
        }

        const finalChatDoc = await this.chatModel
          .findById(chatId)
          .populate(
            'creator',
            'displayName firstName lastName profilePicture isCreator',
          )
          .populate(
            'participants',
            'displayName firstName lastName profilePicture isCreator',
          )
          .populate({
            path: 'lastMessage',
            populate: {
              path: 'sender',
              select: 'displayName firstName lastName',
            },
          })
          .populate('accessTiers', '_id name');

        return this.transformChatToDto(finalChatDoc);
      } catch (error) {
        console.error(`Error updating participants for chat ${chatId}:`, error);
        return this.transformChatToDto(updatedChatDoc);
      }
    }

    const fullyPopulatedChat = await this.chatModel
      .findById(chatId)
      .populate(
        'creator',
        'displayName firstName lastName profilePicture isCreator',
      )
      .populate(
        'participants',
        'displayName firstName lastName profilePicture isCreator',
      )
      .populate({
        path: 'lastMessage',
        populate: { path: 'sender', select: 'displayName firstName lastName' },
      })
      .populate('accessTiers', '_id name');

    return this.transformChatToDto(fullyPopulatedChat || updatedChatDoc);
  }

  async deleteChat(
    userId: string,
    chatId: string,
  ): Promise<{ success: boolean }> {
    const chat = await this.chatModel.findById(chatId);

    if (!chat || chat.isDeleted) {
      throw new NotFoundException('Chat not found');
    }

    if (chat.type === ChatType.GROUP && chat.creator.toString() !== userId) {
      throw new ForbiddenException('Only the creator can delete the chat');
    }

    if (
      chat.type === ChatType.DIRECT &&
      !chat.participants.some((p) => p.toString() === userId)
    ) {
      throw new ForbiddenException('You are not a participant in this chat');
    }

    await this.chatModel.findByIdAndUpdate(chatId, {
      $set: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    });

    await this.chatParticipantModel.updateMany(
      { chat: new Types.ObjectId(chatId) },
      { $set: { isDeleted: true } },
    );

    return { success: true };
  }

  async sendMessage(
    userId: string,
    chatId: string,
    sendMessageDto: SendMessageDto,
    attachmentFile?: Express.Multer.File,
  ): Promise<MessageDto> {
    const userIdObj = new Types.ObjectId(userId);
    const chatIdObj = new Types.ObjectId(chatId);

    // Step 1: Fetch participant and sender details in parallel.
    const [participant, sender] = await Promise.all([
      this.chatParticipantModel
        .findOne({
          chat: chatIdObj,
          user: userIdObj,
          isDeleted: false,
        })
        .populate('chat')
        .lean(),
      this.userModel
        .findById(userIdObj)
        .select('displayName firstName lastName profilePicture isCreator')
        .lean(),
    ]);

    // Step 2: Validate access
    if (!participant) {
      throw new ForbiddenException(
        'You do not have access to send messages in this chat.',
      );
    }
    if (!sender) {
      throw new NotFoundException('Sender not found.');
    }

    const chat = participant.chat as PopulatedChat;

    // Step 3: Handle attachment upload (blocking, as it's part of the message)
    let attachment: any = null;
    if (attachmentFile) {
      try {
        const fileUrl = await this.s3Service.uploadFile(
          attachmentFile,
          `chat-attachments/${chatId}`,
          process.env.AWS_S3_BUCKET_NAME || 'patreon-clone-assets',
        );
        attachment = {
          url: fileUrl,
          fileName: attachmentFile.originalname,
          fileType: attachmentFile.mimetype,
          fileSize: attachmentFile.size,
          uploadedAt: new Date().toISOString(),
        };
      } catch (s3Error) {
        this.logger.error(
          `Error uploading attachment to S3 for chat ${chatId}:`,
          s3Error,
        );
        throw new InternalServerErrorException('Failed to upload attachment.');
      }
    }

    // Step 4: Create and save the message (blocking, this is critical)
    const message = new this.messageModel({
      chat: chatIdObj,
      sender: userIdObj,
      content: sendMessageDto.content,
      attachments: attachment ? [attachment] : [],
      readBy: [userIdObj],
    });
    const savedMessage = await message.save();

    this.performPostMessageUpdates(
      chatIdObj,
      userIdObj,
      savedMessage._id as Types.ObjectId,
      chat,
      sendMessageDto.content,
    );

    const messageDto = this.transformMessageToDto({
      ...savedMessage.toObject(),
      sender: sender as User & Document,
    } as unknown as Message);

    return messageDto;
  }

  private performPostMessageUpdates(
    chatIdObj: Types.ObjectId,
    userIdObj: Types.ObjectId,
    messageId: Types.ObjectId,
    chat: PopulatedChat,
    messageContent: string,
  ): void {
    // This function is called without await to run in the background.
    Promise.allSettled([
      this.chatModel.updateOne({ _id: chatIdObj }, { lastMessage: messageId }),
      this.chatParticipantModel.updateMany(
        { chat: chatIdObj, user: { $ne: userIdObj }, isDeleted: false },
        { $set: { hasUnreadMessages: true }, $inc: { unreadCount: 1 } },
      ),
      this.sendNotificationsToParticipants(
        chat,
        userIdObj.toString(),
        messageContent,
      ),
    ]).then((results) => {
      results.forEach((result, i) => {
        if (result.status === 'rejected') {
          this.logger.error(
            `Post-message update task ${i} failed for chat ${chatIdObj}:`,
            result.reason,
          );
        }
      });
    });
  }

  private async sendNotificationsToParticipants(
    chat: PopulatedChat,
    senderId: string,
    messageContent: string,
  ): Promise<void> {
    try {
      const participants = await this.chatParticipantModel.find({
        chat: chat._id,
        isDeleted: false,
        user: { $ne: new Types.ObjectId(senderId) },
      });

      for (const participant of participants) {
        const recipientId = participant.user.toString();
        if (chat.type === ChatType.DIRECT) {
          this.notificationGenerator.generateDirectMessageNotification({
            senderId,
            recipientId,
            chatId: chat._id.toString(),
            messageContent,
            chatCreator: chat.creator.toString(),
          });
        } else {
          this.notificationGenerator.generateChatMessageNotification(
            senderId,
            recipientId,
            chat._id.toString(),
            messageContent,
            chat.creator.toString(),
          );
        }
      }
    } catch (error) {
      this.logger.error(
        `Failed to send notifications for chat ${chat._id}:`,
        error,
      );
    }
  }

  async getMessages(
    userId: string,
    chatId: string,
    query: GetMessagesQueryDto,
  ): Promise<MessagesResponse> {
    const chatParticipant = await this.chatParticipantModel.findOne({
      chat: new Types.ObjectId(chatId),
      user: new Types.ObjectId(userId),
      isDeleted: false,
    });

    if (!chatParticipant) {
      throw new NotFoundException(
        'Chat not found or you are not a participant',
      );
    }

    const chat = await this.chatModel.findById(chatId);
    if (!chat || chat.isDeleted) {
      throw new NotFoundException('Chat not found');
    }

    const filter: any = {
      chat: new Types.ObjectId(chatId),
      isDeleted: false,
    };

    if (query.beforeDate) {
      filter.createdAt = {
        ...filter.createdAt,
        $lt: new Date(query.beforeDate),
      };
    }
    if (query.afterDate) {
      filter.createdAt = {
        ...filter.createdAt,
        $gt: new Date(query.afterDate),
      };
    }

    if (query.before) {
      filter._id = { $lt: new Types.ObjectId(query.before) };
    } else if (query.after) {
      filter._id = { $gt: new Types.ObjectId(query.after) };
    }

    const limit = query.limit || 20;

    const sortDirection = query.initialLoad ? -1 : query.after ? 1 : -1;

    const messages = await this.messageModel
      .find(filter)
      .sort({ createdAt: sortDirection })
      .limit(limit + 1)
      .populate(
        'sender',
        'displayName firstName lastName profilePicture isCreator',
      );

    const hasMore = messages.length > limit;
    const hasNewer = query.before ? true : false;

    if (hasMore) {
      messages.pop();
    }

    if ((query.initialLoad && sortDirection === -1) || query.after) {
      messages.reverse();
    }

    const messageDtos = messages.map((msg) => this.transformMessageToDto(msg));

    const nextCursor =
      hasMore && messages.length > 0
        ? messages[messages.length - 1]._id.toString()
        : undefined;

    const previousCursor =
      messages.length > 0 ? messages[0]._id.toString() : undefined;

    const dateGroups = query.includeGrouping
      ? this.generateDateGroups(messageDtos)
      : undefined;

    return {
      messages: messageDtos,
      hasMore,
      hasNewer,
      dateGroups,
      nextCursor,
      previousCursor,
    };
  }

  async markMessagesAsRead(
    userId: string,
    chatId: string,
    markReadDto: MarkMessagesReadDto,
  ): Promise<{ success: boolean }> {
    const chatParticipant = await this.chatParticipantModel.findOne({
      chat: new Types.ObjectId(chatId),
      user: new Types.ObjectId(userId),
      isDeleted: false,
    });

    if (!chatParticipant) {
      throw new NotFoundException(
        'Chat not found or you are not a participant',
      );
    }

    await this.messageModel.updateMany(
      {
        chat: new Types.ObjectId(chatId),
        _id: { $lte: new Types.ObjectId(markReadDto.lastReadMessageId) },
        readBy: { $ne: new Types.ObjectId(userId) },
      },
      { $addToSet: { readBy: new Types.ObjectId(userId) } },
    );

    await this.chatParticipantModel.findOneAndUpdate(
      {
        chat: new Types.ObjectId(chatId),
        user: new Types.ObjectId(userId),
      },
      {
        $set: {
          hasUnreadMessages: false,
          unreadCount: 0,
          lastReadMessageId: new Types.ObjectId(markReadDto.lastReadMessageId),
        },
      },
    );

    return { success: true };
  }

  async checkChatAccess(userId: string, chatId: string): Promise<boolean> {
    const chat = await this.chatModel.findById(chatId);
    if (!chat || chat.isDeleted) {
      return false;
    }

    if (chat.type === ChatType.DIRECT) {
      return chat.participants.some((p) => p.toString() === userId);
    }

    const user = await this.userModel.findById(userId);
    if (!user) {
      return false;
    }

    if (chat.creator.toString() === userId) {
      return true;
    }

    switch (chat.accessType) {
      case ChatAccessType.ALL:
        return true;

      case ChatAccessType.PAID:
        const subscription = await this.subscriptionModel.findOne({
          subscriber: new Types.ObjectId(userId),
          creator: chat.creator,
          status: 'active',
        });
        return !!subscription;

      case ChatAccessType.SELECTED:
        if (!chat.accessTiers || chat.accessTiers.length === 0) {
          return false;
        }

        const tierSubscription = await this.subscriptionModel.findOne({
          subscriber: new Types.ObjectId(userId),
          creator: chat.creator,
          membership: { $in: chat.accessTiers },
          status: 'active',
        });
        return !!tierSubscription;

      default:
        return false;
    }
  }

  async joinChat(userId: string, chatId: string): Promise<ChatDto> {
    const chat = await this.chatModel.findById(chatId);
    if (!chat || chat.isDeleted) {
      throw new NotFoundException('Chat not found');
    }

    if (chat.type !== ChatType.GROUP) {
      throw new BadRequestException('Only group chats can be joined');
    }

    const existingParticipant = await this.chatParticipantModel.findOne({
      chat: new Types.ObjectId(chatId),
      user: new Types.ObjectId(userId),
      isDeleted: false,
    });

    if (existingParticipant) {
      return this.getChat(userId, chatId);
    }

    const hasAccess = await this.checkChatAccess(userId, chatId);
    if (!hasAccess) {
      throw new ForbiddenException('You do not have access to join this chat');
    }

    await this.chatParticipantModel.create({
      chat: new Types.ObjectId(chatId),
      user: new Types.ObjectId(userId),
      hasUnreadMessages: true,
      unreadCount: 0,
    });

    await this.chatModel.findByIdAndUpdate(chatId, {
      $addToSet: { participants: new Types.ObjectId(userId) },
    });

    return this.getChat(userId, chatId);
  }

  async leaveChat(
    userId: string,
    chatId: string,
  ): Promise<{ success: boolean }> {
    const chat = await this.chatModel.findById(chatId);
    if (!chat || chat.isDeleted) {
      throw new NotFoundException('Chat not found');
    }

    if (chat.type !== ChatType.GROUP) {
      throw new BadRequestException('Only group chats can be left');
    }

    if (chat.creator.toString() === userId) {
      throw new BadRequestException('Creator cannot leave their own chat');
    }

    await this.chatParticipantModel.findOneAndUpdate(
      {
        chat: new Types.ObjectId(chatId),
        user: new Types.ObjectId(userId),
      },
      { $set: { isDeleted: true } },
    );

    await this.chatModel.findByIdAndUpdate(chatId, {
      $pull: { participants: new Types.ObjectId(userId) },
    });

    return { success: true };
  }

  async getTotalUnreadCount(userId: string): Promise<number> {
    const participants = await this.chatParticipantModel.find({
      user: new Types.ObjectId(userId),
      isDeleted: false,
    });

    return participants.reduce(
      (total, participant) => total + (participant.unreadCount || 0),
      0,
    );
  }

  private transformChatToDto(
    chatDoc: PopulatedChat | Chat | Document,
  ): ChatDto | null {
    const chat = chatDoc as Chat & Document;
    if (!chat?._id) return null;

    const populatedChat = chatDoc as PopulatedChat;

    const participants: ChatParticipantDto[] = Array.isArray(chat.participants)
      ? (chat.participants as User[] | Types.ObjectId[])
          .map((p) =>
            this.transformUserToChatParticipant(p as User | Types.ObjectId),
          )
          .filter((p): p is ChatParticipantDto => p !== null)
      : [];

    const creatorDto = chat.creator
      ? this.transformUserToChatParticipant(
          chat.creator as User | Types.ObjectId,
        )
      : null;

    if (creatorDto && !participants.some((p) => p.id === creatorDto.id)) {
      const creatorExists =
        Array.isArray(chat.participants) &&
        chat.participants.some((p) => {
          const pId =
            p instanceof Types.ObjectId
              ? p.toString()
              : (p as User)?._id?.toString();
          const creatorId =
            chat.creator instanceof Types.ObjectId
              ? chat.creator.toString()
              : (chat.creator as User)?._id?.toString();
          return pId === creatorId;
        });
      if (!creatorExists) {
        participants.push(creatorDto);
      }
    }

    const accessTierIds = Array.isArray(chat.accessTiers)
      ? (chat.accessTiers as Membership[] | Types.ObjectId[])
          .map((tier) =>
            tier instanceof Types.ObjectId
              ? tier.toString()
              : tier?._id?.toString(),
          )
          .filter((id): id is string => !!id)
      : [];

    const chatWithUnread = chat as any;

    return {
      id: chat._id.toString(),
      type: chat.type,
      title: chat.title,
      description: chat.description,
      creator: creatorDto,
      participants: participants,
      lastMessage: populatedChat.lastMessage
        ? this.transformMessageToDto(
            populatedChat.lastMessage as PopulatedMessage,
          )
        : undefined,
      accessType: chat.accessType,
      accessTiers: accessTierIds,
      createdAt: chat.createdAt?.toISOString(),
      updatedAt: chat.updatedAt?.toISOString(),
      unreadCount: chatWithUnread.unreadCount ?? 0,
    };
  }

  private transformMessageToDto(
    messageDoc: PopulatedMessage | Message | Document,
  ): MessageDto | null {
    const message = messageDoc as Message & Document;
    if (!message?._id) return null;

    const populatedMsg = messageDoc as PopulatedMessage;

    const senderDto = populatedMsg.sender
      ? this.transformUserToChatParticipant(
          populatedMsg.sender as User | Types.ObjectId,
        )
      : null;

    if (!senderDto) {
      console.warn(
        `Message ${message._id} missing populated sender for DTO transformation.`,
      );
      return null;
    }

    const createdAt = message.createdAt?.toISOString();
    const dateGroup = createdAt
      ? this.getDateGroup(new Date(message.createdAt))
      : undefined;

    return {
      id: message._id.toString(),
      sender: senderDto,
      content: message.content,
      attachments:
        message.attachments?.map((att) => ({
          url: att.url,
          fileName: att.fileName,
          fileType: att.fileType,
          fileSize: att.fileSize,
          uploadedAt:
            att.uploadedAt instanceof Date
              ? att.uploadedAt.toISOString()
              : att.uploadedAt,
        })) || [],
      readBy: message.readBy?.map((id) => id.toString()) || [],
      isDeleted: message.isDeleted ?? false,
      deletedAt: message.deletedAt?.toISOString(),
      createdAt,
      updatedAt: message.updatedAt?.toISOString(),
      dateGroup,
    };
  }

  private transformUserToChatParticipant(
    userDoc: User | Types.ObjectId | Document,
  ): ChatParticipantDto | null {
    if (userDoc instanceof Document && userDoc._id) {
      const user = userDoc as User & Document;
      return {
        id: user._id.toString(),
        displayName: user.displayName || user.firstName || 'User',
        profilePicture: user.profilePicture,
        isCreator: user.isCreator ?? false,
      };
    } else if (userDoc instanceof Types.ObjectId) {
      return null;
    } else if (typeof userDoc === 'object' && userDoc?._id) {
      const user = userDoc as User;
      return {
        id: user._id.toString(),
        displayName: user.displayName || user.firstName || 'User',
        profilePicture: user.profilePicture,
        isCreator: user.isCreator ?? false,
      };
    } else {
      console.warn('Unrecognized user format for DTO transformation:', userDoc);
      return null;
    }
  }

  async handleNewSubscription(
    userId: string,
    membershipId: string,
  ): Promise<void> {
    const userObjectId = new Types.ObjectId(userId);
    const membershipObjectId = new Types.ObjectId(membershipId);

    const membership = await this.membershipModel.findById(membershipObjectId);
    if (!membership?.creator) return;

    const creatorObjectId = getObjectId(membership.creator);
    if (!creatorObjectId) {
      console.error(
        `Could not resolve creator ObjectId for membership ${membershipId}`,
      );
      return;
    }

    const eligibleChats = await this.chatModel.find({
      creator: creatorObjectId,
      type: ChatType.GROUP,
      isDeleted: false,
      $or: [
        { accessType: ChatAccessType.ALL },
        {
          accessType: ChatAccessType.SELECTED,
          accessTiers: membershipObjectId,
        },
      ],
      participants: { $ne: userObjectId },
    });

    for (const chat of eligibleChats) {
      await this.chatModel.updateOne(
        { _id: chat._id },
        { $addToSet: { participants: userObjectId } },
      );

      await this.chatParticipantModel.updateOne(
        { chat: chat._id, user: userObjectId },
        {
          $set: { isDeleted: false },
          $setOnInsert: {
            chat: chat._id,
            user: userObjectId,
            hasUnreadMessages: true,
            unreadCount: 0,
            isMuted: false,
            lastReadMessageId: null,
            createdAt: new Date(),
          },
        },
        { upsert: true },
      );
    }
  }

  async handleExpiredSubscription(
    userId: string,
    membershipId: string,
  ): Promise<void> {
    const userObjectId = new Types.ObjectId(userId);
    const membershipObjectId = new Types.ObjectId(membershipId);

    const membership = await this.membershipModel.findById(membershipObjectId);
    if (!membership?.creator) return;

    const creatorObjectId = getObjectId(membership.creator);
    if (!creatorObjectId) {
      console.error(
        `Could not resolve creator ObjectId for membership ${membershipId}`,
      );
      return;
    }

    const potentiallyAffectedChats = await this.chatModel
      .find({
        creator: creatorObjectId,
        type: ChatType.GROUP,
        participants: userObjectId,
        isDeleted: false,
      })
      .populate('accessTiers');

    const otherActiveSubscriptions = await this.subscriptionModel.find({
      subscriber: userObjectId,
      creator: creatorObjectId,
      status: 'active',
      membership: { $ne: membershipObjectId },
    });
    const otherActiveMembershipObjectIds = otherActiveSubscriptions
      .map((sub) => getObjectId(sub.membership))
      .filter((id): id is Types.ObjectId => !!id);

    for (const chat of potentiallyAffectedChats) {
      let userRemainsEligible = false;

      if (chat.accessType === ChatAccessType.ALL) {
        userRemainsEligible = otherActiveSubscriptions.length > 0;
      } else if (chat.accessType === ChatAccessType.SELECTED) {
        const chatAccessTierIds =
          (chat.accessTiers as Membership[] | Types.ObjectId[])
            ?.map((tier) => getObjectIdString(tier))
            .filter((id): id is string => !!id) ?? [];

        userRemainsEligible = otherActiveMembershipObjectIds.some((activeId) =>
          chatAccessTierIds.includes(activeId.toString()),
        );
      }

      if (!userRemainsEligible) {
        await this.chatModel.updateOne(
          { _id: chat._id },
          { $pull: { participants: userObjectId } },
        );

        await this.chatParticipantModel.deleteOne({
          chat: chat._id,
          user: userObjectId,
        });
      }
    }
  }

  /**
   * Determines the appropriate date group for a timestamp.
   * @param date The date to get a group for
   * @returns A string representing the date group: "today", "yesterday", or "YYYY-MM-DD"
   */
  public getDateGroup(date: Date): string {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const messageDate = new Date(date);
    const messageDateOnly = new Date(
      messageDate.getFullYear(),
      messageDate.getMonth(),
      messageDate.getDate(),
    );

    if (messageDateOnly.getTime() === today.getTime()) {
      return 'today';
    } else if (messageDateOnly.getTime() === yesterday.getTime()) {
      return 'yesterday';
    } else {
      return messageDate.toISOString().split('T')[0]; // YYYY-MM-DD
    }
  }

  /**
   * Generates date groups from a list of messages.
   * @param messages The messages to group
   * @returns An object mapping date strings to arrays of message IDs
   */
  private generateDateGroups(messages: MessageDto[]): {
    [date: string]: string[];
  } {
    const groups: { [date: string]: string[] } = {};

    messages.forEach((message) => {
      const date = new Date(message.createdAt);
      const dateString = this.getDateGroup(date);

      if (!groups[dateString]) {
        groups[dateString] = [];
      }

      groups[dateString].push(message.id);
    });

    return groups;
  }

  /**
   * Get a list of dates that have messages in a chat
   */
  async getMessageDates(
    userId: string,
    chatId: string,
    query: GetMessageDatesQueryDto,
  ): Promise<MessageDatesResponse> {
    // Verify user has access to the chat
    const chatParticipant = await this.chatParticipantModel.findOne({
      chat: new Types.ObjectId(chatId),
      user: new Types.ObjectId(userId),
      isDeleted: false,
    });

    if (!chatParticipant) {
      throw new NotFoundException(
        'Chat not found or you are not a participant',
      );
    }

    const chat = await this.chatModel.findById(chatId);
    if (!chat || chat.isDeleted) {
      throw new NotFoundException('Chat not found');
    }

    // Build filter based on query params
    const filter: any = {
      chat: new Types.ObjectId(chatId),
      isDeleted: false,
    };

    if (query.startDate) {
      filter.createdAt = {
        ...filter.createdAt,
        $gte: new Date(query.startDate),
      };
    }

    if (query.endDate) {
      filter.createdAt = {
        ...filter.createdAt,
        $lte: new Date(query.endDate),
      };
    }

    // Using aggregation pipeline to group messages by date
    const dateCounts = await this.messageModel.aggregate([
      { $match: filter },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
          },
          messageCount: { $sum: 1 },
          firstMessageId: { $first: '$_id' },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Format response
    const dates = dateCounts.map((group) => ({
      date: group._id,
      messageCount: group.messageCount,
      firstMessageId: group.firstMessageId.toString(),
    }));

    // Find oldest and newest dates
    let oldestDate = '';
    let newestDate = '';

    if (dates.length > 0) {
      oldestDate = dates[0].date;
      newestDate = dates[dates.length - 1].date;
    }

    return {
      dates,
      oldestDate,
      newestDate,
    };
  }
}
