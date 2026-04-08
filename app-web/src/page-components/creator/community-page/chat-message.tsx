import { Avatar } from "@/components/ui/avatar";
import { getTimeAgo } from "@/utils/getTimeAgo";
import { Box, Flex, Image, Stack, Text } from "@chakra-ui/react";
import React from "react";
import { useAuth } from "@/context/auth.provider";

interface Props {
  message: {
    id: string;
    content: string;
    sender: {
      id: string;
      displayName: string;
      profilePicture?: string;
      isCreator: boolean;
    };
    attachments?: Array<{
      url: string;
      fileName: string;
      fileType: string;
      fileSize?: number;
      uploadedAt?: string;
    }>;
    createdAt: string;
    readBy: string[];
  };
}

const ChatMessage: React.FC<Props> = ({ message }) => {
  const { user } = useAuth();
  const isCurrentUser = user?._id === message?.sender?.id;

  return (
    <Flex
      gap={4}
      justifyContent={isCurrentUser ? "flex-end" : "flex-start"}
      w="100%"
    >
      {!isCurrentUser && (
        <Avatar
          size={"xl"}
          src={message.sender.profilePicture}
          name={message.sender.displayName}
        />
      )}
      <Stack
        bg={isCurrentUser ? "blue.500" : "blue.100"}
        color={isCurrentUser ? "star.50" : "inherit"}
        rounded={"12px"}
        px={"14px"}
        py={"12px"}
        maxW={"350px"}
        alignSelf={isCurrentUser ? "flex-end" : "flex-start"}
      >
        <Flex alignItems={"baseline"} gap={2}>
          <Text fontSize={"sm"} fontWeight={500}>
            {message.sender.displayName}
          </Text>
          {/* {message.sender.isCreator && (
            <Badge size={"xs"} colorPalette="blue">
              Creator
            </Badge>
          )} */}
          <Text fontSize={"xs"} color={isCurrentUser ? "gray.300" : "gray.600"}>
            &#183;
          </Text>
          <Text fontSize={"xs"} color={isCurrentUser ? "gray.300" : "gray.600"}>
            {getTimeAgo(message.createdAt)}
          </Text>
        </Flex>

        {message.content && <Text fontSize={"sm"}>{message.content}</Text>}

        {message.attachments && message.attachments.length > 0 && (
          <Box mt={2}>
            {message.attachments.map((attachment, index) => (
              <React.Fragment key={index}>
                {attachment.fileType.startsWith("image/") ? (
                  <Image
                    src={attachment.url}
                    alt={attachment.fileName}
                    borderRadius="md"
                    maxH="200px"
                    maxW="300px"
                    mt={2}
                  />
                ) : (
                  <Flex
                    mt={2}
                    p={2}
                    bg={
                      isCurrentUser
                        ? "rgba(255,255,255,0.2)"
                        : "rgba(0,0,0,0.05)"
                    }
                    borderRadius="md"
                    alignItems="center"
                    gap={2}
                  >
                    <Box>📎</Box>
                    <Text fontSize="xs" lineClamp={1}>
                      {attachment.fileName}
                    </Text>
                  </Flex>
                )}
              </React.Fragment>
            ))}
          </Box>
        )}

        {user && message.readBy.includes(user._id) && isCurrentUser && (
          <Text fontSize={"xs"} color={"gray.300"} textAlign="right">
            Read
          </Text>
        )}
      </Stack>
    </Flex>
  );
};

export default ChatMessage;
