"use client";
import React from "react";
import {
	DialogBody,
	DialogCloseTrigger,
	DialogContent,
	DialogHeader,
	DialogRoot,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Flex, Separator, Stack, Text } from "@chakra-ui/react";

const DetailsModal: React.FC = () => {
	return (
		<DialogRoot motionPreset={"slide-in-bottom"} placement={"center"}>
			<DialogTrigger
				ml={"-50px"}
				fontWeight={600}
				fontSize="xs"
				cursor="pointer"
			>
				View details
			</DialogTrigger>
			<DialogContent>
				<DialogHeader
					alignItems={"center"}
					display={"flex"}
					justifyContent={"space-between"}
				>
					<Text fontSize={"xl"} fontWeight={600} flex={1}>
						Your balance
					</Text>
					<DialogCloseTrigger />
				</DialogHeader>
				<DialogBody fontSize={"sm"}>
					<Flex alignItems={"center"} justifyContent={"space-between"}>
						<Text>Available to withdraw</Text>
						<Text>$0.00</Text>
					</Flex>
					<Separator my={3} />
					<Flex alignItems={"center"} justifyContent={"space-between"}>
						<Stack>
							<Text>Pending earnings from web and Android</Text>
							<Text fontSize={"xs"} fontWeight={300}>
								These recent earnings will be processed shortly.
							</Text>
						</Stack>
						<Text>$0.00</Text>
					</Flex>
					<Flex
						mt={3}
						gap={6}
						alignItems={"center"}
						justifyContent={"space-between"}
					>
						<Stack>
							<Text>Pending earnings from iOS</Text>
							<Text fontSize={"xs"} fontWeight={300}>
								Earnings from transactions made in the iOS app become available
								75 days after purchase. The current amount is an estimate.
							</Text>
						</Stack>
						<Text>$0.00</Text>
					</Flex>
					<Separator my={3} />
					<Flex alignItems={"center"} justifyContent={"space-between"}>
						<Text fontWeight={600}>Total balance</Text>
						<Text fontWeight={600}>$0.00</Text>
					</Flex>
				</DialogBody>
			</DialogContent>
		</DialogRoot>
	);
};

export default DetailsModal;
