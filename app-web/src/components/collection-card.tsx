import { Box, Image, Stack, Text } from "@chakra-ui/react";
import Link from "next/link";
import React from "react";

interface CollectionCardProps {
	id: string;
	title: string;
	description?: string;
	imageUrl?: string;
	postCount: number;
}

const CollectionCard: React.FC<CollectionCardProps> = ({
	id,
	title,
	description,
	imageUrl,
	postCount,
}) => {
	return (
		<Link href={`/profile/collections/${id}`}>
			<Box
				borderRadius="12px"
				overflow="hidden"
				className="glass-card"
				transition="transform 0.2s"
				_hover={{ transform: "translateY(-4px)" }}
			>
				<Box position="relative" height="200px" width="100%">
					<Image
						src={imageUrl || "/images/collection-placeholder.jpg"}
						alt={title}
						objectFit="cover"
						width="100%"
						height="100%"
					/>
				</Box>
				<Stack p="16px">
					<Text fontWeight="600" fontSize="lg" lineClamp={1}>
						{title}
					</Text>
					{description && (
						<Text fontSize="sm" color="star.600" lineClamp={2}>
							{description}
						</Text>
					)}
					<Text fontSize="xs" color="star.500" mt="2">
						{postCount} {postCount === 1 ? "post" : "posts"}
					</Text>
				</Stack>
			</Box>
		</Link>
	);
};

export default CollectionCard;
