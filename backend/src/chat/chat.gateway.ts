import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseGuards, Inject, forwardRef, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ChatService } from './chat.service';
import { SendMessageDto, MarkMessagesReadDto, MessageDto } from './chat.dto';
import { WsJwtGuard } from './ws-jwt.guard';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ChatParticipant } from '@/schemas/chat.schema';
import { ModuleRef } from '@nestjs/core';
// import { NotificationGeneratorService } from '@/notifications/notification-generator.service';

@WebSocketGateway({
  namespace: 'chat',
  cors: {
    origin: '*',
  },
})
export class ChatGateway
  implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(ChatGateway.name);
  private serverInitialized = false;
  private adapterInitialized = false;
  private pendingBroadcasts: Array<{
    roomName: string;
    event: string;
    payload: any;
  }> = [];
  private initializationTimeout: NodeJS.Timeout;

  private userSocketMap: Map<string, Set<string>> = new Map();
  private socketUserMap: Map<string, string> = new Map();

  constructor(
    private readonly jwtService: JwtService,
    @Inject(forwardRef(() => ChatService))
    private readonly chatService: ChatService,
    @InjectModel(ChatParticipant.name)
    private chatParticipantModel: Model<ChatParticipant>,
    private moduleRef: ModuleRef,
  ) {}

  afterInit(server: Server) {
    this.serverInitialized = true;
    this.server = server;
    this.logger.log('WebSocket server initialized');

    // Add a delay to ensure adapter is fully initialized
    this.initializationTimeout = setTimeout(() => {
      this.adapterInitialized = true;
      this.logger.log('Socket.io adapter initialization timeout completed');

      // Process any pending broadcasts
      if (this.pendingBroadcasts.length > 0) {
        this.logger.log(
          `Processing ${this.pendingBroadcasts.length} pending broadcasts`,
        );
        this.processPendingBroadcasts();
      }
    }, 3000); // 3 seconds seems reasonable for adapter initialization
  }

  private processPendingBroadcasts() {
    if (!this.adapterInitialized || !this.serverInitialized || !this.server) {
      this.logger.warn(
        'Cannot process pending broadcasts: Server or adapter not ready',
      );
      return;
    }

    while (this.pendingBroadcasts.length > 0) {
      const broadcast = this.pendingBroadcasts.shift();
      try {
        this.logger.log(
          `Processing pending broadcast to room ${broadcast.roomName}: event=${broadcast.event}`,
        );
        this.server
          .to(broadcast.roomName)
          .emit(broadcast.event, broadcast.payload);
      } catch (error) {
        this.logger.error(
          `Failed to emit pending broadcast to room ${broadcast.roomName}: ${error.message}`,
          error.stack,
        );
      }
    }
  }

  async handleConnection(client: Socket) {
    try {
      const token =
        client.handshake.auth.token ||
        client.handshake.headers.authorization?.split(' ')[1];

      if (!token) {
        this.logger.warn(
          `Connection attempt rejected: No token found for socket ${client.id}`,
        );
        client.disconnect();
        return;
      }

      const payload = this.jwtService.verify(token);
      const userId = payload.sub || payload.userId;

      if (!userId) {
        this.logger.warn(
          `Connection attempt rejected: Invalid token payload (no userId) for socket ${client.id}`,
        );
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
      this.logger.log(
        `Found ${userChatParticipants.length} active chat participations for user ${userId}`,
      );

      userChatParticipants.forEach((participant) => {
        const chatId = participant.chat?.toString();
        if (chatId && Types.ObjectId.isValid(chatId)) {
          const roomName = `chat:${chatId}`;
          client.join(roomName);
          this.logger.log(
            `Socket ${client.id} (User: ${userId}) automatically joined room ${roomName}`,
          );
        } else {
          this.logger.warn(
            `Skipping auto-join for user ${userId}, socket ${client.id}: Invalid chatId found in ChatParticipant ${participant._id}`,
          );
        }
      });

      client.emit('connected', { userId });
    } catch (error) {
      const userId = this.socketUserMap.get(client.id) || 'unknown';
      this.logger.error(
        `Connection error for socket ${client.id} (User: ${userId}): ${error.message}`,
        error.stack,
      );
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
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
    } else {
      this.logger.log(`Unknown socket ${client.id} disconnected.`);
    }
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('join_chat')
  async handleJoinChat(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { chatId: string },
  ) {
    const userId = this.socketUserMap.get(client.id);
    if (!userId) return;

    try {
      const hasAccess = await this.chatService.checkChatAccess(
        userId,
        payload.chatId,
      );
      if (!hasAccess) {
        this.logger.warn(
          `User ${userId} denied joining room chat:${payload.chatId} (No access)`,
        );
        return { success: false, message: 'Access denied' };
      }

      const roomName = `chat:${payload.chatId}`;
      client.join(roomName);
      this.logger.log(
        `Socket ${client.id} (User: ${userId}) explicitly joined room ${roomName}`,
      );
      return { success: true, chatId: payload.chatId };
    } catch (error) {
      this.logger.error(
        `Error during join_chat for user ${userId}, chat ${payload.chatId}: ${error.message}`,
        error.stack,
      );
      return { success: false, message: error.message };
    }
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('leave_chat')
  async handleLeaveChat(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { chatId: string },
  ) {
    const userId = this.socketUserMap.get(client.id);
    const roomName = `chat:${payload.chatId}`;
    client.leave(roomName);
    this.logger.log(
      `Socket ${client.id} (User: ${userId || 'unknown'}) left room ${roomName}`,
    );
    return { success: true, chatId: payload.chatId };
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('send_message')
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { chatId: string; message: SendMessageDto },
  ) {
    this.logger.log(`Received 'send_message' event from socket ${client.id}`);

    const userId = this.socketUserMap.get(client.id);
    if (!userId) {
      this.logger.warn(
        `Cannot handle 'send_message': No userId found for socket ${client.id}`,
      );
      return { success: false, message: 'Authentication error' };
    }

    this.logger.log(
      `User ${userId} attempting to send message to chat ${payload.chatId}. Content: "${payload.message?.content?.substring(0, 50)}..."`,
    );

    try {
      this.logger.log(
        `Calling chatService.sendMessage for user ${userId}, chat ${payload.chatId}...`,
      );
      const messageDto: MessageDto = await this.chatService.sendMessage(
        userId,
        payload.chatId,
        payload.message,
      );
      this.logger.log(
        `chatService.sendMessage successful for chat ${payload.chatId}. Returned message ID: ${messageDto?.id}`,
      );

      const roomName = `chat:${payload.chatId}`;

      // The dateGroup is already added by transformMessageToDto in the chat service
      const emitPayload = {
        chatId: payload.chatId,
        message: messageDto,
      };

      const socketsInRoom = this.server.sockets.adapter.rooms.get(roomName);
      if (socketsInRoom && socketsInRoom.size > 0) {
        this.logger.log(
          `Broadcasting 'new_message' (ID: ${messageDto.id}) from User ${userId} to room ${roomName} (${socketsInRoom.size} socket(s))`,
        );
        this.server.to(roomName).emit('new_message', emitPayload);
        this.logger.log(
          `Successfully emitted 'new_message' (ID: ${messageDto.id}) to room ${roomName}.`,
        );
      } else {
        this.logger.warn(
          `Did not emit 'new_message' (ID: ${messageDto.id}) because room ${roomName} has no sockets connected.`,
        );
      }

      const participants = await this.chatParticipantModel.find({
        chat: payload.chatId,
        isDeleted: false,
      });

      for (const participant of participants) {
        if (participant.user.toString() !== userId) {
          const unreadCount = await this.chatService.getTotalUnreadCount(
            participant.user.toString(),
          );

          // try {
          //   const notificationGenerator = this.moduleRef.get(
          //     NotificationGeneratorService,
          //     { strict: false },
          //   );
          //   // if (notificationGenerator) {
          //   //   await notificationGenerator.generateChatMessageNotification(
          //   //     userId,
          //   //     participant.user.toString(),
          //   //     payload.chatId,
          //   //     payload.message.content,
          //   //   );
          //   // }
          // } catch (error) {
          //   this.logger.error(
          //     `Failed to generate chat notification for user ${participant.user.toString()}:`,
          //     error,
          //   );
          // }

          const userSockets = this.userSocketMap.get(
            participant.user.toString(),
          );
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
    } catch (error) {
      this.logger.error(
        `Error during 'send_message' processing for user ${userId}, chat ${payload.chatId}: ${error.message}`,
        error.stack,
      );
      return {
        success: false,
        message: `Failed to send message: ${error.message || 'Unknown error'}`,
      };
    }
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('mark_read')
  async handleMarkRead(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { chatId: string; data: MarkMessagesReadDto },
  ) {
    const userId = this.socketUserMap.get(client.id);
    if (!userId) return;

    try {
      const result = await this.chatService.markMessagesAsRead(
        userId,
        payload.chatId,
        payload.data,
      );

      this.server.to(`chat:${payload.chatId}`).emit('message_read', {
        chatId: payload.chatId,
        userId,
        lastReadMessageId: payload.data.lastReadMessageId,
      });

      return result;
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('typing')
  async handleTyping(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { chatId: string; isTyping: boolean },
  ) {
    const userId = this.socketUserMap.get(client.id);
    if (!userId) return;

    client.to(`chat:${payload.chatId}`).emit('user_typing', {
      chatId: payload.chatId,
      userId,
      isTyping: payload.isTyping,
    });

    return { success: true };
  }

  public broadcastNewMessage(chatId: string, message: MessageDto): void {
    try {
      const roomName = `chat:${chatId}`;

      // Ensure dateGroup is present in the message
      if (!message.dateGroup && message.createdAt) {
        const messageDate = new Date(message.createdAt);
        if (messageDate) {
          message.dateGroup = this.chatService.getDateGroup(messageDate);
        }
      }

      const emitPayload = { chatId, message };

      // Check if server is initialized
      if (!this.server) {
        this.logger.warn(
          `Cannot broadcast message to ${roomName}: Socket.io server not initialized`,
        );
        // Store for later broadcasting when server is available
        this.pendingBroadcasts.push({
          roomName,
          event: 'new_message',
          payload: emitPayload,
        });
        return;
      }

      // Check if adapter is initialized
      if (!this.adapterInitialized) {
        this.logger.warn(
          `Deferring broadcast to ${roomName}: Socket.io adapter not fully initialized yet`,
        );
        // Queue for later broadcasting
        this.pendingBroadcasts.push({
          roomName,
          event: 'new_message',
          payload: emitPayload,
        });
        return;
      }

      // Adapter is initialized, check for room
      let roomSize = 0;
      try {
        if (this.server.sockets?.adapter?.rooms?.get) {
          const socketsInRoom = this.server.sockets.adapter.rooms.get(roomName);
          roomSize = socketsInRoom ? socketsInRoom.size : 0;
        }
      } catch (error) {
        this.logger.warn(
          `Error checking room ${roomName} details: ${error.message}. Proceeding with broadcast anyway.`,
        );
      }

      // Always broadcast even if room appears empty - clients may join later
      this.logger.log(
        `Broadcasting 'new_message' (ID: ${message.id}) to room ${roomName} (${roomSize} sockets currently connected)`,
      );

      try {
        this.server.to(roomName).emit('new_message', emitPayload);
        this.logger.log(
          `Successfully emitted 'new_message' (ID: ${message.id}) to room ${roomName}`,
        );
      } catch (error) {
        this.logger.error(
          `Failed to emit 'new_message' to room ${roomName}: ${error.message}`,
          error.stack,
        );
      }
    } catch (error) {
      // Catch-all for any unexpected errors
      this.logger.error(
        `Unexpected error in broadcastNewMessage for chat ${chatId}: ${error.message}`,
        error.stack,
      );
    }
  }

  notifyChatUpdated(chatId: string, data: any) {
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
    } catch (error) {
      this.logger.error(
        `Error in notifyChatUpdated for chat ${chatId}: ${error.message}`,
        error.stack,
      );
    }
  }

  notifyNewChat(userId: string, chatData: any) {
    try {
      const userSockets = this.userSocketMap.get(userId);

      if (!userSockets || !this.server || !this.adapterInitialized) {
        this.logger.log(`Queuing new_chat notification for user ${userId}`);
        // We'll use a special format for user-specific broadcasts
        this.pendingBroadcasts.push({
          roomName: `user:${userId}`,
          event: 'new_chat',
          payload: chatData,
        });
        return;
      }

      userSockets.forEach((socketId) => {
        this.logger.log(
          `Sending new_chat notification to socket ${socketId} for user ${userId}`,
        );
        this.server.to(socketId).emit('new_chat', chatData);
      });
    } catch (error) {
      this.logger.error(
        `Error in notifyNewChat for user ${userId}: ${error.message}`,
        error.stack,
      );
    }
  }
  public joinUserToChatRoom(userId: string, chatId: string) {
    // Add a guard to ensure the server and its properties are initialized
    if (!this.server || !this.server.sockets || !this.server.sockets.sockets) {
      this.logger.warn(
        `Server not fully initialized. Cannot join user ${userId} to chat ${chatId} at this time.`,
      );
      return;
    }

    const userSockets = this.userSocketMap.get(userId);
    if (userSockets) {
      const roomName = `chat:${chatId}`;
      userSockets.forEach((socketId) => {
        const socket = this.server.sockets.sockets.get(socketId);
        if (socket) {
          socket.join(roomName);
          this.logger.log(
            `Dynamically joined user ${userId} (socket ${socketId}) to room ${roomName}`,
          );
        }
      });
    }
  }
}
