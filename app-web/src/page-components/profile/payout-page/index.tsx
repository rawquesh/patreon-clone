"use client";
import { Button } from "@/components/ui/button";
import { Box, Flex, Heading, Stack, Text } from "@chakra-ui/react";
import React, { useState, useEffect } from "react";
import DetailsModal from "./details-modal";
import api from "@/lib/api";
import { toaster } from "@/components/ui/toaster";
import { getErrorMessage } from "@/lib/toasts";
import { useAuth } from "@/context/auth.provider";

const PayoutPage: React.FC = () => {
  const [isOnboarded, setIsOnboarded] = useState<boolean | null>(null);
  const [availableBalance, setAvailableBalance] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;
    const fetchPayoutInfo = async () => {
      setIsLoading(true);
      try {
        const [balanceResponse] = await Promise.all([
          api.get<{
            available: number; // Amount available for immediate payout (in dollars)
            pending: number; // Amount pending to be available (in dollars)
          }>("/payments/available"),
        ]);

        const statusData = user.hasCompletedStripeOnboarding;
        const balanceData = balanceResponse.data;

        setIsOnboarded(statusData);
        setAvailableBalance(
          balanceData.available ?? 0
        );
      } catch (error: any) {
        console.error("Error fetching payout info:", error);
        toaster.create({
          title: "Failed to load payout information",
          description: getErrorMessage(error, "Please try again later"),
          type: "error",
          duration: 4000,
        });
        setIsOnboarded(false);
        setAvailableBalance(0);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPayoutInfo();
  }, [user]);

  const handleConnectStripe = async () => {
    setIsProcessing(true);
    try {
      const response = await api.post<{ stripeOnboardingUrl: string }>(
        "/users/publish-creator",
        {
          acceptTerms: true,
        }
      );

      const data = response.data;

      toaster.create({
        title: "Success",
        description: "Redirecting to Stripe to complete your onboarding",
        type: "success",
        duration: 3000,
      });

      window.location.href = data.stripeOnboardingUrl;
    } catch (error: any) {
      console.error("Error initiating Stripe onboarding:", error);
      toaster.create({
        title: "Failed to connect with Stripe",
        description: getErrorMessage(error, "Please try again later"),
        type: "error",
        duration: 4000,
      });
      setIsProcessing(false);
    }
  };

  const handleReceiveFunds = async () => {
    if (availableBalance <= 0) return;
    setIsProcessing(true);
    try {
      const response = await api.post<{
        success: boolean;
        message: string;
        amount: number;
        timestamp: string;
      }>("/payments/transfer");

      const data = response.data;

      // toast.success(data.message || "Payout initiated successfully!");
      toaster.create({
        title: "Success",
        description: data.message,
        type: "success",
        duration: 3000,
      });

      setAvailableBalance(0);
    } catch (error: any) {
      console.error("Error initiating disbursement:", error);
      toaster.create({
        title: "Payout failed",
        description: getErrorMessage(error, "Please try again later"),
        type: "error",
        duration: 4000,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  return (
    <Box pt={"56px"} maxW={"1024px"} w={"90vw"} mx={"auto"}>
      <Heading fontSize={"xl"} fontWeight={600}>
        Payouts
      </Heading>
      <Flex
        alignItems={"center"}
        boxShadow={"md"}
        rounded={"8px"}
        mt={4}
        bg={"white"}
        p={"24px"}
        justifyContent={"space-between"}
        flexDir={{ base: "column", lg: "row" }}
        gap={6}
      >
        <Stack gap={0} px={"12px"} mx={"12px"}>
          <Text fontSize={"xs"} fontWeight={600}>
            Available to withdraw
          </Text>
          <Text fontSize={"4xl"} fontWeight={600}>
            {isLoading ? "Loading..." : formatCurrency(availableBalance)}
          </Text>
          <DetailsModal />
        </Stack>
        {isLoading ? (
          <Button loading disabled>
            Loading...
          </Button>
        ) : isOnboarded === null ? (
          <Button disabled>Error loading status</Button>
        ) : isOnboarded ? (
          <Button
            onClick={handleReceiveFunds}
            disabled={availableBalance <= 0 || isProcessing}
            loading={isProcessing}
          >
            Receive funds
          </Button>
        ) : (
          <Button
            onClick={handleConnectStripe}
            disabled={isProcessing}
            loading={isProcessing}
          >
            Connect with Stripe
          </Button>
        )}
      </Flex>
    </Box>
  );
};

export default PayoutPage;
