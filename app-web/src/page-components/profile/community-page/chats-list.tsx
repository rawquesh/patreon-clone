"use client";

import { Box, Stack, Text, Flex } from "@chakra-ui/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { format } from "date-fns";
import { Avatar } from "@/components/ui/avatar";
import { useChat } from "@/context/chat.provider";

interface Chat {
  id: string;
  title: string;
  description?: string;
  lastMessage?: {
    content: string;
    sender: string;
    timestamp: string;
  };
  creator: {
    id: string;
    displayName: string;
    profilePicture?: string;
  };
  unreadCount?: number;
}

interface ChatsListProps {
  chats: Chat[];
}

const ChatsList: React.FC<ChatsListProps> = ({ chats }) => {
  const pathname = usePathname();
  const isUserMode = pathname?.startsWith("/user");
  const baseUrl = isUserMode
    ? "/user/messages/chat"
    : "/profile/community/chat";
  const { currentChat } = useChat();

  return (
    <Stack gap={2}>
      {chats.map((chat) => {
        const isActive =
          currentChat?.id === chat.id || pathname.includes(`/chat/${chat.id}`);
        return (
          <Link key={chat.id} href={`${baseUrl}/${chat.id}`}>
            <Box
              p={3}
              borderRadius="12px"
              cursor="pointer"
              css={{
                background: isActive
                  ? "linear-gradient(135deg, hsl(211, 71%, 43% / 0.1), hsl(335, 27%, 64% / 0.08))"
                  : "transparent",
                borderLeft: "3px solid",
                borderLeftColor: isActive ? "hsl(211, 71%, 43%)" : "transparent",
                transition: "all 0.15s ease",
                "&:hover": {
                  background: isActive
                    ? "linear-gradient(135deg, hsl(211, 71%, 43% / 0.1), hsl(335, 27%, 64% / 0.08))"
                    : "rgba(255,255,255,0.5)",
                },
              }}
            >
              <Flex justify="space-between" align="flex-start" mb={1}>
                <Flex align="center" gap={2}>
                  <Avatar
                    size="sm"
                    name={chat.title}
                    src={chat.creator.profilePicture}
                  />
                  <Box>
                    <Text
                      fontWeight={600}
                      fontSize="14px"
                      css={{ color: "hsl(222.2, 47.4%, 11.2%)" }}
                    >
                      {chat.title}
                    </Text>
                    <Text
                      fontSize="12px"
                      css={{ color: "hsl(215.4, 16.3%, 46.9%)" }}
                    >
                      {chat.lastMessage?.content.slice(0, 25) ||
                        "No messages yet"}
                    </Text>
                  </Box>
                </Flex>
                <Box textAlign="right" flexShrink={0}>
                  <Text fontSize="11px" css={{ color: "hsl(215.4, 16.3%, 46.9%)" }}>
                    {chat.lastMessage?.timestamp
                      ? format(new Date(chat.lastMessage.timestamp), "h:mm a")
                      : ""}
                  </Text>
                </Box>
              </Flex>
            </Box>
          </Link>
        );
      })}
      {chats.length === 0 && (
        <Text
          textAlign="center"
          css={{ color: "hsl(215.4, 16.3%, 46.9%)", py: "16px", fontSize: "14px" }}
        >
          No chats available
        </Text>
      )}
    </Stack>
  );
};

export default ChatsList;
