"use client";

import {
	Badge,
	Box,
	Flex,
	IconButton,
	Stack,
	Table,
	Text,
} from "@chakra-ui/react";
import React, { useState } from "react";
import { Tag } from "@/components/ui/tag";
import { Icon } from "@iconify/react/dist/iconify.js";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchGifts } from "@/lib/backend-services/promotions-service";
import { format } from "date-fns";
import { DiscountStatus, IGift } from "@/typings/IDiscount";
import GiftModal from "./gift-modal";
import GiftTableMenuPopover from "./gift-table-menu-popover";
import { toaster } from "@/components/ui/toaster";

const GiftsTable: React.FC = () => {
	const queryClient = useQueryClient();
	const [copyingCode, setCopyingCode] = useState<string | null>(null);

	const { data, isLoading, error } = useQuery({
		queryKey: ["gifts"],
		queryFn: fetchGifts,
	});

	const handleCopyCode = (code: string) => {
		navigator.clipboard
			.writeText(code)
			.then(() => {
				setCopyingCode(code);
				toaster.create({
					title: "Code copied to clipboard",
					type: "success",
					duration: 2000,
				});
				setTimeout(() => setCopyingCode(null), 2000);
			})
			.catch((err) => {
				console.error("Failed to copy code:", err);
				toaster.create({
					title: "Failed to copy code",
					type: "error",
					duration: 2000,
				});
			});
	};

	const onGiftChange = () => {
		queryClient.invalidateQueries({ queryKey: ["gifts"] });
	};

	if (isLoading) {
		return (
			<Box py={10} textAlign="center">
				<Text>Loading gifts...</Text>
			</Box>
		);
	}

	if (error) {
		return (
			<Box py={10} textAlign="center">
				<Text color="red.500">Error loading gifts.</Text>
				<Text>Please try again later.</Text>
			</Box>
		);
	}

	const gifts = data || [];

	const formatDate = (dateString: string) => {
		try {
			return format(new Date(dateString), "MMM d, yyyy");
		} catch (e) {
			console.log(e);
			return "Invalid date";
		}
	};

	const rows = gifts.map((item: IGift) => (
		<Table.Row bg={"white"} key={item.id}>
			<Table.Cell>
				<Stack>
					<Flex gap={2}>
						<Text fontSize={"xs"} fontWeight={600}>
							{item.title}
						</Text>
						<Tag size={"sm"} startElement={<Icon icon={"mdi:gift"} />}>
							{item.code}
						</Tag>
					</Flex>
					<Flex color={"star.600"} fontSize={"xs"} gap={2}>
						<Text>
							{item.description || `${item.durationDays} days free trial`}{" "}
							&#xb7;
						</Text>
						<Text textTransform={"capitalize"}>{item.applicableTo} tiers</Text>
					</Flex>
				</Stack>
			</Table.Cell>
			<Table.Cell>
				<Badge
					colorPalette={
						item.status === DiscountStatus.ACTIVE ? "green" : "gray"
					}
				>
					{item.status}
				</Badge>
			</Table.Cell>
			<Table.Cell>
				<Text fontSize={"xs"}>{formatDate(item.startDate)}</Text>
			</Table.Cell>
			<Table.Cell>
				<Text fontSize={"xs"}>{formatDate(item.endDate)}</Text>
			</Table.Cell>
			<Table.Cell>
				<Text fontSize={"xs"}>{item.redeemed}</Text>
			</Table.Cell>
			<Table.Cell>
				<Flex>
					<IconButton
						variant={"ghost"}
						onClick={() => handleCopyCode(item.code)}
						aria-label="Copy code"
					>
						<Icon
							icon={copyingCode === item.code ? "mdi:check" : "solar:copy-bold"}
						/>
					</IconButton>
					<GiftTableMenuPopover gift={item} onGiftChange={onGiftChange} />
				</Flex>
			</Table.Cell>
		</Table.Row>
	));

	return (
		<Box>
			<Table.Root
				borderRadius={"lg"}
				overflow={"hidden"}
				boxShadow={"md"}
				bg={"white"}
			>
				<Table.Header>
					<Table.Row bg={"white"}>
						<Table.ColumnHeader w={"40%"}>Name</Table.ColumnHeader>
						<Table.ColumnHeader>Status</Table.ColumnHeader>
						<Table.ColumnHeader>Begins</Table.ColumnHeader>
						<Table.ColumnHeader>Ends</Table.ColumnHeader>
						<Table.ColumnHeader>Redeemed</Table.ColumnHeader>
						<Table.ColumnHeader>
							<GiftModal mode="create" onSaveCallback={onGiftChange} />
						</Table.ColumnHeader>
					</Table.Row>
				</Table.Header>
				{gifts.length > 0 ? (
					<Table.Body>{rows}</Table.Body>
				) : (
					<Table.Body>
						<Table.Row>
							<Table.Cell colSpan={6}>
								<Stack
									alignItems={"center"}
									justifyContent={"center"}
									minH={"350px"}
									textAlign={"center"}
									gap={3}
								>
									<Box bg={"star.100"} p={3} rounded={"999px"}>
										<Icon width={"36px"} icon={"mdi:gift"} />
									</Box>
									<Text fontSize={"xl"} fontWeight={600}>
										No gifts yet
									</Text>
									<Text>When you add a gift, it&apos;ll show up here</Text>
									<GiftModal mode="create" onSaveCallback={onGiftChange} />
								</Stack>
							</Table.Cell>
						</Table.Row>
					</Table.Body>
				)}
			</Table.Root>
		</Box>
	);
};

export default GiftsTable;
