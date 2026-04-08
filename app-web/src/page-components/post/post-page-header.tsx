"use client";

import { Box, Flex, Heading, Link, Stack, Text } from "@chakra-ui/react";
import { ShareButton } from "../creator/share-button";
import { getTimeAgo } from "@/utils/getTimeAgo";
import NextLink from "next/link";

import { Avatar } from "@/components/ui/avatar";

export const PostPageHeader: React.FC<{
  title: string;
  postId: string;
  createdAt: string;
  username: string;
  displayName: string;
  profilePicture?: string;
}> = ({ title, postId, createdAt, displayName, username, profilePicture }) => {
  const formattedDate = new Date(createdAt).toISOString();

  return (
    <Stack
      px={{ base: "16px", md: "24px" }}
      w="100%"
      mx="auto"
      mb={"-15px"}
      maxW="1150px"
    >
      <Flex
        align="center"
        pb={4}
        borderBottom={"1px solid"}
        borderColor={"gray.200"}
        gap={3}
      >
        <Avatar
          src={profilePicture}
          shape="rounded"
          w="40px"
          h="40px"
          name={username || displayName}
        />
        <Box>
          <NextLink href={`/creator/${username}`} passHref>
            <Link as="div" _hover={{ textDecoration: "underline" }}>
              <Text fontWeight="bold">{displayName}</Text>
            </Link>
          </NextLink>
          <Text fontSize="sm" color={"gray.600"}>
            @{username}
          </Text>
        </Box>
      </Flex>
      <Flex direction={{ base: "column-reverse", lg: "row" }}>
        <Box flexGrow={1} w={{ base: "100%", lg: "calc(100% - 320px - 32px)" }}>
          <Stack gap={0}>
            <Flex justifyContent={"space-between"} alignItems={"center"}>
              <Heading as="h1" size="xl" mb={2} wordBreak="break-word">
                {title}
              </Heading>
              <ShareButton postId={postId} />
            </Flex>
            <Text mb={6} fontSize="sm" color="gray.600">
              {getTimeAgo(formattedDate)}
            </Text>
          </Stack>
        </Box>
      </Flex>
    </Stack>
  );
};
