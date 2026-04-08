/* eslint-disable @next/next/no-img-element */
"use client";
import React from "react";
import {
	Box,
	Flex,
	IconButton,
	Separator,
	Stack,
	Text,
	useDisclosure,
} from "@chakra-ui/react";
import {
	DrawerBackdrop,
	DrawerContent,
	DrawerRoot,
} from "@/components/ui/drawer";
import { Icon } from "@iconify/react/dist/iconify.js";
import { navItems } from "./data";
import NavLinkItem from "./nav-link-item";
import { Button } from "@/components/ui/button";
import MobileBottomDrawer from "./mobile-bottom-drawer";
import { useUserMode } from "@/context/user-mode.provider";
import { useRouter } from "next/navigation";

interface Props {
	mode: "creator" | "user";
}

const MobileDrawer: React.FC<Props> = ({ mode }) => {
	const { open, onClose, onOpen } = useDisclosure();
	const { setMode } = useUserMode();
	const router = useRouter();

	const handleCreateClick = () => {
		router.push("/profile/create/text");
		onClose();
	};

	return (
		<DrawerRoot
			closeOnInteractOutside={false}
			closeOnEscape={false}
			placement={"start"}
			size={"full"}
			open={open}
		>
			<DrawerBackdrop />
			<IconButton onClick={onOpen} variant={"ghost"}>
				<Icon icon={"mage:dash-menu"} />
			</IconButton>
			<DrawerContent p={0}>
				<Flex
					css={{ "& img": { w: "84px" } }}
					justifyContent={"space-between"}
					mx={"24px"}
					mt={"24px"}
					alignItems={"center"}
				>
					<img src={"/icons/logo-text.svg"} alt="logo" />
					<IconButton onClick={onClose} variant={"ghost"}>
						<Icon icon={"mingcute:close-fill"} />
					</IconButton>
				</Flex>
				<Stack p="24px">
					{navItems[mode].map((item) => (
						<NavLinkItem key={item.link} {...item} />
					))}
					{mode === "creator" ? (
						<Button
							display={"flex"}
							justifyContent={"center"}
							alignItems={"center"}
							variant={"outline"}
							color={{ base: "star.600" }}
							onClick={handleCreateClick}
						>
							<Icon icon={"ion:create"} />
							<Text
								transform={"translateY(2px)"}
								fontSize={"sm"}
								fontWeight={600}
							>
								Create
							</Text>
						</Button>
					) : null}
				</Stack>
				<Box mt={"auto"}>
					<Separator />
					<MobileBottomDrawer currentMode={mode} onModeChange={setMode} />
				</Box>
			</DrawerContent>
		</DrawerRoot>
	);
};

export default MobileDrawer;
