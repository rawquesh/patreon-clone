"use client";

import React from "react";
import { Box, Flex, Text, Link, Image, Badge } from "@chakra-ui/react";
import { format } from "date-fns";
import { Avatar } from "@/components/ui/avatar";

interface MessageAttachment {
  url: string;
  fileName: string;
  fileType: string;
  fileSize: number;
}

interface Message {
  id: string;
  content: string;
  sender: {
    id: string;
    displayName: string;
    profilePicture?: string;
  };
  attachments?: MessageAttachment[];
  createdAt: string;
}

interface ChatMessageProps {
  message: Message;
  isOwnMessage: boolean;
  chatCreatorId?: string;
}

const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  isOwnMessage,
  chatCreatorId,
}) => {
  const isImage = (fileType: string) => fileType.startsWith("image/");
  const isSenderChatCreator =
    !isOwnMessage && chatCreatorId === message.sender.id;

  return (
    <Flex
      justify={isOwnMessage ? "flex-end" : "flex-start"}
      align="flex-start"
      gap={2}
    >
      {!isOwnMessage && (
        <Avatar
          size="sm"
          src={message.sender.profilePicture}
          name={message.sender.displayName}
        />
      )}
      <Box
        maxW="70%"
        css={{
          background: isOwnMessage
            ? "var(--gradient-primary)"
            : "rgba(255,255,255,0.85)",
          backdropFilter: "blur(8px)",
          color: isOwnMessage ? "white" : "hsl(222.2, 47.4%, 11.2%)",
          border: "1px solid",
          borderColor: isOwnMessage
            ? "transparent"
            : "rgba(255,255,255,0.5)",
          borderRadius: "16px",
          borderBottomLeftRadius: isOwnMessage ? "16px" : "4px",
          borderBottomRightRadius: isOwnMessage ? "4px" : "16px",
          p: "12px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
        }}
      >
        {!isOwnMessage && (
          <Flex align="center" mb={1}>
            <Text
              fontSize="13px"
              fontWeight={700}
              mr={2}
              css={{ color: "hsl(222.2, 47.4%, 11.2%)" }}
            >
              {message.sender.displayName}
            </Text>
            {isSenderChatCreator && (
              <Box
                px={2}
                py={0.5}
                borderRadius="full"
                fontSize="10px"
                fontWeight={600}
                css={{
                  background: "var(--gradient-primary)",
                  color: "white",
                }}
              >
                Creator
              </Box>
            )}
          </Flex>
        )}
        <Text fontSize="14px">{message.content}</Text>

        {message.attachments?.map((attachment, index) => (
          <Box key={index} mt={2}>
            {isImage(attachment.fileType) ? (
              <Image
                src={attachment.url}
                alt={attachment.fileName}
                maxH="200px"
                borderRadius="12px"
                cursor="pointer"
                onClick={() => window.open(attachment.url, "_blank")}
                style={{ objectFit: "cover" }}
              />
            ) : (
              <Link
                href={attachment.url}
                css={{
                  color: "hsl(211, 71%, 43%)",
                  "&:hover": { textDecoration: "underline" },
                }}
              >
                {attachment.fileName}
              </Link>
            )}
          </Box>
        ))}

        <Text
          fontSize="11px"
          mt={1}
          css={{
            color: isOwnMessage
              ? "rgba(255,255,255,0.7)"
              : "hsl(215.4, 16.3%, 46.9%)",
          }}
        >
          {format(new Date(message.createdAt), "h:mm a")}
        </Text>
      </Box>
    </Flex>
  );
};

export default ChatMessage;
