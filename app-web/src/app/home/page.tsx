"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Avatar } from "@/components/ui/avatar";
import {
  Box,
  Separator,
  Flex,
  Heading,
  Link,
  Spinner,
  Stack,
  Text,
} from "@chakra-ui/react";
import { useSubscribedFeed } from "@/lib/backend-services/home-service";
import TextPost from "@/page-components/creator/text-post";
import ImagePost from "@/page-components/creator/image-post";
import VideoPost from "@/page-components/creator/video-post";
import AudioPost from "@/page-components/creator/audio-post";
import LinkPost from "@/page-components/creator/link-post";
import { useAuth } from "@/context/auth.provider";
import { Button } from "@/components/ui/button";
import NextLink from "next/link";
import { homeAPI } from "@/lib/backend-services/home-service";
import { useSubscription } from "@/context/subscription.provider";

// Interface for creator data from posts
interface Creator {
  id: string;
  displayName: string;
  username: string;
  profilePicture?: string;
}

// Interface for post data
interface Post {
  _id: string;
  title: string;
  textContent?: string;
  mediaUrls?: string[];
  videoUrl?: string;
  audioUrl?: string;
  linkUrl?: string;
  thumbnail?: string;
  createdAt: string;
  likes: any[];
  comments: any[];
  type: string;
  creator: Creator;
  previewText?: string;
}

const PostItem = React.memo(({ post }: { post: any }) => {
  const { subscriptions } = useSubscription();
  const isSubscribed = subscriptions.some(
    (subscription) =>
      subscription.creator._id === post.creator.id &&
      subscription.status === "active"
  );

  const creator = post.creator;
  console.log({ post });
  const commonProps = {
    title: post.title,
    body: post.textContent || "",
    timeStamp: new Date(post.createdAt).toISOString(),
    likes: post.likesCount || 0,
    comments: post.commentsCount || 0,
    locked: false,
    postId: post._id,
    previewText: post.previewText,
    hasAccess: post.hasAccess,
    tierAccess: post.tierAccess,
    isSubscribed,
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
          image={post.thumbnail || post.mediaUrls?.[0] || ""}
        />
      );
      break;
    case "video":
      postComponent = (
        <VideoPost
          {...commonProps}
          src={post.videoUrl || post.mediaUrls?.[0] || ""}
          thumbnail={post.thumnail || post.thumbnailUrl}
          length={0}
        />
      );
      break;
    case "audio":
      postComponent = (
        <AudioPost
          {...commonProps}
          src={post.audioUrl || post.mediaUrls?.[0] || ""}
        />
      );
      break;
    case "link":
      postComponent = (
        <LinkPost {...commonProps} linkUrl={post.linkUrl || ""} />
      );
      break;
    default:
      postComponent = <TextPost {...commonProps} />;
  }

  return (
    <Stack gap={4} mb={6}>
      <Flex align="center" gap={3}>
        <Avatar
          src={creator.profilePicture}
          shape="rounded"
          w="40px"
          h="40px"
        />
        <Box>
          <NextLink href={`/creator/${creator.username}`} passHref>
            <Link as="div" _hover={{ textDecoration: "underline" }}>
              <Text fontWeight="bold">{creator.displayName}</Text>
            </Link>
          </NextLink>
          <Text fontSize="sm" color={"gray.600"}>
            @{creator.username}
          </Text>
        </Box>
      </Flex>
      {postComponent}
      <Separator />
    </Stack>
  );
});

PostItem.displayName = "PostItem";

const HomePage: React.FC = () => {
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [allPosts, setAllPosts] = useState<Post[]>([]);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMorePages, setHasMorePages] = useState(false);
  const { user, isLoadingUser: authLoading } = useAuth();
  const { data, isLoading, isError } = useSubscribedFeed(page, limit);
  const postsRef = useRef<Record<string, boolean>>({});

  // Initial data load
  useEffect(() => {
    if (allPosts.length > 0) return;

    if (data?.posts && page === 1) {
      setAllPosts(data.posts);

      postsRef.current = data.posts.reduce((acc, post) => {
        acc[post._id] = true;
        return acc;
      }, {} as Record<string, boolean>);

      setHasMorePages(data.pagination && page < data.pagination.totalPages);
    }
  }, [data, page, allPosts.length]);

  // Use a direct API call for loading more posts instead of refetch
  const loadMore = useCallback(async () => {
    if (!hasMorePages || isLoadingMore) return;

    try {
      setIsLoadingMore(true);
      const nextPage = page + 1;

      // Make direct API call for next page
      const result = await homeAPI.getSubscribedFeed(nextPage, limit);

      if (result.posts) {
        // Filter out duplicates
        const newPosts = result.posts.filter(
          (post) => !postsRef.current[post._id]
        );

        // Update post tracking
        newPosts.forEach((post) => {
          postsRef.current[post._id] = true;
        });

        // Append new posts without re-rendering existing ones
        setAllPosts((prev) => [...prev, ...newPosts]);

        // Update page state
        setPage(nextPage);

        // Check if more pages exist
        setHasMorePages(
          result.pagination && nextPage < result.pagination.totalPages
        );
      }
    } catch (error) {
      console.error("Error loading more posts:", error);
    } finally {
      setIsLoadingMore(false);
    }
  }, [hasMorePages, isLoadingMore, page, limit]);

  if (authLoading) {
    return (
      <Flex justify="center" align="center" height="100%" minH="50vh">
        <Spinner size="xl" />
      </Flex>
    );
  }

  if (!user) {
    return (
      <Box p={6} maxW="1200px" mx="auto">
        <Heading mb={6}>Welcome to Patreon Clone</Heading>
        <Text fontSize="lg">
          Sign in to see posts from creators you follow.
        </Text>
      </Box>
    );
  }

  return (
    <Box p={{ base: 4, md: 6 }} maxW="1200px" mx="auto">
      <Heading fontSize="xl" fontWeight="bold" mb={6}>
        Latest
      </Heading>

      {isLoading && page === 1 ? (
        <Flex justify="center" align="center" height="200px">
          <Spinner size="xl" />
        </Flex>
      ) : isError ? (
        <Text textAlign="center" color="red.500">
          There was an error loading your feed. Please try again later.
        </Text>
      ) : allPosts.length > 0 ? (
        <Box maxW="680px" mx="auto">
          {/* This maps each post to its own component with a stable key */}
          {allPosts.map((post) => (
            <PostItem key={post._id} post={post} />
          ))}

          {hasMorePages && (
            <Flex justify="center" mt={4} mb={8}>
              <Button
                onClick={loadMore}
                loading={isLoadingMore}
                variant="outline"
                disabled={isLoadingMore}
              >
                {isLoadingMore ? "Loading..." : "Load More"}
              </Button>
            </Flex>
          )}
        </Box>
      ) : (
        <Flex
          direction="column"
          align="center"
          justify="center"
          minH="300px"
          p={6}
          bg="white"
          borderRadius="lg"
          boxShadow="sm"
        >
          <Text fontSize="xl" fontWeight="medium" mb={4}>
            Your feed is empty
          </Text>
          <Text textAlign="center">
            Follow some creators to see their posts here, or explore the
            community to find new content.
          </Text>
        </Flex>
      )}
    </Box>
  );
};

export default HomePage;
