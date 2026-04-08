"use client";
import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Box,
  Button as ChakraButton,
  Center,
  Container,
  Separator,
  Flex,
  Heading,
  Image,
  Spinner,
  Stack,
  Text,
} from "@chakra-ui/react";
import { useCreator } from "@/lib/backend-services/creator-service";
import {
  useMembershipDetails,
  useSubscribeToPaidMembership,
  useSubscriptionStatus,
} from "@/lib/backend-services/subscription-service";
import { useUser } from "@/lib/backend-services/user-service";
import { IMembership } from "@/typings/ISubscription";
import { toaster } from "@/components/ui/toaster";

const MembershipCheckoutPage: React.FC = () => {
  const params = useParams();
  const creatorId = params.creatorId as string;
  const membershipId = params.membershipId as string;
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);

  const { data: membership, isLoading: membershipLoading } =
    useMembershipDetails(membershipId);
  const { data: creator, isLoading: creatorLoading } = useCreator(creatorId);
  const { data: user } = useUser();
  const { data: subscriptionData } = useSubscriptionStatus(creatorId);
  const subscribeMutation = useSubscribeToPaidMembership();

  useEffect(() => {
    if (subscriptionData?.isSubscribed) {
      router.push(`/creator/${creatorId}`);
      toaster.create({
        title: "Already subscribed",
        description: "You're already a member of this creator's community",
        type: "info",
        duration: 5000,
      });
    }
  }, [subscriptionData, creatorId, router]);

  const handleSubscribe = async () => {
    if (!user || !membership) return;

    setIsProcessing(true);
    subscribeMutation.mutate(
      {
        membershipId,
      },
      {
        onSuccess: () => {
          toaster.create({
            title: "Subscription successful",
            description: `You are now a member of ${creator?.displayName}'s ${membership.name} tier`,
            type: "success",
            duration: 5000,
          });
          // router.push(`/creator/${creatorId}`);
        },
        onError: (error: any) => {
          toaster.create({
            title: "Subscription failed",
            description:
              error.message || "An error occurred during subscription",
            type: "error",
            duration: 5000,
          });
          setIsProcessing(false);
        },
      }
    );
  };

  // Format price consistently
  const getMonthlyPrice = (mem: IMembership | undefined): number => {
    if (!mem) return 0;
    return mem.monthlyRate || mem.monthlyPrice || 0;
  };

  if (membershipLoading || creatorLoading) {
    return (
      <Center h="calc(100vh - 80px)">
        <Spinner size="xl" color="green.500" />
      </Center>
    );
  }

  if (!membership || !creator) {
    return (
      <Center h="calc(100vh - 80px)">
        <Text>Membership or creator not found</Text>
      </Center>
    );
  }

  // Safely get seats left value
  const seatsLeft = membership.seatsLeft || 0;

  return (
    <Container maxW="container.md" py={8}>
      <Heading as="h1" mb={6} fontSize="2xl" textAlign="center">
        Complete your subscription
      </Heading>

      <Flex
        direction={{ base: "column", md: "row" }}
        gap={8}
        align="flex-start"
      >
        {/* Membership details */}
        <Box flex="1">
          <Box borderWidth="1px" borderRadius="lg" overflow="hidden" mb={4}>
            {membership.coverImage && (
              <Image
                src={membership.coverImage}
                alt={membership.name}
                height={200}
                width="100%"
                objectFit="cover"
              />
            )}

            <Box p={4}>
              <Heading as="h2" size="md" mb={2}>
                {membership.name}
              </Heading>

              <Text mb={3} color="gray.600">
                by {creator.displayName}
              </Text>

              <Text mb={4} fontSize="sm">
                {membership.description}
              </Text>

              {membership.isLimited && (
                <Text
                  fontSize="sm"
                  color={seatsLeft > 5 ? "green.500" : "orange.500"}
                >
                  Limited membership - {seatsLeft} spots remaining
                </Text>
              )}
            </Box>
          </Box>
        </Box>

        {/* Order summary */}
        <Box
          flex="1"
          borderWidth="1px"
          borderRadius="lg"
          p={4}
          position="sticky"
          top="20px"
        >
          <Heading as="h3" size="md" mb={4}>
            Order Summary
          </Heading>

          <Stack gap={3}>
            <Flex justify="space-between">
              <Text>{membership.name} Membership</Text>
              <Text>${getMonthlyPrice(membership)}/month</Text>
            </Flex>

            {/* Trial period is conditional and might not be available */}
            {membership.isTrial && (
              <Flex justify="space-between" color="green.500">
                <Text>Free trial period</Text>
                <Text>{membership.trialDurationDays || 7} days</Text>
              </Flex>
            )}

            <Separator />

            <Flex justify="space-between" fontWeight="bold">
              <Text>Total billed now</Text>
              <Text>
                {membership.isTrial
                  ? "$0.00"
                  : `$${getMonthlyPrice(membership).toFixed(2)}`}
              </Text>
            </Flex>

            {membership.isTrial && (
              <Text fontSize="sm" color="gray.500">
                After your trial ends, you&apos;ll be charged $
                {getMonthlyPrice(membership).toFixed(2)}/month unless you
                cancel.
              </Text>
            )}

            <ChakraButton
              colorScheme="green"
              size="lg"
              mt={4}
              onClick={handleSubscribe}
              _loading={{ opacity: 0.8 }}
              disabled={isProcessing}
            >
              {isProcessing
                ? "Processing..."
                : membership.isTrial
                ? "Start Free Trial"
                : "Subscribe Now"}
            </ChakraButton>

            <Text fontSize="xs" color="gray.500" textAlign="center" mt={2}>
              By subscribing, you agree to our Terms of Service and Privacy
              Policy
            </Text>
          </Stack>
        </Box>
      </Flex>
    </Container>
  );
};

export default MembershipCheckoutPage;
