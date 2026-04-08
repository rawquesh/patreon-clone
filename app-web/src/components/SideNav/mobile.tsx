"use client";
import { Flex, Text } from "@chakra-ui/react";
import React from "react";
import { usePathname } from "next/navigation";
import MobileDrawer from "./mobile-drawer";
import { useUserMode } from "@/context/user-mode.provider";

interface Props {
	mode: "creator" | "user";
}

const MobileSideNav: React.FC<Props> = () => {
	const pathname = usePathname().split("/profile")[1] || "";
	const { mode: contextMode } = useUserMode();

	const currentMode = contextMode;

	return (
		<Flex
			h={"48px"}
			alignItems={"center"}
			px={"40px"}
			display={{ base: "flex", lg: "none" }}
			pos={"fixed"}
			top={0}
			left={0}
			w={"100vw"}
			bg={{ base: "white" }}
		>
			<MobileDrawer mode={currentMode} />
			<Text flex={1} textAlign={"center"} textTransform={"capitalize"}>
				{pathname}
			</Text>
		</Flex>
	);
};

export default MobileSideNav;
