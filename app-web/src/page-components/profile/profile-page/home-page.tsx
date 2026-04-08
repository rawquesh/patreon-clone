"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Box, Flex, Spinner, Text, Stack, Separator } from "@chakra-ui/react";
import TextPost from "@/page-components/creator/text-post";
import ImagePost from "@/page-components/creator/image-post";
import VideoPost from "@/page-components/creator/video-post";
import AudioPost from "@/page-components/creator/audio-post";
import LinkPost from "@/page-components/creator/link-post";
import {
  creatorAPI,
  CreatorPost,
} from "@/lib/backend-services/creator-service";
import { useAuth } from "@/context/auth.provider";
const ProfilePostItem = React.memo(({ post }: { post: CreatorPost }) => {
  const commonProps = {
    title: post.title,
    body: "",
    timeStamp: new Date(post.createdAt).toISOString(),
    locked: false,
    postId: post._id,
    videoId: post.videoId,
    videoUrl: post.videoUrl,
    likes: post.likes,
    comments: post.comments,
    previewText: post.previewText,
    hasAccess: true,
    isSubscribed: true,
    tierAccess: [],
    linkUrl: post.linkUrl,
    images: post.mediaUrls,
  };

  let postComponent;
  switch (post.type.toLowerCase()) {
    case "text":
      postComponent = <TextPost {...commonProps} />;
      break;
    case "image":
      postComponent = (
        <ImagePost
          {...commonProps}
          image={post.thumbnail || post.thumbnailUrl || post.mediaUrl || ""}
        />
      );
      break;
    case "picture":
      postComponent = (
        <ImagePost
          {...commonProps}
          image={post.thumbnail || post.thumbnailUrl || post.mediaUrl || ""}
        />
      );
      break;
    case "video":
      postComponent = (
        <VideoPost
          {...commonProps}
          src={post.videoUrl || ""}
          thumbnail={post.thumbnailUrl || post.mediaUrl || ""}
          length={0}
        />
      );
      break;
    case "audio":
      postComponent = <AudioPost {...commonProps} src={post.mediaUrl || ""} />;
      break;
    case "link":
      postComponent = <LinkPost {...commonProps} />;
      break;
    default:
      postComponent = (
        <TextPost
          {...commonProps}
          body={`Unsupported post type: ${post.type}`}
        />
      );
  }

  return (
    <Stack gap={4} mb={6}>
      {postComponent}
      <Separator />
    </Stack>
  );
});
ProfilePostItem.displayName = "ProfilePostItem";

const HomePage: React.FC = () => {
  const [allPosts, setAllPosts] = useState<CreatorPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const { user } = useAuth();

  const fetchPosts = useCallback(async () => {
    setIsError(false);
    setIsLoading(true);

    try {
      const posts: CreatorPost[] = await creatorAPI.getCreatorPosts(user!._id);
      if (posts) {
        setAllPosts(posts);
      } else {
        setAllPosts([]);
      }
    } catch (error) {
      console.error("Error fetching creator posts:", error);
      setIsError(true);
      setAllPosts([]);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setAllPosts([]);
    setIsLoading(true);
    if (user) {
      fetchPosts();
    }
  }, [user, fetchPosts]);

  return (
    <Box w={{ base: "100%", lg: "680px" }} mx={"auto"} mt={6}>
      {isLoading ? (
        <Flex justify="center" align="center" height="200px">
          <Spinner size="xl" />
        </Flex>
      ) : isError ? (
        <Text textAlign="center" color="red.500" p={4}>
          Could not load posts. Please try again later.
        </Text>
      ) : allPosts.length > 0 ? (
        <>
          {allPosts.map((post) => (
            <ProfilePostItem key={post._id} post={post} />
          ))}
        </>
      ) : (
        <Text textAlign="center" color="gray.500" p={4}>
          This creator hasn&apos;t posted anything yet.
        </Text>
      )}
    </Box>
  );
};

export default HomePage;
