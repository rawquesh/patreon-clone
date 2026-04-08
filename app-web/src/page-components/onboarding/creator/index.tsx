import { Button, Flex, Grid, Input, Stack, Text } from "@chakra-ui/react";
import React from "react";
import { RoundedButton } from "@/components/ui/rounded-button";

const Create: React.FC = () => {
	return (
		<div>
			<Grid gridTemplateRows={"1fr 120px"} w={"full"} h={"100%"}>
				<Stack>
					<Text fontSize={"2xl"} fontWeight={"bold"} as={"h1"}>
						Let’s name your page
					</Text>

					<Input
						rounded={"8px"}
						bg={{ base: "gray.100", _dark: "gray.700" }}
						outlineColor={"star.400"}
						variant={"outline"}
						placeholder={"Your creator name"}
					/>
					<Button h={"42px"} borderColor={"black"} w={"100%"}>
						Continue
					</Button>
				</Stack>
				<Flex justifyContent={"center"}>
					<RoundedButton
						bg={{ base: "gray.50", _dark: "gray.700" }}
						variant={"outline"}
						fontWeight={600}
					>
						Not a creator? Join as a fan
					</RoundedButton>
				</Flex>
			</Grid>
		</div>
	);
};

export default Create;
