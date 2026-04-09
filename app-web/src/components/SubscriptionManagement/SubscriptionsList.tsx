"use client";

import React, { useState } from "react";
import {
  Box,
  Button,
  Flex,
  Heading,
  SimpleGrid,
  Spinner,
  Stack,
  Tabs,
  Text,
} from "@chakra-ui/react";
import { useUserSubscriptions } from "@/lib/backend-services/subscription-service";
import { SubscriptionStatus } from "@/typings/ISubscription";
import SubscriptionCard from "./SubscriptionCard";

const SubscriptionsList: React.FC = () => {
  const [status, setStatus] = useState<SubscriptionStatus | undefined>(
    SubscriptionStatus.ACTIVE
  );

  const { data, isLoading, isError, refetch } = useUserSubscriptions({
    status: status,
  });

  const handleTabChange = (value: string) => {
    switch (value) {
      case "active":
        setStatus(SubscriptionStatus.ACTIVE);
        break;
      case "cancelled":
        setStatus(SubscriptionStatus.CANCELLED);
        break;
      case "all":
        setStatus(undefined);
        break;
      default:
        setStatus(SubscriptionStatus.ACTIVE);
    }
  };

  const filteredSubscriptions = data?.subscriptions?.filter((sub) => {
    if (status === SubscriptionStatus.ACTIVE) {
      return sub.status === SubscriptionStatus.ACTIVE;
    }
    if (status === SubscriptionStatus.CANCELLED) {
      return sub.status === SubscriptionStatus.CANCELLED;
    }
    return true;
  }) ?? [];

  const handleSubscriptionCancelled = () => {
    refetch();
  };

  return (
    <Box>
      <Heading size="lg" mb={6}>
        Your Subscriptions
      </Heading>

      <Tabs.Root
        onValueChange={(e) => handleTabChange(e.value)}
        defaultValue="active"
        mb={6}
      >
        <Tabs.List className="glass-card-static" css={{ padding: "4px" }}>
          <Tabs.Trigger value="active" css={{ "&[data-state=active]": { background: "var(--gradient-primary)", color: "white", borderRadius: "full" }, "&[data-state=inactive]": { color: "hsl(215.4, 16.3%, 46.9%)", borderRadius: "full" } }}>Active</Tabs.Trigger>
          <Tabs.Trigger value="cancelled" css={{ "&[data-state=active]": { background: "var(--gradient-primary)", color: "white", borderRadius: "full" }, "&[data-state=inactive]": { color: "hsl(215.4, 16.3%, 46.9%)", borderRadius: "full" } }}>Cancelled</Tabs.Trigger>
          <Tabs.Trigger value="all" css={{ "&[data-state=active]": { background: "var(--gradient-primary)", color: "white", borderRadius: "full" }, "&[data-state=inactive]": { color: "hsl(215.4, 16.3%, 46.9%)", borderRadius: "full" } }}>All</Tabs.Trigger>
        </Tabs.List>

        <Tabs.Content value="active">
          <SubscriptionsContent
            isLoading={isLoading}
            isError={isError}
            subscriptions={filteredSubscriptions}
            emptyType="active"
            onRetry={refetch}
            onCancelled={handleSubscriptionCancelled}
          />
        </Tabs.Content>

        <Tabs.Content value="cancelled">
          <SubscriptionsContent
            isLoading={isLoading}
            isError={isError}
            subscriptions={filteredSubscriptions}
            emptyType="cancelled"
            onRetry={refetch}
            onCancelled={handleSubscriptionCancelled}
          />
        </Tabs.Content>

        <Tabs.Content value="all">
          <SubscriptionsContent
            isLoading={isLoading}
            isError={isError}
            subscriptions={filteredSubscriptions}
            emptyType="all"
            onRetry={refetch}
            onCancelled={handleSubscriptionCancelled}
          />
        </Tabs.Content>
      </Tabs.Root>
    </Box>
  );
};

interface SubscriptionsContentProps {
  isLoading: boolean;
  isError: boolean;
  subscriptions: NonNullable<ReturnType<typeof useUserSubscriptions>["data"]>["subscriptions"] | undefined;
  emptyType: "active" | "cancelled" | "all";
  onRetry: () => void;
  onCancelled: () => void;
}

const emptyMessages = {
  active: {
    title: "No active subscriptions",
    description: "You don't have any active subscriptions at the moment.",
    buttonText: "Explore Creators",
    buttonLink: "/explore",
  },
  cancelled: {
    title: "No cancelled subscriptions",
    description: "You don't have any cancelled subscriptions.",
    buttonText: "View Active Subscriptions",
    buttonLink: "#",
  },
  all: {
    title: "No subscriptions found",
    description: "You haven't subscribed to any creators yet.",
    buttonText: "Explore Creators",
    buttonLink: "/explore",
  },
};

const SubscriptionsContent: React.FC<SubscriptionsContentProps> = ({
  isLoading,
  isError,
  subscriptions,
  emptyType,
  onRetry,
  onCancelled,
}) => {
  if (isLoading) {
    return (
      <Flex justify="center" align="center" minH="200px">
        <Spinner size="xl" css={{ color: "hsl(211, 71%, 43%)" }} />
      </Flex>
    );
  }

  if (isError) {
    return (
      <Box textAlign="center" p={8} css={{ background: "hsl(0, 84.2%, 60.2% / 0.1)", borderRadius: "8px" }}>
        <Text mb={4}>There was an error loading your subscriptions.</Text>
        <Button onClick={onRetry}>Try Again</Button>
      </Box>
    );
  }

  if (!subscriptions || subscriptions.length === 0) {
    const message = emptyMessages[emptyType];
    return (
      <Box
        textAlign="center"
        p={8}
        borderWidth="1px"
        borderRadius="lg"
        className="glass-card"
      >
        <Stack gap={4} align="center">
          <Heading size="md">{message.title}</Heading>
          <Text>{message.description}</Text>
          <Button
            onClick={() => (window.location.href = message.buttonLink)}
            className="btn-gradient"
          >
            {message.buttonText}
          </Button>
        </Stack>
      </Box>
    );
  }

  return (
    <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={6}>
      {subscriptions.map((subscription) => (
        <SubscriptionCard
          key={subscription._id}
          subscription={subscription}
          onCancelled={onCancelled}
        />
      ))}
    </SimpleGrid>
  );
};

export default SubscriptionsList;
