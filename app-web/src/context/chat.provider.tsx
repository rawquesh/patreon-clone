"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useMemo,
} from "react";
import chatService, {
  Chat,
  ChatMessage,
  MessagesResponse,
} from "@/lib/backend-services/chat-service";
import { useAuth } from "./auth.provider";

interface ChatContextType {
  directChats: Chat[];
  groupChats: Chat[];
  currentChat: Chat | null;
  messages: ChatMessage[];
  hasMoreMessages: boolean;
  hasNewerMessages: boolean;
  dateGroups: Record<string, string[]>;
  isLoading: boolean;
  isSending: boolean;
  typingUsers: Record<string, Set<string>>;
  unreadCount: number;
  connectToChat: () => Promise<void>;
  disconnectFromChat: () => void;
  loadChats: () => Promise<void>;
  loadChat: (chatId: string) => Promise<void>;
  sendMessage: (content: string, attachment?: File) => Promise<void>;
  loadMoreMessages: () => Promise<void>;
  markMessagesAsRead: () => Promise<void>;
  setTyping: (isTyping: boolean) => void;
  createGroupChat: (data: {
    title: string;
    description?: string;
    accessType: "all" | "paid" | "select";
    accessTiers?: string[];
  }) => Promise<Chat>;
  createDirectChat: (participantId: string, creatorId: string) => Promise<Chat>;
}
const ChatContext = createContext<ChatContextType | undefined>(undefined);
export function ChatProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [connected, setConnected] = React.useState(false);

  // Individual state hooks
  const [directChats, setDirectChats] = React.useState<Chat[]>([]);
  const [groupChats, setGroupChats] = React.useState<Chat[]>([]);
  const [currentChat, setCurrentChat] = React.useState<Chat | null>(null);
  const [messages, setMessages] = React.useState<ChatMessage[]>([]);
  const [hasMoreMessages, setHasMoreMessages] = React.useState(false);
  const [hasNewerMessages, setHasNewerMessages] = React.useState(false);
  const [dateGroups, setDateGroups] = React.useState<Record<string, string[]>>(
    {}
  );
  const [isLoading, setIsLoading] = React.useState(false);
  const [isSending, setIsSending] = React.useState(false);
  const [typingUsers, setTypingUsers] = React.useState<
    Record<string, Set<string>>
  >({});
  const [unreadCount, setUnreadCount] = React.useState(0);
  const [nextCursor, setNextCursor] = React.useState<string | undefined>(
    undefined
  );
  const [previousCursor, setPreviousCursor] = React.useState<
    string | undefined
  >(undefined);

  console.log({ directChats });

  // Use refs to store current state values that we need to access in callbacks
  const stateRef = useRef({
    directChats,
    groupChats,
    currentChat,
    messages,
    hasMoreMessages,
    hasNewerMessages,
    dateGroups,
    isLoading,
    isSending,
    typingUsers,
    unreadCount,
    nextCursor,
    previousCursor,
  });

  // Update stateRef after each render
  useEffect(() => {
    stateRef.current = {
      directChats,
      groupChats,
      currentChat,
      messages,
      hasMoreMessages,
      hasNewerMessages,
      dateGroups,
      isLoading,
      isSending,
      typingUsers,
      unreadCount,
      nextCursor,
      previousCursor,
    };
  }, [
    directChats,
    groupChats,
    currentChat,
    messages,
    hasMoreMessages,
    hasNewerMessages,
    dateGroups,
    isLoading,
    isSending,
    typingUsers,
    unreadCount,
    nextCursor,
    previousCursor,
  ]);

  const loadChats = useCallback(async () => {
    console.log("loadChats called");
    try {
      setIsLoading(true);
      const { directChats: fetchedDirectChats, groupChats: fetchedGroupChats } =
        await chatService.getUserChats();
      const chronologicallyOrderedGroupChats = fetchedGroupChats.reverse();
      setDirectChats(fetchedDirectChats);
      setGroupChats(chronologicallyOrderedGroupChats);
      console.log("groupChats", fetchedGroupChats);
    } catch (error) {
      console.error("Error loading chats:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const connectToChat = useCallback(async () => {
    console.log("[ChatProvider] connectToChat called (now only connects).");
    if (!user || chatService.isConnected() || chatService.isConnecting()) {
      console.log(
        "[ChatProvider] connectToChat skipped (no user / already connected / already connecting)."
      );
      return;
    }
    try {
      await chatService.connect();
      console.log(
        "[ChatProvider] chatService.connect() promise resolved (connection pending event)..."
      );
    } catch (error) {
      console.error("[ChatProvider] connectToChat initiation failed:", error);
      setConnected(false);
    }
  }, [user]);

  const disconnectFromChat = useCallback(() => {
    console.log("[ChatProvider] disconnectFromChat called.");
    chatService.disconnect();
    setConnected(false);
  }, []);

  const loadChat = useCallback(async (chatId: string) => {
    try {
      setIsLoading(true);
      setMessages([]);
      setDateGroups({});
      setNextCursor(undefined);
      setPreviousCursor(undefined);
      const chat = await chatService.getChat(chatId);
      setCurrentChat(chat);

      const response: MessagesResponse = await chatService.getMessages(chatId, {
        initialLoad: true,
        limit: 20,
        includeGrouping: true,
      });

      // Store messages in oldest-to-newest order (newest at bottom)
      setMessages(response.messages);
      setHasMoreMessages(response.hasMore);
      setHasNewerMessages(response.hasNewer);

      if (response.dateGroups) {
        setDateGroups(response.dateGroups);
      }

      if (response.nextCursor) {
        setNextCursor(response.nextCursor);
      }

      if (response.previousCursor) {
        setPreviousCursor(response.previousCursor);
      }

      console.log(
        "[ChatProvider] loadChat completed. Initial messages count:",
        response.messages.length
      );
    } catch (error) {
      console.error(`Error loading chat ${chatId}:`, error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const sendMessage = useCallback(
    async (content: string, attachment?: File) => {
      const { currentChat: chat, messages: currentMessages } = stateRef.current;
      if (!chat) return;

      try {
        setIsSending(true);
        const message = await chatService.sendMessage(
          chat.id,
          content,
          attachment
        );
        // Add new message to the end (newest at bottom)
        setMessages([...currentMessages, message]);

        // Update date groups if needed
        if (message.dateGroup) {
          setDateGroups((prevGroups) => {
            const updatedGroups = { ...prevGroups };
            const dateKey = message.dateGroup || "today"; // Provide a fallback

            if (!updatedGroups[dateKey]) {
              updatedGroups[dateKey] = [];
            }

            updatedGroups[dateKey].push(message.id);
            return updatedGroups;
          });
        }
      } catch (error) {
        console.error("Error sending message:", error);
      } finally {
        setIsSending(false);
      }
    },
    []
  );

  const loadMoreMessages = useCallback(async () => {
    const {
      currentChat: chat,
      messages: currentMessages,
      hasMoreMessages: hasMore,
      isLoading: loading,
      nextCursor,
    } = stateRef.current;
    if (!chat || !hasMore || loading || !nextCursor) return;

    console.log("[ChatProvider] loadMoreMessages called.");
    try {
      setIsLoading(true);

      const response: MessagesResponse = await chatService.getMessages(
        chat.id,
        {
          before: nextCursor,
          limit: 20,
          includeGrouping: true,
        }
      );

      console.log(
        "[ChatProvider] loadMoreMessages fetched older messages count:",
        response.messages.length
      );

      // Prepend older messages (keep newest at bottom)
      setMessages([...response.messages, ...currentMessages]);
      setHasMoreMessages(response.hasMore);

      if (response.nextCursor) {
        setNextCursor(response.nextCursor);
      }

      // Update date groups
      if (response.dateGroups) {
        setDateGroups((prevGroups) => {
          const updatedGroups = { ...prevGroups };

          // Merge new date groups with existing ones
          Object.entries(response.dateGroups || {}).forEach(([date, ids]) => {
            if (!updatedGroups[date]) {
              updatedGroups[date] = [];
            }

            // Add message IDs that aren't already in the group
            ids.forEach((id) => {
              if (!updatedGroups[date].includes(id)) {
                updatedGroups[date].push(id);
              }
            });
          });

          return updatedGroups;
        });
      }
    } catch (error) {
      console.error("Error loading more messages:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const markMessagesAsRead = useCallback(async () => {
    const {
      currentChat: chat,
      messages: currentMessages,
      directChats: currDirectChats,
      groupChats: currGroupChats,
    } = stateRef.current;
    if (!chat || currentMessages.length === 0) return;
    console.log(
      `[ChatProvider] markMessagesAsRead called for chat: ${chat.id}`
    );

    try {
      const lastMessageId = currentMessages[currentMessages.length - 1].id;
      await chatService.markMessagesAsRead(chat.id, lastMessageId);

      setDirectChats(
        currDirectChats.map((c) =>
          c.id === chat.id ? { ...c, unreadCount: 0 } : c
        )
      );

      setGroupChats(
        currGroupChats.map((c) =>
          c.id === chat.id ? { ...c, unreadCount: 0 } : c
        )
      );
    } catch (error) {
      console.error("Error marking messages as read:", error);
    }
  }, []);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const setTyping = useCallback((_isTyping: boolean) => {
    // No-op function - typing indicators disabled
    return;
  }, []);

  const createGroupChat = useCallback(
    async (data: {
      title: string;
      description?: string;
      accessType: "all" | "paid" | "select";
      accessTiers?: string[];
    }) => {
      return await chatService.createGroupChat(data);
    },
    []
  );

  const createDirectChat = useCallback(
    async (participantId: string, creatorId: string) => {
      return await chatService.createDirectChat(participantId, creatorId);
    },
    []
  );

  useEffect(() => {
    console.log("[ChatProvider] Main useEffect running. Deps:", {
      user: !!user,
    });

    if (!user) {
      console.log("[ChatProvider] No user, disconnecting if connected.");
      if (chatService.isConnected()) {
        disconnectFromChat();
      }
      setDirectChats([]);
      setGroupChats([]);
      setCurrentChat(null);
      setMessages([]);
      setHasMoreMessages(false);
      setIsLoading(false);
      setIsSending(false);
      setTypingUsers({});
      setUnreadCount(0);
      return;
    }

    const setupListeners = () => {
      console.log(
        "[ChatProvider] setupListeners() defining handlers and attaching listeners."
      );

      const handleConnected = (data: { userId: string }) => {
        console.log(
          "[ChatProvider] Listener triggered: 'connected'. Setting connected state to true.",
          data
        );
        setConnected(true);
        // loadChats();
        chatService.getUnreadCount().then((count) => {
          console.log("[ChatProvider] Received initial unread count:", count);
          setUnreadCount(count);
        });
        console.log(
          "[ChatProvider] Initial chats and unread count loading initiated after connection."
        );
      };

      const handleDisconnect = () => {
        console.warn(
          "[ChatProvider] Listener triggered: 'disconnect'. Setting connected state to false."
        );
        setConnected(false);
      };

      const handleConnectError = (error: Error) => {
        console.error(
          "[ChatProvider] Listener triggered: 'connect_error'. Setting connected state to false.",
          error
        );
        setConnected(false);
      };

      const handleNewMessage = (data: {
        chatId: string;
        message: ChatMessage;
      }) => {
        console.log(
          "[ChatProvider] Listener triggered: 'new_message'. Data:",
          data
        );
        const {
          currentChat: chat,
          messages: currentMessages,
          directChats: currDirectChats,
          groupChats: currGroupChats,
          unreadCount: currUnreadCount,
        } = stateRef.current;

        console.log("[ChatProvider] handleNewMessage - Current state:", {
          currentChatId: chat?.id,
          messageChatId: data.chatId,
        });

        if (chat?.id === data.chatId) {
          console.log(
            "[ChatProvider] handleNewMessage - Updating messages for current chat."
          );
          setMessages([...currentMessages, data.message]);
          console.log(
            "[ChatProvider] handleNewMessage - Calling markMessagesAsRead after adding message."
          );
          markMessagesAsRead();
        }

        const updateChatList = (chats: Chat[]): Chat[] =>
          chats.map((c) =>
            c.id === data.chatId
              ? {
                  ...c,
                  lastMessage: {
                    content: data.message.content,
                    sender: data.message.sender.displayName,
                    timestamp: data.message.createdAt,
                  },
                  unreadCount:
                    chat?.id === data.chatId
                      ? c.unreadCount
                      : (c.unreadCount || 0) + 1,
                }
              : c
          );

        console.log("[ChatProvider] handleNewMessage - Updating chat lists.");
        const newDirectChats = updateChatList(currDirectChats);
        const newGroupChats = updateChatList(currGroupChats);
        const increment = chat?.id === data.chatId ? 0 : 1;

        setDirectChats(newDirectChats);
        setGroupChats(newGroupChats);
        setUnreadCount(currUnreadCount + increment);
      };

      const handleMessageRead = (data: {
        chatId: string;
        userId: string;
        lastReadMessageId: string;
      }) => {
        console.log(
          "[ChatProvider] Listener triggered: 'message_read'. Data:",
          data
        );
        const { currentChat: chat, messages: currentMessages } =
          stateRef.current;
        if (chat?.id !== data.chatId) return;

        console.log(
          "[ChatProvider] handleMessageRead - Updating messages readBy status."
        );
        setMessages(
          currentMessages.map((msg) => {
            if (
              msg.id <= data.lastReadMessageId &&
              !msg.readBy.includes(data.userId)
            ) {
              return { ...msg, readBy: [...msg.readBy, data.userId] };
            }
            return msg;
          })
        );
      };

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const handleUserTyping = (_data: {
        chatId: string;
        userId: string;
        isTyping: boolean;
      }) => {
        // No-op function - typing indicators disabled
        return;
      };

      const handleUnreadCountUpdate = (data: { count: number }) => {
        console.log(
          "[ChatProvider] Listener triggered: 'unread_count_update'. Data:",
          data
        );
        setUnreadCount(data.count);
      };

      const unsubscribers = [
        chatService.on("connected", handleConnected),
        chatService.on("disconnect", handleDisconnect),
        chatService.on("connect_error", handleConnectError),
        chatService.on("new_message", handleNewMessage),
        chatService.on("message_read", handleMessageRead),
        chatService.on("user_typing", handleUserTyping),
        chatService.on("unread_count_update", handleUnreadCountUpdate),
      ];
      console.log("[ChatProvider] Listeners attached via chatService.on.");

      return () => {
        console.log(
          "[ChatProvider] Cleanup function: Unsubscribing all listeners."
        );
        unsubscribers.forEach((unsub) => unsub());
      };
    };

    console.log("[ChatProvider] Setting up listeners...");
    const cleanupListeners = setupListeners();

    if (user && !chatService.isConnected() && !chatService.isConnecting()) {
      console.log(
        "[ChatProvider] User found, service not connected/connecting. Calling connectToChat..."
      );
      connectToChat();
    } else if (chatService.isConnected()) {
      console.log("[ChatProvider] Service already connected on effect run.");
      if (!connected) {
        console.log(
          "[ChatProvider] Syncing provider connected state to true and loading initial data."
        );
        setConnected(true);
        // loadChats();
        chatService.getUnreadCount().then((count) => setUnreadCount(count));
      }
    } else if (chatService.isConnecting()) {
      console.log(
        "[ChatProvider] Service is currently connecting. Waiting for connected/error event."
      );
    }

    return () => {
      console.log("[ChatProvider] Main useEffect cleanup running.");
      cleanupListeners();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, connectToChat, disconnectFromChat, loadChats]);

  // Memoize the context value
  const contextValue = useMemo(
    () => ({
      // Individual state values
      directChats,
      groupChats,
      currentChat,
      messages,
      hasMoreMessages,
      hasNewerMessages,
      dateGroups,
      isLoading,
      isSending,
      typingUsers,
      unreadCount,
      // Include memoized functions
      connectToChat,
      disconnectFromChat,
      loadChats,
      loadChat,
      sendMessage,
      loadMoreMessages,
      markMessagesAsRead,
      setTyping,
      createGroupChat,
      createDirectChat,
    }),
    [
      // Depend on individual state values
      directChats,
      groupChats,
      currentChat,
      messages,
      hasMoreMessages,
      hasNewerMessages,
      dateGroups,
      isLoading,
      isSending,
      typingUsers,
      unreadCount,
      // Depend on memoized functions
      connectToChat,
      disconnectFromChat,
      loadChats,
      loadChat,
      sendMessage,
      loadMoreMessages,
      markMessagesAsRead,
      setTyping,
      createGroupChat,
      createDirectChat,
    ]
  );

  console.log({ messages });

  return (
    <ChatContext.Provider value={contextValue}>{children}</ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
}
