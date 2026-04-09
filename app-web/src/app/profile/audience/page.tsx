import { Box } from "@chakra-ui/react";
import AudiencePage from "@/page-components/profile/audience-page";
import React from "react";

const Audience: React.FC = () => {
	return (
		<Box className="animate-fade-in-up">
			<AudiencePage />
		</Box>
	);
};

export default Audience;
