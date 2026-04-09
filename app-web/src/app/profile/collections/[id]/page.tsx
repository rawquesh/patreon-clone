"use client";

import React from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import NextLink from "next/link";
import {
  Box,
  Flex,
  Image,
  Text,
  Link,
  Separator,
  Spinner,
  Stack,
} from "@chakra-ui/react";
import { Avatar } from "@/components/ui/avatar";
import { fetchCollectionWithPosts } from "@/lib/backend-services/posts-service";
import { Post, CollectionWithPostsResponse } from "@/typings/ICollection";
import TextPost from "@/page-components/creator/text-post";
import ImagePost from "@/page-components/creator/image-post";
import VideoPost from "@/page-components/creator/video-post";
import AudioPost from "@/page-components/creator/audio-post";
import LinkPost from "@/page-components/creator/link-post";

const CollectionPage: React.FC = () => {
  const params = useParams();
  const collectionId = params.id as string;

  const {
    data: collectionData,
    isLoading,
    isError,
    error,
  } = useQuery<CollectionWithPostsResponse, Error>({
    queryKey: ["collection", collectionId],
    queryFn: () => fetchCollectionWithPosts(collectionId, { limit: 50 }),
    enabled: !!collectionId,
  });

  const collectionDetails = collectionData;
  const posts = collectionData?.posts || [];
  const creator = collectionData?.creator;

  if (isLoading) {
    return (
      <Flex justify="center" align="center" minH="50vh">
        <Spinner
          size="xl"
          css={{
            color: "hsl(211, 71%, 43%)",
            borderWidth: "3px",
          }}
        />
      </Flex>
    );
  }

  if (isError || !collectionDetails) {
    console.error("Error fetching collection:", error);
    return (
      <Flex justify="center" align="center" minH="50vh" p={4}>
        <Text css={{ color: "hsl(0, 84.2%, 60.2%)" }}>
          {error?.message || "Could not load collection."}
        </Text>
      </Flex>
    );
  }

  const renderPostComponent = (post: Post) => {
    const commonProps = {
      title: post.title,
      body: post.previewText || post.description || "",
      timeStamp: post.publishDate || post.createdAt,
      likes: post.likeCount || 0,
      comments: post.commentCount || 0,
      locked: false,
      hasAccess: true,
      postId: post.id,
      tierAccess: post.tierAccess,
      images: post.mediaUrls,
      linkUrl: post.linkUrl,
      isSubscribed: true,
    };

    switch (post.type?.toLowerCase()) {
      case "text":
        return <TextPost {...commonProps} />;
      case "image":
        return (
          <ImagePost
            {...commonProps}
            image={post.thumbnailUrl || post.mediaUrls?.[0] || ""}
          />
        );
      case "video":
        return (
          <VideoPost
            {...commonProps}
            src={post.videoUrl || post.mediaUrls?.[0] || ""}
            thumbnail={post.thumbnailUrl || ""}
            length={0}
          />
        );
      case "audio":
        return (
          <AudioPost
            {...commonProps}
            src={post.mediaUrls?.[0] || ""}
          />
        );
      case "link":
        return <LinkPost {...commonProps} />;
      default:
        return (
          <Box className="glass-card" p={4} borderRadius="12px">
            <Text fontWeight="bold" css={{ color: "hsl(222.2, 47.4%, 11.2%)" }}>
              {post.title}
            </Text>
            <Text css={{ color: "hsl(215.4, 16.3%, 46.9%)" }}>
              Unsupported post type: {post.type}
            </Text>
          </Box>
        );
    }
  };

  return (
    <Box className="animate-fade-in-up">
      {/* Header Section */}
      <Box
        px={12}
        py={8}
        mb={8}
        className="glass-card"
        borderRadius="20px"
        overflow="hidden"
      >
        <Flex
          direction="column"
          justify="center"
          p={{ base: 4, md: 8 }}
          flex={1}
        >
          {creator && (
            <Flex align="center" mb={2}>
              <Avatar
                src={creator.profilePicture}
                name={creator.displayName}
                size="xs"
                mr={2}
              />
              <NextLink href={`/creator/${creator.creatorUsername}`} passHref>
                <Link
                  fontSize="sm"
                  fontWeight="medium"
                  _hover={{ textDecoration: "underline" }}
                  css={{ color: "hsl(211, 71%, 43%)" }}
                >
                  {creator.displayName}
                </Link>
              </NextLink>
            </Flex>
          )}
          <Text
            fontSize={{ base: "2xl", md: "4xl" }}
            fontWeight="bold"
            lineHeight="tight"
            css={{
              background: "linear-gradient(135deg, hsl(211, 71%, 43%), hsl(335, 27%, 64%))",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            {collectionDetails.title}
          </Text>
          {collectionDetails.description && (
            <Text mt={2} fontSize="md" css={{ color: "hsl(215.4, 16.3%, 46.9%)" }}>
              {collectionDetails.description}
            </Text>
          )}
        </Flex>

        {collectionDetails.coverImage && (
          <Box
            flexShrink={0}
            width={{ base: "100px", md: "300px", lg: "400px" }}
          >
            <Image
              src={collectionDetails.coverImage}
              alt={`${collectionDetails.title} cover image`}
              objectFit="cover"
              width="100%"
              height="100%"
              maxH={{ base: "150px", md: "250px" }}
              borderRadius="12px"
            />
          </Box>
        )}
      </Box>

      {/* Posts Section */}
      <Stack gap={6} maxW="680px" mx="auto" px={{ base: 2, md: 0 }}>
        {posts.length > 0 ? (
          posts.map((post) => (
            <Box key={post.id}>
              {creator && (
                <Flex align="center" gap={3} mb={3}>
                  <Avatar
                    src={creator.profilePicture}
                    name={creator.displayName}
                    shape="rounded"
                    w="40px"
                    h="40px"
                  />
                  <Box>
                    <NextLink
                      href={`/creator/${creator.creatorUsername}`}
                      passHref
                    >
                      <Link as="div" _hover={{ textDecoration: "underline" }}>
                        <Text fontWeight="bold" css={{ color: "hsl(222.2, 47.4%, 11.2%)" }}>
                          {creator.displayName}
                        </Text>
                      </Link>
                    </NextLink>
                    <Text fontSize="sm" css={{ color: "hsl(215.4, 16.3%, 46.9%)" }}>
                      @{creator.creatorUsername}
                    </Text>
                  </Box>
                </Flex>
              )}
              {renderPostComponent(post)}
              <Separator mt={6} css={{ borderColor: "hsl(210, 30%, 88%)" }} />
            </Box>
          ))
        ) : (
          <Flex
            direction="column"
            align="center"
            justify="center"
            minH="200px"
            className="glass-card"
            borderRadius="16px"
            p={8}
          >
            <Text
              textAlign="center"
              fontSize="lg"
              css={{ color: "hsl(215.4, 16.3%, 46.9%)" }}
            >
              There are no posts in this collection yet.
            </Text>
          </Flex>
        )}
      </Stack>
    </Box>
  );
};

export default CollectionPage;
