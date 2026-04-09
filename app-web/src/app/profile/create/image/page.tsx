import { Box } from "@chakra-ui/react";
import CreateImagePost from "@/page-components/profile/create/image-post";
import React from "react";

const CreateImage: React.FC = () => {
	return (
		<Box className="animate-fade-in-up" pb="100px">
			<CreateImagePost />
		</Box>
	);
};

export default CreateImage;
