import React from "react";
import { Container, Stack } from "@chakra-ui/react";
import RecentlyVisited from "./recently-visited";
import TopCreators from "./top-creators";
import PopularThisWeek from "./popular-this-week";
import TopCreatorsCategory from "./top-creators-category";

const HomePage: React.FC = () => {
  return (
    <Container maxW="container.xl" py={8}>
      <Stack gap={8}>
        <RecentlyVisited />
        <TopCreators />
        <PopularThisWeek />
        <TopCreatorsCategory />
      </Stack>
    </Container>
  );
};

export default HomePage;
