"use client";
import { useAuth } from "@/context/auth.provider";
import { Center, Flex, Spinner, Text, VStack, Box } from "@chakra-ui/react";
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
				<Spinner
					size="xl"
					css={{
						color: "hsl(211, 71%, 43%)",
						borderWidth: "3px",
					}}
				/>
			</Center>
		);
	}

	return (
		<Flex direction="column" h="100vh" justify="center" align="center" className="animate-fade-in-up">
			{isProcessing ? (
				<VStack gap={6}>
					<Box className="glass-card" p={8} borderRadius="20px" css={{ boxShadow: "var(--glow-primary)" }}>
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
					</Box>
					<Text fontSize="xl" fontWeight={500} css={{ color: "hsl(222.2, 47.4%, 11.2%)" }}>
						Finalizing your creator account...
					</Text>
				</VStack>
			) : error ? (
				<VStack gap={6}>
					<Box className="glass-card" p={8} borderRadius="20px">
						<Text css={{ color: "hsl(0, 84.2%, 60.2%)" }} fontSize="xl" fontWeight={500}>
							{error}
						</Text>
						<Text mt={4} css={{ color: "hsl(215.4, 16.3%, 46.9%)" }}>
							Please try again or contact support.
						</Text>
					</Box>
				</VStack>
			) : (
				<VStack gap={6}>
					<Box className="glass-card" p={8} borderRadius="20px">
						<Text fontSize="xl" fontWeight={500} css={{ color: "hsl(222.2, 47.4%, 11.2%)" }}>
							Redirecting to your profile...
						</Text>
						<Spinner mt={4} size="md" css={{ color: "hsl(211, 71%, 43%)" }} />
					</Box>
				</VStack>
			)}
		</Flex>
	);
}
