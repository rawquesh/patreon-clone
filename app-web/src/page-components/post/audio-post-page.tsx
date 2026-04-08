"use client";

import { Flex, Stack, Text, Box } from "@chakra-ui/react";
import React, { Suspense } from "react";
import PostPageCreatorInfo from "./post-page-creator-info";
import PostLike from "./post-like";
import IconText from "@/components/ui/icon-text";
import PostCommentsSection from "./post-comments-section";
import { PostData } from "@/typings/IPost";
import {
  usePostLikes,
  usePostComments,
} from "@/lib/backend-services/post-service";
import CustomAudioPlayer from "@/components/audio-player";
import Attachments from "../creator/attchments";

const AudioPostPageComponent: React.FC<{
  postData: PostData;
  postId: string;
}> = ({ postData, postId }) => {
  const { description, audioUrl, mediaUrls, creator } = postData;
  const { data: likesData } = usePostLikes(postId);
  const { data: commentsData } = usePostComments(postId);

  // Use pagination.total for likes count instead of likesCount
  const likesCount = likesData?.pagination?.total || 0;
  const commentsCount = commentsData?.pagination?.total || 0;

  // Format date to ISO string for getTimeAgo

  // Use audioUrl if available, otherwise fallback to mediaUrls
  const audioSrc =
    audioUrl || (mediaUrls && mediaUrls.length > 0 ? mediaUrls[0] : "");

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
        {audioSrc && (
          <Box bg="gray.50" p={4} borderRadius="md" mb={6} width="100%">
            {/* <audio
              controls
              src={audioSrc}
              style={{ width: "100%", borderRadius: "8px" }}
            /> */}
            <CustomAudioPlayer src={audioSrc} />
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
          <PostCommentsSection bg="white" postId={postId} />
        </Suspense>
      </Stack>
      {/* Conditionally render Creator Info based on postData.hasAccess */}
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

export default AudioPostPageComponent;
