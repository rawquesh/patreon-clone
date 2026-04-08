/* eslint-disable @typescript-eslint/no-unsafe-function-type */
import { io, Socket } from "socket.io-client";
import api from "../api";
import { toaster } from "@/components/ui/toaster";

export interface UserChatMessage {
  id: string;
  content: string;
  sender: {
    id: string;
    displayName: string;
    profilePicture?: string;
    isCreator: boolean;
  };
  attachments?: Array<{
    url: string;
    fileName: string;
    fileType: string;
    fileSize: number;
  }>;
  createdAt: string;
  readBy: string[];
}

export interface UserChat {
  id: string;
  type: "group" | "direct";
  title: string;
  description?: string;
  creator: {
    id: string;
    displayName: string;
    profilePicture?: string;
    isCreator: boolean;
  };
  participants: Array<{
    id: string;
    displayName: string;
    profilePicture?: string;
    isCreator: boolean;
  }>;
  lastMessage?: {
    content: string;
    sender: string;
    timestamp: string;
  };
  unreadCount: number;
}

type UserChatEventMap = {
  connected: (data: { userId: string }) => void;
  new_message: (data: { chatId: string; message: UserChatMessage }) => void;
  message_read: (data: {
    chatId: string;
    userId: string;
    lastReadMessageId: string;
  }) => void;
  user_typing: (data: {
    chatId: string;
    userId: string;
    isTyping: boolean;
  }) => void;
  disconnect: () => void;
  connect_error: (error: Error) => void;
};

class UserChatService {
  private socket: Socket | null = null;
  private eventListeners: Map<string, Set<Function>> = new Map();
  private connected = false;
  private connecting = false;

  public async connect(): Promise<void> {
    if (this.connected || this.connecting) return;

    this.connecting = true;

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Not authenticated");
      }
      const apiUrl = "https://your-backend-server.example.com.com";
      this.socket = io(`${apiUrl}/chat`, {
        auth: { token },
        transports: ["websocket"],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5,
      });

      this.setupEventListeners();

      return new Promise((resolve, reject) => {
        if (!this.socket) return reject(new Error("Socket not initialized"));

        this.socket.on("connected", (data: any) => {
          this.connecting = false;
          this.connected = true;
          this.emit("connected", data);
          resolve();
        });

        this.socket.on("connect_error", (error) => {
          this.connecting = false;
          reject(error);
        });

        setTimeout(() => {
          if (!this.connected) {
            this.connecting = false;
            reject(new Error("Connection timeout"));
          }
        }, 10000);
      });
    } catch (error) {
      this.connecting = false;
      throw error;
    }
  }

  public disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.connected = false;
    }
  }

  private setupEventListeners(): void {
    if (!this.socket) return;

    const eventTypes: Array<keyof UserChatEventMap> = [
      "new_message",
      "message_read",
      "user_typing",
    ];

    eventTypes.forEach((eventType) => {
      this.socket?.on(eventType, (data: any) => {
        this.emit(eventType, data);
      });
    });
  }

  public on<T extends keyof UserChatEventMap>(
    event: T,
    listener: UserChatEventMap[T]
  ): () => void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }

    this.eventListeners.get(event)?.add(listener as Function);
    return () => {
      this.eventListeners.get(event)?.delete(listener as Function);
    };
  }

  private emit<T extends keyof UserChatEventMap>(
    event: T,
    ...args: Parameters<UserChatEventMap[T]>
  ): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach((listener) => {
        try {
          listener(...args);
        } catch (error) {
          console.error(`Error in ${event} listener:`, error);
        }
      });
    }
  }

  public async getUserChats(): Promise<{
    directChats: UserChat[];
    groupChats: UserChat[];
  }> {
    try {
      const response = await api.get("/chat");
      return response.data;
    } catch (error) {
      console.error("Error fetching chats:", error);
      toaster.create({
        title: "Error",
        description: "Failed to fetch chats",
        type: "error",
        duration: 3000,
      });
      return { directChats: [], groupChats: [] };
    }
  }

  public async getChat(chatId: string): Promise<UserChat> {
    console.log("getChat", chatId);
    try {
      const response = await api.get(`/chat/${chatId}`);

      return response.data;
    } catch (error) {
      console.error(`Error fetching chat ${chatId}:`, error);
      toaster.create({
        title: "Error",
        description: "Failed to fetch chat details",
        type: "error",
        duration: 3000,
      });
      throw error;
    }
  }

  public async getMessages(
    chatId: string,
    params?: { before?: string; limit?: number }
  ): Promise<{ messages: UserChatMessage[]; hasMore: boolean }> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.limit) queryParams.append("limit", params.limit.toString());
      if (params?.before) queryParams.append("before", params.before);

      const response = await api.get(
        `/chat/${chatId}/messages?${queryParams.toString()}`
      );
      return response.data;
    } catch (error) {
      console.error(`Error fetching messages for chat ${chatId}:`, error);
      toaster.create({
        title: "Error",
        description: "Failed to load messages",
        type: "error",
        duration: 3000,
      });
      return { messages: [], hasMore: false };
    }
  }

  public async sendMessage(
    chatId: string,
    content: string,
    attachment?: File
  ): Promise<UserChatMessage> {
    try {
      const formData = new FormData();
      formData.append("content", content);
      if (attachment) {
        formData.append("attachment", attachment);
      }

      const response = await api.post(`/chat/${chatId}/messages`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error) {
      console.error(`Error sending message to chat ${chatId}:`, error);
      toaster.create({
        title: "Error",
        description: "Failed to send message",
        type: "error",
        duration: 3000,
      });
      throw error;
    }
  }

  public async markMessagesAsRead(
    chatId: string,
    lastReadMessageId: string
  ): Promise<void> {
    try {
      await api.post(`/chat/${chatId}/read`, { lastReadMessageId });
    } catch (error) {
      console.error("Error marking messages as read:", error);
      throw error;
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public sendTypingIndicator(chatId: string, isTyping: boolean): void {
    // No-op function - typing indicators disabled
    return;
  }

  public async getUnreadCount(): Promise<number> {
    try {
      const response = await api.get("/chat/unread/count");
      return response.data.count;
    } catch (error) {
      console.error("Error fetching unread count:", error);
      return 0;
    }
  }
}

const userChatService = new UserChatService();
export default userChatService;
