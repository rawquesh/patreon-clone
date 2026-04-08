import { Avatar } from "@/components/ui/avatar";
import { Image as ChakraImage, Stack } from "@chakra-ui/react";
import Image from "next/image";
import React from "react";

interface Props {
	coverImage: string;
	profilePicture: string;
	username: string;
}

const ProfilePreview: React.FC<Props> = ({
	coverImage,
	profilePicture,
	username,
}) => {
	return (
		<Stack
			rounded={"8px"}
			overflow={"hidden"}
			justifyContent={"space-between"}
			w={"100%"}
			p={"16px"}
			position={"relative"}
			h={"205px"}
		>
			<ChakraImage
				pos={"relative"}
				zIndex={99}
				w={"32px"}
				src="/icons/logo.svg"
			/>
			<Image
				src={coverImage}
				alt={"cover"}
				layout={"fill"}
				objectFit={"cover"}
			/>
			<Avatar
				h={"56px"}
				w={"56px"}
				shape={"rounded"}
				name={username}
				src={profilePicture}
			/>
		</Stack>
	);
};

export default ProfilePreview;
