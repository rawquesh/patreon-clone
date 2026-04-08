import { Box, Heading } from "@chakra-ui/react";
import React from "react";
import LibraryPageTabs from "./library-page-tabs";
import DraftsPage from "./drafts-page";
import PostsPage from "./posts-page";
import CollectionsPage from "./collections-page";

const LibraryPage: React.FC<{ page: "drafts" | "posts" | "collections" }> = ({
  page,
}) => {
  return (
    <Box pt={"56px"} maxW={"1024px"} w={"90vw"} mx={"auto"}>
      <Heading fontSize={"xl"} fontWeight={600}>
        Library
      </Heading>
      <LibraryPageTabs currentTab={page} />
      {page === "drafts" ? (
        <DraftsPage />
      ) : page === "posts" ? (
        <PostsPage />
      ) : (
        <CollectionsPage />
      )}
    </Box>
  );
};

export default LibraryPage;
