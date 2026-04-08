"use client";
import { Avatar } from "@/components/ui/avatar";
import { Box, Flex } from "@chakra-ui/react";
import React from "react";

interface Props {
	profilePicture: string;
	username: string;
}

const ProfilePicture: React.FC<Props> = ({ profilePicture, username }) => {
	return (
		<Flex
			transform={"translateY(-50%)"}
			position={"absolute"}
			justifyContent={"center"}
			// left={"50%"}
			w={"100%"}
		>
			<Box position={"relative"}>
				<Avatar
					h={"120px"}
					w={"120px"}
					shape={"rounded"}
					name={username}
					src={profilePicture}
				/>
			</Box>
		</Flex>
	);
};

export default ProfilePicture;
