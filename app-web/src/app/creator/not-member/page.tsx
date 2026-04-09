import { Box } from "@chakra-ui/react";
import CreatorPage from "@/page-components/creator";
import React from "react";

const Creator: React.FC = () => {
	return (
		<Box className="animate-fade-in-up">
			<CreatorPage />
		</Box>
	);
};

export default Creator;
