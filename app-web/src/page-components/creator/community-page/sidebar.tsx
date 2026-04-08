// Updated sidebar.tsx
import { Box, HStack, Badge, Heading } from "@chakra-ui/react";
import { FC, useEffect, memo } from "react";
import Link from "next/link";
import NewChatModal from "./new-chat-modal";
import ChatsList from "./chats-list";
import DirectMessagesSearch from "./direct-messages-search";
import DirectMessagesList from "./direct-messages-list";
import { useAuth } from "@/context/auth.provider";
import { useChat } from "@/context/chat.provider";
import { Chat, ChatListItem } from "@/lib/backend-services/chat-service";

interface SidebarProps {
  page: "chat" | "direct-messages";
  mode: "user" | "creator";
}

const SidebarComponent: FC<SidebarProps> = ({ page, mode }) => {
  const { groupChats, directChats, loadChats } = useChat();
  const { user } = useAuth();

  useEffect(() => {
    console.log("Sidebar Mounted: Loading initial chats");
    loadChats();
  }, [loadChats]);

  const filteredGroupChats = groupChats.filter(
    (chat) => user && chat.creator && chat.creator.id === user._id
  );
  const filteredDirectChats = directChats.filter(
    (chat) => user && chat.creator && chat.creator.id === user._id
  );

  const mapChatToListItem = (chat: Chat): ChatListItem => ({
    id: chat.id,
    title: chat.title,
    type: chat.type,
    unreadCount: chat.unreadCount,
    lastMessage: chat.lastMessage
      ? {
          content: chat.lastMessage.content,
          sender: chat.lastMessage.sender,
          timestamp: chat.lastMessage.timestamp,
        }
      : undefined,
    participants: chat.participants.map((p) => ({
      id: p.id,
      name: p.displayName || p.name,
      profilePicture: p.profilePicture,
    })),
    creator: {
      id: chat.creator.id,
      name: chat.creator.displayName,
    },
  });

  const groupChatListItems = filteredGroupChats.map(mapChatToListItem);
  const directChatListItems = filteredDirectChats.map(mapChatToListItem);

  const groupUnreadCount = groupChatListItems.reduce(
    (sum, item) => sum + item.unreadCount,
    0
  );
  const directUnreadCount = directChatListItems.reduce(
    (sum, item) => sum + item.unreadCount,
    0
  );

  return (
    <Box
      w="300px"
      bg={"white"}
      position={"fixed"}
      top={0}
      left={{ base: 0, lg: "300px" }}
      minH={"100vh"}
      borderRightWidth="1px"
      px={4}
      pt={4}
      display={{ base: "none", md: "block" }}
    >
      <Heading fontSize="2xl" fontWeight="bold" mb={4}>
        Messages
      </Heading>
      <HStack
        css={{
          "& a": {
            px: 4,
            py: 2,
            borderRadius: "8px",
            fontSize: "sm",
            fontWeight: 600,
            position: "relative",
            '&[data-active="true"]': {
              bg: "gray.200",
            },
            "&:hover": {
              bg: "gray.100",
            },
          },
        }}
        gap={4}
        mb={4}
      >
        <Link data-active={page === "chat"} href={"/profile/community/chat"}>
          Chats
          {groupUnreadCount > 0 && (
            <Badge
              position="absolute"
              top="-5px"
              right="-5px"
              colorPalette="blue"
              borderRadius="full"
            >
              {groupUnreadCount}
            </Badge>
          )}
        </Link>
        <Link
          data-active={page === "direct-messages"}
          href={"/profile/community/direct-messages"}
        >
          Direct Messages
          {directUnreadCount > 0 && (
            <Badge
              position="absolute"
              top="-5px"
              right="-5px"
              colorPalette="blue"
              borderRadius="full"
            >
              {directUnreadCount}
            </Badge>
          )}
        </Link>
      </HStack>
      {page === "direct-messages" && <DirectMessagesSearch />}
      {page === "chat" && <ChatsList chats={groupChatListItems} />}
      {page === "direct-messages" && (
        <DirectMessagesList chats={directChatListItems} />
      )}
      {mode === "creator" && page === "chat" && <NewChatModal />}
    </Box>
  );
};

export const Sidebar = memo(SidebarComponent);
