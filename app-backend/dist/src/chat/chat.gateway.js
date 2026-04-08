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
var ChatGateway_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const chat_service_1 = require("./chat.service");
const ws_jwt_guard_1 = require("./ws-jwt.guard");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const chat_1 = require("../database/schemas/chat");
const core_1 = require("@nestjs/core");
let ChatGateway = ChatGateway_1 = class ChatGateway {
    constructor(jwtService, chatService, chatParticipantModel, moduleRef) {
        this.jwtService = jwtService;
        this.chatService = chatService;
        this.chatParticipantModel = chatParticipantModel;
        this.moduleRef = moduleRef;
        this.logger = new common_1.Logger(ChatGateway_1.name);
        this.serverInitialized = false;
        this.adapterInitialized = false;
        this.pendingBroadcasts = [];
        this.userSocketMap = new Map();
        this.socketUserMap = new Map();
    }
    afterInit(server) {
        this.serverInitialized = true;
        this.server = server;
        this.logger.log('WebSocket server initialized');
        this.initializationTimeout = setTimeout(() => {
            this.adapterInitialized = true;
            this.logger.log('Socket.io adapter initialization timeout completed');
            if (this.pendingBroadcasts.length > 0) {
                this.logger.log(`Processing ${this.pendingBroadcasts.length} pending broadcasts`);
                this.processPendingBroadcasts();
            }
        }, 3000);
    }
    processPendingBroadcasts() {
        if (!this.adapterInitialized || !this.serverInitialized || !this.server) {
            this.logger.warn('Cannot process pending broadcasts: Server or adapter not ready');
            return;
        }
        while (this.pendingBroadcasts.length > 0) {
            const broadcast = this.pendingBroadcasts.shift();
            try {
                this.logger.log(`Processing pending broadcast to room ${broadcast.roomName}: event=${broadcast.event}`);
                this.server
                    .to(broadcast.roomName)
                    .emit(broadcast.event, broadcast.payload);
            }
            catch (error) {
                this.logger.error(`Failed to emit pending broadcast to room ${broadcast.roomName}: ${error.message}`, error.stack);
            }
        }
    }
    async handleConnection(client) {
        try {
            const token = client.handshake.auth.token ||
                client.handshake.headers.authorization?.split(' ')[1];
            if (!token) {
                this.logger.warn(`Connection attempt rejected: No token found for socket ${client.id}`);
                client.disconnect();
                return;
            }
            const payload = this.jwtService.verify(token);
            const userId = payload.sub || payload.userId;
            if (!userId) {
                this.logger.warn(`Connection attempt rejected: Invalid token payload (no userId) for socket ${client.id}`);
                client.disconnect();
                return;
            }
            if (!this.userSocketMap.has(userId)) {
                this.userSocketMap.set(userId, new Set());
            }
            this.userSocketMap.get(userId).add(client.id);
            this.socketUserMap.set(client.id, userId);
            this.logger.log(`User ${userId} connected with socket ${client.id}`);
            const userChatParticipants = await this.chatParticipantModel.find({
                user: userId,
                isDeleted: false,
            });
            this.logger.log(`Found ${userChatParticipants.length} active chat participations for user ${userId}`);
            userChatParticipants.forEach((participant) => {
                const chatId = participant.chat?.toString();
                if (chatId && mongoose_2.Types.ObjectId.isValid(chatId)) {
                    const roomName = `chat:${chatId}`;
                    client.join(roomName);
                    this.logger.log(`Socket ${client.id} (User: ${userId}) automatically joined room ${roomName}`);
                }
                else {
                    this.logger.warn(`Skipping auto-join for user ${userId}, socket ${client.id}: Invalid chatId found in ChatParticipant ${participant._id}`);
                }
            });
            client.emit('connected', { userId });
        }
        catch (error) {
            const userId = this.socketUserMap.get(client.id) || 'unknown';
            this.logger.error(`Connection error for socket ${client.id} (User: ${userId}): ${error.message}`, error.stack);
            client.disconnect();
        }
    }
    handleDisconnect(client) {
        const userId = this.socketUserMap.get(client.id);
        if (userId) {
            this.logger.log(`User ${userId} disconnected (socket ${client.id})`);
            const userSockets = this.userSocketMap.get(userId);
            if (userSockets) {
                userSockets.delete(client.id);
                if (userSockets.size === 0) {
                    this.logger.log(`User ${userId} has no remaining connections.`);
                    this.userSocketMap.delete(userId);
                }
            }
            this.socketUserMap.delete(client.id);
        }
        else {
            this.logger.log(`Unknown socket ${client.id} disconnected.`);
        }
    }
    async handleJoinChat(client, payload) {
        const userId = this.socketUserMap.get(client.id);
        if (!userId)
            return;
        try {
            const hasAccess = await this.chatService.checkChatAccess(userId, payload.chatId);
            if (!hasAccess) {
                this.logger.warn(`User ${userId} denied joining room chat:${payload.chatId} (No access)`);
                return { success: false, message: 'Access denied' };
            }
            const roomName = `chat:${payload.chatId}`;
            client.join(roomName);
            this.logger.log(`Socket ${client.id} (User: ${userId}) explicitly joined room ${roomName}`);
            return { success: true, chatId: payload.chatId };
        }
        catch (error) {
            this.logger.error(`Error during join_chat for user ${userId}, chat ${payload.chatId}: ${error.message}`, error.stack);
            return { success: false, message: error.message };
        }
    }
    async handleLeaveChat(client, payload) {
        const userId = this.socketUserMap.get(client.id);
        const roomName = `chat:${payload.chatId}`;
        client.leave(roomName);
        this.logger.log(`Socket ${client.id} (User: ${userId || 'unknown'}) left room ${roomName}`);
        return { success: true, chatId: payload.chatId };
    }
    async handleSendMessage(client, payload) {
        this.logger.log(`Received 'send_message' event from socket ${client.id}`);
        const userId = this.socketUserMap.get(client.id);
        if (!userId) {
            this.logger.warn(`Cannot handle 'send_message': No userId found for socket ${client.id}`);
            return { success: false, message: 'Authentication error' };
        }
        this.logger.log(`User ${userId} attempting to send message to chat ${payload.chatId}. Content: "${payload.message?.content?.substring(0, 50)}..."`);
        try {
            this.logger.log(`Calling chatService.sendMessage for user ${userId}, chat ${payload.chatId}...`);
            const messageDto = await this.chatService.sendMessage(userId, payload.chatId, payload.message);
            this.logger.log(`chatService.sendMessage successful for chat ${payload.chatId}. Returned message ID: ${messageDto?.id}`);
            const roomName = `chat:${payload.chatId}`;
            const emitPayload = {
                chatId: payload.chatId,
                message: messageDto,
            };
            const socketsInRoom = this.server.sockets.adapter.rooms.get(roomName);
            if (socketsInRoom && socketsInRoom.size > 0) {
                this.logger.log(`Broadcasting 'new_message' (ID: ${messageDto.id}) from User ${userId} to room ${roomName} (${socketsInRoom.size} socket(s))`);
                this.server.to(roomName).emit('new_message', emitPayload);
                this.logger.log(`Successfully emitted 'new_message' (ID: ${messageDto.id}) to room ${roomName}.`);
            }
            else {
                this.logger.warn(`Did not emit 'new_message' (ID: ${messageDto.id}) because room ${roomName} has no sockets connected.`);
            }
            const participants = await this.chatParticipantModel.find({
                chat: payload.chatId,
                isDeleted: false,
            });
            for (const participant of participants) {
                if (participant.user.toString() !== userId) {
                    const unreadCount = await this.chatService.getTotalUnreadCount(participant.user.toString());
                    const userSockets = this.userSocketMap.get(participant.user.toString());
                    if (userSockets) {
                        userSockets.forEach((socketId) => {
                            this.server
                                .to(socketId)
                                .emit('unread_count_update', { count: unreadCount });
                        });
                    }
                }
            }
            return messageDto;
        }
        catch (error) {
            this.logger.error(`Error during 'send_message' processing for user ${userId}, chat ${payload.chatId}: ${error.message}`, error.stack);
            return {
                success: false,
                message: `Failed to send message: ${error.message || 'Unknown error'}`,
            };
        }
    }
    async handleMarkRead(client, payload) {
        const userId = this.socketUserMap.get(client.id);
        if (!userId)
            return;
        try {
            const result = await this.chatService.markMessagesAsRead(userId, payload.chatId, payload.data);
            this.server.to(`chat:${payload.chatId}`).emit('message_read', {
                chatId: payload.chatId,
                userId,
                lastReadMessageId: payload.data.lastReadMessageId,
            });
            return result;
        }
        catch (error) {
            return { success: false, message: error.message };
        }
    }
    async handleTyping(client, payload) {
        const userId = this.socketUserMap.get(client.id);
        if (!userId)
            return;
        client.to(`chat:${payload.chatId}`).emit('user_typing', {
            chatId: payload.chatId,
            userId,
            isTyping: payload.isTyping,
        });
        return { success: true };
    }
    broadcastNewMessage(chatId, message) {
        try {
            const roomName = `chat:${chatId}`;
            if (!message.dateGroup && message.createdAt) {
                const messageDate = new Date(message.createdAt);
                if (messageDate) {
                    message.dateGroup = this.chatService.getDateGroup(messageDate);
                }
            }
            const emitPayload = { chatId, message };
            if (!this.server) {
                this.logger.warn(`Cannot broadcast message to ${roomName}: Socket.io server not initialized`);
                this.pendingBroadcasts.push({
                    roomName,
                    event: 'new_message',
                    payload: emitPayload,
                });
                return;
            }
            if (!this.adapterInitialized) {
                this.logger.warn(`Deferring broadcast to ${roomName}: Socket.io adapter not fully initialized yet`);
                this.pendingBroadcasts.push({
                    roomName,
                    event: 'new_message',
                    payload: emitPayload,
                });
                return;
            }
            let roomSize = 0;
            try {
                if (this.server.sockets?.adapter?.rooms?.get) {
                    const socketsInRoom = this.server.sockets.adapter.rooms.get(roomName);
                    roomSize = socketsInRoom ? socketsInRoom.size : 0;
                }
            }
            catch (error) {
                this.logger.warn(`Error checking room ${roomName} details: ${error.message}. Proceeding with broadcast anyway.`);
            }
            this.logger.log(`Broadcasting 'new_message' (ID: ${message.id}) to room ${roomName} (${roomSize} sockets currently connected)`);
            try {
                this.server.to(roomName).emit('new_message', emitPayload);
                this.logger.log(`Successfully emitted 'new_message' (ID: ${message.id}) to room ${roomName}`);
            }
            catch (error) {
                this.logger.error(`Failed to emit 'new_message' to room ${roomName}: ${error.message}`, error.stack);
            }
        }
        catch (error) {
            this.logger.error(`Unexpected error in broadcastNewMessage for chat ${chatId}: ${error.message}`, error.stack);
        }
    }
    notifyChatUpdated(chatId, data) {
        try {
            const roomName = `chat:${chatId}`;
            const payload = { chatId, ...data };
            if (!this.server || !this.adapterInitialized) {
                this.pendingBroadcasts.push({
                    roomName,
                    event: 'chat_updated',
                    payload,
                });
                return;
            }
            this.server.to(roomName).emit('chat_updated', payload);
        }
        catch (error) {
            this.logger.error(`Error in notifyChatUpdated for chat ${chatId}: ${error.message}`, error.stack);
        }
    }
    notifyNewChat(userId, chatData) {
        try {
            const userSockets = this.userSocketMap.get(userId);
            if (!userSockets || !this.server || !this.adapterInitialized) {
                this.logger.log(`Queuing new_chat notification for user ${userId}`);
                this.pendingBroadcasts.push({
                    roomName: `user:${userId}`,
                    event: 'new_chat',
                    payload: chatData,
                });
                return;
            }
            userSockets.forEach((socketId) => {
                this.logger.log(`Sending new_chat notification to socket ${socketId} for user ${userId}`);
                this.server.to(socketId).emit('new_chat', chatData);
            });
        }
        catch (error) {
            this.logger.error(`Error in notifyNewChat for user ${userId}: ${error.message}`, error.stack);
        }
    }
    joinUserToChatRoom(userId, chatId) {
        if (!this.server || !this.server.sockets || !this.server.sockets.sockets) {
            this.logger.warn(`Server not fully initialized. Cannot join user ${userId} to chat ${chatId} at this time.`);
            return;
        }
        const userSockets = this.userSocketMap.get(userId);
        if (userSockets) {
            const roomName = `chat:${chatId}`;
            userSockets.forEach((socketId) => {
                const socket = this.server.sockets.sockets.get(socketId);
                if (socket) {
                    socket.join(roomName);
                    this.logger.log(`Dynamically joined user ${userId} (socket ${socketId}) to room ${roomName}`);
                }
            });
        }
    }
};
exports.ChatGateway = ChatGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], ChatGateway.prototype, "server", void 0);
__decorate([
    (0, common_1.UseGuards)(ws_jwt_guard_1.WsJwtGuard),
    (0, websockets_1.SubscribeMessage)('join_chat'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "handleJoinChat", null);
__decorate([
    (0, common_1.UseGuards)(ws_jwt_guard_1.WsJwtGuard),
    (0, websockets_1.SubscribeMessage)('leave_chat'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "handleLeaveChat", null);
__decorate([
    (0, common_1.UseGuards)(ws_jwt_guard_1.WsJwtGuard),
    (0, websockets_1.SubscribeMessage)('send_message'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "handleSendMessage", null);
__decorate([
    (0, common_1.UseGuards)(ws_jwt_guard_1.WsJwtGuard),
    (0, websockets_1.SubscribeMessage)('mark_read'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "handleMarkRead", null);
__decorate([
    (0, common_1.UseGuards)(ws_jwt_guard_1.WsJwtGuard),
    (0, websockets_1.SubscribeMessage)('typing'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "handleTyping", null);
exports.ChatGateway = ChatGateway = ChatGateway_1 = __decorate([
    (0, websockets_1.WebSocketGateway)({
        namespace: 'chat',
        cors: {
            origin: '*',
        },
    }),
    __param(1, (0, common_1.Inject)((0, common_1.forwardRef)(() => chat_service_1.ChatService))),
    __param(2, (0, mongoose_1.InjectModel)(chat_1.ChatParticipant.name)),
    __metadata("design:paramtypes", [jwt_1.JwtService,
        chat_service_1.ChatService,
        mongoose_2.Model,
        core_1.ModuleRef])
], ChatGateway);
//# sourceMappingURL=chat.gateway.js.map