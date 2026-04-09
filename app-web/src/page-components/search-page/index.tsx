"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  Box,
  Flex,
  Grid,
  Heading,
  Text,
  Spinner,
  Input,
  Button,
} from "@chakra-ui/react";
import { Icon } from "@iconify/react/dist/iconify.js";
import Image from "next/image";
import Link from "next/link";
import CategoriesFilter from "@/components/search/categories-filter";
import { useSearchResults } from "@/lib/backend-services/search-service";
import { CreatorCategory } from "@/lib/constants";
import { Tabs } from "@chakra-ui/react";

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
    <Box
      className="animate-fade-in-up"
      maxW="1200px"
      mx="auto"
      py={8}
      px={{ base: 4, md: 6 }}
      pb="100px"
    >
      {/* Search Header */}
      <Box mb={8}>
        <Box position="relative" mb={6}>
          <Box
            position="absolute"
            w="400px"
            h="80px"
            borderRadius="full"
            css={{
              background: "linear-gradient(135deg, hsl(211, 71%, 43% / 0.08), hsl(335, 27%, 64% / 0.06))",
              filter: "blur(40px)",
              top: "-20px",
              left: "0",
              pointerEvents: "none",
            }}
          />
          <Heading
            fontSize="2xl"
            fontWeight={700}
            css={{ color: "hsl(222.2, 47.4%, 11.2%)" }}
          >
            Search
          </Heading>
        </Box>
        <form onSubmit={handleSearch}>
          <Box
            className="glass-card"
            borderRadius="16px"
            overflow="hidden"
          >
            <Flex position="relative">
              <Input
                placeholder="Search creators, posts, or topics..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                borderRadius="0"
                border="none"
                bg="transparent"
                _hover={{ bg: "transparent" }}
                _focus={{ bg: "transparent", boxShadow: "none" }}
                fontSize="md"
                size="lg"
                pr="4rem"
                css={{
                  "& input": {
                    background: "transparent",
                  },
                }}
              />
              <Button
                position="absolute"
                right="0"
                top="0"
                aria-label="Search"
                variant="ghost"
                type="submit"
                size="lg"
                height="100%"
                zIndex={2}
                css={{
                  color: "hsl(211, 71%, 43%)",
                  "&:hover": {
                    background: "linear-gradient(135deg, hsl(211, 71%, 43% / 0.08), hsl(335, 27%, 64% / 0.06))",
                  },
                }}
              >
                <Icon icon="material-symbols:search" width="24px" />
              </Button>
            </Flex>
          </Box>
        </form>
      </Box>

      {!query ? (
        <Box textAlign="center" py={10}>
          <Box
            className="glass-card"
            p={8}
            borderRadius="16px"
            maxW="480px"
            mx="auto"
          >
            <Box
              w="64px"
              h="64px"
              borderRadius="full"
              mx="auto"
              mb={4}
              css={{
                background: "linear-gradient(135deg, hsl(211, 71%, 43% / 0.1), hsl(335, 27%, 64% / 0.08))",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Icon icon="material-symbols:search" width="32px" height="32px" style={{ color: "hsl(215.4, 16.3%, 46.9%)" }} />
            </Box>
            <Heading size="lg" mb={4} css={{ color: "hsl(222.2, 47.4%, 11.2%)" }}>
              Search for creators, posts, and topics
            </Heading>
            <Text css={{ color: "hsl(215.4, 16.3%, 46.9%)" }}>
              Enter a search term above to find what you&apos;re looking for
            </Text>
          </Box>
        </Box>
      ) : (
        <>
          <Heading size="lg" mb={2} css={{ color: "hsl(222.2, 47.4%, 11.2%)" }}>
            Search results for &ldquo;{query}&rdquo;
            {category !== "all" && (
              <Text as="span" fontSize="md" fontWeight="normal" ml={2} css={{ color: "hsl(215.4, 16.3%, 46.9%)" }}>
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
              <Box
                w="48px"
                h="48px"
                borderRadius="full"
                border="3px solid hsl(210, 30%, 88%)"
                borderTopColor="hsl(211, 71%, 43%)"
                animation="spin 0.8s linear infinite"
                css={{
                  "@keyframes spin": {
                    "0%": { transform: "rotate(0deg)" },
                    "100%": { transform: "rotate(360deg)" },
                  },
                }}
              />
            </Flex>
          ) : (
            <Tabs.Root
              defaultValue={activeTab}
              onValueChange={(value) => setActiveTab(value.value)}
            >
              <Tabs.List
                className="glass-card-static"
                borderRadius="12px"
                p={1}
                gap={1}
                width="100%"
                mb={6}
                css={{
                  background: "rgba(255,255,255,0.7)",
                  backdropFilter: "blur(12px)",
                }}
              >
                {["creators", "posts"].map((value) => (
                  <Tabs.Trigger
                    key={value}
                    value={value}
                    borderRadius="10px"
                    px={5}
                    py={2}
                    fontSize="sm"
                    fontWeight={500}
                    textTransform="capitalize"
                    css={{
                      color: "hsl(215.4, 16.3%, 46.9%)",
                      transition: "all 0.15s ease",
                      "&[data-state=active]": {
                        background: "var(--gradient-primary)",
                        color: "white",
                        fontWeight: 600,
                        boxShadow: "0 2px 8px hsl(211, 71%, 43% / 0.3)",
                      },
                      "&:hover:not([data-state=active])": {
                        color: "hsl(222.2, 47.4%, 11.2%)",
                        background: "rgba(255,255,255,0.6)",
                      },
                    }}
                  >
                    {value} ({value === "creators" ? searchResults?.creators?.length || 0 : searchResults?.posts?.length || 0})
                  </Tabs.Trigger>
                ))}
              </Tabs.List>

              <Tabs.Content value="creators">
                {searchResults?.creators && searchResults.creators.length > 0 ? (
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
                          className="glass-card"
                          p={4}
                          borderRadius="16px"
                          _hover={{
                            transform: "translateY(-4px)",
                            boxShadow: "0 12px 32px hsl(211, 71%, 43% / 0.15)",
                          }}
                          transition="all 0.2s ease"
                          height="100%"
                        >
                          <Flex align="center" gap={4}>
                            <Box
                              position="relative"
                              width="60px"
                              height="60px"
                              borderRadius="full"
                              overflow="hidden"
                              flexShrink={0}
                            >
                              <Image
                                src={
                                  creator.profilePicture ||
                                  "/icons/default-avatar.svg"
                                }
                                alt={creator.displayName}
                                fill
                                style={{ objectFit: "cover" }}
                              />
                            </Box>
                            <Box>
                              <Text
                                fontWeight={700}
                                fontSize="lg"
                                css={{ color: "hsl(222.2, 47.4%, 11.2%)" }}
                              >
                                {creator.displayName}
                              </Text>
                              <Text css={{ color: "hsl(215.4, 16.3%, 46.9%)", fontSize: "14px" }}>
                                Creating {creator.creatorHeadline}
                              </Text>
                              {creator.creatorCategory && (
                                <Box
                                  display="inline-block"
                                  mt={1}
                                  px={3}
                                  py={1}
                                  borderRadius="full"
                                  fontSize="11px"
                                  fontWeight={600}
                                  css={{
                                    background: "linear-gradient(135deg, hsl(211, 71%, 43%), hsl(335, 27%, 64%))",
                                    color: "white",
                                  }}
                                >
                                  {getCategoryDisplayName(creator.creatorCategory)}
                                </Box>
                              )}
                            </Box>
                          </Flex>
                        </Box>
                      </Link>
                    ))}
                  </Grid>
                ) : (
                  <Box className="glass-card" p={8} borderRadius="16px" textAlign="center">
                    <Text css={{ color: "hsl(215.4, 16.3%, 46.9%)" }}>
                      No creators found matching your search criteria
                    </Text>
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
                          className="glass-card"
                          p={4}
                          borderRadius="16px"
                          _hover={{
                            transform: "translateY(-4px)",
                            boxShadow: "0 12px 32px hsl(211, 71%, 43% / 0.15)",
                          }}
                          transition="all 0.2s ease"
                          height="100%"
                        >
                          {post.coverImage && (
                            <Box
                              height="160px"
                              mb={4}
                              borderRadius="12px"
                              overflow="hidden"
                              position="relative"
                            >
                              <Image
                                src={post.coverImage}
                                alt={post.title}
                                fill
                                style={{ objectFit: "cover" }}
                              />
                            </Box>
                          )}
                          <Heading
                            size="md"
                            mb={2}
                            css={{ color: "hsl(222.2, 47.4%, 11.2%)" }}
                          >
                            {post.title}
                          </Heading>
                          <Text css={{ color: "hsl(215.4, 16.3%, 46.9%)", fontSize: "14px", mb: "12px" }}>
                            {truncateText(post.content)}
                          </Text>
                          <Flex justify="space-between" align="center">
                            <Flex align="center" gap={2}>
                              <Box
                                position="relative"
                                width="30px"
                                height="30px"
                                borderRadius="full"
                                overflow="hidden"
                              >
                                <Image
                                  src={
                                    post.creator.profilePicture ||
                                    "/icons/default-avatar.svg"
                                  }
                                  alt={post.creator.displayName}
                                  fill
                                  style={{ objectFit: "cover" }}
                                />
                              </Box>
                              <Text
                                fontSize="sm"
                                fontWeight={600}
                                css={{ color: "hsl(222.2, 47.4%, 11.2%)" }}
                              >
                                {post.creator.displayName}
                              </Text>
                            </Flex>
                            {post.categories && post.categories.length > 0 && (
                              <Box
                                display="inline-block"
                                px={2}
                                py={1}
                                borderRadius="full"
                                fontSize="11px"
                                fontWeight={500}
                                css={{
                                  background: "hsl(210, 20%, 94%)",
                                  color: "hsl(215.4, 16.3%, 46.9%)",
                                }}
                              >
                                {post.categories[0]}
                              </Box>
                            )}
                          </Flex>
                        </Box>
                      </Link>
                    ))}
                  </Grid>
                ) : (
                  <Box className="glass-card" p={8} borderRadius="16px" textAlign="center">
                    <Text css={{ color: "hsl(215.4, 16.3%, 46.9%)" }}>
                      No posts found matching your search criteria
                    </Text>
                  </Box>
                )}
              </Tabs.Content>
            </Tabs.Root>
          )}
        </>
      )}
    </Box>
  );
}
