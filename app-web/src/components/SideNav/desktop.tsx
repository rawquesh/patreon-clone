"use client";
import {
  Box,
  Flex,
  Heading,
  HStack,
  Image,
  Skeleton,
  Stack,
  Text,
  VStack,
} from "@chakra-ui/react";
import React from "react";
import { navItems } from "./data";
import NavLinkItem from "./nav-link-item";
import { branding } from "@/config/branding";
import UserAvatar from "./user-avatar";
import NavPopover from "./nav-popover";
import MembershipItem from "./membership-item";
import { useAuth } from "@/context/auth.provider";
import CreateModal from "@/page-components/profile/profile-page/create-modal";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { ISubscription as Subscription } from "@/typings/ISubscription";

interface UserSubscriptionsResponse {
  subscriptions: Subscription[];
  total: number;
}

interface Props {
  mode: "creator" | "user";
}

const getUniqueSubscriptionsByCreator = (
  subscriptions: Subscription[]
): Subscription[] => {
  const seenCreatorIds = new Set<string>();

  return subscriptions.filter((subscription) => {
    const creatorId = subscription.creator._id;

    if (seenCreatorIds.has(creatorId)) {
      return false;
    } else {
      seenCreatorIds.add(creatorId);
      return true;
    }
  });
};

const DesktopSidenav: React.FC<Props> = ({ mode }) => {
  const { user, isLoadingUser } = useAuth();
  const { data: subscriptionsData, isLoading: isLoadingSubscriptions } =
    useQuery({
      queryKey: ["userSubscriptions", "active"],
      queryFn: async () => {
        const { data } = await api.get<UserSubscriptionsResponse>(
          "/users/subscriptions?status=active"
        );
        return data;
      },
    });

  const subs: Subscription[] = getUniqueSubscriptionsByCreator(
    subscriptionsData?.subscriptions || []
  );

  return (
    <Stack
      pos={"fixed"}
      h={"100vh"}
      w={"280px"}
      display={{ base: "none", lg: "flex" }}
      className="glass-card-static"
      css={{
        // Gradient top bar accent
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "2px",
          background: "var(--gradient-primary)",
        },
        // Subtle gradient background
        background: "linear-gradient(180deg, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.6) 100%)",
      }}
      py={"24px"}
      px={"20px"}
      gap={0}
      zIndex={50}
    >
      {/* Logo */}
      <HStack mb={8} gap={3}>
        <Box
          w={"36px"}
          h={"36px"}
          borderRadius={"10px"}
          background="var(--gradient-primary)"
          display={"flex"}
          alignItems={"center"}
          justifyContent={"center"}
          flexShrink={0}
        >
          <Image src="/icons/logo.png" alt="logo" boxSize={"22px"} />
        </Box>
        <VStack align="start" gap={0}>
          <Heading
            size="2xl"
            css={{
              background: "linear-gradient(135deg, hsl(211, 71%, 43%), hsl(335, 27%, 64%))",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
            fontSize={"1.25rem"}
            fontWeight={700}
            lineHeight={1}
          >
            {branding.name}
          </Heading>
        </VStack>
      </HStack>

      {/* Navigation Items */}
      <Stack gap={1} flex={1} overflow={"auto"} className="no-scrollbar">
        {navItems[mode].map((item) => (
          <NavLinkItem key={item.link} {...item} />
        ))}
      </Stack>

      {/* Creator Create Button */}
      {mode === "creator" && (
        <Box mb={4}>
          <CreateModal outline />
        </Box>
      )}

      {/* Memberships Section */}
      {mode === "user" && (
        <>
          <Text
            mt={2}
            mb={2}
            css={{
              color: "hsl(215.4, 16.3%, 46.9%)",
              fontSize: "0.7rem",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
            }}
            px={"4px"}
          >
            Memberships
          </Text>
          <Box
            maxH={"160px"}
            overflow={"auto"}
            mb={4}
            css={{ "&::-webkit-scrollbar": { width: "4px" } }}
          >
            {isLoadingSubscriptions ? (
              <>
                <Skeleton h="36px" mx="4px" my="4px" borderRadius="8px" />
                <Skeleton h="36px" mx="4px" my="4px" borderRadius="8px" />
              </>
            ) : subscriptionsData?.subscriptions &&
              subscriptionsData.subscriptions.length > 0 ? (
              [...subs].map((subscription) => (
                <MembershipItem
                  key={subscription._id}
                  title={subscription.creator.creatorUsername}
                  link={`/creator/${subscription.creator.creatorUsername}`}
                  imageUrl={subscription.creator.profilePicture}
                />
              ))
            ) : (
              <Text
                fontSize="sm"
                css={{ color: "hsl(215.4, 16.3%, 46.9%)" }}
                px={"4px"}
              >
                No active memberships
              </Text>
            )}
          </Box>
        </>
      )}

      {/* User Avatar + Settings */}
      {isLoadingUser ? (
        <Skeleton mt={"auto"} h={"48px"} w={"100%"} borderRadius="10px" />
      ) : (
        <Flex
          justifyContent={"space-between"}
          mt={"auto"}
          pt={4}
          borderTopWidth={"1px"}
          borderColor={"hsl(210, 30%, 88%)"}
          alignItems={"center"}
          gap={3}
        >
          <UserAvatar
            mode={mode}
            avatarUrl={user?.profilePicture}
            username={user?.firstName}
            isCreator={Boolean(user?.isCreator)}
          />
          <NavPopover />
        </Flex>
      )}
    </Stack>
  );
};

export default DesktopSidenav;
