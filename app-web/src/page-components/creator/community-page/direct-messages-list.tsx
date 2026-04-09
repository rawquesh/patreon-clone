import { Avatar } from "@/components/ui/avatar";
import { ChatListItem } from "@/lib/backend-services/chat-service";
import { Badge, HStack, Stack, Text, VStack } from "@chakra-ui/react";
import { getTimeAgo } from "@/utils/getTimeAgo";
import Link from "next/link";
import React from "react";
import { useChat } from "@/context/chat.provider";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/auth.provider";

interface DirectMessagesListProps {
  chats: ChatListItem[];
}

const DirectMessagesList: React.FC<DirectMessagesListProps> = ({ chats }) => {
  const pathname = usePathname();
  const { currentChat } = useChat();
  const { user } = useAuth();

  if (chats.length === 0) {
    return (
      <VStack my={4} align="center" justify="center" gap={4} py={8}>
        <Text css={{ color: "hsl(215.4, 16.3%, 46.9%)" }}>No direct messages yet</Text>
        <Text fontSize="sm" css={{ color: "hsl(215.4, 16.3%, 46.9%)" }} textAlign="center">
          Messages between you and the creator will appear here
        </Text>
      </VStack>
    );
  }

  return (
    <VStack my={4} align="stretch" gap={2}>
      {chats.map((chat) => {
        const isActive =
          currentChat?.id === chat.id ||
          pathname.includes(`/direct-messages/${chat.id}`);

        const otherParticipant =
          chat.participants.find((p) => p.id !== user?._id) ||
          chat.participants[0];

        const isCreatorChat = chat.creator.id !== user?._id;

        return (
          <Link
            key={chat.id}
            href={`/profile/community/direct-messages/${chat.id}`}
          >
            <HStack
              p={3}
              borderRadius="md"
              bg={isActive ? "hsl(211, 71%, 43% / 0.08)" : "transparent"}
              _hover={{ bg: "rgba(255,255,255,0.6)" }}
              cursor="pointer"
              borderLeftWidth={isActive ? "3px" : "0"}
              borderLeftColor="hsl(211, 71%, 43%)"
            >
              <Avatar
                name={otherParticipant.name}
                shape={"rounded"}
                size="xl"
                src={otherParticipant.profilePicture}
              />
              <Stack flex={1} gap={1}>
                <HStack justify="space-between">
                  <HStack>
                    <Text fontSize={"sm"} fontWeight="medium">
                      {otherParticipant.name}
                    </Text>
                    {isCreatorChat && (
                      <Badge size="xs" css={{ background: "var(--gradient-primary)", color: "white" }}>
                        Creator
                      </Badge>
                    )}
                  </HStack>
                  {chat.lastMessage && (
                    <Text fontSize="xs" css={{ color: "hsl(215.4, 16.3%, 46.9%)" }}>
                      {getTimeAgo(chat.lastMessage.timestamp)}
                    </Text>
                  )}
                </HStack>
                <Text fontSize={"xs"} css={{ color: "hsl(215.4, 16.3%, 46.9%)" }} lineClamp={1}>
                  {chat.lastMessage
                    ? chat.lastMessage.content.slice(0, 20)
                    : "No messages yet"}
                </Text>
                <HStack>
                  <Text fontSize="xs" css={{ color: "hsl(215.4, 16.3%, 46.9%)" }}>
                    {chat.lastMessage ? chat.lastMessage.sender : ""}
                  </Text>
                  {chat.unreadCount > 0 && (
                    <Badge
                      css={{ background: "var(--gradient-primary)", color: "white" }}
                      borderRadius="full"
                      px={2}
                      fontSize="xs"
                    >
                      {chat.unreadCount}
                    </Badge>
                  )}
                </HStack>
              </Stack>
            </HStack>
          </Link>
        );
      })}
    </VStack>
  );
};

export default DirectMessagesList;
