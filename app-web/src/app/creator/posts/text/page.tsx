import { Box } from "@chakra-ui/react";
import TextPostPageComponent from "@/page-components/creator/text-post-page";
import React from "react";

const TextPostPage: React.FC = () => {
	return (
		<Box className="animate-fade-in-up">
			<TextPostPageComponent />
		</Box>
	);
};

export default TextPostPage;
