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
    <Box color={branding.colors.star} bg="white">
      <MarketingHeader />

      <>
        <Box
          as="section"
          textAlign="center"
          pt={{ base: "5rem", md: "8rem" }}
          pb="3rem"
        >
          <Box maxW="960px" mx="auto" px={{ base: 4, md: 6 }}>
            <VStack gap={4}>
              <Text
                bg={branding.colors.bgWarm}
                color={branding.colors.primary}
                fontWeight="600"
                px={4}
                py={2}
                borderRadius="full"
                fontSize={".75rem"}
              >
                Simple, Transparent Pricing
              </Text>
              <Heading
                as="h1"
                size="5xl"
                // textTransform={'unnd'}
                textDecorationColor="rgba(29, 112, 191, 0.2)"
              >
                <Box
                  color={branding.colors.primary}
                  as={"span"}
                  textDecorationColor="rgba(29, 112, 191, 0.2) !important"
                  textDecoration={"underline"}
                  textUnderlineOffset="8px"
                >
                  Starting a {branding.name}{" "}
                </Box>
                <Box textDecoration={"none"} as="span" color="#333">
                  is Free
                </Box>
              </Heading>
              <Text fontSize="lg" color={branding.colors.star} maxW="80%">
                Share work directly with your community right away for free and
                introduce paid options when you&apos;re ready.
              </Text>
            </VStack>
          </Box>
        </Box>

        <Box as="section" py={{ base: "3rem", md: "4rem" }}>
          <Box maxW="1000px" mx="auto" px={{ base: 4, md: 6 }}>
            <VStack gap={4} textAlign="center" mb={10}>
              <Heading as="h2" size="3xl">
                See how much you could earn
              </Heading>
              <Text fontSize="lg" maxW="700px">
                Use our calculator to estimate your potential earnings. {branding.name}
                takes a flat {branding.platform.feePercentage}% platform fee plus payment processing costs.
              </Text>
            </VStack>
            <EarningsCalculator />
          </Box>
        </Box>

        <Box as="section" py="6rem" bg={branding.colors.bgWarm}>
          <Box maxW="1200px" mx="auto" px={{ base: 4, md: 6 }}>
            <VStack gap={4} textAlign="center" mb={12}>
              <Text
                bg={branding.colors.duneLight}
                color={branding.colors.accentDark}
                fontWeight="600"
                px={4}
                py={2}
                borderRadius="full"
              >
                Premium Features
              </Text>
              <Heading as="h2" size="xl" fontFamily="'Playfair Display', serif">
                What&apos;s Included
              </Heading>
              <Text fontSize="lg">
                Every creator on {branding.name} gets access to our complete suite of
                powerful community-building tools.
              </Text>
            </VStack>
            <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} gap={8}>
              {features.map((feature, index) => (
                <VStack
                  key={index}
                  bg="white"
                  p={6}
                  borderRadius="16px"
                  boxShadow="0 10px 30px rgba(0,0,0,0.05)"
                  align="start"
                  gap={4}
                  _hover={{
                    transform: "translateY(-5px)",
                    boxShadow: "0 15px 35px rgba(0,0,0,0.1)",
                  }}
                  transition="all 0.3s ease"
                >
                  <Flex
                    bg="rgba(29, 112, 191, 0.1)"
                    boxSize="48px"
                    borderRadius="12px"
                    align="center"
                    justify="center"
                    css={{
                      "& svg": {
                        color: branding.colors.primary,
                        boxSize: "24px",
                      },
                    }}
                  >
                    {/* <Icon as={feature.icon} color={branding.colors.primary} boxSize="24px" /> */}
                    {feature.icon}
                  </Flex>
                  <Heading
                    size="sm"
                    fontSize={"xl"}
                    fontFamily="'Playfair Display', serif"
                  >
                    {feature.title}
                  </Heading>
                  <Text fontSize="sm">{feature.description}</Text>
                </VStack>
              ))}
            </SimpleGrid>
          </Box>
        </Box>

        <Box as="section" py="6rem">
          <Box maxW="1000px" mx="auto" px={{ base: 4, md: 6 }}>
            <VStack gap={4} textAlign="center" mb={12}>
              <Heading as="h2" size="xl">
                Frequently Asked Questions
              </Heading>
              <Text fontSize="lg">
                Get answers to common questions about pricing and features.
              </Text>
            </VStack>
            <FaqAccordion />
          </Box>
        </Box>

        <Box
          as="section"
          py="5rem"
          bg={branding.colors.primary}
          color="white"
          textAlign="center"
        >
          <Box maxW="800px" mx="auto" px={{ base: 4, md: 6 }}>
            <VStack gap={6}>
              <Heading as="h2" size="xl" color="white">
                Ready to build your {branding.name}?
              </Heading>
              <Text fontSize="lg" color="whiteAlpha.900">
                Join hundreds of creators building meaningful connections
                and sustainable income.
              </Text>
              <HStack gap={4}>
                <Link href={"/auth/login"}>
                  <Button
                    size="lg"
                    bg="white"
                    color={branding.colors.primary}
                    _hover={{ bg: "gray.200" }}
                  >
                    Get Started
                  </Button>
                </Link>
                <Link
                  href={branding.urls.meeting}
                  target="_blank"
                >
                  <Button
                    size="lg"
                    variant="outline"
                    color="white"
                    borderColor="whiteAlpha.400"
                    _hover={{ bg: "whiteAlpha.200" }}
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
