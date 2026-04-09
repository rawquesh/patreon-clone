"use client";
import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Box,
  Button as ChakraButton,
  Center,
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

  const getMonthlyPrice = (mem: IMembership | undefined): number => {
    if (!mem) return 0;
    return mem.monthlyRate || mem.monthlyPrice || 0;
  };

  if (membershipLoading || creatorLoading) {
    return (
      <Center h="calc(100vh - 80px)">
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

  if (!membership || !creator) {
    return (
      <Center h="calc(100vh - 80px)">
        <Text css={{ color: "hsl(215.4, 16.3%, 46.9%)" }}>
          Membership or creator not found
        </Text>
      </Center>
    );
  }

  const seatsLeft = membership.seatsLeft || 0;

  return (
    <Box
      maxW="768px"
      mx="auto"
      py={8}
      px={{ base: 4, md: 6 }}
      className="animate-fade-in-up"
    >
      <Heading
        as="h1"
        mb={6}
        fontSize="2xl"
        textAlign="center"
        css={{
          background: "linear-gradient(135deg, hsl(211, 71%, 43%), hsl(335, 27%, 64%))",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
        }}
      >
        Complete your subscription
      </Heading>

      <Flex
        direction={{ base: "column", lg: "row" }}
        gap={8}
        align="flex-start"
      >
        <Box flex="1">
          <Box
            className="glass-card"
            borderRadius="16px"
            overflow="hidden"
            mb={4}
          >
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
              <Heading
                as="h2"
                size="md"
                mb={2}
                css={{ color: "hsl(222.2, 47.4%, 11.2%)" }}
              >
                {membership.name}
              </Heading>

              <Text mb={3} css={{ color: "hsl(215.4, 16.3%, 46.9%)" }}>
                by {creator.displayName}
              </Text>

              <Text mb={4} fontSize="sm" css={{ color: "hsl(215.4, 16.3%, 46.9%)" }}>
                {membership.description}
              </Text>

              {membership.isLimited && (
                <Text
                  fontSize="sm"
                  css={{
                    color: seatsLeft > 5 ? "hsl(160, 60%, 45%)" : "hsl(38, 92%, 50%)",
                  }}
                >
                  Limited membership - {seatsLeft} spots remaining
                </Text>
              )}
            </Box>
          </Box>
        </Box>

        <Box
          flex="1"
          className="glass-card"
          borderRadius="16px"
          p={6}
          position="sticky"
          top="20px"
        >
          <Heading
            as="h3"
            size="md"
            mb={4}
            css={{ color: "hsl(222.2, 47.4%, 11.2%)" }}
          >
            Order Summary
          </Heading>

          <Stack gap={3}>
            <Flex justify="space-between">
              <Text css={{ color: "hsl(215.4, 16.3%, 46.9%)" }}>
                {membership.name} Membership
              </Text>
              <Text
                fontWeight={600}
                css={{
                  background: "linear-gradient(135deg, hsl(211, 71%, 43%), hsl(335, 27%, 64%))",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                ${getMonthlyPrice(membership)}/month
              </Text>
            </Flex>

            {membership.isTrial && (
              <Flex justify="space-between" css={{ color: "hsl(160, 60%, 45%)" }}>
                <Text>Free trial period</Text>
                <Text>{membership.trialDurationDays || 7} days</Text>
              </Flex>
            )}

            <Separator css={{ borderColor: "hsl(215.4, 16.3%, 46.9% / 0.15)" }} />

            <Flex justify="space-between" fontWeight="bold">
              <Text css={{ color: "hsl(222.2, 47.4%, 11.2%)" }}>Total billed now</Text>
              <Text
                css={{
                  background: "linear-gradient(135deg, hsl(211, 71%, 43%), hsl(335, 27%, 64%))",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  fontWeight: "bold",
                }}
              >
                {membership.isTrial
                  ? "$0.00"
                  : `$${getMonthlyPrice(membership).toFixed(2)}`}
              </Text>
            </Flex>

            {membership.isTrial && (
              <Text fontSize="sm" css={{ color: "hsl(215.4, 16.3%, 46.9%)" }}>
                After your trial ends, you&apos;ll be charged $
                {getMonthlyPrice(membership).toFixed(2)}/month unless you
                cancel.
              </Text>
            )}

            <ChakraButton
              size="lg"
              mt={4}
              onClick={handleSubscribe}
              _loading={{ opacity: 0.8 }}
              disabled={isProcessing}
              className="btn-gradient"
              css={{ fontWeight: 600 }}
            >
              {isProcessing
                ? "Processing..."
                : membership.isTrial
                ? "Start Free Trial"
                : "Subscribe Now"}
            </ChakraButton>

            <Text
              fontSize="xs"
              css={{ color: "hsl(215.4, 16.3%, 46.9%)" }}
              textAlign="center"
              mt={2}
            >
              By subscribing, you agree to our Terms of Service and Privacy
              Policy
            </Text>
          </Stack>
        </Box>
      </Flex>
    </Box>
  );
};

export default MembershipCheckoutPage;
