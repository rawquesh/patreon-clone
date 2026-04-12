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
import { UpgradeModal } from "@/components/upgrade-modal";

const isYoutubeUrl = (url: string): boolean => {
  if (!url) return false;
  const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/;
  return youtubeRegex.test(url);
};

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
  const { description, videoUrl, mediaUrls, creator, hasAccess, thumbnailUrl, previewText } =
    postData;
  const { data: likesData } = usePostLikes(postId);
  const { data: commentsData } = usePostComments(postId);
  const likesCount = likesData?.pagination?.total || 0;
  const commentsCount = commentsData?.pagination?.total || 0;

  const videoSrc =
    videoUrl || (mediaUrls && mediaUrls.length > 0 ? mediaUrls[0] : "");
  const isYoutube = isYoutubeUrl(videoSrc);
  const youtubeVideoId = isYoutube ? getYoutubeVideoId(videoSrc) : null;

  return (
    <Flex
      p={{ base: "16px", md: "24px" }}
      w="100%"
      direction={{ base: "column-reverse", lg: "row" }}
      maxW="1150px"
      mx="auto"
      gap={8}
    >
      {/* Main content */}
      <Box flex="1" minW={0}>
        {/* White card container */}
        <Box
          bg="white"
          borderRadius="xl"
          p={{ base: 5, md: 8 }}
          border="1px solid"
          css={{ borderColor: "hsl(210, 30%, 92%)" }}
          boxShadow="0 2px 8px rgba(0,0,0,0.04)"
        >
          {/* Video Player */}
          {hasAccess ? (
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
                    borderRadius="lg"
                  />
                ) : (
                  <SimpleVideoPlayer src={videoSrc} width="100%" height="100%" />
                )}
              </AspectRatio>
            </Box>
          ) : (
            <AspectRatio
              rounded="xl"
              pos={"relative"}
              ratio={16 / 9}
              width="100%"
              overflow="hidden"
              mb={6}
            >
              <Box
                width="100%"
                height="100%"
                position="relative"
                bg="black"
                borderRadius="xl"
                overflow="hidden"
              >
                {thumbnailUrl && (
                  <Image
                    src={thumbnailUrl}
                    alt="video thumbnail"
                    layout="fill"
                    style={{ objectFit: "cover", opacity: 0.4 }}
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
                    width={48}
                    height={48}
                    icon={"tabler:lock-filled"}
                    style={{ color: "white" }}
                  />
                  <Text color="white" fontSize="md" fontWeight={500}>
                    Subscribe to watch this video
                  </Text>
                </Box>
              </Box>
            </AspectRatio>
          )}

          {/* Description / Preview */}
          {hasAccess ? (
            description && <Text mb={6}>{description}</Text>
          ) : (
            previewText && (
              <Text mb={6} color="hsl(215.4, 16.3%, 46.9%)">
                {previewText}
              </Text>
            )
          )}

          {/* Lock UI */}
          {!hasAccess && (
            <Flex
              direction="column"
              align="center"
              justify="center"
              className="glass-card"
              p={8}
              rounded="xl"
              mt={6}
              border="1px solid"
              css={{
                borderColor: "rgba(255,255,255,0.8)",
                boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
                backgroundImage: "var(--gradient-sidebar)",
              }}
              gap={4}
            >
              <Box
                bg="hsl(210, 30%, 96%)"
                p={4}
                rounded="full"
                color="hsl(211, 71%, 43%)"
              >
                <Icon icon="tabler:lock-filled" width={24} height={24} />
              </Box>
              <Text fontWeight={700} fontSize="lg" css={{ color: "hsl(222.2, 47.4%, 11.2%)" }}>
                Unlock this post
              </Text>
              <Text color="hsl(215.4, 16.3%, 46.9%)" textAlign="center" mb={2} maxW="400px">
                Join a membership tier to unlock full access to this post and support the creator.
              </Text>
              <UpgradeModal tierAccess={postData.tierAccess} />
            </Flex>
          )}

          {/* Full access content */}
          {hasAccess && (
            <>
              <Attachments attachments={postData.attachments || []} />

              <Flex my={6} gap={4} borderTop="1px solid" css={{ borderColor: "hsl(210, 30%, 92%)" }} pt={5}>
                <Suspense>
                  <PostLike key={likesCount} likes={likesCount} postId={postId} />
                </Suspense>
                <IconText
                  containerProps={{ cursor: "pointer" }}
                  icon="iconamoon:comment-fill"
                  text={String(commentsCount)}
                />
              </Flex>
              <Box id="comments-section" pt={5}>
                <Suspense>
                  <PostCommentsSection className="glass-card" postId={postId} />
                </Suspense>
              </Box>
            </>
          )}
        </Box>
      </Box>

      {/* Creator Info Sidebar */}
      <Box
        w={{ base: "100%", lg: "320px" }}
        flexShrink={0}
        position={{ lg: "sticky" }}
        top={{ lg: "80px" }}
        alignSelf={{ lg: "flex-start" }}
        height={{ lg: "calc(100vh - 100px)" }}
      >
        <PostPageCreatorInfo
          avatarUrl={creator.profilePicture || ""}
          description={creator.description || "Content creator"}
          username={creator.username}
          id={creator.id}
          tierAccess={postData.tierAccess}
        />
      </Box>
    </Flex>
  );
};

export default VideoPostPageComponent;
