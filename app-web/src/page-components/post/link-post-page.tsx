"use client";

import { Flex, Stack, Text, Box, Link as ChakraLink } from "@chakra-ui/react";
import React, { Suspense } from "react";
import PostPageCreatorInfo from "./post-page-creator-info";
import PostLike from "./post-like";
import IconText from "@/components/ui/icon-text";
import PostCommentsSection from "./post-comments-section";
import { PostData } from "@/typings/IPost";
import { Icon } from "@iconify/react/dist/iconify.js";
import {
  usePostLikes,
  usePostComments,
} from "@/lib/backend-services/post-service";
import Attachments from "../creator/attchments";

const LinkPostPageComponent: React.FC<{
  postData: PostData;
  postId: string;
}> = ({ postData, postId }) => {
  const { description, linkUrl, creator } = postData;
  const { data: likesData } = usePostLikes(postId);
  const { data: commentsData } = usePostComments(postId);

  // Use pagination.total for likes count instead of likesCount
  const likesCount = likesData?.pagination?.total || 0;
  const commentsCount = commentsData?.pagination?.total || 0;

  // Format date to ISO string for getTimeAgo

  return (
    <Flex
      p={"16px"}
      w={"100vw"}
      direction={{ base: "column-reverse", lg: "row" }}
      maxW={"1150px"}
      mx={"auto"}
      gap={8}
    >
      <Stack gap={0} flexGrow={1}>
        {linkUrl && (
          <Box
            className="glass-card"
            p={4}
            borderRadius="md"
            mb={6}
            display="flex"
            alignItems="center"
          >
            <Icon icon="clarity:link-solid" style={{ marginRight: "8px" }} />
            <ChakraLink href={linkUrl} css={{ color: "hsl(211, 71%, 43%)" }}>
              {linkUrl}
            </ChakraLink>
          </Box>
        )}

        {description && <Text mb={6}>{description}</Text>}
        <Attachments attachments={postData.attachments || []} />

        <Flex my={4} gap={4}>
          <Suspense>
            <PostLike key={likesCount} likes={likesCount} postId={postId} />
          </Suspense>
          <IconText
            containerProps={{ cursor: "pointer" }}
            icon="iconamoon:comment-fill"
            text={String(commentsCount)}
          />
        </Flex>
        <Suspense>
          <PostCommentsSection className="glass-card" postId={postId} />
        </Suspense>
      </Stack>
      {!postData?.hasAccess && (
        <PostPageCreatorInfo
          avatarUrl={creator.profilePicture || ""}
          description={creator.description || "Content creator"}
          username={creator.username}
          id={creator.id}
          tierAccess={postData.tierAccess}
        />
      )}
    </Flex>
  );
};

export default LinkPostPageComponent;
