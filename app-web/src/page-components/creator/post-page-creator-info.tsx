import { Avatar } from "@/components/ui/avatar";
import { Box, Flex, Stack, Text } from "@chakra-ui/react";
import React from "react";

interface Props {
	avatarUrl: string;
	username: string;
	description: string;
	membership: string;
}

const PostPageCreatorInfo: React.FC<Props> = (props) => {
	return (
		<div>
			<Mobile {...props} />
			<Desktop {...props} />
		</div>
	);
};

const Mobile: React.FC<Props> = ({ avatarUrl, username }) => {
	return (
		<Flex gap={4} display={{ base: "flex", lg: "none" }} alignItems={"center"}>
			<Avatar w={"40px"} h={"40px"} shape={"rounded"} src={avatarUrl} />
			<Text fontWeight={600} fontSize={"2xl"}>
				{username}
			</Text>
		</Flex>
	);
};

const Desktop: React.FC<Props> = ({
	avatarUrl,
	description,
	membership,
	username,
}) => {
	return (
		<Box
			borderRadius={"12px"}
			p={"16px"}
			display={{ base: "none", lg: "block" }}
			bg={"white"}
			w={"350px"}
		>
			{/* <Stack></Stack> */}
			<Stack alignItems={"center"} gap={0} textAlign={"center"}>
				<Avatar w={"120px"} h={"120px"} shape={"rounded"} src={avatarUrl} />
				<Text mt={2} fontWeight={600}>
					{username}
				</Text>
				<Text fontSize={"sm"}>{description}</Text>
				<Text color={"star.600"} fontSize={"sm"}>
					{membership}
				</Text>
			</Stack>
		</Box>
	);
};

export default PostPageCreatorInfo;
