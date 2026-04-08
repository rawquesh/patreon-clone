import React from "react";
import { Icon } from "@iconify/react/dist/iconify.js";
import {
	MenuContent,
	MenuItem,
	MenuRoot,
	MenuTrigger,
} from "@/components/ui/menu";
import { Button } from "@/components/ui/button";
import { Center, Text } from "@chakra-ui/react";

const RecentlyVisitedPopover: React.FC = () => {
	return (
		<MenuRoot>
			<MenuTrigger
				bg={"transparent"}
				color={"star.800"}
				_hover={{
					bg: "rgb(0, 0, 0, 0.1)",
				}}
				rounded={"999px"}
				h={"30px"}
				w={"30px"}
				display={"flex"}
				alignItems={"center"}
				justifyContent={"center"}
				cursor={"pointer"}
				className="recently-visited-popover"
				ml={"auto"}
			>
				<Icon icon={"charm:menu-meatball"} />
			</MenuTrigger>
			<MenuContent>
				<Center my={2}>
					<Button mb={1}>Join for free</Button>
				</Center>
				<MenuItem
					my={2}
					display={"flex"}
					alignItems={"center"}
					gap={3}
					value="block"
				>
					<Icon width={"24px"} icon={"ic:baseline-delete"} />
					<Text>Remove from history</Text>
				</MenuItem>
				<MenuItem display={"flex"} alignItems={"center"} gap={3} value="block">
					<Icon width={"24px"} icon={"material-symbols:report-rounded"} />
					<Text>Report this creator</Text>
				</MenuItem>
			</MenuContent>
		</MenuRoot>
	);
};

export default RecentlyVisitedPopover;
