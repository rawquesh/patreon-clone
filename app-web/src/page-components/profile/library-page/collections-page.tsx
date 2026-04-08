import { Box } from "@chakra-ui/react";
import React from "react";
import CollectionsTable from "./collections-table";
import { PostsFilterProvider } from "@/context/posts.provider";

const CollectionsPage: React.FC = () => {
	return (
		<PostsFilterProvider>
			<Box p={4}>
				<CollectionsTable />
			</Box>
		</PostsFilterProvider>
	);
};

export default CollectionsPage;
