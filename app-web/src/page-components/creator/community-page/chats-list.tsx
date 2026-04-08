import { Avatar } from "@/components/ui/avatar";
import { ChatListItem } from "@/lib/backend-services/chat-service";
import { Badge, HStack, Stack, Text, VStack } from "@chakra-ui/react";
import { getTimeAgo } from "@/utils/getTimeAgo";
import Link from "next/link";
import React from "react";
import { useChat } from "@/context/chat.provider";
import { usePathname } from "next/navigation";

interface ChatsListProps {
  chats: ChatListItem[];
}

const ChatsList: React.FC<ChatsListProps> = ({ chats }) => {
  const pathname = usePathname();
  const { currentChat } = useChat();

  if (chats.length === 0) {
    return (
      <VStack my={4} align="center" justify="center" gap={4} py={8}>
        <Text color="gray.500">No chats yet</Text>
        <Text fontSize="sm" color="gray.400" textAlign="center">
          Group chats created by the creator will appear here
        </Text>
      </VStack>
    );
  }

  return (
    <VStack my={4} align="stretch" gap={2}>
      {chats.map((chat) => {
        const isActive =
          currentChat?.id === chat.id || pathname.includes(`/chat/${chat.id}`);

        return (
          <Link key={chat.id} href={`/profile/community/chat/${chat.id}`}>
            <HStack
              p={3}
              borderRadius="md"
              bg={isActive ? "blue.50" : "transparent"}
              _hover={{ bg: isActive ? "blue.50" : "gray.100" }}
              cursor="pointer"
              borderLeftWidth={isActive ? "3px" : "0"}
              borderLeftColor="blue.500"
            >
              <Avatar
                name={chat.title}
                shape={"rounded"}
                size="xl"
                src={chat.participants[0]?.profilePicture}
              />
              <Stack flex={1} gap={1}>
                <HStack justify="space-between">
                  <Text fontSize={"sm"} fontWeight="medium" lineClamp={1}>
                    {chat.title}
                  </Text>
                  {chat.lastMessage && (
                    <Text fontSize="xs" color="gray.500">
                      {getTimeAgo(chat.lastMessage.timestamp)}
                    </Text>
                  )}
                </HStack>
                <Text fontSize={"xs"} color="gray.600" lineClamp={1}>
                  {chat.lastMessage
                    ? `${chat.lastMessage.content.slice(0, 20)}`
                    : "No messages yet"}
                </Text>
                <HStack>
                  <Text fontSize="xs" color="gray.600">
                    {chat.creator.name}
                  </Text>
                  {chat.unreadCount > 0 && (
                    <Badge
                      colorPalette="blue"
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

export default ChatsList;
