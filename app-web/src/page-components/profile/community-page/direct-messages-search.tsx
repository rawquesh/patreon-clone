import { InputGroup } from "@/components/ui/input-group";
import { SearchIcon } from "@/icons/search";
import { Flex, Input } from "@chakra-ui/react";
import React from "react";
import DirectMessagesFilterPopover from "./direct-messagees-filter-popover";

const DirectMessagesSearch: React.FC = () => {
	return (
		<Flex gap={3} alignItems={"center"}>
			<InputGroup glass startElement={<SearchIcon />}>
				<Input placeholder="Search or start conversation" />
			</InputGroup>
			<DirectMessagesFilterPopover />
		</Flex>
	);
};

export default DirectMessagesSearch;
