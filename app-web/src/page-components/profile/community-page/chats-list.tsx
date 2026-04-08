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
              borderRadius="md"
              // _hover={{ bg: "gray.50" }}
              cursor="pointer"
              bg={isActive ? "blue.50" : "transparent"}
              _hover={{ bg: isActive ? "blue.50" : "gray.100" }}
              borderLeftWidth={isActive ? "3px" : "0"}
              borderLeftColor="blue.500"
            >
              <Flex justify="space-between" align="flex-start" mb={1}>
                <Flex align="center" gap={2}>
                  <Avatar
                    size="sm"
                    name={chat.title}
                    src={chat.creator.profilePicture}
                  />
                  <Box>
                    <Text fontWeight="medium">{chat.title}</Text>
                    <Text fontSize="sm" color="gray.600">
                      {chat.lastMessage?.content.slice(0, 20) ||
                        "No messages yet"}
                    </Text>
                  </Box>
                </Flex>
                <Box textAlign="right">
                  <Text fontSize="xs" color="gray.500">
                    {chat.lastMessage?.timestamp
                      ? format(new Date(chat.lastMessage.timestamp), "h:mm a")
                      : ""}
                  </Text>
                  {/* {chat.unreadCount ? (
                    <Box
                      bg="blue.500"
                      color="white"
                      borderRadius="full"
                      px={2}
                      py={0.5}
                      fontSize="xs"
                      mt={1}
                    >
                      {chat.unreadCount}
                    </Box>
                  ) : null} */}
                </Box>
              </Flex>
            </Box>
          </Link>
        );
      })}
      {chats.length === 0 && (
        <Text textAlign="center" color="gray.500" py={4}>
          No chats available
        </Text>
      )}
    </Stack>
  );
};

export default ChatsList;
