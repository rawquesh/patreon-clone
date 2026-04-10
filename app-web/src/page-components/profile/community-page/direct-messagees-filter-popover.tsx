import React from "react";
import {
	PopoverBody,
	PopoverContent,
	PopoverHeader,
	PopoverRoot,
	PopoverTrigger,
} from "@/components/ui/popover";
import { Flex, Stack, Text } from "@chakra-ui/react";
import { Icon } from "@iconify/react/dist/iconify.js";

const DirectMessagesFilterPopover: React.FC = () => {
	return (
		<PopoverRoot>
			<PopoverTrigger>
				<Flex
					_hover={{
						background: "linear-gradient(135deg, hsl(211, 71%, 43% / 0.08), hsl(335, 27%, 64% / 0.06))",
					}}
					w={"40px"}
					h={"40px"}
					borderRadius={"999px"}
					justifyContent={"center"}
					alignItems={"center"}
					cursor={"pointer"}
					css={{
						background: "rgba(255,255,255,0.7)",
						backdropFilter: "blur(8px)",
						border: "1px solid rgba(255,255,255,0.5)",
						color: "hsl(215.4, 16.3%, 46.9%)",
						transition: "all 0.15s ease",
					}}
				>
					<Icon icon={"mynaui:filter"} />
				</Flex>
			</PopoverTrigger>
			<PopoverContent w={"200px"} className="glass-menu">
				<PopoverHeader
					css={{
						color: "hsl(215.4, 16.3%, 46.9%)",
						fontWeight: 600,
						fontSize: "11px",
						letterSpacing: "0.05em",
					}}
				>
					FILTER
				</PopoverHeader>
				<PopoverBody>
					<Stack>
						<Flex justifyContent={"space-between"} alignItems={"center"}>
							<Text
								fontWeight={500}
								css={{ color: "hsl(222.2, 47.4%, 11.2%)" }}
							>
								All
							</Text>
							<Icon
								width={"24px"}
								icon={"mynaui:check"}
								style={{ color: "hsl(211, 71%, 43%)" }}
							/>
						</Flex>

						<Flex justifyContent={"space-between"} alignItems={"center"}>
							<Text
								fontWeight={500}
								css={{ color: "hsl(222.2, 47.4%, 11.2%)" }}
							>
								Unread
							</Text>
						</Flex>
					</Stack>
				</PopoverBody>
			</PopoverContent>
		</PopoverRoot>
	);
};

export default DirectMessagesFilterPopover;
