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
			<Tabs.List
				className="glass-card-static"
				borderRadius="12px"
				p={1}
				gap={1}
				width="100%"
				css={{
					background: "rgba(255,255,255,0.7)",
					backdropFilter: "blur(12px)",
				}}
			>
				{["membership", "earnings", "posts"].map((value) => (
					<Tabs.Trigger
						key={value}
						value={value}
						borderRadius="10px"
						px={5}
						py={2}
						fontSize="sm"
						fontWeight={500}
						textTransform="capitalize"
						css={{
							color: "hsl(215.4, 16.3%, 46.9%)",
							transition: "all 0.15s ease",
							"&[data-state=active]": {
								background: "var(--gradient-primary)",
								color: "white",
								fontWeight: 600,
								boxShadow: "0 2px 8px hsl(211, 71%, 43% / 0.3)",
							},
							"&:hover:not([data-state=active])": {
								color: "hsl(222.2, 47.4%, 11.2%)",
								background: "rgba(255,255,255,0.6)",
							},
						}}
					>
						{value}
					</Tabs.Trigger>
				))}
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
