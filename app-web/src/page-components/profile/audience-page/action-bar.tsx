"use client";
import ButtonWithIcon from "@/components/ui/button-with-icon";
import { InputGroup } from "@/components/ui/input-group";
import { Flex, Input } from "@chakra-ui/react";
import { Icon } from "@iconify/react/dist/iconify.js";
import React, { useState, useEffect } from "react";
import { useMembers } from "@/context/members-provider";
import { toaster } from "@/components/ui/toaster";

const ActionBar: React.FC = () => {
	const { updateFilters, exportToCSV } = useMembers();
	const [search, setSearch] = useState("");
	const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(
		null
	);

	useEffect(() => {
		if (searchTimeout) {
			clearTimeout(searchTimeout);
		}

		const timeout = setTimeout(() => {
			updateFilters({ search: search, page: 1 });
		}, 500);

		setSearchTimeout(timeout);

		return () => {
			if (searchTimeout) {
				clearTimeout(searchTimeout);
			}
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [search, updateFilters]);

	const handleExportCSV = async () => {
		try {
			await exportToCSV();
			toaster.create({
				title: "Success",
				description: "Members exported to CSV successfully",
				type: "success",
				duration: 3000,
			});
		} catch (error) {
			console.log(error);
			toaster.create({
				title: "Error",
				description: "Failed to export members to CSV",
				type: "error",
				duration: 3000,
			});
		}
	};

	return (
		<Flex gap={6} mt={6}>
			<InputGroup
				startElement={<Icon icon={"ic:sharp-search"} />}
				endElement={
					search?.length > 0 && (
						<Icon
							cursor={"pointer"}
							onClick={() => {
								setSearch("");
								updateFilters({ search: "" });
							}}
							icon={"material-symbols:close"}
						/>
					)
				}
			>
				<Input
					minW="250px"
					value={search}
					onChange={(e) => {
						setSearch(e.target.value);
					}}
					placeholder="Search by email or name"
					variant={"outline"}
					bg={"white"}
				/>
			</InputGroup>
			<ButtonWithIcon
				variant={"outline"}
				icon="material-symbols-light:download"
				onClick={handleExportCSV}
			>
				CSV
			</ButtonWithIcon>
		</Flex>
	);
};

export default ActionBar;
