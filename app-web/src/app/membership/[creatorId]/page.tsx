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
      bg={"white"}
      shadow={"md"}
      overflow={"hidden"}
      rounded={"12px"}
      color={"star.800"}
      mb={4}
      position="relative"
      border={`2px solid ${branding.colors.success}`}
    >
      <Box
        position="absolute"
        top={0}
        right={0}
        bg=branding.colors.success
        color="white"
        px={2}
        py={1}
        fontSize="xs"
        zIndex={2}
        borderBottomLeftRadius="md"
      >
        Free
      </Box>

      <Stack gap={0} px={"16px"} py={"24px"}>
        <Text fontSize={"xl"} fontWeight={600}>
          Free Membership
        </Text>
        <Stack direction="row" gap={4} align="baseline">
          <Text fontSize={"sm"} color={"star.600"}>
            <Text
              as="span"
              color={"star.800"}
              fontSize={"3xl"}
              fontWeight={600}
            >
              $0
            </Text>
            /month
          </Text>
        </Stack>
        <Button
          my={2}
          onClick={onJoinClick}
          colorScheme="green"
          loading={isLoading}
        >
          Join for free
        </Button>

        <Box fontSize={"sm"} letterSpacing={"wide"} my={3}>
          <Text mb={2}>
            Join {creatorName}&apos;s community for free and get:
          </Text>
          <Stack gap={2}>
            <Text display="flex" alignItems="center">
              <Box as="span" mr={2}>
                ✓
              </Box>
              Access to public posts
            </Text>
            <Text display="flex" alignItems="center">
              <Box as="span" mr={2}>
                ✓
              </Box>
              Join the community
            </Text>
            <Text display="flex" alignItems="center">
              <Box as="span" mr={2}>
                ✓
              </Box>
              Get notified of new content
            </Text>
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

  // Redirect to creator page if user is already subscribed
  useEffect(() => {
    if (subscriptionData?.isSubscribed) {
      router.push(`/creator/${creatorId}`);
    }
  }, [creatorId, subscriptionData, router]);

  const handleJoinFree = () => {
    // First check if there's an existing free membership tier
    // const freeMembership = memberships.find(
    //   (m) => m.monthlyRate === 0 || m.monthlyPrice === 0
    // );

    freeSubscribeMutation.mutate(creatorId, {
      onSuccess: () => {
        router.push(`/creator/${creatorId}`);
      },
    });
  };

  // Format membership data for PricingCard components
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
        <Spinner size="xl" color="green.500" />
      </Center>
    );
  }

  if (!creator) {
    return (
      <Center h="calc(100vh - 80px)">
        <Text>Creator not found</Text>
      </Center>
    );
  }

  return (
    <Box maxW="1200px" mx="auto" px={4} py={8}>
      <Stack gap={8} align="center">
        <Stack textAlign="center" gap={2} maxW="700px">
          <Heading fontSize="3xl" fontWeight={700}>
            Join {creator.displayName}&apos;s Community
          </Heading>
          <Text fontSize="md" color="gray.600">
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
          {/* Free membership option */}
          <FreeMembershipCard
            creatorId={creatorId}
            creatorName={creator.displayName}
            onJoinClick={handleJoinFree}
            isLoading={freeSubscribeMutation.isPending}
          />

          {/* Paid membership options */}
          {membershipCards.length > 0 ? (
            membershipCards.map((membership) => (
              <PricingCard key={membership.membershipId} {...membership} />
            ))
          ) : (
            <Box
              textAlign="center"
              p={4}
              bg="gray.50"
              borderRadius="md"
              gridColumn={{ md: "span 2" }}
            >
              <Text color="gray.500" my={2}>
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
