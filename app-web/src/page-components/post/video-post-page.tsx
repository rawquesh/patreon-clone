/* eslint-disable @typescript-eslint/ban-ts-comment */
"use client";
import { Flex, Stack, Text, Box, AspectRatio } from "@chakra-ui/react";
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
import Attachments from "../creator/attchments";
import Image from "next/image";
import { Icon } from "@iconify/react/dist/iconify.js";
import SimpleVideoPlayer from "@/components/simple-video-player";

// Function to check if a URL is a YouTube link
const isYoutubeUrl = (url: string): boolean => {
  if (!url) return false;
  const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/;
  return youtubeRegex.test(url);
};

// Function to extract YouTube video ID from URL
const getYoutubeVideoId = (url: string): string | null => {
  let videoId = null;
  const youtubeShortRegex = /youtu\.be\/([^\/\?&]+)/;
  const youtubeWatchRegex = /youtube\.com\/watch\?v=([^\/\?&]+)/;
  const youtubeEmbedRegex = /youtube\.com\/embed\/([^\/\?&]+)/;

  const shortMatch = url.match(youtubeShortRegex);
  const watchMatch = url.match(youtubeWatchRegex);
  const embedMatch = url.match(youtubeEmbedRegex);

  if (shortMatch) videoId = shortMatch[1];
  else if (watchMatch) videoId = watchMatch[1];
  else if (embedMatch) videoId = embedMatch[1];

  return videoId;
};

const VideoPostPageComponent: React.FC<{
  postData: PostData;
  postId: string;
}> = ({ postData, postId }) => {
  const { description, videoUrl, mediaUrls, creator, thumbnailUrl } = postData;
  const { data: likesData } = usePostLikes(postId);
  const { data: commentsData } = usePostComments(postId);
  // Use pagination.total for likes count instead of likesCount
  const likesCount = likesData?.pagination?.total || 0;
  const commentsCount = commentsData?.pagination?.total || 0;

  // Format date to ISO string for getTimeAgo

  // Use videoUrl if available, otherwise fallback to mediaUrls
  const videoSrc =
    videoUrl || (mediaUrls && mediaUrls.length > 0 ? mediaUrls[0] : "");

  // Check if the video source is a YouTube URL
  const isYoutube = isYoutubeUrl(videoSrc);
  const youtubeVideoId = isYoutube ? getYoutubeVideoId(videoSrc) : null;
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
        {postData.hasAccess ? (
          <Box mb={6}>
            <AspectRatio pos={"relative"} ratio={16 / 9} width="100%">
              {isYoutube && youtubeVideoId ? (
                <Box
                  as="iframe"
                  // @ts-ignore
                  src={`https://www.youtube.com/embed/${youtubeVideoId}`}
                  width="100%"
                  height="100%"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  border="0"
                  borderRadius="8px"
                />
              ) : (
                <SimpleVideoPlayer src={videoSrc} width="100%" height="100%" />
              )}
            </AspectRatio>
          </Box>
        ) : (
          <AspectRatio
            rounded={"lg"}
            pos={"relative"}
            ratio={16 / 9}
            width="100%"
            overflow={"hidden"}
            mb={6}
          >
            {isYoutube ? (
              <Box pos={"relative"} width="100%" height="100%">
                <Box
                  pos={"absolute"}
                  w={"100%"}
                  h={"100%"}
                  display={"flex"}
                  flexDirection={"column"}
                  justifyContent={"center"}
                  alignItems={"center"}
                  gap={3}
                  zIndex={1000}
                  bg={"rgba(0, 0, 0, 0.1)"}
                >
                  <Icon width={60} icon={"logos:youtube-icon"} />
                  <Text color="white" fontSize="md" fontWeight={500}>
                    Subscribe to watch this video
                  </Text>
                </Box>
                <Image src={thumbnailUrl} alt="title" layout="fill" />
              </Box>
            ) : (
              <Box
                width="100%"
                height="100%"
                position="relative"
                bg="black"
                borderRadius="md"
                overflow="hidden"
              >
                {thumbnailUrl && (
                  <Image
                    src={thumbnailUrl}
                    alt="title"
                    layout="fill"
                    style={{ objectFit: "cover", opacity: 0.3 }}
                  />
                )}
                <Box
                  pos={"absolute"}
                  w={"100%"}
                  h={"100%"}
                  display={"flex"}
                  flexDirection={"column"}
                  justifyContent={"center"}
                  alignItems={"center"}
                  gap={3}
                  zIndex={1000}
                >
                  <Icon
                    width={60}
                    height={60}
                    icon={"tabler:lock-filled"}
                    style={{ color: "white" }}
                  />
                  <Text color="white" fontSize="md" fontWeight={500}>
                    Subscribe to watch this video
                  </Text>
                </Box>
              </Box>
            )}
          </AspectRatio>
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

export default VideoPostPageComponent;
