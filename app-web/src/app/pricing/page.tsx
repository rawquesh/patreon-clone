import React from "react";
import {
  Box,
  Flex,
  Heading,
  Text,
  Button,
  VStack,
  HStack,
  SimpleGrid,
} from "@chakra-ui/react";
import {
  EarningsCalculator,
  FaqAccordion,
  SubscriptionIcon,
  ChatIcon,
  MediaIcon,
  AnalyticsIcon,
  DashboardIcon,
  PaymentIcon,
  BrandingIcon,
  CommentIcon,
} from "./client-components";
import Link from "next/link";
import { MarketingHeader } from "@/components/marketing-header";
import { MarketingPageFooter } from "../marketing-page-footer";
import { branding } from "@/config/branding";

const features = [
  {
    icon: SubscriptionIcon,
    title: "Subscriptions & Member-Only Content",
    description:
      "Offer tiered monthly subscriptions with exclusive posts and perks.",
  },
  {
    icon: ChatIcon,
    title: "Direct Messaging & Group Chats",
    description:
      "Build deeper connections with supporters through private conversations.",
  },
  {
    icon: MediaIcon,
    title: "Rich Media Posts",
    description:
      "Share text, images, audio, and video in a distraction-free format.",
  },
  {
    icon: CommentIcon,
    title: "Commenting & Reactions",
    description: "Engage your audience directly on each post.",
  },
  {
    icon: AnalyticsIcon,
    title: "Post Analytics",
    description: "Track views and engagement to understand what resonates.",
  },
  {
    icon: DashboardIcon,
    title: "Revenue Dashboard",
    description: "Monitor your earnings and subscription growth in one place.",
  },
  {
    icon: PaymentIcon,
    title: "Integrated Payments & Payouts",
    description:
      "Get paid reliably with built-in tools — no third-party setup required.",
  },
  {
    icon: BrandingIcon,
    title: "Custom Branding",
    description: "Personalize your space with your name, logo, and bio.",
  },
];

export default function PricingPage() {
  return (
    <Box css={{ background: "var(--app-bg)" }}>
      <MarketingHeader />

      <>
        <Box
          as="section"
          textAlign="center"
          pt={{ base: "5rem", md: "8rem" }}
          pb="3rem"
          className="page-header"
        >
          <Box maxW="960px" mx="auto" px={{ base: 4, md: 6 }}>
            <VStack gap={4}>
              <Box
                px={4}
                py={2}
                borderRadius="full"
                fontSize={".75rem"}
                fontWeight="600"
                css={{
                  background: "var(--gradient-primary)",
                  color: "white",
                }}
              >
                Simple, Transparent Pricing
              </Box>
              <Heading
                as="h1"
                size="5xl"
                css={{
                  background: "linear-gradient(135deg, hsl(211, 71%, 43%), hsl(335, 27%, 64%))",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  lineHeight: 1.15,
                }}
              >
                Starting a {branding.name} is Free
              </Heading>
              <Text
                fontSize="lg"
                css={{ color: "hsl(215.4, 16.3%, 46.9%)", maxW: "80%" }}
              >
                Share work directly with your community right away for free and
                introduce paid options when you&apos;re ready.
              </Text>
            </VStack>
          </Box>
        </Box>

        <Box as="section" py={{ base: "3rem", md: "4rem" }}>
          <Box maxW="1000px" mx="auto" px={{ base: 4, md: 6 }}>
            <VStack gap={4} textAlign="center" mb={10}>
              <Heading
                as="h2"
                size="3xl"
                css={{
                  background: "linear-gradient(135deg, hsl(211, 71%, 43%), hsl(335, 27%, 64%))",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                See how much you could earn
              </Heading>
              <Text
                fontSize="lg"
                maxW="700px"
                css={{ color: "hsl(215.4, 16.3%, 46.9%)" }}
              >
                Use our calculator to estimate your potential earnings. {branding.name}
                takes a flat {branding.platform.feePercentage}% platform fee plus payment processing costs.
              </Text>
            </VStack>
            <EarningsCalculator />
          </Box>
        </Box>

        <Box
          as="section"
          py="6rem"
          className="glass-surface"
          css={{
            background: "rgba(255,255,255,0.5)",
            backdropFilter: "blur(8px)",
          }}
        >
          <Box maxW="1200px" mx="auto" px={{ base: 4, md: 6 }}>
            <VStack gap={4} textAlign="center" mb={12}>
              <Box
                px={4}
                py={2}
                borderRadius="full"
                fontSize={".75rem"}
                fontWeight="600"
                className="glass-card"
                css={{ color: "hsl(211, 71%, 43%)" }}
              >
                Premium Features
              </Box>
              <Heading as="h2" size="xl" css={{ color: "hsl(222.2, 47.4%, 11.2%)" }}>
                What&apos;s Included
              </Heading>
              <Text
                fontSize="lg"
                css={{ color: "hsl(215.4, 16.3%, 46.9%)" }}
              >
                Every creator on {branding.name} gets access to our complete suite of
                powerful community-building tools.
              </Text>
            </VStack>
            <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} gap={8}>
              {features.map((feature, index) => (
                <Box
                  key={index}
                  className="glass-card hover-lift"
                  p={6}
                  borderRadius="16px"
                  display="flex"
                  flexDirection="column"
                  alignItems="start"
                  gap={4}
                >
                  <Flex
                    boxSize="48px"
                    borderRadius="12px"
                    align="center"
                    justify="center"
                    css={{
                      background: "linear-gradient(135deg, hsl(211, 71%, 43% / 0.1), hsl(335, 27%, 64% / 0.1))",
                      "& svg": {
                        color: "hsl(211, 71%, 43%)",
                        boxSize: "24px",
                      },
                    }}
                  >
                    {feature.icon}
                  </Flex>
                  <Heading
                    size="sm"
                    fontSize={"xl"}
                    css={{ color: "hsl(222.2, 47.4%, 11.2%)" }}
                  >
                    {feature.title}
                  </Heading>
                  <Text fontSize="sm" css={{ color: "hsl(215.4, 16.3%, 46.9%)" }}>
                    {feature.description}
                  </Text>
                </Box>
              ))}
            </SimpleGrid>
          </Box>
        </Box>

        <Box as="section" py="6rem">
          <Box maxW="1000px" mx="auto" px={{ base: 4, md: 6 }}>
            <VStack gap={4} textAlign="center" mb={12}>
              <Heading
                as="h2"
                size="xl"
                css={{
                  background: "linear-gradient(135deg, hsl(211, 71%, 43%), hsl(335, 27%, 64%))",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Frequently Asked Questions
              </Heading>
              <Text fontSize="lg" css={{ color: "hsl(215.4, 16.3%, 46.9%)" }}>
                Get answers to common questions about pricing and features.
              </Text>
            </VStack>
            <FaqAccordion />
          </Box>
        </Box>

        <Box
          as="section"
          py="5rem"
          css={{
            background: "var(--gradient-primary)",
          }}
          textAlign="center"
        >
          <Box maxW="800px" mx="auto" px={{ base: 4, md: 6 }}>
            <VStack gap={6}>
              <Heading as="h2" size="xl" color="white">
                Ready to build your {branding.name}?
              </Heading>
              <Text fontSize="lg" css={{ color: "rgba(255,255,255,0.85)" }}>
                Join hundreds of creators building meaningful connections
                and sustainable income.
              </Text>
              <HStack gap={4}>
                <Link href={"/auth/login"}>
                  <Button
                    size="lg"
                    className="glass-card"
                    css={{
                      color: "hsl(211, 71%, 43%)",
                      fontWeight: 600,
                      _hover: {
                        background: "rgba(255,255,255,0.9)",
                        transform: "translateY(-1px)",
                      },
                    }}
                  >
                    Get Started
                  </Button>
                </Link>
                <Link href={branding.urls.meeting} target="_blank">
                  <Button
                    size="lg"
                    variant="outline"
                    css={{
                      color: "white",
                      borderColor: "rgba(255,255,255,0.4)",
                      _hover: {
                        background: "rgba(255,255,255,0.15)",
                        borderColor: "white",
                      },
                    }}
                  >
                    Schedule Creator Demo
                  </Button>
                </Link>
              </HStack>
            </VStack>
          </Box>
        </Box>
      </>

      <MarketingPageFooter />
    </Box>
  );
}
