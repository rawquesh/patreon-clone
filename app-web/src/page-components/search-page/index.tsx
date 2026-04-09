"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  Box,
  Flex,
  Grid,
  Heading,
  Image,
  Tabs,
  Text,
  Badge,
  Spinner,
  Input,
  Button,
} from "@chakra-ui/react";
import { Icon } from "@iconify/react/dist/iconify.js";
import Link from "next/link";
import CategoriesFilter from "@/components/search/categories-filter";
import { useSearchResults } from "@/lib/backend-services/search-service";
import { CreatorCategory } from "@/lib/constants";

interface Creator {
  _id: string;
  displayName: string;
  creatorUsername: string;
  profilePicture: string;
  creatorHeadline: string;
  creatorCategory?: CreatorCategory;
}

interface Post {
  _id: string;
  title: string;
  content: string;
  coverImage?: string;
  creator: Creator;
  createdAt: string;
  categories?: string[];
}

export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  const category = searchParams.get("category") || "all";
  const [activeTab, setActiveTab] = useState("creators");
  const [searchInput, setSearchInput] = useState(query);

  const { data: searchResults, isLoading } = useSearchResults(query, category);

  useEffect(() => {
    if (searchResults) {
      if (searchResults.creators && searchResults.creators.length > 0) {
        setActiveTab("creators");
      } else if (searchResults.posts && searchResults.posts.length > 0) {
        setActiveTab("posts");
      } else if (searchResults.topics && searchResults.topics.length > 0) {
        setActiveTab("topics");
      }
    }

    setSearchInput(query);
  }, [searchResults, query]);

  const handleCategoryChange = (newCategory: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (newCategory && newCategory !== "all") {
      params.set("category", newCategory);
    } else {
      params.delete("category");
    }

    if (query) {
      params.set("q", query);
    }

    window.location.href = `/search?${params.toString()}`;
  };

  const getCategoryDisplayName = (categoryValue?: string): string => {
    if (!categoryValue) return "";

    return categoryValue
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  const truncateText = (text: string, maxLength: number = 100): string => {
    if (text?.length <= maxLength) return text;
    return text?.slice(0, maxLength) + "...";
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchInput.trim()) return;

    const params = new URLSearchParams(searchParams.toString());
    params.set("q", searchInput);

    if (category && category !== "all") {
      params.set("category", category);
    }

    window.location.href = `/search?${params.toString()}`;
  };

  return (
    <Box maxW="1200px" mx="auto" py={8} px={{ base: 4, md: 6 }}>
      <Box mb={8}>
        <form onSubmit={handleSearch}>
          <Flex position="relative">
            <Input
              placeholder="Search creators, posts, or topics..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              borderRadius="full"
              bg="gray.100"
              _hover={{ bg: "gray.200" }}
              _focus={{ bg: "white", boxShadow: "md" }}
              fontSize="md"
              size="lg"
              pr="4rem"
            />
            <Button
              position="absolute"
              right="0"
              top="0"
              aria-label="Search"
              variant="ghost"
              type="submit"
              borderRadius="full"
              size="lg"
              height="100%"
              zIndex={2}
            >
              <Icon icon="material-symbols:search" />
            </Button>
          </Flex>
        </form>
      </Box>

      {!query ? (
        <Box textAlign="center" py={10}>
          <Heading size="lg" mb={4}>
            Search for creators, posts, and topics
          </Heading>
          <Text color="gray.600">
            Enter a search term above to find what you&apos;re looking for
          </Text>
        </Box>
      ) : (
        <>
          <Heading size="lg" mb={4}>
            Search results for &ldquo;{query}&rdquo;
            {category !== "all" && (
              <Text as="span" fontSize="md" fontWeight="normal" ml={2}>
                in {getCategoryDisplayName(category)}
              </Text>
            )}
          </Heading>

          <CategoriesFilter
            selectedCategories={[]}
            onCategoriesChange={() => {}}
            onCategoryChange={handleCategoryChange}
            selectedCategory={category}
          />

          {isLoading ? (
            <Flex justify="center" align="center" py={10}>
              <Spinner size="xl" color="blue.500" />
            </Flex>
          ) : (
            <Tabs.Root
              defaultValue={activeTab}
              onValueChange={(value) => setActiveTab(value.value)}
            >
              <Tabs.List>
                <Flex
                  borderBottom="1px solid"
                  borderColor="gray.200"
                  width="100%"
                  mb={6}
                  css={{
                    "& [aria-selected=true]": {
                      fontWeight: 600,
                      color: "blue.500",
                      borderBottom: "2px solid",
                      borderColor: "blue.500",
                    },
                  }}
                >
                  <Tabs.Trigger value="creators" className="tab-trigger">
                    Creators ({searchResults?.creators?.length || 0})
                  </Tabs.Trigger>
                  <Tabs.Trigger value="posts" className="tab-trigger">
                    Posts ({searchResults?.posts?.length || 0})
                  </Tabs.Trigger>
                  {/* <Tabs.Trigger value="topics" className="tab-trigger">
                    Topics ({searchResults?.topics?.length || 0})
                  </Tabs.Trigger> */}
                </Flex>
              </Tabs.List>

              <Tabs.Content value="creators">
                {searchResults?.creators &&
                searchResults.creators.length > 0 ? (
                  <Grid
                    templateColumns={{
                      base: "1fr",
                      md: "repeat(2, 1fr)",
                      lg: "repeat(3, 1fr)",
                    }}
                    gap={6}
                    mt={6}
                  >
                    {searchResults.creators.map((creator: Creator) => (
                      <Link
                        href={`/creator/${creator.creatorUsername}`}
                        key={creator._id}
                      >
                        <Box
                          p={4}
                          borderRadius="md"
                          boxShadow="md"
                          bg="white"
                          _hover={{
                            transform: "translateY(-4px)",
                            transition: "transform 0.2s",
                            boxShadow: "lg",
                          }}
                          height="100%"
                        >
                          <Flex align="center" gap={4}>
                            <Image
                              src={
                                creator.profilePicture ||
                                "/icons/default-avatar.svg"
                              }
                              alt={creator.displayName}
                              boxSize="60px"
                              borderRadius="full"
                              objectFit="cover"
                            />
                            <Box>
                              <Text fontWeight="bold" fontSize="lg">
                                {creator.displayName}
                              </Text>
                              <Text color="gray.600" fontSize="sm">
                                Creating {creator.creatorHeadline}
                              </Text>
                              {creator.creatorCategory && (
                                <Badge
                                  colorScheme="blue"
                                  mt={1}
                                  fontSize="xs"
                                  borderRadius="full"
                                  px={2}
                                >
                                  {getCategoryDisplayName(
                                    creator.creatorCategory
                                  )}
                                </Badge>
                              )}
                            </Box>
                          </Flex>
                        </Box>
                      </Link>
                    ))}
                  </Grid>
                ) : (
                  <Box textAlign="center" py={10}>
                    <Text>No creators found matching your search criteria</Text>
                  </Box>
                )}
              </Tabs.Content>

              <Tabs.Content value="posts">
                {searchResults?.posts && searchResults.posts.length > 0 ? (
                  <Grid
                    templateColumns={{
                      base: "1fr",
                      md: "repeat(2, 1fr)",
                      lg: "repeat(3, 1fr)",
                    }}
                    gap={6}
                    mt={6}
                  >
                    {searchResults.posts.map((post: Post) => (
                      <Link href={`/post/${post._id}`} key={post._id}>
                        <Box
                          p={4}
                          borderRadius="md"
                          boxShadow="md"
                          bg="white"
                          _hover={{
                            transform: "translateY(-4px)",
                            transition: "transform 0.2s",
                            boxShadow: "lg",
                          }}
                          height="100%"
                        >
                          {post.coverImage && (
                            <Box
                              height="160px"
                              mb={4}
                              borderRadius="md"
                              overflow="hidden"
                            >
                              <Image
                                src={post.coverImage}
                                alt={post.title}
                                width="100%"
                                height="100%"
                                objectFit="cover"
                              />
                            </Box>
                          )}
                          <Heading size="md" mb={2}>
                            {post.title}
                          </Heading>
                          <Text color="gray.600" mb={3}>
                            {truncateText(post.content)}
                          </Text>
                          <Flex justify="space-between" align="center">
                            <Flex align="center" gap={2}>
                              <Image
                                src={
                                  post.creator.profilePicture ||
                                  "/icons/default-avatar.svg"
                                }
                                alt={post.creator.displayName}
                                boxSize="30px"
                                borderRadius="full"
                                objectFit="cover"
                              />
                              <Text fontSize="sm" fontWeight="medium">
                                {post.creator.displayName}
                              </Text>
                            </Flex>
                            {post.categories && post.categories.length > 0 && (
                              <Badge
                                colorScheme="blue"
                                fontSize="xs"
                                borderRadius="full"
                                px={2}
                              >
                                {post.categories[0]}
                              </Badge>
                            )}
                          </Flex>
                        </Box>
                      </Link>
                    ))}
                  </Grid>
                ) : (
                  <Box textAlign="center" py={10}>
                    <Text>No posts found matching your search criteria</Text>
                  </Box>
                )}
              </Tabs.Content>

              <Tabs.Content value="topics">
                {searchResults?.topics && searchResults.topics.length > 0 ? (
                  <Grid
                    templateColumns={{
                      base: "1fr",
                      md: "repeat(2, 1fr)",
                      lg: "repeat(3, 1fr)",
                    }}
                    gap={6}
                    mt={6}
                  >
                    {searchResults.topics.map((topic: any) => (
                      <Link href={`/topic/${topic._id}`} key={topic._id}>
                        <Box
                          p={4}
                          borderRadius="md"
                          boxShadow="md"
                          bg="white"
                          _hover={{
                            transform: "translateY(-4px)",
                            transition: "transform 0.2s",
                            boxShadow: "lg",
                          }}
                          height="100%"
                        >
                          <Heading size="md" mb={2}>
                            {topic.title}
                          </Heading>
                          <Text color="gray.600" mb={3}>
                            {truncateText(topic.description)}
                          </Text>
                          <Flex justify="space-between" align="center">
                            <Text fontSize="sm" color="gray.500">
                              {topic.postCount} posts
                            </Text>
                            {topic.category && (
                              <Badge
                                colorScheme="blue"
                                fontSize="xs"
                                borderRadius="full"
                                px={2}
                              >
                                {topic.category}
                              </Badge>
                            )}
                          </Flex>
                        </Box>
                      </Link>
                    ))}
                  </Grid>
                ) : (
                  <Box textAlign="center" py={10}>
                    <Text>No topics found matching your search criteria</Text>
                  </Box>
                )}
              </Tabs.Content>
            </Tabs.Root>
          )}
        </>
      )}

      <style jsx global>{`
        .tab-trigger {
          padding: 1rem 1.5rem;
          cursor: pointer;
          font-size: 1rem;
          border-bottom: 2px solid transparent;
          transition: all 0.2s;
        }

        .tab-trigger:hover {
          color: #3182ce;
        }
      `}</style>
    </Box>
  );
}
