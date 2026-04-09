"use client";
import React, { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Box,
  Center,
  Spinner,
  Stack,
  Text,
  SimpleGrid,
  Heading,
} from "@chakra-ui/react";
import { useCreator } from "@/lib/backend-services/creator-service";
import {
  useCreatorMemberships,
  useSubscriptionStatus,
  useSubscribeToFreeMembership,
} from "@/lib/backend-services/subscription-service";
import { PricingCard } from "@/page-components/creator/pricing-card";
import { Button } from "@/components/ui/button";
import { branding } from "@/config/branding";

interface FreeMembershipCardProps {
  creatorId: string;
  creatorName: string;
  onJoinClick: () => void;
  isLoading: boolean;
}

const FreeMembershipCard: React.FC<FreeMembershipCardProps> = ({
  creatorName,
  onJoinClick,
  isLoading,
}) => {
  return (
    <Box
      w={{ base: "100%", md: "317px" }}
      maxW={"350px"}
      mx={"auto"}
      overflow={"hidden"}
      rounded={"16px"}
      mb={4}
      position="relative"
      className="glass-card border-gradient"
    >
      <Box
        position="absolute"
        top={0}
        right={0}
        css={{ background: "var(--gradient-primary)" }}
        color="white"
        px={3}
        py={1.5}
        fontSize="xs"
        fontWeight={600}
        zIndex={2}
        borderBottomLeftRadius="md"
      >
        Free
      </Box>

      <Stack gap={0} px={"16px"} py={"24px"}>
        <Text
          fontSize={"xl"}
          fontWeight={600}
          css={{ color: "hsl(222.2, 47.4%, 11.2%)" }}
        >
          Free Membership
        </Text>
        <Stack direction="row" gap={4} align="baseline">
          <Text fontSize={"sm"} css={{ color: "hsl(215.4, 16.3%, 46.9%)" }}>
            <Text
              as="span"
              fontSize={"3xl"}
              fontWeight={600}
              css={{
                background: "linear-gradient(135deg, hsl(211, 71%, 43%), hsl(335, 27%, 64%))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              $0
            </Text>
            /month
          </Text>
        </Stack>
        <Button
          my={2}
          onClick={onJoinClick}
          loading={isLoading}
          className="btn-gradient"
          css={{ fontWeight: 600 }}
        >
          Join for free
        </Button>

        <Box fontSize={"sm"} letterSpacing={"wide"} my={3}>
          <Text mb={2} css={{ color: "hsl(215.4, 16.3%, 46.9%)" }}>
            Join {creatorName}&apos;s community for free and get:
          </Text>
          <Stack gap={2}>
            {[
              "Access to public posts",
              "Join the community",
              "Get notified of new content",
            ].map((item) => (
              <Text
                key={item}
                display="flex"
                alignItems="center"
                css={{ color: "hsl(215.4, 16.3%, 46.9%)" }}
              >
                <Box
                  as="span"
                  mr={2}
                  css={{
                    color: "hsl(160, 60%, 45%)",
                    fontWeight: "bold",
                  }}
                >
                  ✓
                </Box>
                {item}
              </Text>
            ))}
          </Stack>
        </Box>
      </Stack>
    </Box>
  );
};

const MembershipPage: React.FC = () => {
  const params = useParams();
  const creatorId = params.creatorId as string;
  const router = useRouter();

  const { data: creator, isLoading: creatorLoading } = useCreator(creatorId);
  const { data: subscriptionData, isLoading: subscriptionLoading } =
    useSubscriptionStatus(creatorId);
  const { data: memberships = [], isLoading: membershipsLoading } =
    useCreatorMemberships(creatorId);
  const freeSubscribeMutation = useSubscribeToFreeMembership();

  useEffect(() => {
    if (subscriptionData?.isSubscribed) {
      router.push(`/creator/${creatorId}`);
    }
  }, [creatorId, subscriptionData, router]);

  const handleJoinFree = () => {
    freeSubscribeMutation.mutate(creatorId, {
      onSuccess: () => {
        router.push(`/creator/${creatorId}`);
      },
    });
  };

  const membershipCards = memberships.map((membership) => ({
    image: membership.coverImage || "/images/pricing-cards/default.jpg",
    title: membership.name,
    pricePerMonth: membership.monthlyRate,
    pricePerYear: membership.yearlyPrice,
    limited: membership.isLimited || false,
    seatsLeft: membership.seatsLeft || 0,
    description: membership.description,
    featured: membership.isFeatured || false,
    membershipId: membership.id,
    creatorId,
  }));

  if (creatorLoading || membershipsLoading || subscriptionLoading) {
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

  if (!creator) {
    return (
      <Center h="calc(100vh - 80px)">
        <Text css={{ color: "hsl(215.4, 16.3%, 46.9%)" }}>Creator not found</Text>
      </Center>
    );
  }

  return (
    <Box maxW="1200px" mx="auto" px={4} py={8} className="animate-fade-in-up">
      <Stack gap={8} align="center">
        <Stack textAlign="center" gap={2} maxW="700px">
          <Heading
            fontSize="3xl"
            fontWeight={700}
            css={{
              background: "linear-gradient(135deg, hsl(211, 71%, 43%), hsl(335, 27%, 64%))",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Join {creator.displayName}&apos;s Community
          </Heading>
          <Text
            fontSize="md"
            css={{ color: "hsl(215.4, 16.3%, 46.9%)" }}
          >
            {creator.creatorHeadline ||
              "Unlock exclusive content and join a growing community."}
          </Text>
        </Stack>

        <SimpleGrid
          columns={{ base: 1, md: 2, lg: 3 }}
          gap={8}
          w="full"
          justifyItems="center"
        >
          <FreeMembershipCard
            creatorId={creatorId}
            creatorName={creator.displayName}
            onJoinClick={handleJoinFree}
            isLoading={freeSubscribeMutation.isPending}
          />

          {membershipCards.length > 0 ? (
            membershipCards.map((membership) => (
              <PricingCard key={membership.membershipId} {...membership} />
            ))
          ) : (
            <Box
              textAlign="center"
              p={4}
              className="glass-card"
              borderRadius="16px"
              gridColumn={{ md: "span 2" }}
            >
              <Text css={{ color: "hsl(215.4, 16.3%, 46.9%)" }} my={2}>
                No paid membership options available yet.
              </Text>
            </Box>
          )}
        </SimpleGrid>
      </Stack>
    </Box>
  );
};

export default MembershipPage;
