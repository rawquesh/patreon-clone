"use client";

import CategoriesFilterMarketing from "./categories-filter-marketing";
import {
  useTopCreators,
  useTopCreatorsByCategory,
} from "@/lib/backend-services/home-service";
import { Box, Grid, Skeleton } from "@chakra-ui/react";
import { useState } from "react";
import CreatorCardMarketing from "./creator-card-marketing";

export const MarketingComponents = () => {
  const [selectedCategories, setSelectedCategories] = useState<string>("all");

  const queryFunction =
    selectedCategories === "all" ? useTopCreators : useTopCreatorsByCategory;
  const {
    data: categoryCreators,
    isLoading,
    // error,
  } = queryFunction(selectedCategories);

  return (
    <Box maxW={"1200px"} mt={6} mx={"auto"}>
      <CategoriesFilterMarketing
        selectedCategories={selectedCategories}
        onCategoriesChange={setSelectedCategories}
      />
      <Grid
        mt={16}
        rowGap={12}
        columnGap={6}
        gridTemplateColumns={{
          base: "1fr",
          md: "1fr 1fr",
          lg: "1fr 1fr 1fr",
          // xl: "1fr 1fr 1fr 1fr",
        }}
      >
        {isLoading &&
          new Array(12)
            .fill(0)
            .map((_, i) => (
              <Skeleton
                alignSelf={"stretch"}
                justifySelf={"center"}
                key={i}
                height={"420px"}
                width={"357px"}
              />
            ))}
        {!isLoading &&
          (categoryCreators || []).map((creator) => (
            <>
              <CreatorCardMarketing
                key={creator._id}
                description={
                  creator.creatorHeadline || "No description available"
                }
                href={`/creator/${creator.creatorUsername}`}
                image={creator.profilePicture || "/default-image.jpg"}
                name={creator.displayName}
                category={creator.creatorCategory!}
                username={creator.creatorUsername}
              />
            </>
          ))}
      </Grid>
    </Box>
  );
};
