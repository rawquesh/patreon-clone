import { Flex, HStack } from "@chakra-ui/react";
import {
	PaginationItems,
	PaginationNextTrigger,
	PaginationPrevTrigger,
	PaginationRoot,
} from "@/components/ui/pagination";

const ExplorerPagination = () => {
	return (
		<Flex justifyContent={"center"}>
			<PaginationRoot count={10} pageSize={2} defaultPage={1}>
				<HStack>
					<PaginationPrevTrigger />
					<PaginationItems />
					<PaginationNextTrigger />
				</HStack>
			</PaginationRoot>
		</Flex>
	);
};

export default ExplorerPagination;
