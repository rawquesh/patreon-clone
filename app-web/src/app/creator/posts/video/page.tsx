import { Box } from "@chakra-ui/react";
import VideoPostPageComponent from "@/page-components/creator/video-post-page";
import React from "react";

const VideoPostPage: React.FC = () => {
	return (
		<Box className="animate-fade-in-up">
			<VideoPostPageComponent />
		</Box>
	);
};

export default VideoPostPage;
