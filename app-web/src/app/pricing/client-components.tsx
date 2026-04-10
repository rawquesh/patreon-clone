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
import { branding } from "@/config/branding";
import api from "@/lib/api";

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
  const [platformFeePct, setPlatformFeePct] = useState<number>(branding.platform.feePercentage);
  const [earnings, setEarnings] = useState({
    revenue: 0,
    platformFee: 0,
    processingFee: 0,
    net: 0,
  });

  useEffect(() => {
    const fetchFee = async () => {
      try {
        const response = await api.get<Array<{ key: string; value: number }>>("/platform-settings");
        const settings = response.data;
        const commissionSetting = settings.find((s) => s.key === "platformCommissionRate");
        if (commissionSetting && typeof commissionSetting.value === "number") {
          setPlatformFeePct(Math.round(commissionSetting.value * 100));
        }
      } catch {
        // Use fallback from branding config
      }
    };
    fetchFee();
  }, []);

  useEffect(() => {
    let revenue = fee * members;
    if (isAnnual) {
      const annualTotal = revenue * 12 * 0.9;
      revenue = Math.round(annualTotal / 12);
    }
    const platformFeeValue = Math.round(revenue * (platformFeePct / 100));
    const processingFeeValue = Math.round(revenue * 0.029 + members * 0.3);
    const netEarnings = revenue - platformFeeValue - processingFeeValue;
    setEarnings({
      revenue,
      platformFee: platformFeeValue,
      processingFee: processingFeeValue,
      net: netEarnings,
    });
  }, [fee, members, isAnnual, platformFeePct]);

  const feePresets = [5, 10, 25, 50, 100];
  const memberPresets = [10, 100, 500, 1000, 10000];

  return (
    <Box>
      <HStack justify="center" mb={8}>
        <Button
          onClick={() => setIsAnnual(false)}
          className={!isAnnual ? "btn-gradient" : ""}
          bg={!isAnnual ? undefined : branding.colors.bgWarm}
          color={!isAnnual ? undefined : branding.colors.textDark}
          css={{
            borderRadius: "9999px",
            fontWeight: 600,
            px: 6,
            py: 5,
            "& > span": { position: "relative", zIndex: 1 },
          }}
        >
          <span>Monthly Billing</span>
        </Button>
        <Button
          onClick={() => setIsAnnual(true)}
          className={isAnnual ? "btn-gradient" : ""}
          bg={isAnnual ? undefined : branding.colors.bgWarm}
          color={isAnnual ? undefined : branding.colors.textDark}
          css={{
            borderRadius: "9999px",
            fontWeight: 600,
            px: 6,
            py: 5,
            "& > span": { position: "relative", zIndex: 1 },
          }}
        >
          <span>Annual Billing</span>
        </Button>
      </HStack>
      <Box
        className="glass-card"
        borderRadius="16px"
        p={{ base: 6, md: 12 }}
      >
        <Heading
          as="h3"
          size="lg"
          textAlign="center"
          mb={8}
          css={{ color: "hsl(222.2, 47.4%, 11.2%)" }}
        >
          Earnings Calculator
        </Heading>
        <Flex
          direction={{ base: "column", lg: "row" }}
          gap={{ base: 8, md: 12 }}
        >
          <VStack flex={1.2} gap={8} align="stretch">
            <Box>
              <Flex justify="space-between" mb={2}>
                <Text fontWeight="600" css={{ color: "hsl(222.2, 47.4%, 11.2%)" }}>
                  Membership Fee
                </Text>
                <Text
                  css={{
                    fontWeight: "bold",
                    background: "linear-gradient(135deg, hsl(211, 71%, 43%), hsl(335, 27%, 64%))",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
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
                  <Slider.Track css={{ background: "hsl(210, 30%, 88%)" }}>
                    <Slider.Range bg="hsl(211, 71%, 43%)" />
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
                    className={fee === p ? "btn-gradient" : ""}
                    bg={fee === p ? undefined : branding.colors.bgWarm}
                    color={fee === p ? undefined : branding.colors.textDark}
                    fontWeight={600}
                    fontSize="12px"
                    px={3}
                    py={4}
                    onClick={() => setFee(p)}
                    css={{ "& > span": { position: "relative", zIndex: 1 } }}
                  >
                    <span>${p}</span>
                  </Button>
                ))}
              </HStack>
            </Box>
            <Box>
              <Flex justify="space-between" mb={2}>
                <Text fontWeight="600" css={{ color: "hsl(222.2, 47.4%, 11.2%)" }}>
                  Number of Members
                </Text>
                <Text
                  css={{
                    fontWeight: "bold",
                    background: "linear-gradient(135deg, hsl(211, 71%, 43%), hsl(335, 27%, 64%))",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
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
                  <Slider.Track css={{ background: "hsl(210, 30%, 88%)" }}>
                    <Slider.Range bg="hsl(211, 71%, 43%)" />
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
                    className={members === p ? "btn-gradient" : ""}
                    bg={members === p ? undefined : branding.colors.bgWarm}
                    color={members === p ? undefined : branding.colors.textDark}
                    fontWeight={600}
                    fontSize="12px"
                    px={3}
                    py={4}
                    onClick={() => setMembers(p)}
                    css={{ "& > span": { position: "relative", zIndex: 1 } }}
                  >
                    <span>{p.toLocaleString()}</span>
                  </Button>
                ))}
              </HStack>
            </Box>
          </VStack>
          <VStack
            flex={1}
            className="glass-card"
            p={8}
            borderRadius="16px"
            align="stretch"
            justify="space-between"
            css={{ gap: 0 }}
          >
            <Box>
              <Heading
                textAlign="center"
                fontWeight="600"
                fontSize="lg"
                css={{ color: "hsl(222.2, 47.4%, 11.2%)" }}
              >
                Your Estimated {isAnnual ? "Equivalent" : ""} Monthly Earnings
              </Heading>
              <Heading
                as="h4"
                size="2xl"
                textAlign="center"
                css={{
                  background: "linear-gradient(135deg, hsl(211, 71%, 43%), hsl(335, 27%, 64%))",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  margin: "8px 0",
                }}
              >
                ${earnings.net.toLocaleString()}
              </Heading>
              <VStack
                className="glass-surface"
                p={4}
                borderRadius="12px"
                mt={4}
                gap={3}
                css={{
                  border: "1px solid var(--glass-border)",
                  background: "rgba(255,255,255,0.5)",
                }}
              >
                <Flex w="full" justify="space-between">
                  <Text fontSize="sm" css={{ color: "hsl(215.4, 16.3%, 46.9%)" }}>
                    Total Revenue
                  </Text>
                  <Text fontWeight="bold" fontSize="sm" css={{ color: "hsl(222.2, 47.4%, 11.2%)" }}>
                    ${earnings.revenue.toLocaleString()}
                  </Text>
                </Flex>
                <Flex w="full" justify="space-between" pt={3}>
                  <Text fontSize="sm" css={{ color: "hsl(215.4, 16.3%, 46.9%)" }}>
                    {branding.name} Platform Fee ({platformFeePct}%)
                  </Text>
                  <Text fontWeight="bold" fontSize="sm" css={{ color: "hsl(222.2, 47.4%, 11.2%)" }}>
                    -${earnings.platformFee.toLocaleString()}
                  </Text>
                </Flex>
                <Flex w="full" justify="space-between" pt={3}>
                  <Text fontSize="sm" css={{ color: "hsl(215.4, 16.3%, 46.9%)" }}>
                    Payment Processing
                  </Text>
                  <Text fontWeight="bold" fontSize="sm" css={{ color: "hsl(222.2, 47.4%, 11.2%)" }}>
                    -${earnings.processingFee.toLocaleString()}
                  </Text>
                </Flex>
                <Flex
                  w="full"
                  justify="space-between"
                  pt={3}
                  css={{
                    borderTop: "2px solid",
                    borderColor: "hsl(215.4, 16.3%, 46.9% / 0.2)",
                    fontWeight: "bold",
                  }}
                >
                  <Text css={{ color: "hsl(222.2, 47.4%, 11.2%)" }}>You Keep</Text>
                  <Text
                    css={{
                      background: "linear-gradient(135deg, hsl(211, 71%, 43%), hsl(335, 27%, 64%))",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                      fontWeight: "bold",
                    }}
                  >
                    ${earnings.net.toLocaleString()}
                  </Text>
                </Flex>
              </VStack>
            </Box>
            <Button
              w="full"
              className="btn-gradient"
              mt={6}
              css={{ fontWeight: 600, "& > span": { position: "relative", zIndex: 1 } }}
            >
              <span>Start Your Community</span>
            </Button>
          </VStack>
        </Flex>
      </Box>
    </Box>
  );
}

const faqData = [
  {
    q: `How does ${branding.name}'s pricing work?`,
    a: `${branding.name} charges a flat ${branding.platform.feePercentage}% platform fee on the revenue you generate through paid memberships, plus standard payment processing fees. There are no setup fees or monthly minimums.`,
  },
  {
    q: "Are there any hidden fees?",
    a: `No. The only fees you'll pay are the ${branding.platform.feePercentage}% platform fee and standard payment processing fees. All features are included for every creator.`,
  },
  {
    q: "When do I get paid?",
    a: "Payouts are processed on a monthly basis. For subscription payments, you'll receive your earnings 7 days after they're processed.",
  },
  {
    q: `What makes ${branding.name} different from other platforms?`,
    a: `${branding.name} is specifically built for creators. Our platform is designed with community values at its core, offering features tailored to creator community needs.`,
  },
];

export function FaqAccordion() {
  return (
    <Accordion.Root collapsible maxW="1000px" mx="auto">
      {faqData.map((item, index) => (
        <Accordion.Item key={index} value={`item-${index}`}>
          <Accordion.ItemTrigger>
            <Box
              as="span"
              flex="1"
              textAlign="left"
              fontWeight="600"
              css={{ color: "hsl(222.2, 47.4%, 11.2%)" }}
            >
              {item.q}
            </Box>
            <Accordion.ItemIndicator />
          </Accordion.ItemTrigger>
          <Accordion.ItemContent>
            <Accordion.ItemBody pb={4} css={{ color: "hsl(215.4, 16.3%, 46.9%)" }}>
              {item.a}
            </Accordion.ItemBody>
          </Accordion.ItemContent>
        </Accordion.Item>
      ))}
    </Accordion.Root>
  );
}
