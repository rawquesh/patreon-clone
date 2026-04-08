import React from "react";
import TableControlBar from "./table-control-bar";
import { Box } from "@chakra-ui/react";
import { PostsFilterProvider } from "@/context/posts.provider";
import LibraryPageTable from "./library-page-table";

const DraftsPage: React.FC = () => {
  return (
    // <PostsFilterProvider>
    // 	<TableControlBar />
    // 	<Separator />

    // 	<Box
    // 		w={{ base: "90%", lg: "984px" }}
    // 		borderRadius={"6px"}
    // 		mx={"auto"}
    // 		p={"24px"}
    // 	>
    // 		<Stack textAlign={"center"} mt={6} alignItems={"center"}>
    // 			<Box w={"fit"} bg={"star.100"} p={4} borderRadius={"999px"}>
    // 				<Icon height={"36px"} icon={"solar:playlist-bold"} />
    // 			</Box>
    // 			<Text fontSize={"sm"} fontWeight={600}>
    // 				No Drafts
    // 			</Text>
    // 		</Stack>
    // 	</Box>
    // </PostsFilterProvider>
    <PostsFilterProvider myPosts={false} isDrafts={true}>
      <Box p={4}>
        <TableControlBar />
        <LibraryPageTable isCreatorView={false} />
      </Box>
    </PostsFilterProvider>
  );
};

export default DraftsPage;
