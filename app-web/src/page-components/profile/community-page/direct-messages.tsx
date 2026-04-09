"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  Box,
  Flex,
  Stack,
  Text,
  Button,
  Center,
} from "@chakra-ui/react";
import { useChat } from "@/context/chat.provider";
import ChatMessage from "./chat-message";
import ChatInput from "./chat-input";
import { useParams } from "next/navigation";
import { useAuth } from "@/context/auth.provider";
import { Avatar } from "@/components/ui/avatar";
import { ChatMessage as ChatMessageType } from "@/lib/backend-services/chat-service";

interface DateSeparator {
  type: "date";
  date: string;
  key: string;
}

type ChatItem = ChatMessageType | DateSeparator;

const isDateSeparator = (item: ChatItem): item is DateSeparator => {
  return (item as DateSeparator).type === "date";
};

const formatDateSeparator = (date: string): string => {
  if (date === "today") return "Today";
  if (date === "yesterday") return "Yesterday";
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
};

const getDateSortValue = (date: string): number => {
  if (date === "today") return Date.now();
  if (date === "yesterday") {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return yesterday.getTime();
  }
  try {
    return new Date(date).getTime();
  } catch {
    return 0;
  }
};

const DirectMessages: React.FC = () => {
  const { chatId } = useParams<{ chatId: string }>();
  const {
    loadChat,
    currentChat,
    messages,
    sendMessage,
    loadMoreMessages,
    hasMoreMessages,
    isLoading,
    markMessagesAsRead,
  } = useChat();
  const { user } = useAuth();

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
    if (
      messages.length > prevMessagesLengthRef.current &&
      !isLoadingOldMessages &&
      (!isLoading || loadingInitial)
    ) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
    prevMessagesLengthRef.current = messages.length;
  }, [messages, isLoading, isLoadingOldMessages, loadingInitial]);

  useEffect(() => {
    if (messages.length > 0 && currentChat) {
      markMessagesAsRead();
    }
  }, [messages, currentChat, markMessagesAsRead]);

  const handleLoadOlderMessages = async () => {
    if (!hasMoreMessages || loadingOlder) return;

    setLoadingOlder(true);
    setIsLoadingOldMessages(true);
    const container = messagesContainerRef.current;
    const oldScrollHeight = container?.scrollHeight || 0;

    try {
      await loadMoreMessages();

      if (container) {
        requestAnimationFrame(() => {
          const newScrollHeight = container.scrollHeight;
          container.scrollTop = newScrollHeight - oldScrollHeight;
        });
      }
    } catch (error) {
      console.error("Error loading older messages:", error);
    } finally {
      setLoadingOlder(false);
      setTimeout(() => {
        setIsLoadingOldMessages(false);
      }, 300);
    }
  };

  const chatItems = React.useMemo(() => {
    if (!messages.length) return [];

    const items: ChatItem[] = [];
    const dateGrouppedMessages: Record<string, ChatMessageType[]> = {};

    messages.forEach((msg) => {
      const dateGroup = msg.dateGroup || "unknown";
      if (!dateGrouppedMessages[dateGroup]) {
        dateGrouppedMessages[dateGroup] = [];
      }
      dateGrouppedMessages[dateGroup].push(msg);
    });

    Object.keys(dateGrouppedMessages).forEach((date) => {
      dateGrouppedMessages[date].sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
    });

    const sortedDates = Object.keys(dateGrouppedMessages).sort((a, b) => {
      return getDateSortValue(a) - getDateSortValue(b);
    });

    for (const date of sortedDates) {
      items.push({ type: "date", date, key: `date-${date}` });
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
        <Box className="glass-card" p={8} borderRadius="16px" textAlign="center">
          <Text css={{ color: "hsl(215.4, 16.3%, 46.9%)" }}>
            Select a conversation to start messaging
          </Text>
        </Box>
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
        <Box
          w="48px"
          h="48px"
          borderRadius="full"
          border="3px solid hsl(210, 30%, 88%)"
          borderTopColor="hsl(211, 71%, 43%)"
          animation="spin 0.8s linear infinite"
          css={{
            "@keyframes spin": {
              "0%": { transform: "rotate(0deg)" },
              "100%": { transform: "rotate(360deg)" },
            },
          }}
        />
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
        <Box className="glass-card" p={6} borderRadius="12px" textAlign="center">
          <Text css={{ color: "hsl(0, 84.2%, 60.2%)" }}>
            Could not load chat.
          </Text>
        </Box>
      </Flex>
    );
  }

  const otherParticipant = currentChat.participants.find(
    (p) => p.id !== user?._id
  );

  return (
    <Box
      ml={{ base: 0, lg: "300px" }}
      display="flex"
      flexDirection="column"
      pos="relative"
    >
      <Box
        p={4}
        borderBottomWidth="1px"
        className="glass-card-static"
        css={{ borderColor: "hsl(210, 30%, 88%)" }}
      >
        <Flex align="center" gap={3}>
          <Avatar
            size="sm"
            src={otherParticipant?.profilePicture}
            name={otherParticipant?.displayName}
          />
          <Box>
            <Text
              fontSize="lg"
              fontWeight={700}
              css={{ color: "hsl(222.2, 47.4%, 11.2%)" }}
            >
              {otherParticipant?.displayName || "User"}
            </Text>
            <Text fontSize="sm" css={{ color: "hsl(215.4, 16.3%, 46.9%)" }}>
              {otherParticipant?.isCreator ? "Creator" : "Member"}
            </Text>
          </Box>
        </Flex>
      </Box>

      <Box
        flex={1}
        position="fixed"
        w={{
          base: "calc(100% - 300px)",
          lg: "calc(100% - 580px)",
        }}
        zIndex={1000}
        bottom={73}
        top={"90px"}
        overflow={"scroll"}
        ref={messagesContainerRef}
        css={{
          "&::-webkit-scrollbar": { width: "4px" },
          "&::-webkit-scrollbar-track": { width: "6px" },
          "&::-webkit-scrollbar-thumb": {
            background: "hsl(210, 20%, 88%)",
            borderRadius: "24px",
          },
        }}
      >
        {hasMoreMessages && (
          <Flex justify="center" py={2} top={0} zIndex={2}>
            <Button
              size="sm"
              variant="outline"
              disabled={loadingOlder}
              onClick={handleLoadOlderMessages}
              borderRadius="full"
              px={6}
              className="btn-gradient-ghost"
            >
              {loadingOlder ? (
                <Flex alignItems="center">
                  <Box
                    w="12px"
                    h="12px"
                    borderRadius="full"
                    border="2px solid hsl(210, 30%, 88%)"
                    borderTopColor="hsl(211, 71%, 43%)"
                    animation="spin 0.8s linear infinite"
                    mr={2}
                    css={{
                      "@keyframes spin": {
                        "0%": { transform: "rotate(0deg)" },
                        "100%": { transform: "rotate(360deg)" },
                      },
                    }}
                  />
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
                  fontSize="11px"
                  fontWeight={600}
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
                isOwnMessage={item.sender.id === user?._id}
                chatCreatorId={currentChat?.creator.id}
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
            <Box
              w="48px"
              h="48px"
              borderRadius="full"
              border="3px solid hsl(210, 30%, 88%)"
              borderTopColor="hsl(211, 71%, 43%)"
              animation="spin 0.8s linear infinite"
              css={{
                "@keyframes spin": {
                  "0%": { transform: "rotate(0deg)" },
                  "100%": { transform: "rotate(360deg)" },
                },
              }}
            />
          </Flex>
        )}
      </Box>

      <Box
        p={4}
        borderTopWidth="1px"
        position="fixed"
        bottom="0"
        w={{ base: "calc(100% - 300px)", lg: "calc(100% - 580px)" }}
        css={{
          background: "rgba(255,255,255,0.85)",
          backdropFilter: "blur(12px)",
          borderColor: "hsl(210, 30%, 88%)",
        }}
      >
        <ChatInput onSendMessage={sendMessage} isDisabled={loadingInitial} />
      </Box>
    </Box>
  );
};

export default DirectMessages;
