"use client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Box, Center, Spinner, Text, VStack } from "@chakra-ui/react";

export default function StripeRefresh() {
	const router = useRouter();

	useEffect(() => {
		router.push("/onboarding/creator");
	}, [router]);

	return (
		<Center h="100vh" flexDirection="column" gap={4} className="animate-fade-in-up">
			<VStack
				className="glass-card"
				p={8}
				borderRadius="20px"
				gap={4}
				align="center"
				css={{
					boxShadow: "var(--glow-primary)",
				}}
			>
				<Spinner
					size="xl"
					css={{
						color: "hsl(211, 71%, 43%)",
						borderWidth: "4px",
						"& .chakra-spinner__track": {
							borderColor: "hsl(211, 71%, 43% / 0.1)",
						},
					}}
				/>
				<Text fontSize="lg" fontWeight={500} css={{ color: "hsl(222.2, 47.4%, 11.2%)" }}>
					Refreshing...
				</Text>
			</VStack>
		</Center>
	);
}
