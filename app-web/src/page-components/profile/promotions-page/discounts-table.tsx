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
import DiscountModal from "./discount-modal";
import DiscountTableMenuPopover from "./discount-table-menu-popover";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchDiscounts } from "@/lib/backend-services/promotions-service";
import { format } from "date-fns";
import { DiscountStatus, IDiscount } from "@/typings/IDiscount";
import { toaster } from "@/components/ui/toaster";

const DiscountsTable: React.FC = () => {
	const queryClient = useQueryClient();
	const [copyingCode, setCopyingCode] = useState<string | null>(null);

	const { data, isLoading, error } = useQuery({
		queryKey: ["discounts"],
		queryFn: fetchDiscounts,
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

	const onDiscountChange = () => {
		queryClient.invalidateQueries({ queryKey: ["discounts"] });
	};

	if (isLoading) {
		return (
			<Box py={10} textAlign="center">
				<Text>Loading discounts...</Text>
			</Box>
		);
	}

	if (error) {
		return (
			<Box py={10} textAlign="center">
				<Text color="red.500">Error loading discounts.</Text>
				<Text>Please try again later.</Text>
			</Box>
		);
	}

	const discounts = data || [];

	const formatDate = (dateString: string) => {
		try {
			return format(new Date(dateString), "MMM d, yyyy");
		} catch (e) {
			console.log(e);
			return "Invalid date";
		}
	};

	const rows = discounts.map((item: IDiscount) => (
		<Table.Row bg={"white"} key={item.id}>
			<Table.Cell>
				<Stack>
					<Flex gap={2}>
						<Text fontSize={"xs"} fontWeight={600}>
							{item.title}
						</Text>
						<Tag
							size={"sm"}
							startElement={<Icon icon={"ic:baseline-discount"} />}
						>
							{item.code}
						</Tag>
					</Flex>
					<Flex color={"star.600"} fontSize={"xs"} gap={2}>
						<Text>
							{item.description || `${item.discountNumber}% off first month`}{" "}
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
					<DiscountTableMenuPopover
						discount={item}
						onDiscountChange={onDiscountChange}
					/>
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
							<DiscountModal mode="create" onSaveCallback={onDiscountChange} />
						</Table.ColumnHeader>
					</Table.Row>
				</Table.Header>
				{discounts.length > 0 ? (
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
										<Icon width={"36px"} icon={"ic:baseline-discount"} />
									</Box>
									<Text fontSize={"xl"} fontWeight={600}>
										No discounts yet
									</Text>
									<Text>When you add a discount, it&apos;ll show up here</Text>
									<DiscountModal
										mode="create"
										onSaveCallback={onDiscountChange}
									/>
								</Stack>
							</Table.Cell>
						</Table.Row>
					</Table.Body>
				)}
			</Table.Root>
		</Box>
	);
};

export default DiscountsTable;
