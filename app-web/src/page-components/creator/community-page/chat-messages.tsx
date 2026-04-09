"use client";
import {
  Box,
  Flex,
  Spinner,
  Stack,
  Text,
  Center,
  Button,
} from "@chakra-ui/react";
import React, { useEffect, useRef, useState } from "react";
import ViewChatDetails from "./view-chat-details";
import ChatMessage from "./chat-message";
import ChatInput from "./chat-input";
import { useChat } from "@/context/chat.provider";
import { useParams } from "next/navigation";
import { ChatMessage as ChatMessageType } from "@/lib/backend-services/chat-service";
// import { useAuth } from "@/context/auth.provider";

// Define props interface
interface ChatMessagesProps {
  chatId?: string;
}

// Interface for date separator
interface DateSeparator {
  type: "date";
  date: string;
  key: string;
}

// Type for items in the messages list (either a message or date separator)
type ChatItem = ChatMessageType | DateSeparator;

// Helper function to check if an item is a date separator
const isDateSeparator = (item: ChatItem): item is DateSeparator => {
  return (item as DateSeparator).type === "date";
};

// Function to format date display
const formatDateSeparator = (date: string): string => {
  if (date === "today") {
    return "Today";
  } else if (date === "yesterday") {
    return "Yesterday";
  } else {
    // Format YYYY-MM-DD to a more readable date
    try {
      const dateObj = new Date(date);
      return dateObj.toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return date;
    }
  }
};

// Function to get timestamp from date string for sorting
const getDateSortValue = (date: string): number => {
  if (date === "today") {
    return Date.now();
  } else if (date === "yesterday") {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return yesterday.getTime();
  } else {
    try {
      return new Date(date).getTime();
    } catch {
      return 0;
    }
  }
};

const ChatMessages: React.FC<ChatMessagesProps> = ({ chatId: propChatId }) => {
  const { chatId: paramChatId } = useParams<{ chatId: string }>();
  const chatId = propChatId || paramChatId; // Prioritize prop if provided
  const {
    loadChat,
    currentChat,
    messages,
    hasMoreMessages,
    isLoading,
    loadMoreMessages,
    markMessagesAsRead,
  } = useChat();
  // const { user } = useAuth(); // Make sure useAuth is imported
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const prevMessagesLengthRef = useRef<number>(0);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [isLoadingOldMessages, setIsLoadingOldMessages] = useState(false);

  useEffect(() => {
    let isMounted = true;
    if (chatId && isMounted) {
      setLoadingInitial(true);
      loadChat(chatId as string).finally(() => {
        if (isMounted) {
          setLoadingInitial(false);
        }
      });
    }
    return () => {
      isMounted = false;
    };
  }, [chatId, loadChat]);

  useEffect(() => {
    // Only scroll to bottom for new messages, not when loading older ones
    // Also ensure we're handling initial load correctly
    if (
      messages.length > prevMessagesLengthRef.current &&
      !isLoadingOldMessages &&
      (!isLoading || loadingInitial)
    ) {
      console.log("[ChatMessages] Scrolling to bottom for new messages");
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
    prevMessagesLengthRef.current = messages.length;
  }, [messages, isLoading, isLoadingOldMessages, loadingInitial]);

  useEffect(() => {
    if (messages.length > 0 && currentChat) {
      markMessagesAsRead();
    }
  }, [messages, currentChat, markMessagesAsRead]);

  // Function to handle loading older messages
  const handleLoadOlderMessages = async () => {
    if (!hasMoreMessages || loadingOlder) return;

    setLoadingOlder(true);
    setIsLoadingOldMessages(true);
    const container = messagesContainerRef.current;
    const oldScrollHeight = container?.scrollHeight || 0;

    try {
      console.log("[ChatMessages] Loading older messages via button click");
      await loadMoreMessages();

      // After messages are loaded, maintain scroll position
      if (container) {
        requestAnimationFrame(() => {
          const newScrollHeight = container.scrollHeight;
          // Set scroll position to maintain the same view (new content appears above)
          container.scrollTop = newScrollHeight - oldScrollHeight;
        });
      }
    } catch (error) {
      console.error("Error loading older messages:", error);
    } finally {
      setLoadingOlder(false);
      // Reset the loading old messages flag after a small delay to prevent immediate scroll
      setTimeout(() => {
        setIsLoadingOldMessages(false);
      }, 300);
    }
  };

  // Create a combined list of messages and date separators
  const chatItems = React.useMemo(() => {
    if (!messages.length) return [];

    const items: ChatItem[] = [];
    const datesSeen = new Set<string>();

    // Sort messages by date & prepare groups
    const dateGrouppedMessages: Record<string, ChatMessageType[]> = {};

    // Group messages by their dateGroup
    messages.forEach((msg) => {
      const dateGroup = msg.dateGroup || "unknown";
      if (!dateGrouppedMessages[dateGroup]) {
        dateGrouppedMessages[dateGroup] = [];
      }
      dateGrouppedMessages[dateGroup].push(msg);
    });

    // Sort each group of messages by timestamp (oldest to newest within each date)
    Object.keys(dateGrouppedMessages).forEach((date) => {
      dateGrouppedMessages[date].sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
    });

    // Sort dates chronologically (oldest to newest)
    const sortedDates = Object.keys(dateGrouppedMessages).sort((a, b) => {
      return getDateSortValue(a) - getDateSortValue(b);
    });

    // Create the list with date separators and messages
    for (const date of sortedDates) {
      // Add date separator if we haven't seen this date yet
      if (!datesSeen.has(date)) {
        items.push({
          type: "date",
          date,
          key: `date-${date}`,
        });
        datesSeen.add(date);
      }

      // Add all messages for this date
      items.push(...dateGrouppedMessages[date]);
    }

    return items;
  }, [messages]);

  if (!chatId) {
    return (
      <Flex
        ml={{ base: 0, lg: "300px" }}
        h="100vh"
        alignItems="center"
        justifyContent="center"
      >
        <Text>Select a chat</Text>
      </Flex>
    );
  }
  if (loadingInitial && messages.length === 0) {
    return (
      <Flex
        ml={{ base: 0, lg: "300px" }}
        h="100vh"
        alignItems="center"
        justifyContent="center"
      >
        <Spinner size="xl" css={{ color: "hsl(211, 71%, 43%)" }} />
      </Flex>
    );
  }
  if (!currentChat) {
    return (
      <Flex
        ml={{ base: 0, lg: "300px" }}
        h="100vh"
        alignItems="center"
        justifyContent="center"
      >
        <Text css={{ color: "hsl(0, 84.2%, 60.2%)" }}>Could not load chat.</Text>
      </Flex>
    );
  }

  return (
    <Box
      ml={{ base: 0, lg: "300px" }}
      // h="100%"
      display="flex"
      flexDirection="column"
      pos="relative" // Needed for overlay
    >
      <Flex px={"15px"} borderBottomWidth="1px" alignItems="center" css={{ borderColor: "hsl(210, 30%, 88%)" }}>
        <Stack gap={0} flex={1}>
          <Text fontWeight={600} css={{ color: "hsl(222.2, 47.4%, 11.2%)" }}>{currentChat.title}</Text>
          <ViewChatDetails chat={currentChat} />
        </Stack>
      </Flex>

      <Box
        flex={1}
        position="fixed"
        w={{
          base: "calc(100% - 300px)",
          lg: "calc(100% - 600px)",
        }}
        zIndex={1000}
        bottom={73}
        top={"60px"}
        overflow={"scroll"}
        ref={messagesContainerRef}
        css={{
          "&::-webkit-scrollbar": {
            width: "4px",
          },
          "&::-webkit-scrollbar-track": {
            width: "6px",
          },
          "&::-webkit-scrollbar-thumb": {
            background: "hsl(210, 30%, 88%)",
            borderRadius: "24px",
          },
          scrollPaddingTop: "40px",
        }}
      >
        {/* Load Older Messages Button */}
        {hasMoreMessages && (
          <Flex justify="center" py={2} top={0} zIndex={2}>
            <Button
              size="sm"
              css={{
                borderColor: "hsl(211, 71%, 43%)",
                color: "hsl(211, 71%, 43%)",
                "&:hover": {
                  background: "var(--gradient-primary)",
                  color: "white",
                  borderColor: "transparent",
                },
              }}
              disabled={loadingOlder}
              onClick={handleLoadOlderMessages}
              borderRadius="full"
              px={6}
            >
              {loadingOlder ? (
                <Flex alignItems="center">
                  <Spinner size="xs" mr={2} />
                  Loading...
                </Flex>
              ) : (
                "Load Older Messages"
              )}
            </Button>
          </Flex>
        )}

        <Stack overflowY="auto" gap={4} p={4}>
          {chatItems.map((item) =>
            isDateSeparator(item) ? (
              <Center key={item.key} py={2}>
                <Box flex="1" height="1px" css={{ background: "hsl(210, 30%, 88%)" }} />
                <Text
                  mx={4}
                  fontSize="xs"
                  fontWeight="medium"
                  css={{ color: "hsl(215.4, 16.3%, 46.9%)" }}
                  textTransform="uppercase"
                >
                  {formatDateSeparator(item.date)}
                </Text>
                <Box flex="1" height="1px" css={{ background: "hsl(210, 30%, 88%)" }} />
              </Center>
            ) : (
              <ChatMessage
                key={item.id}
                message={item}
                // isOwnMessage={user?._id === item.sender.id}
              />
            )
          )}

          <div ref={messagesEndRef} />
        </Stack>

        {loadingInitial && messages.length === 0 && (
          <Flex
            position="absolute"
            inset={0}
            alignItems="center"
            justifyContent="center"
            zIndex={10}
          >
            <Spinner size="xl" css={{ color: "hsl(211, 71%, 43%)" }} />
          </Flex>
        )}
      </Box>

      <ChatInput isDisabled={loadingInitial} />
    </Box>
  );
};

export default ChatMessages;
