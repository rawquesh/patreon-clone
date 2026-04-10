/* eslint-disable @typescript-eslint/ban-ts-comment */
"use client";

import React from "react";
import ButtonWithIcon from "@/components/ui/button-with-icon";
import IconText from "@/components/ui/icon-text";
import { getTimeAgo } from "@/utils/getTimeAgo";
import { Box, Flex, Heading, Stack, Text } from "@chakra-ui/react";
import Image from "next/image";
import Link from "next/link";
import PostLike from "./post-like";
import PostComments from "./post-comments";
import { useRouter } from "next/navigation";
import { ShareButton } from "./share-button";
import { Link as ScrollLink } from "react-scroll";
import { TierAccess } from "@/typings/ITierAccess";
import { UpgradeModal } from "@/components/upgrade-modal";
import { Icon } from "@iconify/react/dist/iconify.js";
import { useAuth } from "@/context/auth.provider";
import SimpleVideoPlayer from "@/components/simple-video-player";

interface Props {
  src: string;
  locked: boolean;
  thumbnail: string;
  length: number;
  title: string;
  timeStamp: string;
  body: string;
  likes: number;
  comments: number;
  postId: string;
  videoId?: string;
  description?: string;
  previewText?: string;
  hasAccess: boolean;
  tierAccess: TierAccess[];
  isSubscribed: boolean;
}

const isYoutubeUrl = (url: string): boolean => {
  const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/;
  return youtubeRegex.test(url);
};

const getYoutubeVideoId = (url: string): string | null => {
  const youtubeShortRegex = /youtu\.be\/([^\/\?&]+)/;
  const youtubeWatchRegex = /youtube\.com\/watch\?v=([^\/\?&]+)/;
  const youtubeEmbedRegex = /youtube\.com\/embed\/([^\/\?&]+)/;

  const shortMatch = url.match(youtubeShortRegex);
  const watchMatch = url.match(youtubeWatchRegex);
  const embedMatch = url.match(youtubeEmbedRegex);

  if (shortMatch) return shortMatch[1];
  if (watchMatch) return watchMatch[1];
  if (embedMatch) return embedMatch[1];
  return null;
};

const VideoPost: React.FC<Props> = ({
  comments,
  likes,
  src,
  thumbnail,
  timeStamp,
  title,
  locked,
  postId,
  videoId,
  description,
  previewText,
  hasAccess,
  tierAccess,
  isSubscribed,
}) => {
  const router = useRouter();
  const { user } = useAuth();
  const isYoutube = Boolean(videoId) || isYoutubeUrl(src);
  const youtubeVideoId = videoId
    ? videoId
    : isYoutube
    ? getYoutubeVideoId(src)
    : null;

  const handlePostClick = () => {
    if (!locked) {
      router.push(`/post/${postId}`);
    }
  };

  const YouTubeEmbed = ({ videoId }: { videoId: string }) => (
    <iframe
      src={`https://www.youtube.com/embed/${videoId}`}
      style={{ width: "100%", height: "100%", borderRadius: "12px", border: "0" }}
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowFullScreen
    />
  );

  return (
    <Stack
      borderRadius="16px"
      overflow="hidden"
      className="glass-card"
      w="100%"
    >
      <Box
        h="365px"
        w="100%"
        display="flex"
        alignItems="end"
        pos="relative"
        onClick={locked ? undefined : handlePostClick}
        cursor={locked ? "default" : "pointer"}
        borderRadius="16px 16px 0 0"
        overflow="hidden"
      >
        {hasAccess ? (
          src ? (
            <Box width="100%" height="100%">
              {isYoutube && youtubeVideoId ? (
                <YouTubeEmbed videoId={youtubeVideoId} />
              ) : (
                <SimpleVideoPlayer src={src} width="100%" height="100%" />
              )}
            </Box>
          ) : (
            <></>
          )
        ) : (
          <>
            <Box
              pos="absolute"
              w="100%"
              h="100%"
              display="flex"
              flexDirection="column"
              justifyContent="center"
              alignItems="center"
              gap={3}
              zIndex={1000}
              css={{ background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)" }}
            >
              <Icon width={60} icon={"tabler:lock-filled"} style={{ color: "white" }} />
              <Text color="white" fontSize="md" fontWeight={500}>
                Subscribe to watch this video
              </Text>
            </Box>
            <Image src={thumbnail} alt={title} layout="fill" />
          </>
        )}
      </Box>
      <Stack p="20px">
        <Link href={`/post/${postId}`}>
          <Heading fontSize="lg" fontWeight={600} cursor="pointer" css={{ color: "hsl(222.2, 47.4%, 11.2%)" }}>
            {title}
          </Heading>
        </Link>
        <Text fontSize="xs" css={{ color: "hsl(215.4, 16.3%, 46.9%)" }}>
          {getTimeAgo(timeStamp)}
        </Text>
        {(previewText || description) && (
          <Text mb={4} onClick={handlePostClick} cursor="pointer" fontSize="sm" css={{ color: "hsl(215.4, 16.3%, 46.9%)" }}>
            {previewText || description}
          </Text>
        )}
        {!hasAccess && (
          <>
            {isSubscribed ? (
              <UpgradeModal tierAccess={tierAccess} />
            ) : (
              <ScrollLink to="memberships" smooth>
                <ButtonWithIcon
                  mt={4}
                  mb={2}
                  w="fit"
                  icon="tabler:lock-filled"
                  onClick={() => {
                    if (!user) {
                      router.push(`/auth/login`);
                    }
                  }}
                  css={{
                    background: "var(--gradient-primary)",
                    borderRadius: "10px",
                    fontWeight: 600,
                  }}
                >
                  Join to unlock
                </ButtonWithIcon>
              </ScrollLink>
            )}
          </>
        )}
        <Flex mt={3} justifyContent="space-between" alignItems="center">
          <Flex gap={4}>
            <PostLike likes={likes} liked={false} postId={postId} />
            <PostComments commentsCount={comments} postId={postId} />
          </Flex>
          <Flex gap={4}>
            <ShareButton postId={postId} />
            {locked && (
              <IconText
                containerProps={{ cursor: "pointer" }}
                icon="tabler:lock-filled"
                text="Locked"
                textProps={{ lineHeight: 1.7, ml: "1px" }}
              />
            )}
          </Flex>
        </Flex>
      </Stack>
    </Stack>
  );
};

export default VideoPost;
