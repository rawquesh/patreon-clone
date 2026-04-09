import { Button } from "@/components/ui/button";
import { Box, Flex, Text } from "@chakra-ui/react";
import { Icon } from "@iconify/react";
import React from "react";

interface Props {
	icon: string;
	title: string;
}

const ConnectListItem: React.FC<Props> = ({ icon, title }) => {
	return (
		<Flex
			alignItems={"center"}
			mt={"10px"}
			className="glass-card"
			p={3}
			borderRadius="12px"
			css={{
				transition: "all 0.2s ease",
				"&:hover": {
					transform: "translateY(-1px)",
					boxShadow: "var(--glass-shadow-hover)",
				},
			}}
		>
			<Box
				css={{
					"& svg": {
						color: "hsl(211, 71%, 43%)",
					},
				}}
			>
				<Icon width={24} height={24} icon={icon} />
			</Box>
			<Text ml={4} css={{ color: "hsl(222.2, 47.4%, 11.2%)", fontWeight: 500 }}>
				{title}
			</Text>
			<Button
				size={"xs"}
				variant={"outline"}
				ml={"auto"}
				className="glass-card"
				css={{
					fontWeight: 600,
					fontSize: "12px",
					color: "hsl(211, 71%, 43%)",
					borderColor: "hsl(211, 71%, 43% / 0.3)",
					"&:hover": {
						background: "var(--gradient-primary)",
						color: "white",
						borderColor: "transparent",
					},
				}}
			>
				Connect
			</Button>
		</Flex>
	);
};

export default ConnectListItem;
