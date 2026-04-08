"use client";

import { Box, Stack, Text, Flex } from "@chakra-ui/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { format } from "date-fns";
import { Avatar } from "@/components/ui/avatar";
import { useAuth } from "@/context/auth.provider";
import { Chat } from "@/lib/backend-services/chat-service";
import { useChat } from "@/context/chat.provider";

interface DirectMessagesListProps {
  chats: Chat[];
}

const DirectMessagesList: React.FC<DirectMessagesListProps> = ({ chats }) => {
  const pathname = usePathname();
  const { currentChat } = useChat();
  const { user } = useAuth();
  const isUserMode = pathname?.startsWith("/user");
  const baseUrl = isUserMode
    ? "/user/messages/direct-messages"
    : "/profile/community/direct-messages";

  return (
    <Stack mt={3} gap={2}>
      {chats.map((chat) => {
        const isActive =
          currentChat?.id === chat.id ||
          pathname.includes(`/direct-messages/${chat.id}`);

        const otherParticipant = chat.participants.find(
          (p) => p.id !== user?._id
        );

        if (!otherParticipant) {
          console.warn(
            "Could not find other participant for direct message:",
            chat.id
          );
          return null;
        }

        return (
          <Link key={chat.id} href={`${baseUrl}/${chat.id}`}>
            <Box
              p={3}
              borderRadius="md"
              bg={isActive ? "blue.50" : "transparent"}
              _hover={{ bg: isActive ? "blue.50" : "gray.100" }}
              cursor="pointer"
              borderLeftWidth={isActive ? "3px" : "0"}
              borderLeftColor="blue.500"
            >
              <Flex justify="space-between" align="flex-start" mb={1}>
                <Flex align="center" gap={2}>
                  <Avatar
                    size="sm"
                    name={
                      otherParticipant.creatorUsername ||
                      otherParticipant.displayName
                    }
                    src={otherParticipant.profilePicture}
                  />
                  <Box>
                    <Text fontWeight="medium">
                      {otherParticipant.creatorUsername ||
                        otherParticipant.name}
                    </Text>
                    <Text fontSize="sm" color="gray.600" lineClamp={1}>
                      {chat.lastMessage?.content.slice(0, 20) ||
                        "No messages yet"}
                    </Text>
                  </Box>
                </Flex>
                <Box textAlign="right" flexShrink={0}>
                  <Text fontSize="xs" color="gray.500">
                    {chat.lastMessage?.timestamp
                      ? format(new Date(chat.lastMessage.timestamp), "p")
                      : ""}
                  </Text>
                  {chat.unreadCount ? (
                    <Flex justifyContent="flex-end">
                      <Box
                        bg="blue.500"
                        color="white"
                        borderRadius="full"
                        px={1.5}
                        py={0}
                        fontSize="xs"
                        lineHeight="tall"
                        mt={1}
                      >
                        {chat.unreadCount}
                      </Box>
                    </Flex>
                  ) : null}
                </Box>
              </Flex>
            </Box>
          </Link>
        );
      })}
      {chats.length === 0 && (
        <Text textAlign="center" color="gray.500" py={4}>
          No direct messages
        </Text>
      )}
    </Stack>
  );
};

export default DirectMessagesList;
