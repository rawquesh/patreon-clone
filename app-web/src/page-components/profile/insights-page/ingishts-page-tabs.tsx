"use client";
import { Flex, Tabs } from "@chakra-ui/react";
import { useSearchParams, useRouter } from "next/navigation";
import React from "react";
import MembershipsTab from "./membership";
import EarningsTab from "./earnings";
import PostsTab from "./posts";

const InsightsPageTabs: React.FC = () => {
	const searchParams = useSearchParams();
	const router = useRouter();

	let tab = searchParams.get("tab");
	tab = ["membership", "earnings", "posts"].includes(tab || "")
		? tab
		: "membership";

	return (
		<Tabs.Root
			onValueChange={(t) => {
				router.push(`/profile/insights?tab=${t.value}`);
			}}
			defaultValue={tab}
			mt={6}
		>
			<Tabs.List borderBottom={"0px"}>
				<Flex
					css={{
						"& [aria-selected=true]": {
							fontWeight: 600,
							bgColor: "transparent",
							border: "none",
							boxShadow: "none",
						},
					}}
				>
					<Tabs.Trigger value="membership">Membership</Tabs.Trigger>
					<Tabs.Trigger value="earnings">Earnings</Tabs.Trigger>
					<Tabs.Trigger value="posts">Posts</Tabs.Trigger>
				</Flex>
			</Tabs.List>
			<Tabs.Content value="membership">
				<MembershipsTab />
			</Tabs.Content>
			<Tabs.Content value="earnings">
				<EarningsTab />
			</Tabs.Content>
			<Tabs.Content value="posts">
				<PostsTab />
			</Tabs.Content>
		</Tabs.Root>
	);
};

export default InsightsPageTabs;
