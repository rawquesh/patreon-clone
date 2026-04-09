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
      borderRight={"1px solid"}
      borderColor={"gray.200"}
      px={"22px"}
      py={"30px"}
      w={"300px"}
      display={{ base: "none", lg: "flex" }}
    >
      <HStack mb={6}>
        <Image src="/icons/logo.png" h={"32px"} alt="logo" />
        <VStack align="start" gap={0}>
          <Heading size="2xl" color={branding.colors.textHeader}>
            {branding.name}
          </Heading>
          {/* <Text fontSize="12px" color="#5A5954">
            Creator Hub
          </Text> */}
        </VStack>
      </HStack>

      {navItems[mode].map((item) => (
        <NavLinkItem key={item.link} {...item} />
      ))}
      {mode === "creator" ? (
        <CreateModal outline />
      ) : (
        <>
          <Text
            mt={5}
            color={"star.600"}
            px={"15px"}
            fontSize={"sm"}
            fontWeight={600}
          >
            Memberships
          </Text>
          <Box overflow={"scroll"}>
            {isLoadingSubscriptions ? (
              <>
                <Skeleton h="40px" mx="15px" my="5px" borderRadius="8px" />
                <Skeleton h="40px" mx="15px" my="5px" borderRadius="8px" />
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
              <Text fontSize="sm" color="gray.500" px="15px">
                No active memberships
              </Text>
            )}
          </Box>
        </>
      )}
      {isLoadingUser ? (
        <Skeleton mt={"auto"} h={"52px"} w={"100%"} />
      ) : (
        <Flex justifyContent={"space-between"} mt={"auto"}>
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
