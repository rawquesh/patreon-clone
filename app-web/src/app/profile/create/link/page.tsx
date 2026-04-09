import { Box } from "@chakra-ui/react";
import CreateLinkPost from "@/page-components/profile/create/link-post";
import React from "react";

const CreateLink: React.FC = () => {
	return (
		<Box className="animate-fade-in-up" pb="100px">
			<CreateLinkPost />
		</Box>
	);
};

export default CreateLink;
