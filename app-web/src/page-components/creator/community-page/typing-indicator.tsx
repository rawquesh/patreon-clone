import { Avatar } from "@/components/ui/avatar";
import { Box, Flex, Text } from "@chakra-ui/react";
import React from "react";

interface TypingIndicatorProps {
	users: Array<{
		_id: string;
		displayName: string;
		profilePicture?: string;
	}>;
}

// system.defineConfig({

// });

const TypingIndicator: React.FC<TypingIndicatorProps> = ({ users }) => {
	if (users.length === 0) return null;

	const getTypingMessage = () => {
		if (users.length === 1) {
			return `${users[0].displayName} is typing...`;
		} else if (users.length === 2) {
			return `${users[0].displayName} and ${users[1].displayName} are typing...`;
		} else {
			return `${users.length} people are typing...`;
		}
	};

	return (
		<Flex gap={2} alignItems="center">
			<Avatar
				size="sm"
				src={users[0].profilePicture}
				name={users[0].displayName}
			/>

			<Box
				css={{ background: "hsl(210, 30%, 88%)" }}
				px={3}
				py={2}
				borderRadius="md"
				display="inline-flex"
				alignItems="center"
			>
				<Text fontSize="xs" fontStyle="italic" mr={2} css={{ color: "hsl(215.4, 16.3%, 46.9%)" }}>
					{getTypingMessage()}
				</Text>

				<Flex gap={1}>
					{[0, 1, 2].map((i) => (
						<Box
							key={i}
							w="6px"
							h="6px"
							borderRadius="full"
							css={{ background: "hsl(215.4, 16.3%, 46.9%)" }}
							animation={`bounce 1.4s ease infinite ${i * 0.2}s`}
						/>
					))}
				</Flex>
			</Box>
		</Flex>
	);
};

export default TypingIndicator;
