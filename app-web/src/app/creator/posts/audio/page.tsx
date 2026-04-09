import { Box } from "@chakra-ui/react";
import AudioPostPageComponent from "@/page-components/creator/audio-post-page";
import React from "react";

const AudioPostPage: React.FC = () => {
	return (
		<Box className="animate-fade-in-up">
			<AudioPostPageComponent />
		</Box>
	);
};

export default AudioPostPage;
