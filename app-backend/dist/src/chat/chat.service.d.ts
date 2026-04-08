import { Model } from 'mongoose';
import { Chat, ChatParticipant, Message } from '@/database/schemas/chat';
import { User } from '@/database/schemas/user';
import { Membership } from '@/database/schemas/membership';
import { Subscription } from '@/database/schemas/subscription';
import { ChatDto, ChatListItemDto, CreateDirectChatDto, CreateGroupChatDto, GetMessagesQueryDto, MarkMessagesReadDto, MessageDto, MessagesResponse, SendMessageDto, UpdateGroupChatDto, GetMessageDatesQueryDto, MessageDatesResponse } from './chat.dto';
import { S3Service } from '@/s3/s3.service';
import { NotificationGeneratorService } from '@/notifications/notification-generator.service';
import { ChatGateway } from './chat.gateway';
export declare class ChatService {
    private chatModel;
    private chatParticipantModel;
    private messageModel;
    private userModel;
    private membershipModel;
    private subscriptionModel;
    private s3Service;
    private notificationGenerator;
    private chatGateway;
    private readonly logger;
    constructor(chatModel: Model<Chat>, chatParticipantModel: Model<ChatParticipant>, messageModel: Model<Message>, userModel: Model<User>, membershipModel: Model<Membership>, subscriptionModel: Model<Subscription>, s3Service: S3Service, notificationGenerator: NotificationGeneratorService, chatGateway: ChatGateway);
    createGroupChat(userId: string, createChatDto: CreateGroupChatDto): Promise<ChatDto>;
    createDirectChat(userId: string, createChatDto: CreateDirectChatDto): Promise<ChatDto>;
    getUserChats(userId: string): Promise<{
        directChats: ChatListItemDto[];
        groupChats: ChatListItemDto[];
    }>;
    getChat(userId: string, chatId: string): Promise<ChatDto>;
    updateGroupChat(userId: string, chatId: string, updateChatDto: UpdateGroupChatDto): Promise<ChatDto>;
    deleteChat(userId: string, chatId: string): Promise<{
        success: boolean;
    }>;
    sendMessage(userId: string, chatId: string, sendMessageDto: SendMessageDto, attachmentFile?: Express.Multer.File): Promise<MessageDto>;
    private performPostMessageUpdates;
    private sendNotificationsToParticipants;
    getMessages(userId: string, chatId: string, query: GetMessagesQueryDto): Promise<MessagesResponse>;
    markMessagesAsRead(userId: string, chatId: string, markReadDto: MarkMessagesReadDto): Promise<{
        success: boolean;
    }>;
    checkChatAccess(userId: string, chatId: string): Promise<boolean>;
    joinChat(userId: string, chatId: string): Promise<ChatDto>;
    leaveChat(userId: string, chatId: string): Promise<{
        success: boolean;
    }>;
    getTotalUnreadCount(userId: string): Promise<number>;
    private transformChatToDto;
    private transformMessageToDto;
    private transformUserToChatParticipant;
    handleNewSubscription(userId: string, membershipId: string): Promise<void>;
    handleExpiredSubscription(userId: string, membershipId: string): Promise<void>;
    getDateGroup(date: Date): string;
    private generateDateGroups;
    getMessageDates(userId: string, chatId: string, query: GetMessageDatesQueryDto): Promise<MessageDatesResponse>;
}
