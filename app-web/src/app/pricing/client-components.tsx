"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  Flex,
  Heading,
  Text,
  VStack,
  HStack,
  Slider,
  Accordion,
} from "@chakra-ui/react";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";

export const SubscriptionIcon = <Icon icon={"stash:subscription-list-light"} />;

export const ChatIcon = <Icon icon={"material-symbols:chat-rounded"} />;
export const MediaIcon = (
  <Icon icon={"material-symbols:perm-media-outline-rounded"} />
);

export const CommentIcon = <Icon icon={"material-symbols:comment-rounded"} />;

export const AnalyticsIcon = <Icon icon={"uim:analytics"} />;

export const DashboardIcon = (
  <Icon icon={"material-symbols:dashboard-rounded"} />
);
export const PaymentIcon = <Icon icon={"streamline:payment-10-solid"} />;
export const BrandingIcon = (
  <Icon icon={"material-symbols:branding-watermark-rounded"} />
);

// --- COMPONENTS ---
export function EarningsCalculator() {
  const [fee, setFee] = useState(10);
  const [members, setMembers] = useState(100);
  const [isAnnual, setIsAnnual] = useState(false);
  const [earnings, setEarnings] = useState({
    revenue: 0,
    platformFee: 0,
    processingFee: 0,
    net: 0,
  });

  useEffect(() => {
    let revenue = fee * members;
    if (isAnnual) {
      const annualTotal = revenue * 12 * 0.9;
      revenue = Math.round(annualTotal / 12);
    }
    const platformFeeValue = Math.round(revenue * 0.1);
    const processingFeeValue = Math.round(revenue * 0.029 + members * 0.3);
    const netEarnings = revenue - platformFeeValue - processingFeeValue;
    setEarnings({
      revenue,
      platformFee: platformFeeValue,
      processingFee: processingFeeValue,
      net: netEarnings,
    });
  }, [fee, members, isAnnual]);

  const feePresets = [5, 10, 25, 50, 100];
  const memberPresets = [10, 100, 500, 1000, 10000];

  return (
    <Box>
      <HStack justify="center" mb={8}>
        <Button
          onClick={() => setIsAnnual(false)}
          bg={!isAnnual ? "#1D70BF" : "#F7F5ED"}
          color={!isAnnual ? "white" : "#5A5954"}
          borderRadius="full"
          boxShadow={!isAnnual ? "0 4px 12px rgba(29, 112, 191, 0.25)" : "none"}
          _hover={{ bg: !isAnnual ? "#3283d1" : "rgba(29, 112, 191, 0.1)" }}
        >
          Monthly Billing
        </Button>
        <Button
          onClick={() => setIsAnnual(true)}
          bg={isAnnual ? "#1D70BF" : "#F7F5ED"}
          color={isAnnual ? "white" : "#5A5954"}
          borderRadius="full"
          boxShadow={isAnnual ? "0 4px 12px rgba(29, 112, 191, 0.25)" : "none"}
          _hover={{ bg: isAnnual ? "#3283d1" : "rgba(29, 112, 191, 0.1)" }}
        >
          Annual Billing
        </Button>
      </HStack>
      <Box
        bg="white"
        borderRadius="16px"
        boxShadow="0 10px 40px rgba(0,0,0,0.08)"
        p={{ base: 6, md: 12 }}
      >
        <Heading as="h3" size="lg" textAlign="center" mb={8}>
          Earnings Calculator
        </Heading>
        <Flex
          direction={{ base: "column", lg: "row" }}
          gap={{ base: 8, md: 12 }}
        >
          <VStack flex={1.2} gap={8} align="stretch">
            <Box>
              <Flex justify="space-between" mb={2}>
                <Text fontWeight="600">Membership Fee</Text>
                <Text color="#1D70BF" fontWeight="bold">
                  ${fee}
                </Text>
              </Flex>
              <Slider.Root
                value={[fee]}
                min={5}
                max={100}
                step={1}
                onValueChange={(e) => setFee(e.value[0])}
              >
                <Slider.Control>
                  <Slider.Track bg="gray.200">
                    <Slider.Range bg="#1D70BF" />
                  </Slider.Track>
                  <Slider.Thumb index={0} boxSize={6} />
                </Slider.Control>
              </Slider.Root>
              <HStack mt={4} gap={2}>
                {feePresets.map((p) => (
                  <Button
                    key={p}
                    size="sm"
                    borderRadius="full"
                    variant={fee === p ? "solid" : "outline"}
                    colorScheme={fee === p ? "blue" : "gray"}
                    onClick={() => setFee(p)}
                  >
                    ${p}
                  </Button>
                ))}
              </HStack>
            </Box>
            <Box>
              <Flex justify="space-between" mb={2}>
                <Text fontWeight="600">Number of Members</Text>
                <Text color="#1D70BF" fontWeight="bold">
                  {members.toLocaleString()}
                </Text>
              </Flex>
              <Slider.Root
                value={[members]}
                min={10}
                max={10000}
                step={10}
                onValueChange={(e) => setMembers(e.value[0])}
              >
                <Slider.Control>
                  <Slider.Track bg="gray.200">
                    <Slider.Range bg="#1D70BF" />
                  </Slider.Track>
                  <Slider.Thumb index={0} boxSize={6} />
                </Slider.Control>
              </Slider.Root>
              <HStack mt={4} gap={2}>
                {memberPresets.map((p) => (
                  <Button
                    key={p}
                    size="sm"
                    borderRadius="full"
                    variant={members === p ? "solid" : "outline"}
                    colorScheme={members === p ? "blue" : "gray"}
                    onClick={() => setMembers(p)}
                  >
                    {p.toLocaleString()}
                  </Button>
                ))}
              </HStack>
            </Box>
          </VStack>
          <VStack
            flex={1}
            bg="#F7F5ED"
            p={8}
            borderRadius="12px"
            align="stretch"
            justify="space-between"
          >
            <Box>
              <Heading textAlign="center" fontWeight="600" fontSize="lg">
                Your Estimated {isAnnual ? "Equivalent" : ""} Monthly Earnings
              </Heading>
              <Heading
                as="h4"
                size="2xl"
                textAlign="center"
                color="#1D70BF"
                my={2}
              >
                ${earnings.net.toLocaleString()}
              </Heading>
              <VStack
                bg="white"
                p={4}
                borderRadius="md"
                mt={4}
                gap={3}
                divideY="1px"
                borderColor="gray.100"
              >
                <Flex w="full" justify="space-between">
                  <Text fontSize="sm">Total Revenue</Text>
                  <Text fontWeight="bold" fontSize="sm">
                    ${earnings.revenue.toLocaleString()}
                  </Text>
                </Flex>
                <Flex w="full" justify="space-between" pt={3}>
                  <Text fontSize="sm">Patreon Clone Platform Fee (10%)</Text>
                  <Text fontWeight="bold" fontSize="sm">
                    -${earnings.platformFee.toLocaleString()}
                  </Text>
                </Flex>
                <Flex w="full" justify="space-between" pt={3}>
                  <Text fontSize="sm">Payment Processing</Text>
                  <Text fontWeight="bold" fontSize="sm">
                    -${earnings.processingFee.toLocaleString()}
                  </Text>
                </Flex>
                <Flex
                  w="full"
                  justify="space-between"
                  pt={3}
                  borderTopWidth="2px"
                  borderColor="gray.300"
                  fontWeight="bold"
                >
                  <Text>You Keep</Text>
                  <Text color="#1D70BF">${earnings.net.toLocaleString()}</Text>
                </Flex>
              </VStack>
            </Box>
            <Button
              w="full"
              bg="#1D70BF"
              color="white"
              _hover={{ bg: "#3283d1" }}
            >
              Start Your Community
            </Button>
          </VStack>
        </Flex>
      </Box>
    </Box>
  );
}

const faqData = [
  {
    q: "How does Patreon Clone's pricing work?",
    a: "Patreon Clone charges a flat 10% platform fee on the revenue you generate through paid memberships, plus standard payment processing fees. There are no setup fees or monthly minimums.",
  },
  {
    q: "Are there any hidden fees?",
    a: "No. The only fees you'll pay are the 10% platform fee and standard payment processing fees. All features are included for every creator.",
  },
  {
    q: "When do I get paid?",
    a: "Payouts are processed on a monthly basis. For subscription payments, you'll receive your earnings 7 days after they're processed.",
  },
  {
    q: "What makes Patreon Clone different from other platforms?",
    a: "Patreon Clone is specifically built for Jewish creators. Our platform is designed with Torah values at its core, offering features tailored to Jewish community needs.",
  },
];

export function FaqAccordion() {
  return (
    <Accordion.Root collapsible maxW="1000px" mx="auto">
      {faqData.map((item, index) => (
        <Accordion.Item key={index} value={`item-${index}`}>
          <Accordion.ItemTrigger>
            <Box as="span" flex="1" textAlign="left" fontWeight="600">
              {item.q}
            </Box>
            <Accordion.ItemIndicator />
          </Accordion.ItemTrigger>
          <Accordion.ItemContent>
            <Accordion.ItemBody pb={4}>{item.a}</Accordion.ItemBody>
          </Accordion.ItemContent>
        </Accordion.Item>
      ))}
    </Accordion.Root>
  );
}
