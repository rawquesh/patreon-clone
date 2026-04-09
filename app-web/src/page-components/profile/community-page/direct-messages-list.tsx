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
          return null;
        }

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
                    name={
                      otherParticipant.creatorUsername ||
                      otherParticipant.displayName
                    }
                    src={otherParticipant.profilePicture}
                  />
                  <Box>
                    <Text
                      fontWeight={600}
                      fontSize="14px"
                      css={{ color: "hsl(222.2, 47.4%, 11.2%)" }}
                    >
                      {otherParticipant.creatorUsername ||
                        otherParticipant.name}
                    </Text>
                    <Text
                      fontSize="12px"
                      css={{ color: "hsl(215.4, 16.3%, 46.9%)" }}
                      lineClamp={1}
                    >
                      {chat.lastMessage?.content.slice(0, 25) ||
                        "No messages yet"}
                    </Text>
                  </Box>
                </Flex>
                <Box textAlign="right" flexShrink={0}>
                  <Text fontSize="11px" css={{ color: "hsl(215.4, 16.3%, 46.9%)" }}>
                    {chat.lastMessage?.timestamp
                      ? format(new Date(chat.lastMessage.timestamp), "p")
                      : ""}
                  </Text>
                  {chat.unreadCount ? (
                    <Flex justifyContent="flex-end">
                      <Box
                        css={{ background: "var(--gradient-primary)" }}
                        color="white"
                        borderRadius="full"
                        px={1.5}
                        py={0}
                        fontSize="10px"
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
        <Text
          textAlign="center"
          css={{ color: "hsl(215.4, 16.3%, 46.9%)", py: "16px", fontSize: "14px" }}
        >
          No direct messages
        </Text>
      )}
    </Stack>
  );
};

export default DirectMessagesList;
