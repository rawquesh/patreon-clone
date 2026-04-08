import { ChatService } from './chat.service';
import { CreateDirectChatDto, CreateGroupChatDto, GetMessagesQueryDto, GetMessageDatesQueryDto, MarkMessagesReadDto, MessageDto, SendMessageDto, UpdateGroupChatDto } from './chat.dto';
import { ChatGateway } from './chat.gateway';
export declare class ChatController {
    private readonly chatService;
    private readonly chatGateway;
    constructor(chatService: ChatService, chatGateway: ChatGateway);
    createGroupChat(req: any, createChatDto: CreateGroupChatDto): Promise<import("./chat.dto").ChatDto>;
    createDirectChat(req: any, createChatDto: CreateDirectChatDto): Promise<import("./chat.dto").ChatDto>;
    getUserChats(req: any): Promise<{
        directChats: import("./chat.dto").ChatListItemDto[];
        groupChats: import("./chat.dto").ChatListItemDto[];
    }>;
    getChat(req: any, id: string): Promise<import("./chat.dto").ChatDto>;
    updateGroupChat(req: any, id: string, updateChatDto: UpdateGroupChatDto): Promise<import("./chat.dto").ChatDto>;
    deleteChat(req: any, id: string): Promise<{
        success: boolean;
    }>;
    sendMessage(req: any, chatId: string, sendMessageDtoBody: SendMessageDto, attachment?: Express.Multer.File): Promise<MessageDto>;
    getMessages(req: any, id: string, query: GetMessagesQueryDto): Promise<import("./chat.dto").MessagesResponse>;
    getMessageDates(req: any, id: string, query: GetMessageDatesQueryDto): Promise<import("./chat.dto").MessageDatesResponse>;
    markMessagesAsRead(req: any, id: string, markReadDto: MarkMessagesReadDto): Promise<{
        success: boolean;
    }>;
    joinChat(req: any, id: string): Promise<import("./chat.dto").ChatDto>;
    leaveChat(req: any, id: string): Promise<{
        success: boolean;
    }>;
    getTotalUnreadCount(req: any): Promise<{
        count: number;
    }>;
}
