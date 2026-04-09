import { Box, Button, Flex, Grid, Input, Stack, Text } from "@chakra-ui/react";
import React from "react";
import { RoundedButton } from "@/components/ui/rounded-button";

const Create: React.FC = () => {
	return (
		<Box>
			<Grid gridTemplateRows={"1fr 120px"} w={"full"} h={"100%"}>
				<Stack>
					<Text
						fontSize={"2xl"}
						fontWeight={"bold"}
						as={"h1"}
						css={{ color: "hsl(222.2, 47.4%, 11.2%)" }}
					>
						Let&apos;s name your page
					</Text>

					<Input
						rounded={"8px"}
						className="glass-input"
						outlineColor={"hsl(211, 71%, 43%)"}
						variant={"outline"}
						placeholder={"Your creator name"}
						css={{
							borderColor: "var(--glass-border)",
							color: "hsl(222.2, 47.4%, 11.2%)",
							fontWeight: 500,
						}}
					/>
					<Button
						h={"42px"}
						className="btn-gradient"
						w={"100%"}
						css={{ fontWeight: 600 }}
					>
						Continue
					</Button>
				</Stack>
				<Flex justifyContent={"center"}>
					<RoundedButton
						className="glass-card"
						variant={"outline"}
						fontWeight={600}
						css={{
							borderColor: "var(--glass-border)",
							color: "hsl(215.4, 16.3%, 46.9%)",
						}}
					>
						Not a creator? Join as a fan
					</RoundedButton>
				</Flex>
			</Grid>
		</Box>
	);
};

export default Create;
