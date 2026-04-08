import { Button } from "@/components/ui/button";
import { Flex, Text } from "@chakra-ui/react";
import { Icon } from "@iconify/react";
import React from "react";

interface Props {
	icon: string;
	title: string;
}

const ConnectListItem: React.FC<Props> = ({ icon, title }) => {
	return (
		<Flex alignItems={"center"} mt={"10px"}>
			<Icon width={24} height={24} icon={icon} />
			<Text ml={4}>{title}</Text>
			<Button size={"xs"} variant={"outline"} ml={"auto"}>
				Connect
			</Button>
		</Flex>
	);
};

export default ConnectListItem;
