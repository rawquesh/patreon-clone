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
  // const [activeTab, setActiveTab] = useState(0);
  const [status] = useState<SubscriptionStatus | undefined>(
    SubscriptionStatus.ACTIVE
  );

  const { data, isLoading, isError, refetch } = useUserSubscriptions({
    status: status,
  });

  // const handleTabChange = (index: number) => {
  //   setActiveTab(index);
  //   switch (index) {
  //     case 0:
  //       setStatus(SubscriptionStatus.ACTIVE);
  //       break;
  //     case 1:
  //       setStatus(SubscriptionStatus.CANCELLED);
  //       break;
  //     case 2:
  //       setStatus(undefined); // All
  //       break;
  //     default:
  //       setStatus(SubscriptionStatus.ACTIVE);
  //   }
  // };

  const handleSubscriptionCancelled = () => {
    refetch();
  };

  return (
    <Box>
      <Heading size="lg" mb={6}>
        Your Subscriptions
      </Heading>

      <Tabs.Root
        colorScheme="blue"
        // onChange={(e) => {
        //   setActiveTab(e.target.value);
        // }}
        // index={activeTab}
        mb={6}
      >
        <Tabs.List>
          <Tabs.Trigger value="active">Active</Tabs.Trigger>
          <Tabs.Trigger value="cancelled">Cancelled</Tabs.Trigger>
          <Tabs.Trigger value="all">All</Tabs.Trigger>
        </Tabs.List>

        <Tabs.Content value="active">
          {[0, 1, 2].map((tabIndex) => (
            <Tabs.Content key={tabIndex} value={tabIndex.toString()}>
              {isLoading ? (
                <Flex justify="center" align="center" minH="200px">
                  <Spinner size="xl" color="blue.500" />
                </Flex>
              ) : isError ? (
                <Box textAlign="center" p={8} bg="red.50" borderRadius="md">
                  <Text mb={4}>
                    There was an error loading your subscriptions.
                  </Text>
                  <Button onClick={() => refetch()}>Try Again</Button>
                </Box>
              ) : data?.subscriptions && data.subscriptions.length > 0 ? (
                <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={6}>
                  {data.subscriptions.map((subscription) => (
                    <SubscriptionCard
                      key={subscription._id}
                      subscription={subscription}
                      onCancelled={handleSubscriptionCancelled}
                    />
                  ))}
                </SimpleGrid>
              ) : (
                <EmptySubscriptionsState tabIndex={tabIndex} />
              )}
            </Tabs.Content>
          ))}
        </Tabs.Content>
      </Tabs.Root>
    </Box>
  );
};

interface EmptySubscriptionsStateProps {
  tabIndex: number;
}

const EmptySubscriptionsState: React.FC<EmptySubscriptionsStateProps> = ({
  tabIndex,
}) => {
  const messages = {
    0: {
      title: "No active subscriptions",
      description: "You don't have any active subscriptions at the moment.",
      buttonText: "Explore Creators",
      buttonLink: "/explore",
    },
    1: {
      title: "No cancelled subscriptions",
      description: "You don't have any cancelled subscriptions.",
      buttonText: "View Active Subscriptions",
      buttonLink: "#",
    },
    2: {
      title: "No subscriptions found",
      description: "You haven't subscribed to any creators yet.",
      buttonText: "Explore Creators",
      buttonLink: "/explore",
    },
  };

  const message = messages[tabIndex as keyof typeof messages];

  return (
    <Box
      textAlign="center"
      p={8}
      borderWidth="1px"
      borderRadius="lg"
      bg="gray.50"
    >
      <Stack gap={4} align="center">
        <Heading size="md">{message.title}</Heading>
        <Text>{message.description}</Text>
        <Button
          colorScheme="blue"
          onClick={() => (window.location.href = message.buttonLink)}
        >
          {message.buttonText}
        </Button>
      </Stack>
    </Box>
  );
};

export default SubscriptionsList;
