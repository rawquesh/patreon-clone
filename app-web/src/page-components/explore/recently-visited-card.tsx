import { Flex, Text, Image } from "@chakra-ui/react";
import Link from "next/link";
import React from "react";
import RecentlyVisitedPopover from "./recently-visited-popover";

interface Props {
	image: string;
	name: string;
	href: string;
}

const RecentlyVisitedCard: React.FC<Props> = ({ href, image, name }) => {
	return (
		<Link href={href}>
			<Flex
				bg={"star.100"}
				borderRadius={"8px"}
				alignItems={"center"}
				padding={"8px"}
				// w={"326px"}
				gap={3}
				_hover={{
					bg: "star.200",
					"& .recently-visited-popover": {
						visibility: "visible",
					},
				}}
				css={{
					"& .recently-visited-popover": {
						visibility: "hidden",
					},
				}}
			>
				<Image
					width={"48px"}
					rounded={"8px"}
					height={"48px"}
					src={image}
					alt={name}
				/>
				<Text fontWeight={500}>{name}</Text>
				<RecentlyVisitedPopover />
			</Flex>
		</Link>
	);
};

export default RecentlyVisitedCard;
