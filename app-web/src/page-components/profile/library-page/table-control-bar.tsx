"use client";

import React, { useState } from "react";
import {
	Flex,
	Input,
	HStack,
	IconButton,
	NativeSelect,
} from "@chakra-ui/react";
import { Icon } from "@iconify/react/dist/iconify.js";
import { PostType, SortBy, SortOrder, TierAccess } from "@/typings/IPost";
import { InputGroup } from "@/components/ui/input-group";
import { usePostsFilter } from "@/context/posts.provider";

const TableControlBar = () => {
	const [searchTerm, setSearchTerm] = useState("");
	const { updateFilters } = usePostsFilter();

	const handleSearch = () => {
		updateFilters({ search: searchTerm, page: 1 });
	};

	return (
		<Flex
			bg="white"
			py={3}
			px={4}
			borderRadius="lg"
			boxShadow="md"
			mb={4}
			justifyContent="space-between"
			flexWrap={{ base: "wrap", md: "nowrap" }}
			gap={3}
		>
			<InputGroup
				startElement={<Icon icon="material-symbols:search" />}
				maxW={{ base: "100%", md: "260px" }}
			>
				<Input
					placeholder="Search posts"
					value={searchTerm}
					onChange={(e) => setSearchTerm(e.target.value)}
					onKeyDown={(e) => e.key === "Enter" && handleSearch()}
				/>
			</InputGroup>

			<HStack gap={2} flexWrap="wrap">
				<NativeSelect.Root w={{ base: "full", md: "auto" }} maxW="180px">
					<NativeSelect.Field
						placeholder="All post types"
						onChange={(e) =>
							updateFilters({
								types: e.target.value
									? [e.target.value as PostType]
									: undefined,
								page: 1,
							})
						}
					>
						<option value={PostType.TEXT}>Text</option>
						<option value={PostType.IMAGE}>Picture</option>
						<option value={PostType.AUDIO}>Audio</option>
						<option value={PostType.VIDEO}>Video</option>
						<option value={PostType.LINK}>Link</option>
					</NativeSelect.Field>
				</NativeSelect.Root>

				<NativeSelect.Root w={{ base: "full", md: "auto" }} maxW="180px">
					<NativeSelect.Field
						placeholder="All tier access"
						onChange={(e) =>
							updateFilters({
								tierAccess: e.target.value
									? [e.target.value as TierAccess]
									: undefined,
								page: 1,
							})
						}
					>
						<option value={TierAccess.ALL}>All</option>
						<option value={TierAccess.FREE}>Free Members</option>
						<option value={TierAccess.PAID}>Paid only</option>
					</NativeSelect.Field>
				</NativeSelect.Root>

				<NativeSelect.Root w={{ base: "full", md: "auto" }} maxW="150px">
					<NativeSelect.Field
						placeholder="Sort by"
						onChange={(e) =>
							updateFilters({ sortBy: e.target.value as SortBy })
						}
					>
						<option value={SortBy.CREATED_AT}>Date</option>
						<option value={SortBy.TITLE}>Title</option>
						<option value={SortBy.TYPE}>Type</option>
					</NativeSelect.Field>
				</NativeSelect.Root>

				<IconButton
					aria-label="Sort order"
					onClick={() =>
						updateFilters({
							sortOrder: SortOrder.ASC ? SortOrder.DESC : SortOrder.ASC,
						})
					}
				>
					<Icon icon="material-symbols:sort" />
				</IconButton>
			</HStack>
		</Flex>
	);
};

export default TableControlBar;
