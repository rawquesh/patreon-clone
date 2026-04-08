"use client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Center, Spinner, Text } from "@chakra-ui/react";

export default function StripeRefresh() {
	const router = useRouter();

	useEffect(() => {
		router.push("/onboarding/creator");
	}, [router]);

	return (
		<Center h="100vh" flexDirection="column" gap={4}>
			<Spinner size="xl" color="blue.500" borderWidth="4px" />
			<Text fontSize="lg">Refreshing...</Text>
		</Center>
	);
}
