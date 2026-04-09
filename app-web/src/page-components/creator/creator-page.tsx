"use client";

import React, { Suspense, useEffect, useState } from "react";
import Cover from "./cover";
import ActionBar from "./action-bar";
import CreatorDetails from "./creator-details";
import PurchaseMembershipBanner from "./purchase-membership-banner";
import CreatorTabs from "./creator-tabs";
import {
  useCreator,
  recordCreatorVisit,
} from "@/lib/backend-services/creator-service";
import { useSubscription } from "@/context/subscription.provider";
import { Spinner, Stack, Center } from "@chakra-ui/react";

const CreatorPage: React.FC = () => {
  const [shouldRender, setShouldRender] = useState(false);

  const { data: creator, isLoading: creatorLoading } = useCreator();
  const { subscriptions, isLoading: subscriptionLoading } = useSubscription();

  // Directly determine if user is subscribed to this creator
  const isSubscribed = Boolean(
    creator &&
      subscriptions.some(
        (subscription) =>
          subscription.creator._id === creator._id &&
          subscription.status === "active"
      )
  );

  useEffect(() => {
    if (typeof window !== undefined) {
      setShouldRender(true);
    }
  }, []);

  useEffect(() => {
    if (creator?._id) {
      recordCreatorVisit(creator._id);
    }
  }, [creator?._id]);

  if (!shouldRender) {
    return null;
  }

  if (creatorLoading || subscriptionLoading) {
    return (
      <Center h="100vh">
        <Spinner size="xl" css={{ color: "hsl(142, 76%, 36%)" }} />
      </Center>
    );
  }

  if (!creator) {
    return (
      <Center h="100vh">
        <Stack textAlign="center" gap={4}>
          <h1>Creator not found</h1>
          <p>
            The creator you&apos;re looking for doesn&apos;t exist or has been
            removed.
          </p>
        </Stack>
      </Center>
    );
  }

  return (
    <div>
      <Cover src={creator.profileCover || "/icons/cover.png"} />
      <ActionBar creator={creator} isMember={isSubscribed} />
      <CreatorDetails creator={creator} isMember={isSubscribed} />
      <Suspense>
        <CreatorTabs
          creatorUsername={creator.creatorUsername}
          creatorId={creator._id}
        />
      </Suspense>
      {!isSubscribed && <PurchaseMembershipBanner creatorId={creator._id} />}
    </div>
  );
};

export default CreatorPage;
