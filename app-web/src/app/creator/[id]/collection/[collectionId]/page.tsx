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
import { useSubscription } from "@/context/subscription.provider";
import LinkPost from "@/page-components/creator/link-post";
// import LinkPost from "@/page-components/creator/link-post"; // LinkPost not used currently
// import { notFound } from 'next/navigation'; // Keep commented, might need later for collection details
// Assuming db is not used directly in frontend components based on findings
// import { db } from '@/lib/db';

interface CollectionPageProps {}
console.clear();

const CollectionPage: React.FC<CollectionPageProps> = () => {
  const params = useParams();
  const collectionId = params.collectionId as string;
  const { subscriptions } = useSubscription();

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

  const isSubscribed = subscriptions.some(
    (subscription) =>
      subscription.creator._id === collectionData?.creator._id &&
      subscription.status === "active"
  );
  if (isLoading) {
    return (
      <Flex justify="center" align="center" minH="50vh">
        <Spinner size="xl" />
      </Flex>
    );
  }

  if (isError || !collectionDetails) {
    console.error("Error fetching collection:", error);
    return (
      <Flex justify="center" align="center" minH="50vh" p={4}>
        <Text color="red.500">
          {error?.message || "Could not load collection."}
        </Text>
      </Flex>
    );
  }
  const renderPostComponent = (post: Post) => {
    console.log(post);
    const commonProps = {
      title: post.title,
      // Use previewText if available, fallback to description
      body: post.previewText || post.description || "",
      // Use publishDate if available, fallback to createdAt
      timeStamp: post.publishDate || post.createdAt,
      likes: post.likeCount || 0,
      comments: post.commentCount || 0,
      locked: false, // TODO: Implement locking logic based on tierAccess/auth
      postId: post.id,
      isSubscribed,
      tierAccess: post.tierAccess,
      hasAccess: post.hasAccess,
      images: post.mediaUrls,
      linkUrl: post.linkUrl,
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
            length={0} // Length not available
          />
        );
      case "audio":
        // Assuming mediaUrls might contain audio, or a dedicated field if added
        return (
          <AudioPost
            {...commonProps}
            src={post.mediaUrls?.[0] || ""} // Placeholder for audio source
          />
        );
      case "link":
        // LinkPost requires linkUrl which is not in the current Post type
        return <LinkPost {...commonProps} />;
      // return (
      //   <Box p={4} borderWidth="1px" borderRadius="md">
      //     <Text fontWeight="bold">{post.title}</Text>
      //     <Text color="gray.500">Link post content not available.</Text>
      //   </Box>
      // );
      default:
        // Fallback for unknown or missing post types
        return (
          <Box p={4} borderWidth="1px" borderRadius="md">
            <Text fontWeight="bold">{post.title}</Text>
            <Text color="gray.500">Unsupported post type: {post.type}</Text>
          </Box>
        );
    }
  };

  return (
    <Box>
      {/* Header Section */}
      <Flex px={12} py={24} mb={8} borderRadius="md" overflow="hidden">
        {/* Left Side: Info */}
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
                >
                  {creator.displayName}!!!
                </Link>
              </NextLink>
            </Flex>
          )}
          <Text
            fontSize={{ base: "2xl", md: "4xl" }}
            fontWeight="bold"
            lineHeight="tight"
          >
            {collectionDetails.title}
          </Text>
          {collectionDetails.description && (
            <Text mt={2} fontSize="md" color="gray.300">
              {collectionDetails.description}
            </Text>
          )}
        </Flex>

        {/* Right Side: Image */}
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
              maxH={{ base: "150px", md: "250px" }} // Constrain image height
            />
          </Box>
        )}
      </Flex>

      {/* Posts Section */}
      <Stack gap={6} maxW="680px" mx="auto" px={{ base: 2, md: 0 }}>
        {posts.length > 0 ? (
          posts.map((post) => (
            <Box key={post.id}>
              {/* Creator info repetition might be desired or removed depending on final design */}
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
                        <Text fontWeight="bold">{creator.displayName}</Text>
                      </Link>
                    </NextLink>
                    <Text fontSize="sm" color={"gray.600"}>
                      @{creator.creatorUsername}
                    </Text>
                  </Box>
                </Flex>
              )}
              {renderPostComponent(post)}
              <Separator mt={6} />
            </Box>
          ))
        ) : (
          <Text textAlign="center" fontSize="lg" mt={10} color="gray.500">
            There are no posts in this collection yet.
          </Text>
        )}
        {/* TODO: Add pagination controls */}
      </Stack>
    </Box>
  );
};

export default CollectionPage;
