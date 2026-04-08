"use client";

import React from "react";
import TableControlBar from "./table-control-bar";
import LibraryPageTable from "./library-page-table";
import { Box } from "@chakra-ui/react";
import { PostsFilterProvider } from "@/context/posts.provider";

interface CreatorPostsPageProps {
  creatorId: string;
}

const CreatorPostsPage: React.FC<CreatorPostsPageProps> = ({ creatorId }) => {
  return (
    <PostsFilterProvider creatorId={creatorId}>
      <Box p={4}>
        <TableControlBar />
        <LibraryPageTable isCreatorView={true} />
      </Box>
    </PostsFilterProvider>
  );
};

export default CreatorPostsPage;
