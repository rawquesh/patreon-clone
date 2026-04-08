"use client";
import { useAuth } from "@/context/auth.provider";
import { Center, Flex, Spinner, Text, VStack } from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import { toaster } from "@/components/ui/toaster";

export default function StripeOnboardingHandler() {
	const { user, isLoadingUser } = useAuth();
	const router = useRouter();
	const [isProcessing, setIsProcessing] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const completeOnboarding = async () => {
			try {
				if (!user) return;

				setIsProcessing(true);
				const { data } = await api.post("/users/stripe-onboarding/complete");

				if (data.accountStatus.isEnabled) {
					toaster.create({
						title: "Success",
						description: "Your creator page is now published!",
						type: "success",
						duration: 3000,
					});
					router.push("/profile");
				} else if (data.accountStatus.requiresAction) {
					setError(
						"Your Stripe account requires additional information. Please check your email for instructions."
					);
				} else {
					router.push("/profile");
				}
			} catch (error: any) {
				console.error("Failed to complete onboarding:", error);
				setError(
					error.response?.data?.message ||
						"Failed to complete Stripe onboarding"
				);
			} finally {
				setIsProcessing(false);
			}
		};

		if (!isLoadingUser && user) {
			completeOnboarding();
		}
	}, [user, isLoadingUser, router]);

	if (isLoadingUser) {
		return (
			<Center h="100vh">
				<Spinner size="xl" color="blue.500" />
			</Center>
		);
	}

	return (
		<Flex direction="column" h="100vh" justify="center" align="center">
			{isProcessing ? (
				<VStack gap={6}>
					<Spinner size="xl" color="blue.500" borderWidth="4px" />
					<Text fontSize="xl">Finalizing your creator account...</Text>
				</VStack>
			) : error ? (
				<VStack gap={6}>
					<Text color="red.500" fontSize="xl">
						{error}
					</Text>
					<Text>Please try again or contact support.</Text>
				</VStack>
			) : (
				<VStack gap={6}>
					<Text fontSize="xl">Redirecting to your profile...</Text>
					<Spinner size="md" color="blue.500" />
				</VStack>
			)}
		</Flex>
	);
}
