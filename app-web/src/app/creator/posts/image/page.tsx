import { Box } from "@chakra-ui/react";
import ImagePostPageComponent from "@/page-components/creator/image-post-page";
import React from "react";

const ImagePostPage: React.FC = () => {
	return (
		<Box className="animate-fade-in-up">
			<ImagePostPageComponent />
		</Box>
	);
};

export default ImagePostPage;
