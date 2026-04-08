/* eslint-disable @typescript-eslint/ban-ts-comment */
"use client";

import React from "react";
import ButtonWithIcon from "@/components/ui/button-with-icon";
import IconText from "@/components/ui/icon-text";
import { getTimeAgo } from "@/utils/getTimeAgo";
import { Box, Flex, Heading, Stack, Text } from "@chakra-ui/react";
import Image from "next/image";
// import { Icon } from "@iconify/react/dist/iconify.js";
// import { formatTime } from "@/utils/formatTime";
// import VideoPlayer from "@/components/video-player";
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

// Function to check if a URL is a YouTube link and extract video ID
const isYoutubeUrl = (url: string): boolean => {
  const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/;
  return youtubeRegex.test(url);
};

const getYoutubeVideoId = (url: string): string | null => {
  // YouTube URLs can be in various formats:
  // - youtu.be/VIDEO_ID
  // - youtube.com/watch?v=VIDEO_ID
  // - youtube.com/embed/VIDEO_ID

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

const VideoPost: React.FC<Props> = ({
  comments,
  // length,
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

  const header = (
    <Link href={`/post/${postId}`}>
      <Text fontSize={"2xl"} fontWeight={600}>
        {title}
      </Text>
    </Link>
  );

  // YouTube embedded player component
  const YouTubeEmbed = ({ videoId }: { videoId: string }) => (
    <Box
      as="iframe"
      // @ts-ignore
      src={`https://www.youtube.com/embed/${videoId}`}
      width="100%"
      height="100%"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowFullScreen
      border="0"
      // borderBlock={"2px solid red"}
    />
  );
  return (
    <Stack
      borderRadius={"12px"}
      overflow={"hidden"}
      bg="white"
      shadow={"md"}
      w={"100%"}
    >
      <Box
        h={"365px"}
        w={"100%"}
        display={"flex"}
        alignItems={"end"}
        pos={"relative"}
        onClick={locked ? undefined : handlePostClick}
        cursor={locked ? "default" : "pointer"}
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
            {isYoutube ? (
              <>
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
                <Image src={thumbnail} alt="title" layout="fill" />
              </>
            ) : (
              <Box
                width="100%"
                height="100%"
                position="relative"
                bg="black"
                borderRadius="md"
                overflow="hidden"
              >
                <Image
                  src={thumbnail}
                  alt="title"
                  layout="fill"
                  style={{ objectFit: "cover", opacity: 0.3 }}
                />
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
          </>
        )}
      </Box>
      <Stack p="24px">
        <Heading fontSize={"2xl"} fontWeight={600}>
          {header}
        </Heading>
        <Text fontSize={"sm"} color={"star.600"}>
          {getTimeAgo(timeStamp)}
        </Text>
        {/* {description && <Text>{description}</Text>} */}
        {/* <Text
          fontSize={"sm"}
          lineClamp={2}
          onClick={handlePostClick}
          cursor="pointer"
        >
          {body}
        </Text> */}
        {(previewText || description) && (
          <Text mb={4} onClick={handlePostClick} cursor="pointer">
            {previewText || description}
          </Text>
        )}
        {/* {locked && (
          <ScrollLink to="memberships" smooth>
            <ButtonWithIcon mt={4} w={"fit"} icon="tabler:lock-filled">
              Join to unlock
            </ButtonWithIcon>
          </ScrollLink>
        )} */}
        {!hasAccess && (
          <>
            {isSubscribed ? (
              <UpgradeModal tierAccess={tierAccess} />
            ) : (
              <ScrollLink to="memberships" smooth>
                <ButtonWithIcon
                  mt={4}
                  mb={2}
                  w={"fit"}
                  icon="tabler:lock-filled"
                  onClick={() => {
                    if (!user) {
                      router.push(`/auth/login`);
                    }
                  }}
                >
                  Join to unlock
                </ButtonWithIcon>
              </ScrollLink>
            )}
          </>
        )}
        <Flex
          color={"star.600"}
          mt={3}
          justifyContent={"space-between"}
          alignItems={"center"}
        >
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
                textProps={{
                  lineHeight: 1.7,
                  ml: "1px",
                }}
              />
            )}
          </Flex>
        </Flex>
      </Stack>
    </Stack>
  );
};

export default VideoPost;
