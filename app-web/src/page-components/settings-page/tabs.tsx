"use client";
import { Flex, Tabs } from "@chakra-ui/react";
import { useRouter, usePathname } from "next/navigation";
import React from "react";

const SettingsPageTabs: React.FC = () => {
	const pathname = usePathname().split("/settings/")[1];
	const router = useRouter();

	const tab = pathname ? pathname : "home";
	return (
		<Tabs.Root
			onValueChange={(t) => {
				router.push(`/settings/${t.value}`);
			}}
			defaultValue={tab}
			mt={6}
		>
			<Tabs.List borderBottom={"0px"}>
				<Tabs.Indicator height={0} />
				<Flex
					css={{
						"& [aria-selected=true]": {
							fontWeight: 600,
							bgColor: "transparant",
							border: "none",
							boxShadow: "none",
						},
					}}
				>
					<Tabs.Trigger color={"green.800"} value="basics">
						Basics
					</Tabs.Trigger>
					<Tabs.Trigger color={"green.800"} value="account">
						Account
					</Tabs.Trigger>
				</Flex>
			</Tabs.List>
		</Tabs.Root>
	);
};

export default SettingsPageTabs;
