"use client";

import React from "react";
import TableControlBar from "./table-control-bar";
import LibraryPageTable from "./library-page-table";
import { Box } from "@chakra-ui/react";
import { PostsFilterProvider } from "@/context/posts.provider";

const PostsPage: React.FC = () => {
  return (
    <PostsFilterProvider myPosts={false}>
      <Box p={4}>
        <TableControlBar />
        <LibraryPageTable isCreatorView={false} />
      </Box>
    </PostsFilterProvider>
  );
};

export default PostsPage;
