import { Box } from "@chakra-ui/react";
import CreateVideoPost from "@/page-components/profile/create/video-post";
import React from "react";

const CreateVideoPage: React.FC = () => {
	return (
		<Box className="animate-fade-in-up" pb="100px">
			<CreateVideoPost />
		</Box>
	);
};

export default CreateVideoPage;
