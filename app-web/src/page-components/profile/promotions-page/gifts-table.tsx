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
				<Box className="glass-card" p={6} borderRadius="12px">
					<Text css={{ color: "hsl(215.4, 16.3%, 46.9%)" }}>Loading gifts...</Text>
				</Box>
			</Box>
		);
	}

	if (error) {
		return (
			<Box py={10} textAlign="center">
				<Box className="glass-card" p={6} borderRadius="12px">
					<Text css={{ color: "hsl(0, 84.2%, 60.2%)" }}>Error loading gifts.</Text>
					<Text css={{ color: "hsl(215.4, 16.3%, 46.9%)", fontSize: "13px", mt: "4px" }}>Please try again later.</Text>
				</Box>
			</Box>
		);
	}

	const gifts = data || [];

	const formatDate = (dateString: string) => {
		try {
			return format(new Date(dateString), "MMM d, yyyy");
		} catch {
			return "Invalid date";
		}
	};

	const rows = gifts.map((item: IGift) => (
		<Table.Row
			bg={"white"}
			key={item.id}
			css={{
				"&:hover": {
					background: "hsl(210, 20%, 96%) !important",
				},
			}}
		>
			<Table.Cell>
				<Stack>
					<Flex gap={2} alignItems="center">
						<Text fontSize={"13px"} fontWeight={600} css={{ color: "hsl(222.2, 47.4%, 11.2%)" }}>
							{item.title}
						</Text>
						<Box
							px={2}
							py={0.5}
							borderRadius="full"
							fontSize="11px"
							fontWeight={600}
							css={{
								background: "var(--gradient-primary)",
								color: "white",
							}}
						>
							{item.code}
						</Box>
					</Flex>
					<Flex fontSize={"12px"} gap={2} css={{ color: "hsl(215.4, 16.3%, 46.9%)" }}>
						<Text>
							{item.description || `${item.durationDays} days free trial`}{" "}
							&middot;
						</Text>
						<Text textTransform={"capitalize"}>{item.applicableTo} tiers</Text>
					</Flex>
				</Stack>
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
						background: item.status === DiscountStatus.ACTIVE
							? "linear-gradient(135deg, hsl(142, 76%, 36%), hsl(142, 76%, 30%))"
							: "hsl(215.4, 16.3%, 90%)",
						color: item.status === DiscountStatus.ACTIVE ? "white" : "hsl(215.4, 16.3%, 46.9%)",
					}}
				>
					{item.status}
				</Box>
			</Table.Cell>
			<Table.Cell>
				<Text fontSize={"12px"} css={{ color: "hsl(215.4, 16.3%, 46.9%)" }}>{formatDate(item.startDate)}</Text>
			</Table.Cell>
			<Table.Cell>
				<Text fontSize={"12px"} css={{ color: "hsl(215.4, 16.3%, 46.9%)" }}>{formatDate(item.endDate)}</Text>
			</Table.Cell>
			<Table.Cell>
				<Text fontSize={"12px"} css={{ color: "hsl(215.4, 16.3%, 46.9%)" }}>{item.redeemed}</Text>
			</Table.Cell>
			<Table.Cell>
				<Flex>
					<IconButton
						variant={"ghost"}
						onClick={() => handleCopyCode(item.code)}
						aria-label="Copy code"
						css={{
							color: copyingCode === item.code ? "hsl(142, 76%, 36%)" : "hsl(215.4, 16.3%, 46.9%)",
							"&:hover": {
								background: "linear-gradient(135deg, hsl(211, 71%, 43% / 0.08), hsl(335, 27%, 64% / 0.06))",
								color: "hsl(211, 71%, 43%)",
							},
						}}
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
				className="glass-card"
				overflow={"hidden"}
				borderRadius="16px"
			>
				<Table.Header>
					<Table.Row bg={"transparent"}>
						<Table.ColumnHeader w={"40%"} css={{ color: "hsl(215.4, 16.3%, 46.9%)", fontWeight: 600, fontSize: "12px" }}>Name</Table.ColumnHeader>
						<Table.ColumnHeader css={{ color: "hsl(215.4, 16.3%, 46.9%)", fontWeight: 600, fontSize: "12px" }}>Status</Table.ColumnHeader>
						<Table.ColumnHeader css={{ color: "hsl(215.4, 16.3%, 46.9%)", fontWeight: 600, fontSize: "12px" }}>Begins</Table.ColumnHeader>
						<Table.ColumnHeader css={{ color: "hsl(215.4, 16.3%, 46.9%)", fontWeight: 600, fontSize: "12px" }}>Ends</Table.ColumnHeader>
						<Table.ColumnHeader css={{ color: "hsl(215.4, 16.3%, 46.9%)", fontWeight: 600, fontSize: "12px" }}>Redeemed</Table.ColumnHeader>
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
									minH={"200px"}
									textAlign={"center"}
									gap={3}
								>
									<Box
										w="64px"
										h="64px"
										borderRadius="full"
										mx="auto"
										css={{
											background: "linear-gradient(135deg, hsl(211, 71%, 43% / 0.1), hsl(335, 27%, 64% / 0.08))",
											display: "flex",
											alignItems: "center",
											justifyContent: "center",
										}}
									>
										<Icon width="28px" height="28px" icon={"mdi:gift"} css={{ color: "hsl(215.4, 16.3%, 46.9%)" }} />
									</Box>
									<Text fontSize="lg" fontWeight={600} css={{ color: "hsl(222.2, 47.4%, 11.2%)" }}>
										No gifts yet
									</Text>
									<Text css={{ color: "hsl(215.4, 16.3%, 46.9%)", fontSize: "14px" }}>
										When you add a gift, it&apos;ll show up here
									</Text>
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
