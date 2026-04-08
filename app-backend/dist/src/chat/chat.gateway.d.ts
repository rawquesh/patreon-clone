import { OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { ChatService } from './chat.service';
import { SendMessageDto, MarkMessagesReadDto, MessageDto } from './chat.dto';
import { Model } from 'mongoose';
import { ChatParticipant } from '@/database/schemas/chat';
import { ModuleRef } from '@nestjs/core';
export declare class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit {
    private readonly jwtService;
    private readonly chatService;
    private chatParticipantModel;
    private moduleRef;
    server: Server;
    private readonly logger;
    private serverInitialized;
    private adapterInitialized;
    private pendingBroadcasts;
    private initializationTimeout;
    private userSocketMap;
    private socketUserMap;
    constructor(jwtService: JwtService, chatService: ChatService, chatParticipantModel: Model<ChatParticipant>, moduleRef: ModuleRef);
    afterInit(server: Server): void;
    private processPendingBroadcasts;
    handleConnection(client: Socket): Promise<void>;
    handleDisconnect(client: Socket): void;
    handleJoinChat(client: Socket, payload: {
        chatId: string;
    }): Promise<{
        success: boolean;
        chatId: string;
        message?: undefined;
    } | {
        success: boolean;
        message: any;
        chatId?: undefined;
    }>;
    handleLeaveChat(client: Socket, payload: {
        chatId: string;
    }): Promise<{
        success: boolean;
        chatId: string;
    }>;
    handleSendMessage(client: Socket, payload: {
        chatId: string;
        message: SendMessageDto;
    }): Promise<MessageDto | {
        success: boolean;
        message: string;
    }>;
    handleMarkRead(client: Socket, payload: {
        chatId: string;
        data: MarkMessagesReadDto;
    }): Promise<{
        success: boolean;
    } | {
        success: boolean;
        message: any;
    }>;
    handleTyping(client: Socket, payload: {
        chatId: string;
        isTyping: boolean;
    }): Promise<{
        success: boolean;
    }>;
    broadcastNewMessage(chatId: string, message: MessageDto): void;
    notifyChatUpdated(chatId: string, data: any): void;
    notifyNewChat(userId: string, chatData: any): void;
    joinUserToChatRoom(userId: string, chatId: string): void;
}
