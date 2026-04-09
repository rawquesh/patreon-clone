import { Box } from "@chakra-ui/react";
import CreateAudioPost from "@/page-components/profile/create/audio-post";
import React from "react";

const CreateAudioPostPage: React.FC = () => {
	return (
		<Box className="animate-fade-in-up" pb="100px">
			<CreateAudioPost />
		</Box>
	);
};

export default CreateAudioPostPage;
