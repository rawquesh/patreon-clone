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
        bg={isOwnMessage ? "blue.500" : "blue.100"}
        color={isOwnMessage ? "white" : "black"}
        p={3}
        borderRadius="lg"
      >
        {!isOwnMessage && (
          <Flex align="center" mb={1}>
            <Text fontSize="sm" fontWeight="bold" mr={2}>
              {message.sender.displayName}
            </Text>
            {isSenderChatCreator && (
              <Badge
                colorScheme="blue"
                fontSize="0.6em"
                px={1.5}
                borderRadius="full"
              >
                Creator
              </Badge>
            )}
          </Flex>
        )}
        <Text>{message.content}</Text>

        {message.attachments?.map((attachment, index) => (
          <Box key={index} mt={2}>
            {isImage(attachment.fileType) ? (
              <Image
                src={attachment.url}
                alt={attachment.fileName}
                maxH="200px"
                borderRadius="md"
                cursor="pointer"
                onClick={() => window.open(attachment.url, "_blank")}
              />
            ) : (
              <Link href={attachment.url} color="blue.400">
                📎 {attachment.fileName}
              </Link>
            )}
          </Box>
        ))}

        <Text
          fontSize="xs"
          color={isOwnMessage ? "whiteAlpha.700" : "gray.500"}
          mt={1}
        >
          {format(new Date(message.createdAt), "h:mm a")}
        </Text>
      </Box>
    </Flex>
  );
};

export default ChatMessage;
