"use client";

import { HARDCODED_CATEGORIES } from "@/lib/constants";
import {
  useTopCreators,
  useTopCreatorsByCategory,
} from "@/lib/backend-services/home-service";
import CreatorCard from "@/components/ui/creator-card";
import { Box, Grid, Heading, Text, Spinner } from "@chakra-ui/react";
import React from "react";

type Props = {
  category: string;
};

const CategoryPage = ({ category: categoryId }: Props) => {
  const categoryObject = React.useMemo(
    () =>
      categoryId === "ALL"
        ? {
            name: "All",
            id: "ALL",
          }
        : HARDCODED_CATEGORIES.find((cat) => cat.id === categoryId),
    [categoryId]
  );

  const categoryName = categoryObject?.name;

  const queryFn =
    categoryId === "ALL" ? useTopCreators : useTopCreatorsByCategory;

  const { data: creators, isLoading, isError } = queryFn(categoryName || "");

  if (!categoryObject) {
    return (
      <Box maxW="1200px" mx="auto" py={8} px={{ base: 4, md: 6 }}>
        <Heading
          as="h1"
          mb={6}
          css={{
            background: "linear-gradient(135deg, hsl(211, 71%, 43%), hsl(335, 27%, 64%))",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          Category Not Found
        </Heading>
        <Text css={{ color: "hsl(215.4, 16.3%, 46.9%)" }}>
          The category ID {categoryId} is not valid.
        </Text>
      </Box>
    );
  }

  if (isLoading) {
    return (
      <Box mx="auto" py={20} textAlign="center" className="animate-fade-in-up">
        <Spinner
          size="xl"
          css={{
            color: "hsl(211, 71%, 43%)",
            borderWidth: "3px",
          }}
        />
        <Text mt={4} css={{ color: "hsl(215.4, 16.3%, 46.9%)" }}>
          Loading creators...
        </Text>
      </Box>
    );
  }

  if (isError) {
    return (
      <Box maxW="1200px" mx="auto" py={8} px={{ base: 4, md: 6 }}>
        <Text css={{ color: "hsl(0, 84.2%, 60.2%)" }}>
          Error: Could not load creators for this category.
        </Text>
      </Box>
    );
  }

  return (
    <Box
      maxW="1200px"
      mx="auto"
      py={8}
      px={{ base: 4, md: 6 }}
      className="animate-fade-in-up"
    >
      <Heading
        as="h1"
        mb={6}
        css={{
          background: "linear-gradient(135deg, hsl(211, 71%, 43%), hsl(335, 27%, 64%))",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
        }}
      >
        Top Creators in {categoryName}
      </Heading>
      {!creators || creators.length === 0 ? (
        <Text css={{ color: "hsl(215.4, 16.3%, 46.9%)" }}>
          No creators found in this category yet.
        </Text>
      ) : (
        <Grid
          templateColumns={{
            base: "repeat(1, 1fr)",
            sm: "repeat(2, 1fr)",
            md: "repeat(3, 1fr)",
            lg: "repeat(4, 1fr)",
            xl: "repeat(5, 1fr)",
          }}
          gap={6}
        >
          {creators.map((creator) => (
            <CreatorCard
              key={creator._id}
              href={`/creator/${creator.creatorUsername}`}
              image={creator.profilePicture || "/placeholder-avatar.png"}
              name={creator.displayName}
              description={creator.creatorHeadline}
            />
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default CategoryPage;
