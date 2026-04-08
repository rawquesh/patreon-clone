"use client";
import { Flex } from "@chakra-ui/react";
import React from "react";
import FilterDrawer from "./filter-drawer";
import { Button } from "@/components/ui/button";
import { useMembers } from "@/context/members-provider";

const FilterBar: React.FC = () => {
	const { updateFilters, filters, resetFilters } = useMembers();

	// Check if any filters are applied
	const hasActiveFilters =
		filters.status !== undefined ||
		filters.tier !== undefined ||
		filters.joinDate !== undefined;

	// Handle "New this month" filter
	const handleNewThisMonth = () => {
		updateFilters({
			joinDate: "thisMonth",
			status: undefined,
			tier: undefined,
		});
	};

	return (
		<Flex mt={6} gap={6}>
			<Button
				variant={filters.joinDate === "thisMonth" ? "solid" : "outline"}
				onClick={handleNewThisMonth}
			>
				New this month
			</Button>
			<FilterDrawer />
			<Button
				variant={"plain"}
				disabled={!hasActiveFilters}
				onClick={resetFilters}
			>
				Clear all
			</Button>
		</Flex>
	);
};

export default FilterBar;
