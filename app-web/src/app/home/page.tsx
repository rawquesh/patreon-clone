"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Avatar } from "@/components/ui/avatar";
import {
  Box,
  Separator,
  Flex,
  Heading,
  Link as ChakraLink,
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
import { branding } from "@/config/branding";

interface Creator {
  id: string;
  displayName: string;
  username: string;
  profilePicture?: string;
}

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
          thumbnail={post.thumbnail || post.thumbnailUrl}
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
    <Box className="glass-card" p={5} borderRadius="16px">
      <Stack gap={4}>
        <Flex align="center" gap={3}>
          <Avatar
            src={creator.profilePicture}
            shape="rounded"
            w="40px"
            h="40px"
          />
          <Box>
            <NextLink href={`/creator/${creator.username}`} passHref>
              <ChakraLink as="div" _hover={{ textDecoration: "underline" }}>
                <Text fontWeight={600} css={{ color: "hsl(222.2, 47.4%, 11.2%)" }}>
                  {creator.displayName}
                </Text>
              </ChakraLink>
            </NextLink>
            <Text fontSize="sm" css={{ color: "hsl(215.4, 16.3%, 46.9%)" }}>
              @{creator.username}
            </Text>
          </Box>
        </Flex>
        {postComponent}
        <Separator css={{ borderColor: "hsl(210, 30%, 88%)" }} />
      </Stack>
    </Box>
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

  const loadMore = useCallback(async () => {
    if (!hasMorePages || isLoadingMore) return;

    try {
      setIsLoadingMore(true);
      const nextPage = page + 1;

      const result = await homeAPI.getSubscribedFeed(nextPage, limit);

      if (result.posts) {
        const newPosts = result.posts.filter(
          (post) => !postsRef.current[post._id]
        );

        newPosts.forEach((post) => {
          postsRef.current[post._id] = true;
        });

        setAllPosts((prev) => [...prev, ...newPosts]);
        setPage(nextPage);
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
        <Spinner size="xl" css={{ color: "hsl(211, 71%, 43%)" }} />
      </Flex>
    );
  }

  if (!user) {
    return (
      <Box p={6} maxW="1200px" mx="auto">
        <Heading mb={6} css={{ color: "hsl(222.2, 47.4%, 11.2%)" }}>
          {branding.name}
        </Heading>
        <Text fontSize="lg" css={{ color: "hsl(215.4, 16.3%, 46.9%)" }}>
          Sign in to see posts from creators you follow.
        </Text>
      </Box>
    );
  }

  return (
    <Box className="animate-fade-in-up" p={{ base: 4, md: 6 }} maxW="1200px" mx="auto">
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
        <Heading
          fontSize="xl"
          fontWeight={700}
          mb={1}
          css={{ color: "hsl(222.2, 47.4%, 11.2%)" }}
        >
          Latest
        </Heading>
        <Box
          h="1px"
          background="linear-gradient(90deg, transparent, hsl(210, 30%, 88%), transparent)"
        />
      </Box>

      {isLoading && page === 1 ? (
        <Flex justify="center" align="center" height="200px">
          <Spinner size="xl" css={{ color: "hsl(211, 71%, 43%)" }} />
        </Flex>
      ) : isError ? (
        <Text textAlign="center" css={{ color: "hsl(0, 84.2%, 60.2%)" }}>
          There was an error loading your feed. Please try again later.
        </Text>
      ) : allPosts.length > 0 ? (
        <Box maxW="680px" mx="auto" className="stagger-children">
          {allPosts.map((post) => (
            <Box key={post._id} mb={4}>
              <PostItem post={post} />
            </Box>
          ))}

          {hasMorePages && (
            <Flex justify="center" mt={4} mb={8}>
              <Button
                onClick={loadMore}
                loading={isLoadingMore}
                variant="outline"
                disabled={isLoadingMore}
                size="sm"
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
          className="glass-card"
          borderRadius="16px"
        >
          <Text
            fontSize="xl"
            fontWeight={600}
            mb={4}
            css={{ color: "hsl(222.2, 47.4%, 11.2%)" }}
          >
            Your feed is empty
          </Text>
          <Text
            textAlign="center"
            css={{ color: "hsl(215.4, 16.3%, 46.9%)", maxW: "400px" }}
          >
            Follow some creators to see their posts here, or explore the
            community to find new content.
          </Text>
          <Button
            mt={4}
            css={{
              background: "var(--gradient-primary)",
              borderRadius: "10px",
              fontWeight: 600,
            }}
            onClick={() => window.location.href = "/explore"}
          >
            Explore Creators
          </Button>
        </Flex>
      )}
    </Box>
  );
};

export default HomePage;
