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
var ChatService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const chat_1 = require("../database/schemas/chat");
const user_1 = require("../database/schemas/user");
const membership_1 = require("../database/schemas/membership");
const subscription_1 = require("../database/schemas/subscription");
const s3_service_1 = require("../s3/s3.service");
const notification_generator_service_1 = require("../notifications/notification-generator.service");
const chat_gateway_1 = require("./chat.gateway");
const config_1 = require("../config");
const getObjectIdString = (docOrId) => {
    if (!docOrId)
        return null;
    if (docOrId instanceof mongoose_2.Types.ObjectId)
        return docOrId.toString();
    if (typeof docOrId === 'string')
        return docOrId;
    if (typeof docOrId === 'object' && '_id' in docOrId)
        return docOrId._id?.toString() ?? null;
    return null;
};
const getObjectId = (docOrId) => {
    if (!docOrId)
        return null;
    if (docOrId instanceof mongoose_2.Types.ObjectId)
        return docOrId;
    if (typeof docOrId === 'string' && mongoose_2.Types.ObjectId.isValid(docOrId))
        return new mongoose_2.Types.ObjectId(docOrId);
    if (typeof docOrId === 'object' &&
        '_id' in docOrId &&
        docOrId._id instanceof mongoose_2.Types.ObjectId)
        return docOrId._id;
    if (typeof docOrId === 'object' &&
        '_id' in docOrId &&
        typeof docOrId._id === 'string' &&
        mongoose_2.Types.ObjectId.isValid(docOrId._id))
        return new mongoose_2.Types.ObjectId(docOrId._id);
    return null;
};
let ChatService = ChatService_1 = class ChatService {
    constructor(chatModel, chatParticipantModel, messageModel, userModel, membershipModel, subscriptionModel, s3Service, notificationGenerator, chatGateway) {
        this.chatModel = chatModel;
        this.chatParticipantModel = chatParticipantModel;
        this.messageModel = messageModel;
        this.userModel = userModel;
        this.membershipModel = membershipModel;
        this.subscriptionModel = subscriptionModel;
        this.s3Service = s3Service;
        this.notificationGenerator = notificationGenerator;
        this.chatGateway = chatGateway;
        this.logger = new common_1.Logger(ChatService_1.name);
    }
    async createGroupChat(userId, createChatDto) {
        const user = await this.userModel.findById(userId);
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        if (!user.isCreator) {
            throw new common_1.ForbiddenException('Only creators can create group chats');
        }
        const creatorObjectId = new mongoose_2.Types.ObjectId(userId);
        let participants = [creatorObjectId];
        console.log('line 122', { participants });
        let accessTierObjectIds = [];
        if (createChatDto.accessType === chat_1.ChatAccessType.SELECTED) {
            if (!createChatDto.accessTiers ||
                createChatDto.accessTiers.length === 0) {
                throw new common_1.BadRequestException('Access tiers must be provided when access type is "SELECTED"');
            }
            accessTierObjectIds = createChatDto.accessTiers.map((id) => new mongoose_2.Types.ObjectId(id));
            const membershipCount = await this.membershipModel.countDocuments({
                _id: { $in: accessTierObjectIds },
                creator: creatorObjectId,
            });
            if (membershipCount !== createChatDto.accessTiers.length) {
                throw new common_1.BadRequestException('One or more tiers are invalid or do not belong to this creator');
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
            ];
            console.log('line 159', { participants });
        }
        else if (createChatDto.accessType === chat_1.ChatAccessType.ALL) {
            const subscribers = await this.subscriptionModel.find({
                creator: creatorObjectId,
                status: 'active',
            });
            const subscriberIds = subscribers.map((sub) => sub.subscriber);
            participants = [
                ...new Set([...participants, ...subscriberIds]),
            ];
            console.log('line 179', { subscriberIds });
        }
        else if (createChatDto.accessType === chat_1.ChatAccessType.PAID) {
            const subscribers = await this.subscriptionModel.find({
                creator: creatorObjectId,
                status: 'active',
                monthlyRate: { $gt: 0 },
            });
            const subscriberIds = subscribers.map((sub) => sub.subscriber);
            participants = [
                ...new Set([...participants, ...subscriberIds]),
            ];
            console.log('line 190', { subscriberIds });
        }
        console.log('line 172', { participants });
        const chat = new this.chatModel({
            type: chat_1.ChatType.GROUP,
            title: createChatDto.title,
            description: createChatDto.description,
            creator: creatorObjectId,
            participants: participants,
            accessType: createChatDto.accessType,
            accessTiers: createChatDto.accessType === chat_1.ChatAccessType.SELECTED
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
            chatId: savedChat._id.toString(),
            chatTitle: savedChat.title,
            creatorId: userId,
            participantIds: participants,
        });
        return this.transformChatToDto(savedChat);
    }
    async createDirectChat(userId, createChatDto) {
        const targetParticipantId = createChatDto.participantId;
        this.logger.log(`Attempting to create direct chat between requesting user ${userId} and target participant ${targetParticipantId}`);
        const userObjectId = new mongoose_2.Types.ObjectId(userId);
        const participantObjectId = new mongoose_2.Types.ObjectId(targetParticipantId);
        const [user, participant] = await Promise.all([
            this.userModel.findById(userObjectId),
            this.userModel.findById(participantObjectId),
        ]);
        if (!user || !participant) {
            this.logger.warn(`createDirectChat failed: Requesting user ${userId} or target participant ${targetParticipantId} not found.`);
            throw new common_1.NotFoundException('User not found');
        }
        const existingChat = await this.chatModel.findOne({
            type: chat_1.ChatType.DIRECT,
            participants: { $all: [userObjectId, participantObjectId] },
            isDeleted: false,
        });
        if (existingChat) {
            this.logger.log(`Existing direct chat found (${existingChat._id}), returning it.`);
            const populatedExistingChat = await this.chatModel
                .findById(existingChat._id)
                .populate('creator', 'displayName firstName lastName profilePicture isCreator')
                .populate('participants', 'displayName firstName lastName profilePicture isCreator')
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
        this.logger.log(`Assigning creator field in Chat schema to: ${creatorUserIdForChat}`);
        const chat = new this.chatModel({
            type: chat_1.ChatType.DIRECT,
            title: `${user.displayName || user.firstName || 'User'} & ${participant.displayName || participant.firstName || 'User'}`,
            creator: new mongoose_2.Types.ObjectId(creatorUserIdForChat),
            participants: [userObjectId, participantObjectId],
        });
        const savedChat = await chat.save();
        this.logger.log(`New direct chat created: ${savedChat._id}`);
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
        this.logger.log(`ChatParticipant entries created for chat ${savedChat._id}`);
        await this.notificationGenerator.generateDirectChatCreatedNotification(userId, targetParticipantId, savedChat._id.toString());
        const newChatId = savedChat._id.toString();
        this.chatGateway.joinUserToChatRoom(userId, newChatId);
        this.chatGateway.joinUserToChatRoom(targetParticipantId, newChatId);
        const populatedNewChat = await this.chatModel
            .findById(savedChat._id)
            .populate('creator', 'displayName firstName lastName profilePicture isCreator')
            .populate('participants', 'displayName firstName lastName profilePicture isCreator')
            .populate({
            path: 'lastMessage',
            populate: { path: 'sender', select: 'displayName firstName lastName' },
        });
        return this.transformChatToDto(populatedNewChat);
    }
    async getUserChats(userId) {
        const chatParticipants = await this.chatParticipantModel
            .find({
            user: new mongoose_2.Types.ObjectId(userId),
            isDeleted: false,
        })
            .populate({
            path: 'chat',
            populate: [
                {
                    path: 'creator',
                    select: 'displayName firstName creatorUsername lastName profilePicture',
                },
                {
                    path: 'participants',
                    select: 'displayName firstName creatorUsername lastName profilePicture',
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
        const directChats = [];
        const groupChats = [];
        for (const participant of chatParticipants) {
            if (!participant.chat || participant.chat.isDeleted) {
                continue;
            }
            const chat = participant.chat;
            const chatDto = {
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
                    name: chat.creator?.displayName || chat.creator?.firstName || 'Creator',
                },
            };
            if (chat.lastMessage) {
                chatDto.lastMessage = {
                    content: chat.lastMessage.content,
                    sender: chat.lastMessage.sender?.displayName ||
                        chat.lastMessage.sender?.firstName ||
                        'User',
                    timestamp: chat.lastMessage.createdAt?.toISOString(),
                };
            }
            if (chat.type === chat_1.ChatType.DIRECT) {
                directChats.push(chatDto);
            }
            else {
                groupChats.push(chatDto);
            }
        }
        return { directChats, groupChats };
    }
    async getChat(userId, chatId) {
        const chatParticipant = await this.chatParticipantModel.findOne({
            chat: new mongoose_2.Types.ObjectId(chatId),
            user: new mongoose_2.Types.ObjectId(userId),
            isDeleted: false,
        });
        if (!chatParticipant) {
            throw new common_1.NotFoundException('Chat not found or you are not a participant');
        }
        const chat = await this.chatModel
            .findById(chatId)
            .populate('creator', 'displayName firstName lastName profilePicture isCreator')
            .populate('participants', 'displayName firstName lastName profilePicture isCreator')
            .populate({
            path: 'lastMessage',
            populate: {
                path: 'sender',
                select: 'displayName firstName lastName',
            },
        })
            .populate('accessTiers', 'name');
        if (!chat || chat.isDeleted) {
            throw new common_1.NotFoundException('Chat not found');
        }
        const chatDto = this.transformChatToDto(chat);
        chatDto.unreadCount = chatParticipant.unreadCount;
        return chatDto;
    }
    async updateGroupChat(userId, chatId, updateChatDto) {
        const chat = await this.chatModel.findById(chatId);
        if (!chat || chat.isDeleted) {
            throw new common_1.NotFoundException('Chat not found');
        }
        if (chat.type !== chat_1.ChatType.GROUP) {
            throw new common_1.BadRequestException('This operation is only available for group chats');
        }
        if (chat.creator.toString() !== userId) {
            throw new common_1.ForbiddenException('Only the creator can update the chat');
        }
        if (updateChatDto.accessType === chat_1.ChatAccessType.SELECTED ||
            (chat.accessType === chat_1.ChatAccessType.SELECTED &&
                !updateChatDto.accessType &&
                updateChatDto.accessTiers)) {
            const tiersToCheck = updateChatDto.accessTiers || chat.accessTiers?.map((t) => t.toString());
            if (!tiersToCheck || tiersToCheck.length === 0) {
                throw new common_1.BadRequestException('Access tiers must be provided when access type is set to "select"');
            }
            const objectIdTiers = tiersToCheck.map((id) => new mongoose_2.Types.ObjectId(id));
            const membershipCount = await this.membershipModel.countDocuments({
                _id: { $in: objectIdTiers },
                creator: new mongoose_2.Types.ObjectId(userId),
            });
            if (membershipCount !== tiersToCheck.length) {
                throw new common_1.BadRequestException('One or more tiers are invalid or do not belong to this creator');
            }
        }
        const updateData = { ...updateChatDto };
        let accessChanged = false;
        if (updateChatDto.accessTiers) {
            updateData.accessTiers = updateChatDto.accessTiers.map((id) => new mongoose_2.Types.ObjectId(id));
            if (JSON.stringify(updateData.accessTiers) !==
                JSON.stringify(chat.accessTiers?.map((t) => t.toString()))) {
                accessChanged = true;
            }
        }
        if (updateChatDto.accessType &&
            updateChatDto.accessType !== chat.accessType) {
            accessChanged = true;
        }
        const updatedChatDoc = await this.chatModel
            .findByIdAndUpdate(chatId, { $set: updateData }, { new: true })
            .populate('creator', 'displayName firstName lastName profilePicture isCreator')
            .populate('participants', '_id')
            .populate('lastMessage')
            .populate('accessTiers', '_id name');
        if (!updatedChatDoc) {
            throw new common_1.NotFoundException('Chat update failed');
        }
        if (accessChanged) {
            console.log(`Access changed for chat ${chatId}, recalculating participants...`);
            try {
                const currentParticipantIds = new Set(updatedChatDoc.participants.map((p) => p._id.toString()));
                const newRequiredParticipantIds = new Set([
                    updatedChatDoc.creator._id.toString(),
                ]);
                if (updatedChatDoc.accessType === chat_1.ChatAccessType.SELECTED &&
                    updatedChatDoc.accessTiers?.length) {
                    const subscribers = await this.subscriptionModel
                        .find({
                        creator: updatedChatDoc.creator._id,
                        membership: {
                            $in: updatedChatDoc.accessTiers.map((t) => t._id),
                        },
                        status: 'active',
                    })
                        .select('subscriber');
                    subscribers.forEach((sub) => newRequiredParticipantIds.add(sub.subscriber.toString()));
                }
                else if (updatedChatDoc.accessType === chat_1.ChatAccessType.PAID) {
                    const subscribers = await this.subscriptionModel
                        .find({
                        creator: updatedChatDoc.creator._id,
                        status: 'active',
                    })
                        .select('subscriber');
                    subscribers.forEach((sub) => newRequiredParticipantIds.add(sub.subscriber.toString()));
                }
                else if (updatedChatDoc.accessType === chat_1.ChatAccessType.ALL) {
                    const allSubscribers = await this.subscriptionModel
                        .find({
                        creator: updatedChatDoc.creator._id,
                        status: 'active',
                    })
                        .select('subscriber');
                    allSubscribers.forEach((sub) => newRequiredParticipantIds.add(sub.subscriber.toString()));
                }
                const participantsToAdd = [...newRequiredParticipantIds].filter((id) => !currentParticipantIds.has(id));
                const participantsToRemove = [...currentParticipantIds].filter((id) => !newRequiredParticipantIds.has(id) &&
                    id !== updatedChatDoc.creator._id.toString());
                console.log('Participants to add:', participantsToAdd);
                console.log('Participants to remove:', participantsToRemove);
                if (participantsToAdd.length > 0) {
                    const addOps = participantsToAdd.map((userIdToAdd) => ({
                        chat: updatedChatDoc._id,
                        user: new mongoose_2.Types.ObjectId(userIdToAdd),
                        hasUnreadMessages: true,
                        unreadCount: 0,
                    }));
                    await this.chatParticipantModel
                        .insertMany(addOps, { ordered: false })
                        .catch((e) => console.log('Ignoring duplicate key errors on insertMany:', e.code));
                    await this.chatModel.findByIdAndUpdate(chatId, {
                        $addToSet: {
                            participants: {
                                $each: participantsToAdd.map((id) => new mongoose_2.Types.ObjectId(id)),
                            },
                        },
                    });
                    console.log(`Added ${participantsToAdd.length} participants to Chat`);
                }
                if (participantsToRemove.length > 0) {
                    await this.chatParticipantModel.updateMany({
                        chat: updatedChatDoc._id,
                        user: {
                            $in: participantsToRemove.map((id) => new mongoose_2.Types.ObjectId(id)),
                        },
                    }, { $set: { isDeleted: true } });
                    await this.chatModel.findByIdAndUpdate(chatId, {
                        $pull: {
                            participants: {
                                $in: participantsToRemove.map((id) => new mongoose_2.Types.ObjectId(id)),
                            },
                        },
                    });
                    console.log(`Removed ${participantsToRemove.length} participants from Chat`);
                }
                const finalChatDoc = await this.chatModel
                    .findById(chatId)
                    .populate('creator', 'displayName firstName lastName profilePicture isCreator')
                    .populate('participants', 'displayName firstName lastName profilePicture isCreator')
                    .populate({
                    path: 'lastMessage',
                    populate: {
                        path: 'sender',
                        select: 'displayName firstName lastName',
                    },
                })
                    .populate('accessTiers', '_id name');
                return this.transformChatToDto(finalChatDoc);
            }
            catch (error) {
                console.error(`Error updating participants for chat ${chatId}:`, error);
                return this.transformChatToDto(updatedChatDoc);
            }
        }
        const fullyPopulatedChat = await this.chatModel
            .findById(chatId)
            .populate('creator', 'displayName firstName lastName profilePicture isCreator')
            .populate('participants', 'displayName firstName lastName profilePicture isCreator')
            .populate({
            path: 'lastMessage',
            populate: { path: 'sender', select: 'displayName firstName lastName' },
        })
            .populate('accessTiers', '_id name');
        return this.transformChatToDto(fullyPopulatedChat || updatedChatDoc);
    }
    async deleteChat(userId, chatId) {
        const chat = await this.chatModel.findById(chatId);
        if (!chat || chat.isDeleted) {
            throw new common_1.NotFoundException('Chat not found');
        }
        if (chat.type === chat_1.ChatType.GROUP && chat.creator.toString() !== userId) {
            throw new common_1.ForbiddenException('Only the creator can delete the chat');
        }
        if (chat.type === chat_1.ChatType.DIRECT &&
            !chat.participants.some((p) => p.toString() === userId)) {
            throw new common_1.ForbiddenException('You are not a participant in this chat');
        }
        await this.chatModel.findByIdAndUpdate(chatId, {
            $set: {
                isDeleted: true,
                deletedAt: new Date(),
            },
        });
        await this.chatParticipantModel.updateMany({ chat: new mongoose_2.Types.ObjectId(chatId) }, { $set: { isDeleted: true } });
        return { success: true };
    }
    async sendMessage(userId, chatId, sendMessageDto, attachmentFile) {
        const userIdObj = new mongoose_2.Types.ObjectId(userId);
        const chatIdObj = new mongoose_2.Types.ObjectId(chatId);
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
        if (!participant) {
            throw new common_1.ForbiddenException('You do not have access to send messages in this chat.');
        }
        if (!sender) {
            throw new common_1.NotFoundException('Sender not found.');
        }
        const chat = participant.chat;
        let attachment = null;
        if (attachmentFile) {
            try {
                const fileUrl = await this.s3Service.uploadFile(attachmentFile, `chat-attachments/${chatId}`, config_1.business.s3.defaultBucket);
                attachment = {
                    url: fileUrl,
                    fileName: attachmentFile.originalname,
                    fileType: attachmentFile.mimetype,
                    fileSize: attachmentFile.size,
                    uploadedAt: new Date().toISOString(),
                };
            }
            catch (s3Error) {
                this.logger.error(`Error uploading attachment to S3 for chat ${chatId}:`, s3Error);
                throw new common_1.InternalServerErrorException('Failed to upload attachment.');
            }
        }
        const message = new this.messageModel({
            chat: chatIdObj,
            sender: userIdObj,
            content: sendMessageDto.content,
            attachments: attachment ? [attachment] : [],
            readBy: [userIdObj],
        });
        const savedMessage = await message.save();
        this.performPostMessageUpdates(chatIdObj, userIdObj, savedMessage._id, chat, sendMessageDto.content);
        const messageDto = this.transformMessageToDto({
            ...savedMessage.toObject(),
            sender: sender,
        });
        return messageDto;
    }
    performPostMessageUpdates(chatIdObj, userIdObj, messageId, chat, messageContent) {
        Promise.allSettled([
            this.chatModel.updateOne({ _id: chatIdObj }, { lastMessage: messageId }),
            this.chatParticipantModel.updateMany({ chat: chatIdObj, user: { $ne: userIdObj }, isDeleted: false }, { $set: { hasUnreadMessages: true }, $inc: { unreadCount: 1 } }),
            this.sendNotificationsToParticipants(chat, userIdObj.toString(), messageContent),
        ]).then((results) => {
            results.forEach((result, i) => {
                if (result.status === 'rejected') {
                    this.logger.error(`Post-message update task ${i} failed for chat ${chatIdObj}:`, result.reason);
                }
            });
        });
    }
    async sendNotificationsToParticipants(chat, senderId, messageContent) {
        try {
            const participants = await this.chatParticipantModel.find({
                chat: chat._id,
                isDeleted: false,
                user: { $ne: new mongoose_2.Types.ObjectId(senderId) },
            });
            for (const participant of participants) {
                const recipientId = participant.user.toString();
                if (chat.type === chat_1.ChatType.DIRECT) {
                    this.notificationGenerator.generateDirectMessageNotification({
                        senderId,
                        recipientId,
                        chatId: chat._id.toString(),
                        messageContent,
                        chatCreator: chat.creator.toString(),
                    });
                }
                else {
                    this.notificationGenerator.generateChatMessageNotification(senderId, recipientId, chat._id.toString(), messageContent, chat.creator.toString());
                }
            }
        }
        catch (error) {
            this.logger.error(`Failed to send notifications for chat ${chat._id}:`, error);
        }
    }
    async getMessages(userId, chatId, query) {
        const chatParticipant = await this.chatParticipantModel.findOne({
            chat: new mongoose_2.Types.ObjectId(chatId),
            user: new mongoose_2.Types.ObjectId(userId),
            isDeleted: false,
        });
        if (!chatParticipant) {
            throw new common_1.NotFoundException('Chat not found or you are not a participant');
        }
        const chat = await this.chatModel.findById(chatId);
        if (!chat || chat.isDeleted) {
            throw new common_1.NotFoundException('Chat not found');
        }
        const filter = {
            chat: new mongoose_2.Types.ObjectId(chatId),
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
            filter._id = { $lt: new mongoose_2.Types.ObjectId(query.before) };
        }
        else if (query.after) {
            filter._id = { $gt: new mongoose_2.Types.ObjectId(query.after) };
        }
        const limit = query.limit || 20;
        const sortDirection = query.initialLoad ? -1 : query.after ? 1 : -1;
        const messages = await this.messageModel
            .find(filter)
            .sort({ createdAt: sortDirection })
            .limit(limit + 1)
            .populate('sender', 'displayName firstName lastName profilePicture isCreator');
        const hasMore = messages.length > limit;
        const hasNewer = query.before ? true : false;
        if (hasMore) {
            messages.pop();
        }
        if ((query.initialLoad && sortDirection === -1) || query.after) {
            messages.reverse();
        }
        const messageDtos = messages.map((msg) => this.transformMessageToDto(msg));
        const nextCursor = hasMore && messages.length > 0
            ? messages[messages.length - 1]._id.toString()
            : undefined;
        const previousCursor = messages.length > 0 ? messages[0]._id.toString() : undefined;
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
    async markMessagesAsRead(userId, chatId, markReadDto) {
        const chatParticipant = await this.chatParticipantModel.findOne({
            chat: new mongoose_2.Types.ObjectId(chatId),
            user: new mongoose_2.Types.ObjectId(userId),
            isDeleted: false,
        });
        if (!chatParticipant) {
            throw new common_1.NotFoundException('Chat not found or you are not a participant');
        }
        await this.messageModel.updateMany({
            chat: new mongoose_2.Types.ObjectId(chatId),
            _id: { $lte: new mongoose_2.Types.ObjectId(markReadDto.lastReadMessageId) },
            readBy: { $ne: new mongoose_2.Types.ObjectId(userId) },
        }, { $addToSet: { readBy: new mongoose_2.Types.ObjectId(userId) } });
        await this.chatParticipantModel.findOneAndUpdate({
            chat: new mongoose_2.Types.ObjectId(chatId),
            user: new mongoose_2.Types.ObjectId(userId),
        }, {
            $set: {
                hasUnreadMessages: false,
                unreadCount: 0,
                lastReadMessageId: new mongoose_2.Types.ObjectId(markReadDto.lastReadMessageId),
            },
        });
        return { success: true };
    }
    async checkChatAccess(userId, chatId) {
        const chat = await this.chatModel.findById(chatId);
        if (!chat || chat.isDeleted) {
            return false;
        }
        if (chat.type === chat_1.ChatType.DIRECT) {
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
            case chat_1.ChatAccessType.ALL:
                return true;
            case chat_1.ChatAccessType.PAID:
                const subscription = await this.subscriptionModel.findOne({
                    subscriber: new mongoose_2.Types.ObjectId(userId),
                    creator: chat.creator,
                    status: 'active',
                });
                return !!subscription;
            case chat_1.ChatAccessType.SELECTED:
                if (!chat.accessTiers || chat.accessTiers.length === 0) {
                    return false;
                }
                const tierSubscription = await this.subscriptionModel.findOne({
                    subscriber: new mongoose_2.Types.ObjectId(userId),
                    creator: chat.creator,
                    membership: { $in: chat.accessTiers },
                    status: 'active',
                });
                return !!tierSubscription;
            default:
                return false;
        }
    }
    async joinChat(userId, chatId) {
        const chat = await this.chatModel.findById(chatId);
        if (!chat || chat.isDeleted) {
            throw new common_1.NotFoundException('Chat not found');
        }
        if (chat.type !== chat_1.ChatType.GROUP) {
            throw new common_1.BadRequestException('Only group chats can be joined');
        }
        const existingParticipant = await this.chatParticipantModel.findOne({
            chat: new mongoose_2.Types.ObjectId(chatId),
            user: new mongoose_2.Types.ObjectId(userId),
            isDeleted: false,
        });
        if (existingParticipant) {
            return this.getChat(userId, chatId);
        }
        const hasAccess = await this.checkChatAccess(userId, chatId);
        if (!hasAccess) {
            throw new common_1.ForbiddenException('You do not have access to join this chat');
        }
        await this.chatParticipantModel.create({
            chat: new mongoose_2.Types.ObjectId(chatId),
            user: new mongoose_2.Types.ObjectId(userId),
            hasUnreadMessages: true,
            unreadCount: 0,
        });
        await this.chatModel.findByIdAndUpdate(chatId, {
            $addToSet: { participants: new mongoose_2.Types.ObjectId(userId) },
        });
        return this.getChat(userId, chatId);
    }
    async leaveChat(userId, chatId) {
        const chat = await this.chatModel.findById(chatId);
        if (!chat || chat.isDeleted) {
            throw new common_1.NotFoundException('Chat not found');
        }
        if (chat.type !== chat_1.ChatType.GROUP) {
            throw new common_1.BadRequestException('Only group chats can be left');
        }
        if (chat.creator.toString() === userId) {
            throw new common_1.BadRequestException('Creator cannot leave their own chat');
        }
        await this.chatParticipantModel.findOneAndUpdate({
            chat: new mongoose_2.Types.ObjectId(chatId),
            user: new mongoose_2.Types.ObjectId(userId),
        }, { $set: { isDeleted: true } });
        await this.chatModel.findByIdAndUpdate(chatId, {
            $pull: { participants: new mongoose_2.Types.ObjectId(userId) },
        });
        return { success: true };
    }
    async getTotalUnreadCount(userId) {
        const participants = await this.chatParticipantModel.find({
            user: new mongoose_2.Types.ObjectId(userId),
            isDeleted: false,
        });
        return participants.reduce((total, participant) => total + (participant.unreadCount || 0), 0);
    }
    transformChatToDto(chatDoc) {
        const chat = chatDoc;
        if (!chat?._id)
            return null;
        const populatedChat = chatDoc;
        const participants = Array.isArray(chat.participants)
            ? chat.participants
                .map((p) => this.transformUserToChatParticipant(p))
                .filter((p) => p !== null)
            : [];
        const creatorDto = chat.creator
            ? this.transformUserToChatParticipant(chat.creator)
            : null;
        if (creatorDto && !participants.some((p) => p.id === creatorDto.id)) {
            const creatorExists = Array.isArray(chat.participants) &&
                chat.participants.some((p) => {
                    const pId = p instanceof mongoose_2.Types.ObjectId
                        ? p.toString()
                        : p?._id?.toString();
                    const creatorId = chat.creator instanceof mongoose_2.Types.ObjectId
                        ? chat.creator.toString()
                        : chat.creator?._id?.toString();
                    return pId === creatorId;
                });
            if (!creatorExists) {
                participants.push(creatorDto);
            }
        }
        const accessTierIds = Array.isArray(chat.accessTiers)
            ? chat.accessTiers
                .map((tier) => tier instanceof mongoose_2.Types.ObjectId
                ? tier.toString()
                : tier?._id?.toString())
                .filter((id) => !!id)
            : [];
        const chatWithUnread = chat;
        return {
            id: chat._id.toString(),
            type: chat.type,
            title: chat.title,
            description: chat.description,
            creator: creatorDto,
            participants: participants,
            lastMessage: populatedChat.lastMessage
                ? this.transformMessageToDto(populatedChat.lastMessage)
                : undefined,
            accessType: chat.accessType,
            accessTiers: accessTierIds,
            createdAt: chat.createdAt?.toISOString(),
            updatedAt: chat.updatedAt?.toISOString(),
            unreadCount: chatWithUnread.unreadCount ?? 0,
        };
    }
    transformMessageToDto(messageDoc) {
        const message = messageDoc;
        if (!message?._id)
            return null;
        const populatedMsg = messageDoc;
        const senderDto = populatedMsg.sender
            ? this.transformUserToChatParticipant(populatedMsg.sender)
            : null;
        if (!senderDto) {
            console.warn(`Message ${message._id} missing populated sender for DTO transformation.`);
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
            attachments: message.attachments?.map((att) => ({
                url: att.url,
                fileName: att.fileName,
                fileType: att.fileType,
                fileSize: att.fileSize,
                uploadedAt: att.uploadedAt instanceof Date
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
    transformUserToChatParticipant(userDoc) {
        if (userDoc instanceof mongoose_2.Document && userDoc._id) {
            const user = userDoc;
            return {
                id: user._id.toString(),
                displayName: user.displayName || user.firstName || 'User',
                profilePicture: user.profilePicture,
                isCreator: user.isCreator ?? false,
            };
        }
        else if (userDoc instanceof mongoose_2.Types.ObjectId) {
            return null;
        }
        else if (typeof userDoc === 'object' && userDoc?._id) {
            const user = userDoc;
            return {
                id: user._id.toString(),
                displayName: user.displayName || user.firstName || 'User',
                profilePicture: user.profilePicture,
                isCreator: user.isCreator ?? false,
            };
        }
        else {
            console.warn('Unrecognized user format for DTO transformation:', userDoc);
            return null;
        }
    }
    async handleNewSubscription(userId, membershipId) {
        const userObjectId = new mongoose_2.Types.ObjectId(userId);
        const membershipObjectId = new mongoose_2.Types.ObjectId(membershipId);
        const membership = await this.membershipModel.findById(membershipObjectId);
        if (!membership?.creator)
            return;
        const creatorObjectId = getObjectId(membership.creator);
        if (!creatorObjectId) {
            console.error(`Could not resolve creator ObjectId for membership ${membershipId}`);
            return;
        }
        const eligibleChats = await this.chatModel.find({
            creator: creatorObjectId,
            type: chat_1.ChatType.GROUP,
            isDeleted: false,
            $or: [
                { accessType: chat_1.ChatAccessType.ALL },
                {
                    accessType: chat_1.ChatAccessType.SELECTED,
                    accessTiers: membershipObjectId,
                },
            ],
            participants: { $ne: userObjectId },
        });
        for (const chat of eligibleChats) {
            await this.chatModel.updateOne({ _id: chat._id }, { $addToSet: { participants: userObjectId } });
            await this.chatParticipantModel.updateOne({ chat: chat._id, user: userObjectId }, {
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
            }, { upsert: true });
        }
    }
    async handleExpiredSubscription(userId, membershipId) {
        const userObjectId = new mongoose_2.Types.ObjectId(userId);
        const membershipObjectId = new mongoose_2.Types.ObjectId(membershipId);
        const membership = await this.membershipModel.findById(membershipObjectId);
        if (!membership?.creator)
            return;
        const creatorObjectId = getObjectId(membership.creator);
        if (!creatorObjectId) {
            console.error(`Could not resolve creator ObjectId for membership ${membershipId}`);
            return;
        }
        const potentiallyAffectedChats = await this.chatModel
            .find({
            creator: creatorObjectId,
            type: chat_1.ChatType.GROUP,
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
            .filter((id) => !!id);
        for (const chat of potentiallyAffectedChats) {
            let userRemainsEligible = false;
            if (chat.accessType === chat_1.ChatAccessType.ALL) {
                userRemainsEligible = otherActiveSubscriptions.length > 0;
            }
            else if (chat.accessType === chat_1.ChatAccessType.SELECTED) {
                const chatAccessTierIds = chat.accessTiers
                    ?.map((tier) => getObjectIdString(tier))
                    .filter((id) => !!id) ?? [];
                userRemainsEligible = otherActiveMembershipObjectIds.some((activeId) => chatAccessTierIds.includes(activeId.toString()));
            }
            if (!userRemainsEligible) {
                await this.chatModel.updateOne({ _id: chat._id }, { $pull: { participants: userObjectId } });
                await this.chatParticipantModel.deleteOne({
                    chat: chat._id,
                    user: userObjectId,
                });
            }
        }
    }
    getDateGroup(date) {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const messageDate = new Date(date);
        const messageDateOnly = new Date(messageDate.getFullYear(), messageDate.getMonth(), messageDate.getDate());
        if (messageDateOnly.getTime() === today.getTime()) {
            return 'today';
        }
        else if (messageDateOnly.getTime() === yesterday.getTime()) {
            return 'yesterday';
        }
        else {
            return messageDate.toISOString().split('T')[0];
        }
    }
    generateDateGroups(messages) {
        const groups = {};
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
    async getMessageDates(userId, chatId, query) {
        const chatParticipant = await this.chatParticipantModel.findOne({
            chat: new mongoose_2.Types.ObjectId(chatId),
            user: new mongoose_2.Types.ObjectId(userId),
            isDeleted: false,
        });
        if (!chatParticipant) {
            throw new common_1.NotFoundException('Chat not found or you are not a participant');
        }
        const chat = await this.chatModel.findById(chatId);
        if (!chat || chat.isDeleted) {
            throw new common_1.NotFoundException('Chat not found');
        }
        const filter = {
            chat: new mongoose_2.Types.ObjectId(chatId),
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
        const dates = dateCounts.map((group) => ({
            date: group._id,
            messageCount: group.messageCount,
            firstMessageId: group.firstMessageId.toString(),
        }));
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
};
exports.ChatService = ChatService;
exports.ChatService = ChatService = ChatService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(chat_1.Chat.name)),
    __param(1, (0, mongoose_1.InjectModel)(chat_1.ChatParticipant.name)),
    __param(2, (0, mongoose_1.InjectModel)(chat_1.Message.name)),
    __param(3, (0, mongoose_1.InjectModel)(user_1.User.name)),
    __param(4, (0, mongoose_1.InjectModel)(membership_1.Membership.name)),
    __param(5, (0, mongoose_1.InjectModel)(subscription_1.Subscription.name)),
    __param(8, (0, common_1.Inject)((0, common_1.forwardRef)(() => chat_gateway_1.ChatGateway))),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        s3_service_1.S3Service,
        notification_generator_service_1.NotificationGeneratorService,
        chat_gateway_1.ChatGateway])
], ChatService);
//# sourceMappingURL=chat.service.js.map