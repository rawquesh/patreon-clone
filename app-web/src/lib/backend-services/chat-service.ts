/* eslint-disable @typescript-eslint/no-unsafe-function-type */
import { io, Socket } from "socket.io-client";
import api from "../api";
import { branding } from "@/config/branding";
import { toastHandlers } from "@/lib/toasts";

export interface ChatMessage {
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
  dateGroup?: string;
}

export interface MessageDatesResponse {
  dates: {
    date: string;
    messageCount: number;
    firstMessageId: string;
  }[];
  oldestDate: string;
  newestDate: string;
}

export interface MessagesResponse {
  messages: ChatMessage[];
  hasMore: boolean;
  hasNewer: boolean;
  dateGroups?: {
    [date: string]: string[];
  };
  nextCursor?: string;
  previousCursor?: string;
}

export interface Chat {
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
    name: string;
    id: string;
    displayName: string;
    profilePicture?: string;
    isCreator: boolean;
    creatorUsername?: string;
  }>;
  lastMessage?: {
    content: string;
    sender: string;
    timestamp: string;
  };
  unreadCount: number;
  accessType?: "all" | "paid" | "select";
  accessTiers?: string[];
}

export interface ChatListItem {
  id: string;
  title: string;
  type: "group" | "direct";
  lastMessage?: {
    content: string;
    sender: string;
    timestamp: string;
  };
  unreadCount: number;
  participants: Array<{
    id: string;
    name: string;
    profilePicture?: string;
  }>;
  creator: {
    id: string;
    name: string;
  };
}

type ChatEventMap = {
  connected: (data: { userId: string }) => void;
  new_message: (data: { chatId: string; message: ChatMessage }) => void;
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
  unread_count_update: (data: { count: number }) => void;
};

class ChatService {
  private socket: Socket | null = null;
  private eventListeners: Map<string, Set<Function>> = new Map();
  private connected = false;
  private connecting = false;

  public isConnected = () => this.connected;
  public isConnecting = () => this.connecting;

  public async connect(): Promise<void> {
    if (this.connected || this.connecting) return;

    this.connecting = true;

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("[ChatService] connect() failed: No token found.");
        throw new Error("Not authenticated");
      }
      const apiUrl = `${branding.urls.apiServer}`;
      this.socket = io(`https://${apiUrl}/chat`, {
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
          console.error("[ChatService] Socket event: 'connect_error'.", error);
          this.connecting = false;
          this.connected = false;
          this.socket?.disconnect();
          this.socket = null;
          this.emit("connect_error", error);
          reject(error);
        });

        this.socket.on("disconnect", (reason) => {
          console.warn(
            "[ChatService] Socket event: 'disconnect'. Reason:",
            reason
          );
          this.connected = false;
          this.connecting = false;
          this.emit("disconnect");
        });
      });
    } catch (error) {
      console.error("[ChatService] connect() caught exception:", error);
      this.connecting = false;
      this.connected = false;
      throw error;
    }
  }

  public disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.connected = false;
      this.connecting = false;
    }
  }

  private setupEventListeners(): void {
    if (!this.socket) return;

    const eventTypes: Array<keyof ChatEventMap> = [
      "new_message",
      "message_read",
      "user_typing",
      "unread_count_update",
    ];

    eventTypes.forEach((eventType) => {
      this.socket?.off(eventType);

      this.socket?.on(eventType, (data: any) => {
        this.emit(eventType as any, data);
      });
    });
  }

  public on<T extends keyof ChatEventMap>(
    event: T,
    listener: ChatEventMap[T]
  ): () => void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }
    const listeners = this.eventListeners.get(event);
    listeners?.add(listener as Function);
    return () => {
      listeners?.delete(listener as Function);
    };
  }

  private emit<T extends keyof ChatEventMap>(
    event: T,
    ...args: Parameters<ChatEventMap[T]>
  ): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach((listener) => {
        try {
          listener(...args);
        } catch (error) {
          console.error(
            `[ChatService] Error in listener for event ${event}:`,
            error
          );
        }
      });
    }
  }

  public async getUserChats(): Promise<{
    directChats: Chat[];
    groupChats: Chat[];
  }> {
    try {
      const response = await api.get("/chat");

      return response.data;
    } catch (error) {
      console.error("Error fetching chats:", error);
      toastHandlers.chatFetchError("fetch chats");
      return { directChats: [], groupChats: [] };
    }
  }

  public async getChat(chatId: string): Promise<Chat> {
    try {
      const response = await api.get(`/chat/${chatId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching chat ${chatId}:`, error);
      toastHandlers.chatFetchError("fetch chat details");
      throw error;
    }
  }

  public async getMessages(
    chatId: string,
    params?: {
      before?: string;
      after?: string;
      limit?: number;
      beforeDate?: string;
      afterDate?: string;
      includeGrouping?: boolean;
      initialLoad?: boolean;
    }
  ): Promise<MessagesResponse> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.limit) queryParams.append("limit", params.limit.toString());
      if (params?.before) queryParams.append("before", params.before);
      if (params?.after) queryParams.append("after", params.after);
      if (params?.beforeDate)
        queryParams.append("beforeDate", params.beforeDate);
      if (params?.afterDate) queryParams.append("afterDate", params.afterDate);
      if (params?.includeGrouping !== undefined)
        queryParams.append(
          "includeGrouping",
          params.includeGrouping.toString()
        );
      if (params?.initialLoad !== undefined)
        queryParams.append("initialLoad", params.initialLoad.toString());

      const response = await api.get(
        `/chat/${chatId}/messages?${queryParams.toString()}`
      );
      return response.data;
    } catch (error) {
      console.error(`Error fetching messages for chat ${chatId}:`, error);
      toastHandlers.chatFetchError("load messages");
      return {
        messages: [],
        hasMore: false,
        hasNewer: false,
      };
    }
  }

  public async getMessageDates(
    chatId: string,
    params?: {
      startDate?: string;
      endDate?: string;
    }
  ): Promise<MessageDatesResponse> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.startDate) queryParams.append("startDate", params.startDate);
      if (params?.endDate) queryParams.append("endDate", params.endDate);

      const response = await api.get(
        `/chat/${chatId}/message-dates?${queryParams.toString()}`
      );
      return response.data;
    } catch (error) {
      console.error(`Error fetching message dates for chat ${chatId}:`, error);
      toastHandlers.chatFetchError("load message dates");
      return {
        dates: [],
        oldestDate: "",
        newestDate: "",
      };
    }
  }

  public async createGroupChat(data: {
    title: string;
    description?: string;
    accessType: "all" | "paid" | "select";
    accessTiers?: string[];
  }): Promise<Chat> {
    try {
      const cleanData = {
        title: data.title,
        description: data.description || "",
        accessType: data.accessType,
        accessTiers: data.accessTiers || [],
      };
      const response = await api.post("/chat/group", cleanData);
      return response.data;
    } catch (error) {
      console.error("Error creating group chat:", error);
      toastHandlers.chatFetchError("create group chat");
      throw error;
    }
  }

  public async createDirectChat(
    participantId: string,
    creatorId: string
  ): Promise<Chat> {
    try {
      const response = await api.post("/chat/direct", {
        participantId,
        creatorId,
      });
      return response.data;
    } catch (error) {
      console.error("Error creating direct chat:", error);
      toastHandlers.chatFetchError("create direct chat");
      throw error;
    }
  }

  public async sendMessage(
    chatId: string,
    content: string,
    attachment?: File
  ): Promise<ChatMessage> {
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
      toastHandlers.chatFetchError("send message");
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
      console.error(`Error marking messages as read in chat ${chatId}:`, error);
      throw error;
    }
  }

  public sendTypingIndicator(): void {
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

const chatService = new ChatService();
export default chatService;
