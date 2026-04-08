/* eslint-disable @typescript-eslint/ban-ts-comment */
"use client";

import { Box, Flex, Stack, Text } from "@chakra-ui/react";
import React, { Suspense, useEffect, useState } from "react";
import PostPageCreatorInfo from "./post-page-creator-info";
import VideoPlayer from "@/components/video-player";
import { getTimeAgo } from "@/utils/getTimeAgo";
import PostLike from "./post-like";
import IconText from "@/components/ui/icon-text";
import PostCommentsSection from "./post-comments-section";

// Function to check if a URL is a YouTube link
const isYoutubeUrl = (url: string): boolean => {
  const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/;
  return youtubeRegex.test(url);
};

// Function to extract YouTube video ID from various YouTube URL formats
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
  />
);

const VideoPostPageComponent: React.FC = () => {
  const [shouldRender, setShouldRender] = useState(false);

  // This would come from your API or router params in a real application
  // We're using a mock value to simulate both YouTube and non-YouTube videos
  const videoUrl = "https://www.youtube.com/watch?v=dQw4w9WgXcQ"; // Example YouTube URL
  // const videoUrl = "/videos/example-vid.mp4"; // Example local video

  useEffect(() => {
    if (typeof window !== undefined) {
      setShouldRender(true);
    }
  }, []);

  if (shouldRender) {
    return <Component videoUrl={videoUrl} />;
  } else {
    return null;
  }
};

// Update Component to accept props
interface ComponentProps {
  videoUrl: string;
}

const Component = ({ videoUrl }: ComponentProps) => {
  const isYoutube = isYoutubeUrl(videoUrl);
  const youtubeVideoId = isYoutube ? getYoutubeVideoId(videoUrl) : null;

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
        <Suspense>
          {isYoutube && youtubeVideoId ? (
            <Box width="100%" height="365px">
              <YouTubeEmbed videoId={youtubeVideoId} />
            </Box>
          ) : (
            <VideoPlayer
              src={videoUrl}
              options={{
                autoplay: false,
              }}
            />
          )}
        </Suspense>
        <Text mt={6} fontSize={"2xl"} fontWeight={600}>
          Post-1
        </Text>
        <Text mb={6} fontSize={"sm"} color={"star.600"}>
          {getTimeAgo("2025-01-27")}
        </Text>
        <Text>
          Lorem ipsum dolor sit amet consectetur, adipisicing elit. Animi
          possimus dolor in repellendus unde! Quo cupiditate praesentium eveniet
          veniam quae doloribus, eligendi maxime quasi earum qui soluta esse?
          Voluptatem, aliquam! Nam dolore dignissimos assumenda accusamus
          voluptatibus vero porro veritatis! Quibusdam, facilis laboriosam quae
          commodi veritatis dolores id, placeat earum nemo deserunt tenetur
          perspiciatis nisi cumque nihil quis vel sequi similique? Delectus eum
          totam veritatis? Est aut qui, quaerat repudiandae mollitia nostrum
          dicta dolor aliquid maiores eos incidunt harum sed a labore explicabo
          culpa ipsa. Placeat, quisquam sed quos porro tempora temporibus ex
          voluptates autem repellendus tenetur ullam natus nemo saepe voluptatem
          sint corporis mollitia minus necessitatibus maiores est laudantium
          nihil quae dolor perspiciatis? Totam, possimus.
        </Text>
        <Flex my={4} gap={4}>
          <Suspense>
            <PostLike postId="123" likes={12} liked />
          </Suspense>
          <IconText
            containerProps={{ cursor: "pointer" }}
            icon="iconamoon:comment-fill"
            text={String(1)}
          />
        </Flex>
        <Suspense>
          <PostCommentsSection postId="123" bg="white" />
        </Suspense>
      </Stack>
      <PostPageCreatorInfo
        avatarUrl="https://cdn.myanimelist.net/r/84x124/images/characters/9/131317.webp?s=d4b03c7291407bde303bc0758047f6bd"
        description="Content creator"
        membership="$5 per month"
        username="USER1"
      />
    </Flex>
  );
};

export default VideoPostPageComponent;
