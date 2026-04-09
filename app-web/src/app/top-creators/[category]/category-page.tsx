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
  // Find the category object from the hardcoded list using the ID
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

  // Use the hook to fetch creators, enable only if categoryName is valid
  const { data: creators, isLoading, isError } = queryFn(categoryName || "");

  // Handle invalid category ID before loading/error states
  if (!categoryObject) {
    return (
      <Box maxW="1200px" mx="auto" py={8} px={{ base: 4, md: 6 }}>
        <Heading as="h1" mb={6}>
          Category Not Found
        </Heading>
        <Text>The category ID {categoryId} is not valid.</Text>
      </Box>
    );
  }

  // Handle Loading state
  if (isLoading) {
    return (
      <Box mx="auto" py={20} textAlign="center">
        <Spinner size="xl" />
        <Text mt={4}>Loading creators...</Text>
      </Box>
    );
  }

  // Handle Error state - Simplified
  if (isError) {
    return (
      <Box maxW="1200px" mx="auto" py={8} px={{ base: 4, md: 6 }}>
        <Text color="red.500">
          Error: Could not load creators for this category.
        </Text>
      </Box>
    );
  }

  return (
    <Box maxW="1200px" mx="auto" py={8} px={{ base: 4, md: 6 }}>
      <Heading as="h1" mb={6}>
        Top Creators in {categoryName}
      </Heading>
      {!creators || creators.length === 0 ? (
        <Text>No creators found in this category yet.</Text>
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
