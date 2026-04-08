import React from "react";
import { Icon } from "@iconify/react/dist/iconify.js";
import { MenuContent, MenuItem, MenuRoot, MenuTrigger } from "../menu";

const CreatorCardPopover: React.FC = () => {
	return (
		<MenuRoot>
			<MenuTrigger
				bg={"transparent"}
				color={"white"}
				_hover={{
					bg: "rgb(0, 0, 0, 0.1)",
				}}
				rounded={"999px"}
				h={"40px"}
				w={"40px"}
				display={"flex"}
				alignItems={"center"}
				justifyContent={"center"}
				cursor={"pointer"}
				zIndex={1000}
				top={"15px"}
				right={"15px"}
				position={"absolute"}
				className="creator-card-popover"
			>
				<Icon icon={"charm:menu-meatball"} />
			</MenuTrigger>
			<MenuContent>
				<MenuItem value="block">Don&apos;t show this creator</MenuItem>
				<MenuItem value="report">Report this creator</MenuItem>
			</MenuContent>
		</MenuRoot>
	);
};

export default CreatorCardPopover;
