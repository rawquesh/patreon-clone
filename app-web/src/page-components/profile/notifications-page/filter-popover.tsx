/* eslint-disable @typescript-eslint/ban-ts-comment */
"use client";
import React, { useState } from "react";
import {
	PopoverBody,
	PopoverContent,
	PopoverHeader,
	PopoverRoot,
	PopoverTrigger,
} from "@/components/ui/popover";
import { Stack, Text } from "@chakra-ui/react";
import { Icon } from "@iconify/react/dist/iconify.js";
import { Checkbox } from "@/components/ui/checkbox";
import { useNotifications } from "@/context/notifications.provider";
import { NotificationType } from "@/typings/INotification";

interface FilterOption {
	label: string;
	value: string;
	on: boolean;
}

const initialFilters: FilterOption[] = [
	{ label: "Likes", value: NotificationType.LIKE, on: false },
	{ label: "Comments", value: NotificationType.COMMENT, on: false },
	{ label: "New members", value: NotificationType.NEW_MEMBER, on: false },
	{ label: "Upgrades", value: NotificationType.UPGRADE, on: false },
	{ label: "Downgrades", value: NotificationType.DOWNGRADE, on: false },
	{ label: "Cancellations", value: NotificationType.CANCELLATION, on: false },
];

const FilterPopover: React.FC = () => {
	const [filters, setFilters] = useState(initialFilters);
	const { refetchNotifications } = useNotifications();

	const applyFilters = () => {
		const activeFilters = filters.filter((f) => f.on).map((f) => f.value);

		if (activeFilters.length > 0) {
			refetchNotifications({
				type: activeFilters,
				page: 1,
			});
		} else {
			refetchNotifications({
				type: undefined,
				page: 1,
			});
		}
	};

	return (
		<PopoverRoot size={"xs"}>
			<PopoverTrigger
				border={"1px solid"}
				borderColor={"star.500"}
				px={5}
				py={2}
				rounded={"8px"}
				_hover={{ bg: "star.100" }}
				display={"flex"}
				alignItems={"center"}
				gap={2}
				cursor={"pointer"}
			>
				<Icon icon={"mynaui:filter"} />
				<Text fontWeight={500} transform={"translateY(2px)"}>
					Filter
				</Text>
			</PopoverTrigger>
			<PopoverContent p={3} w={"250px"}>
				<PopoverHeader
					fontSize={"md"}
					display={"flex"}
					justifyContent={"space-between"}
					fontWeight={500}
				>
					<Text>Filter by</Text>
					<Text
						onClick={() => {
							setFilters(initialFilters);
							refetchNotifications({ type: undefined, page: 1 });
						}}
						cursor={"pointer"}
						as={"button"}
						css={{ color: "hsl(211, 71%, 43%)" }}
					>
						Clear
					</Text>
				</PopoverHeader>
				<PopoverBody>
					<Stack gap={3}>
						{filters.map((filter, index) => (
							<Checkbox
								key={filter.value}
								checked={filter.on}
								onChange={(e) => {
									setFilters((prev) => {
										const newFilters = [...prev];
										//@ts-ignore
										newFilters[index].on = !!e.target.checked;
										return newFilters;
									});
								}}
								cursor={"pointer"}
							>
								{filter.label}
							</Checkbox>
						))}
					</Stack>
					<Text
						mt={4}
						textAlign="center"
						css={{ color: "hsl(211, 71%, 43%)" }}
						fontWeight="semibold"
						cursor="pointer"
						onClick={applyFilters}
					>
						Apply filters
					</Text>
				</PopoverBody>
			</PopoverContent>
		</PopoverRoot>
	);
};

export default FilterPopover;
