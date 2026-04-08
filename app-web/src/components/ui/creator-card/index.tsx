import { Box, Stack, Text } from "@chakra-ui/react";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import CreatorCardPopover from "./creator-card-popover";

interface Props {
	image: string;
	name: string;
	description: string;
	href: string;
}

const CreatorCard: React.FC<Props> = ({ description, href, image, name }) => {
	return (
		<Link href={href}>
			<Stack
				_hover={{
					bg: "star.100",
					"& .creator-card-popover": {
						opacity: 1,
					},
				}}
				pt={2}
				px={2}
				pb={5}
				gap={0}
				rounded={"8px"}
				css={{
					"& .creator-card-popover": {
						opacity: 0,
					},
				}}
			>
				<Box
					position={"relative"}
					height={0}
					paddingBottom={"100%"}
					// width={"233px"}
					borderRadius={"8px"}
					overflow={"hidden"}
					css={{
						"& img": {
							zIndex: 10,
						},
						"& .shadow": {
							opacity: 0,
						},
					}}
					_hover={{
						"& .shadow": {
							opacity: 1,
						},
					}}
				>
					<Box
						className="shadow"
						position={"absolute"}
						top={0}
						left={0}
						right={0}
						bottom={0}
						zIndex={1000}
						boxShadow="inset 0 0 60px 25px rgba(0, 0, 0, 0.5)"
					></Box>
					<Image layout="fill" src={image} alt={name} />
					<CreatorCardPopover />
				</Box>
				<Text fontWeight={600}>{name}</Text>
				<Text fontSize={"sm"} color={"star.600"}>
					{description}
				</Text>
			</Stack>
		</Link>
	);
};

export default CreatorCard;

// box-shadow: inset 0 0 0 1px gba(0, 0, 0, .09)
