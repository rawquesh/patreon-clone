"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Box, Flex, Spinner, Text, Stack, Heading } from "@chakra-ui/react";
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
        <TextPost {...commonProps} body={`Unsupported post type: ${post.type}`} />
      );
  }

  return <Box mb={4}>{postComponent}</Box>;
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
    <Box
      className="animate-fade-in-up"
      w={{ base: "100%", lg: "680px" }}
      mx="auto"
      mt={6}
      px={{ base: 4, md: 0 }}
    >
      {/* Page Header */}
      <Box mb={6} position="relative">
        <Box
          position="absolute"
          w="300px"
          h="60px"
          borderRadius="full"
          css={{
            background: "linear-gradient(135deg, hsl(211, 71%, 43% / 0.08), hsl(335, 27%, 64% / 0.06))",
            filter: "blur(40px)",
            top: "-10px",
            left: "0",
            pointerEvents: "none",
          }}
        />
        <Heading fontSize="xl" fontWeight={700} mb={1} css={{ color: "hsl(222.2, 47.4%, 11.2%)" }}>
          My Posts
        </Heading>
        <Box
          h="1px"
          background="linear-gradient(90deg, transparent, hsl(210, 30%, 88%), transparent)"
        />
      </Box>

      {isLoading ? (
        <Flex justify="center" align="center" height="200px">
          <Spinner size="xl" css={{ color: "hsl(211, 71%, 43%)" }} />
        </Flex>
      ) : isError ? (
        <Flex
          direction="column"
          align="center"
          justify="center"
          minH="200px"
          p={6}
          className="glass-card"
          borderRadius="16px"
        >
          <Text css={{ color: "hsl(0, 84.2%, 60.2%)" }}>
            Could not load posts. Please try again later.
          </Text>
        </Flex>
      ) : allPosts.length > 0 ? (
        <Box className="stagger-children">
          {allPosts.map((post) => (
            <ProfilePostItem key={post._id} post={post} />
          ))}
        </Box>
      ) : (
        <Flex
          direction="column"
          align="center"
          justify="center"
          minH="200px"
          p={6}
          className="glass-card"
          borderRadius="16px"
        >
          <Text fontSize="lg" fontWeight={600} mb={2} css={{ color: "hsl(222.2, 47.4%, 11.2%)" }}>
            No posts yet
          </Text>
          <Text textAlign="center" css={{ color: "hsl(215.4, 16.3%, 46.9%)" }}>
            Start creating content to share with your community.
          </Text>
        </Flex>
      )}
    </Box>
  );
};

export default HomePage;
