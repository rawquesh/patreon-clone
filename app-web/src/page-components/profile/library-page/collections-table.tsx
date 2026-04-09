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
				<Box className="glass-card" p={6} borderRadius="12px">
					<Text css={{ color: "hsl(215.4, 16.3%, 46.9%)" }}>Loading collections...</Text>
				</Box>
			</Text>
		);
	}

	if (error) {
		return (
			<Text textAlign="center" py={8}>
				<Box className="glass-card" p={6} borderRadius="12px">
					<Text css={{ color: "hsl(0, 84.2%, 60.2%)" }}>Error loading collections</Text>
				</Box>
			</Text>
		);
	}

	const formatDate = (dateString: string) => {
		const date = new Date(dateString);
		return date.toLocaleDateString();
	};

	if (!collections || collections.length === 0) {
		return (
			<Box w="100%" className="glass-card" borderRadius="16px" p={8}>
				<Stack textAlign="center" mt={6} alignItems="center" gap={4}>
					<Box
						w="64px"
						h="64px"
						borderRadius="full"
						css={{
							background: "linear-gradient(135deg, hsl(211, 71%, 43% / 0.1), hsl(335, 27%, 64% / 0.08))",
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
						}}
					>
						<Icon height="32px" icon="solar:playlist-bold" css={{ color: "hsl(215.4, 16.3%, 46.9%)" }} />
					</Box>
					<Text
						fontSize="sm"
						fontWeight={600}
						css={{ color: "hsl(222.2, 47.4%, 11.2%)" }}
					>
						No collections yet
					</Text>
					<Text
						maxW="400px"
						fontSize="14px"
						css={{ color: "hsl(215.4, 16.3%, 46.9%)" }}
					>
						Collections is an improved way to organize your posts and it helps
						your members explore all your great work.
					</Text>
					<ButtonWithIcon
						mt={2}
						icon="ic:round-plus"
						className="btn-gradient"
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
		<Box w="100%">
			<Flex justify="space-between" align="center" mb={4}>
				<Text
					fontSize="lg"
					fontWeight={700}
					css={{ color: "hsl(222.2, 47.4%, 11.2%)" }}
				>
					Your Collections
				</Text>
				<ButtonWithIcon
					icon="ic:round-plus"
					className="btn-gradient"
					onClick={() => {
						window.location.href = "/profile?tab=collection";
					}}
				>
					Create Collection
				</ButtonWithIcon>
			</Flex>

			<Table.Root className="glass-card" borderRadius="16px" overflow="hidden">
				<Table.Header>
					<Table.Row bg="transparent">
						<Table.ColumnHeader w="40%" css={{ color: "hsl(215.4, 16.3%, 46.9%)", fontWeight: 600, fontSize: "12px" }}>Collection</Table.ColumnHeader>
						<Table.ColumnHeader css={{ color: "hsl(215.4, 16.3%, 46.9%)", fontWeight: 600, fontSize: "12px" }}>Created</Table.ColumnHeader>
						<Table.ColumnHeader css={{ color: "hsl(215.4, 16.3%, 46.9%)", fontWeight: 600, fontSize: "12px" }}>Posts</Table.ColumnHeader>
						<Table.ColumnHeader css={{ color: "hsl(215.4, 16.3%, 46.9%)", fontWeight: 600, fontSize: "12px" }}>Status</Table.ColumnHeader>
						<Table.ColumnHeader></Table.ColumnHeader>
					</Table.Row>
				</Table.Header>
				<Table.Body>
					{collections.map((collection) => (
						<Table.Row
							key={collection._id}
							className="glass-card"
							css={{
								"&:hover": {
									background: "hsl(210, 20%, 96%) !important",
								},
							}}
						>
							<Table.Cell>
								<Stack>
									<Text
										fontSize="14px"
										fontWeight={600}
										css={{ color: "hsl(222.2, 47.4%, 11.2%)" }}
									>
										{collection.title}
									</Text>
									{collection.description && (
										<Text
											fontSize="12px"
											lineClamp={2}
											css={{ color: "hsl(215.4, 16.3%, 46.9%)" }}
										>
											{collection.description}
										</Text>
									)}
								</Stack>
							</Table.Cell>
							<Table.Cell>
								<Text fontSize="12px" css={{ color: "hsl(215.4, 16.3%, 46.9%)" }}>
									{formatDate(collection.createdAt)}
								</Text>
							</Table.Cell>
							<Table.Cell>
								<Text fontSize="14px" css={{ color: "hsl(222.2, 47.4%, 11.2%)" }}>
									{collection.postCount}
								</Text>
							</Table.Cell>
							<Table.Cell>
								<Box
									display="inline-block"
									px={3}
									py={1}
									borderRadius="full"
									fontSize="11px"
									fontWeight={600}
									css={{
										background: collection.postCount > 0
											? "linear-gradient(135deg, hsl(142, 76%, 36%), hsl(142, 76%, 30%))"
											: "hsl(215.4, 16.3%, 90%)",
										color: collection.postCount > 0 ? "white" : "hsl(215.4, 16.3%, 46.9%)",
									}}
								>
									{collection.postCount > 0 ? "Published" : "Empty"}
								</Box>
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
