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
    return mode === "creator"
      ? chat.creator.id === user._id
      : chat.creator.id !== user._id;
  };

  const filteredGroupChats = groupChats.filter(filterCondition);
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

  return (
    <Box
      w="300px"
      position={"fixed"}
      top={0}
      left={{ base: 0, lg: "280px" }}
      minH={"100vh"}
      borderRightWidth="1px"
      css={{
        borderColor: "hsl(210, 30%, 88%)",
        background: "rgba(255,255,255,0.7)",
        backdropFilter: "blur(12px)",
      }}
      p={4}
      display={{ base: "none", md: "block" }}
    >
      <Text
        fontSize="2xl"
        fontWeight={700}
        mb={4}
        css={{ color: "hsl(222.2, 47.4%, 11.2%)" }}
      >
        Messages
      </Text>
      <HStack
        gap={3}
        mb={4}
      >
        {[
          { label: "Chats", href: chatHref, value: "chat", count: groupUnreadCount },
          { label: "Direct", href: dmHref, value: "direct-messages", count: directUnreadCount },
        ].map((item) => (
          <Link key={item.value} href={item.href}>
            <Box
              px={4}
              py={2}
              borderRadius="10px"
              fontSize="14px"
              fontWeight={600}
              position="relative"
              css={{
                background: page === item.value
                  ? "var(--gradient-primary)"
                  : "transparent",
                color: page === item.value ? "white" : "hsl(215.4, 16.3%, 46.9%)",
                transition: "all 0.15s ease",
                "&:hover": {
                  background: page === item.value
                    ? "var(--gradient-primary)"
                    : "hsl(210, 20%, 94%)",
                  color: page === item.value ? "white" : "hsl(222.2, 47.4%, 11.2%)",
                },
              }}
            >
              {item.label}
              {item.count > 0 && (
                <Badge
                  position="absolute"
                  top="-5px"
                  right="-8px"
                  borderRadius="full"
                  fontSize="10px"
                  px={1.5}
                  py={0.5}
                  css={{
                    background: "var(--gradient-primary)",
                    color: "white",
                    border: "2px solid white",
                  }}
                >
                  {item.count}
                </Badge>
              )}
            </Box>
          </Link>
        ))}
      </HStack>
      {page === "chat" && <ChatsList chats={filteredGroupChats} />}
      {page === "direct-messages" && (
        <DirectMessagesList chats={filteredDirectChats} />
      )}
    </Box>
  );
};

export const Sidebar = memo(SidebarComponent);

export default Sidebar;
