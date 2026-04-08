"use client";
import React, { useState } from "react";
import {
	DrawerBackdrop,
	DrawerBody,
	DrawerContent,
	DrawerFooter,
	DrawerRoot,
} from "@/components/ui/drawer";
import {
	IconButton,
	Separator,
	Stack,
	Text,
	useDisclosure,
	NativeSelect,
	Tabs,
} from "@chakra-ui/react";
import ButtonWithIcon from "@/components/ui/button-with-icon";
import { Icon } from "@iconify/react/dist/iconify.js";
import { Button } from "@/components/ui/button";
import { useMembers } from "@/context/members-provider";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";

const FilterDrawer: React.FC = () => {
	const { open, onClose, onOpen } = useDisclosure();
	const { filters, updateFilters } = useMembers();

	// Local state for filter selection
	const [localFilters, setLocalFilters] = useState({
		status: filters.status || "",
		tier: filters.tier || "",
		joinDate: filters.joinDate || "",
	});

	// Fetch membership tiers
	const { data: membershipTiers } = useQuery({
		queryKey: ["membership-tiers"],
		queryFn: async () => {
			try {
				const { data } = await api.get("/memberships/creator");
				return data.memberships || [];
			} catch (error) {
				console.error("Error fetching membership tiers:", error);
				return [];
			}
		},
	});

	const handleApplyFilters = () => {
		updateFilters({
			status: localFilters.status || undefined,
			tier: localFilters.tier || undefined,
			joinDate: localFilters.joinDate || undefined,
			page: 1,
		});
		onClose();
	};

	return (
		<DrawerRoot
			closeOnInteractOutside={false}
			closeOnEscape={false}
			placement={"end"}
			open={open}
			size={"md"}
		>
			<DrawerBackdrop />
			<ButtonWithIcon variant={"subtle"} icon="mi:filter" onClick={onOpen}>
				Filter
			</ButtonWithIcon>
			<DrawerContent px={2} position={"relative"}>
				<DrawerBody>
					<Tabs.Root defaultValue={"all"}>
						<Tabs.List>
							<Tabs.Trigger value="all">All Filters</Tabs.Trigger>
							<Tabs.Trigger value="saved">Saved Filters</Tabs.Trigger>
						</Tabs.List>
						<Tabs.Content value="all">
							<Stack mt={8}>
								<Text fontWeight={600}>Status</Text>
								<NativeSelect.Root>
									<NativeSelect.Field
										value={localFilters.status}
										onChange={(e) =>
											setLocalFilters({
												...localFilters,
												status: e.target.value,
											})
										}
									>
										<option value="">All</option>
										<option value="Active">Active</option>
										<option value="Inactive">Inactive</option>
										<option value="Cancelled">Cancelled</option>
									</NativeSelect.Field>
								</NativeSelect.Root>
							</Stack>

							<Stack mt={6}>
								<Text fontWeight={600}>Membership Tier</Text>
								<NativeSelect.Root>
									<NativeSelect.Field
										value={localFilters.tier}
										onChange={(e) =>
											setLocalFilters({ ...localFilters, tier: e.target.value })
										}
									>
										<option value="">All</option>
										{membershipTiers?.map(
											(tier: { _id: string; name: string }) => (
												<option key={tier._id} value={tier.name}>
													{tier.name}
												</option>
											)
										)}
									</NativeSelect.Field>
								</NativeSelect.Root>
							</Stack>

							<Stack mt={6}>
								<Text fontWeight={600}>Join Date</Text>
								<NativeSelect.Root>
									<NativeSelect.Field
										value={localFilters.joinDate}
										onChange={(e) =>
											setLocalFilters({
												...localFilters,
												joinDate: e.target.value,
											})
										}
									>
										<option value="">Anytime</option>
										<option value="thisMonth">This month</option>
										<option value="lastMonth">Last month</option>
										<option value="last3Months">Last 3 months</option>
										<option value="last6Months">Last 6 months</option>
										<option value="lastYear">Last year</option>
									</NativeSelect.Field>
								</NativeSelect.Root>
							</Stack>
						</Tabs.Content>
						<Tabs.Content value="saved">
							<Text
								mt={8}
								textAlign={"center"}
								fontSize={"sm"}
								color={"star.700"}
							>
								No saved filters
							</Text>
						</Tabs.Content>
					</Tabs.Root>
					<IconButton
						pos={"absolute"}
						top={"5px"}
						right={"10px"}
						onClick={onClose}
						variant={"ghost"}
						aria-label="Close drawer"
					>
						<Icon icon={"mingcute:close-fill"} />
					</IconButton>
				</DrawerBody>
				<Separator mb={3} />
				<DrawerFooter>
					<Button onClick={onClose} variant={"ghost"}>
						Cancel
					</Button>
					<Button onClick={handleApplyFilters}>Apply filters</Button>
				</DrawerFooter>
			</DrawerContent>
		</DrawerRoot>
	);
};

export default FilterDrawer;
