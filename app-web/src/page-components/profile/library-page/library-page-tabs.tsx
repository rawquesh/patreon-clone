"use client";
import { Flex, Tabs } from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import React from "react";

const LibraryPageTabs: React.FC<{
	currentTab: string;
}> = ({ currentTab }) => {
	const router = useRouter();

	return (
		<Tabs.Root
			onValueChange={(t) => {
				router.push(`/profile/library/${t.value}`);
			}}
			defaultValue={currentTab}
			mt={6}
		>
			<Tabs.List borderBottom={"0px"}>
				{/* <Tabs.Indicator height={0} /> */}
				<Flex
					css={{
						"& [aria-selected=true]": {
							fontWeight: 600,
							bgColor: "transparant",
							border: "none",
							boxShadow: "none",
						},
					}}
					// px={"40px"}
				>
					<Tabs.Trigger value="posts">Posts</Tabs.Trigger>
					<Tabs.Trigger value="collections">Collections</Tabs.Trigger>
					<Tabs.Trigger value="drafts">Drafts</Tabs.Trigger>
				</Flex>
			</Tabs.List>
		</Tabs.Root>
	);
};

export default LibraryPageTabs;
