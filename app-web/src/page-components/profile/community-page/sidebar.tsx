"use client";

import { Box, HStack, Text, Badge } from "@chakra-ui/react";
import { FC, memo, useEffect } from "react";
import Link from "next/link";
import ChatsList from "./chats-list";
import DirectMessagesList from "./direct-messages-list";
import { useChat } from "@/context/chat.provider";
import { useAuth } from "@/context/auth.provider";
import { Chat } from "@/lib/backend-services/chat-service";

interface SidebarProps {
  page: "chat" | "direct-messages";
  mode: "user" | "creator";
}
const SidebarComponent: FC<SidebarProps> = ({ page, mode }) => {
  const { groupChats, directChats, loadChats } = useChat();
  const { user } = useAuth();

  useEffect(() => {
    console.log("Profile Sidebar Mounted: Loading initial chats");
    loadChats();
  }, [loadChats]);

  const filterCondition = (chat: Chat) => {
    if (!user || !chat.creator) return false;
    console.log(
      "creator",
      chat.creator.id,
      user._id,
      chat.creator.id !== user?._id,
      chat
    );
    return mode === "creator"
      ? chat.creator.id === user._id
      : chat.creator.id !== user._id;
  };

  const filteredGroupChats = groupChats.filter(filterCondition);
  // const filteredGroupChats = groupChats;
  // const filteredDirectChats = directChats.filter(filterCondition);
  const filteredDirectChats = directChats.filter(
    (c) => c.creator.id !== user?._id
  );

  const groupUnreadCount = filteredGroupChats.reduce(
    (sum, chat) => sum + chat.unreadCount,
    0
  );
  const directUnreadCount = filteredDirectChats.reduce(
    (sum, chat) => sum + chat.unreadCount,
    0
  );

  const chatHref = "/user/messages/chat";
  const dmHref = "/user/messages/direct-messages";
  // const chatHref =
  //   mode === "creator" ? "/profile/community/chat" : "/user/messages/chat";
  // const dmHref =
  //   mode === "creator"
  //     ? "/profile/community/direct-messages"
  //     : "/user/messages/direct-messages";
  console.log(directChats);

  return (
    <Box
      w="300px"
      bg={"white"}
      position={"fixed"}
      top={0}
      left={{ base: 0, lg: "300px" }}
      minH={"100vh"}
      borderRightWidth="1px"
      p={4}
      display={{ base: "none", md: "block" }}
    >
      <Text fontSize="2xl" fontWeight="bold" mb={4}>
        Messages
      </Text>
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
        <Link data-active={page === "chat"} href={chatHref}>
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
        <Link data-active={page === "direct-messages"} href={dmHref}>
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
      {/* {page === "direct-messages" && <DirectMessagesSearch />} */}
      {page === "chat" && <ChatsList chats={filteredGroupChats} />}
      {page === "direct-messages" && (
        <DirectMessagesList chats={filteredDirectChats} />
      )}
    </Box>
  );
};

export const Sidebar = memo(SidebarComponent);

export default Sidebar;
