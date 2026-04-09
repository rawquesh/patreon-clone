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
					bg: "primary.50",
					transform: "translateY(-2px)",
					boxShadow: "0 8px 24px rgba(29, 112, 191, 0.12)",
					"& .creator-card-popover": {
						opacity: 1,
					},
					"& .card-image-wrap": {
						boxShadow: "0 4px 16px rgba(29, 112, 191, 0.15)",
					},
				}}
				pt={2}
				px={2}
				pb={5}
				gap={0}
				rounded="12px"
				css={{
					transition: "all 0.2s ease",
					background: "transparent",
				}}
			>
				<Box
					position="relative"
					height={0}
					paddingBottom="100%"
					borderRadius="12px"
					overflow="hidden"
					className="card-image-wrap"
					css={{
						transition: "box-shadow 0.2s ease",
						boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
						"& img": {
							zIndex: 10,
						},
						"& .shadow": {
							opacity: 0,
						},
						"&::before": {
							content: '""',
							position: "absolute",
							top: 0,
							left: 0,
							right: 0,
							height: "2px",
							background: "var(--gradient-primary)",
							opacity: 0,
							transition: "opacity 0.2s ease",
							zIndex: 11,
						},
					}}
					_hover={{
						"& .shadow": {
							opacity: 1,
						},
						"&::before": {
							opacity: 1,
						},
					}}
				>
					<Box
						className="shadow"
						position="absolute"
						top={0}
						left={0}
						right={0}
						bottom={0}
						zIndex={1000}
						boxShadow="inset 0 0 60px 25px rgba(0, 0, 0, 0.4)"
					/>
					<Image layout="fill" src={image} alt={name} />
					<CreatorCardPopover />
				</Box>
				<Text fontWeight={600} mt={2} css={{ color: "hsl(222.2, 47.4%, 11.2%)" }}>
					{name}
				</Text>
				<Text fontSize="sm" css={{ color: "hsl(215.4, 16.3%, 46.9%)" }}>
					{description}
				</Text>
			</Stack>
		</Link>
	);
};

export default CreatorCard;
