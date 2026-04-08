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
						bg: "gray.100",
					}}
					w={"40px"}
					h={"40px"}
					borderRadius={"999px"}
					justifyContent={"center"}
					alignItems={"center"}
					cursor={"pointer"}
				>
					<Icon icon={"mynaui:filter"} />
				</Flex>
			</PopoverTrigger>
			<PopoverContent w={"200px"}>
				<PopoverHeader>FILTER</PopoverHeader>
				<PopoverBody>
					<Stack>
						<Flex justifyContent={"space-between"} alignItems={"center"}>
							<Text fontWeight={500}>All</Text>
							<Icon width={"24px"} icon={"mynaui:check"} />
						</Flex>

						<Flex justifyContent={"space-between"} alignItems={"center"}>
							<Text fontWeight={500}>Unread</Text>
						</Flex>
					</Stack>
				</PopoverBody>
			</PopoverContent>
		</PopoverRoot>
	);
};

export default DirectMessagesFilterPopover;
