"use client";

import React, { useState } from "react";
import ExploreSearchBar from "./search-bar";
import { Stack } from "@chakra-ui/react";
import CategoriesFilter from "@/components/search/categories-filter";
import TopCreators from "./top-creators";
import PopularThisWeek from "./popular-this-week";
import RecentlyVisited from "./recently-visited";
import TopCreatorsByCategories from "./top-creators-by-categories";

const ExplorePage: React.FC = () => {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  return (
    <Stack py={"47px"} gap={8} px={{ base: "10px", md: "51px" }}>
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
  );
};

export default ExplorePage;
