import React from "react";
import { Box, Stack } from "@chakra-ui/react";
import RecentlyVisited from "./recently-visited";
import TopCreators from "./top-creators";
import PopularThisWeek from "./popular-this-week";
import TopCreatorsCategory from "./top-creators-category";

const HomePage: React.FC = () => {
  return (
    <Box maxW="1200px" mx="auto" py={8} px={{ base: 4, md: 6 }}>
      <Stack gap={8}>
        <RecentlyVisited />
        <TopCreators />
        <PopularThisWeek />
        <TopCreatorsCategory />
      </Stack>
    </Box>
  );
};

export default HomePage;
