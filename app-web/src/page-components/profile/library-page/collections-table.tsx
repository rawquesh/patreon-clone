"use client";

import { Badge, Box, Flex, Stack, Table, Text } from "@chakra-ui/react";
import React from "react";
import { Icon } from "@iconify/react/dist/iconify.js";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import CollectionActionsMenu from "./CollectionActionsMenu";
import ButtonWithIcon from "@/components/ui/button-with-icon";

interface Collection {
	_id: string;
	title: string;
	description: string;
	coverImageUrl: string;
	postCount: number;
	createdAt: string;
}

const CollectionsTable: React.FC = () => {
	const {
		data: collections,
		isLoading,
		error,
	} = useQuery({
		queryKey: ["collections"],
		queryFn: async () => {
			const { data } = await api.get<{ collections: Collection[] }>(
				"/collections"
			);
			return data.collections || [];
		},
	});

	if (isLoading) {
		return (
			<Text textAlign="center" py={8}>
				Loading collections...
			</Text>
		);
	}

	if (error) {
		return (
			<Text textAlign="center" color="red.500" py={8}>
				Error loading collections
			</Text>
		);
	}

	const formatDate = (dateString: string) => {
		const date = new Date(dateString);
		return date.toLocaleDateString();
	};

	if (!collections || collections.length === 0) {
		return (
			<Box w="100%" borderRadius="6px" p="24px">
				<Stack textAlign="center" mt={6} alignItems="center">
					<Box w="fit" bg="star.100" p={4} borderRadius="999px">
						<Icon height="36px" icon="solar:playlist-bold" />
					</Box>
					<Text fontSize="sm" fontWeight={600}>
						No collections yet
					</Text>
					<Text maxW="400px" fontSize="sm">
						Collections is an improved way to organize your posts and it helps
						your members explore all your great work.
					</Text>
					<ButtonWithIcon
						mt={4}
						icon="ic:round-plus"
						borderRadius="28px"
						bgColor="star.100"
						color="star.800"
						_hover={{ bgColor: "star.200" }}
						onClick={() => {
							window.location.href = "/profile?tab=collection";
						}}
					>
						Create Collection
					</ButtonWithIcon>
				</Stack>
			</Box>
		);
	}

	return (
		<Box w="100%" overflowX="auto">
			<Flex justify="space-between" align="center" mb={4}>
				<Text fontSize="xl" fontWeight={600}>
					Your Collections
				</Text>
				<ButtonWithIcon
					icon="ic:round-plus"
					onClick={() => {
						window.location.href = "/profile?tab=collection";
					}}
				>
					Create Collection
				</ButtonWithIcon>
			</Flex>

			<Table.Root borderRadius="lg" overflow="hidden" boxShadow="md">
				<Table.Header>
					<Table.Row bg="white">
						<Table.ColumnHeader w="40%">Collection</Table.ColumnHeader>
						<Table.ColumnHeader>Created</Table.ColumnHeader>
						<Table.ColumnHeader>Posts</Table.ColumnHeader>
						<Table.ColumnHeader>Status</Table.ColumnHeader>
						<Table.ColumnHeader></Table.ColumnHeader>
					</Table.Row>
				</Table.Header>
				<Table.Body>
					{collections.map((collection) => (
						<Table.Row key={collection._id} bg="white">
							<Table.Cell>
								<Stack>
									<Text fontSize="sm" fontWeight={600}>
										{collection.title}
									</Text>
									{collection.description && (
										<Text fontSize="xs" color="star.600" lineClamp={2}>
											{collection.description}
										</Text>
									)}
								</Stack>
							</Table.Cell>
							<Table.Cell>
								<Text fontSize="xs">{formatDate(collection.createdAt)}</Text>
							</Table.Cell>
							<Table.Cell>
								<Text fontSize="sm">{collection.postCount}</Text>
							</Table.Cell>
							<Table.Cell>
								<Badge colorPalette="green">
									{collection.postCount > 0 ? "Published" : "Empty"}
								</Badge>
							</Table.Cell>
							<Table.Cell>
								<CollectionActionsMenu collection={collection} />
							</Table.Cell>
						</Table.Row>
					))}
				</Table.Body>
			</Table.Root>
		</Box>
	);
};

export default CollectionsTable;
