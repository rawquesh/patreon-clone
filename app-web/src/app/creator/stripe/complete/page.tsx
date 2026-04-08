"use client";
import { useAuth } from "@/context/auth.provider";
import { Center, Spinner, Text } from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
// import api from "@/lib/api";

export default function StripeComplete() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    router.push("/profile");
    // const completeOnboarding = async () => {
    // 	try {
    // 		await api.post("/users/stripe-onboarding/complete");
    // 	} catch (error) {
    // 		console.error("Failed to complete onboarding:", error);
    // 		router.push("/onboarding/creator");
    // 	}
    // };

    // if (user?.stripeConnectAccountId) {
    // 	completeOnboarding();
    // }
  }, [user, router]);

  return (
    <Center h="100vh" flexDirection="column" gap={4}>
      <Spinner size="xl" color="blue.500" borderWidth="4px" />
      <Text fontSize="lg">Completing your setup...</Text>
    </Center>
  );
}
