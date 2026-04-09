import { Box } from "@chakra-ui/react";
import CreateTextPostPage from "@/page-components/profile/create/text-post";
import React from "react";

const CreateTextPost: React.FC = () => {
	return (
		<Box className="animate-fade-in-up" pb="100px">
			<CreateTextPostPage />
		</Box>
	);
};

export default CreateTextPost;
