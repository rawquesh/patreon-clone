"use client";

import React, { useState } from "react";
import ExploreSearchBar from "./search-bar";
import { Box, Stack } from "@chakra-ui/react";
import CategoriesFilter from "@/components/search/categories-filter";
import TopCreators from "./top-creators";
import PopularThisWeek from "./popular-this-week";
import RecentlyVisited from "./recently-visited";
import TopCreatorsByCategories from "./top-creators-by-categories";

const ExplorePage: React.FC = () => {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  return (
    <Box className="animate-fade-in-up" py="40px" px={{ base: "16px", md: "48px" }}>
      <Stack gap={10}>
        <ExploreSearchBar />
        <CategoriesFilter
          selectedCategories={selectedCategories}
          onCategoriesChange={setSelectedCategories}
        />
        <RecentlyVisited />
        <TopCreators />
        <PopularThisWeek />
        <TopCreatorsByCategories selectedCategories={selectedCategories} />
      </Stack>
    </Box>
  );
};

export default ExplorePage;
