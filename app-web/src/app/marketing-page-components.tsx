"use client";

import React, { useState } from "react";
import {
  Box,
  Flex,
  Heading,
  Text,
  Button,
  VStack,
  HStack,
  Image,
  IconButton,
} from "@chakra-ui/react";
import { Icon } from "@iconify/react";
import { branding, marketing } from "@/config";

// --- Features Data ---
const featuresData: Record<
  string,
  { icon: any; title: string; description: string }[]
> = {
  "Monetize Your Passion": [
    {
      icon: <Icon icon="stash:monetize" />,
      title: "Turn Your Passion Into Income",
      description:
        `Transform your creativity and expertise into sustainable income. With ${branding.name}, you can offer paid subscriptions, host live events, share exclusive content, or teach classes — all on a platform that respects your values and mission.`,
    },
    {
      icon: <Icon icon="hugeicons:honor" />,
      title: "Honor Your Values",
      description:
        `No more compromising your content to please algorithms. ${branding.name} lets you earn from your work while maintaining authenticity and integrity. Even a small dedicated community can generate meaningful income — without chasing trends or sacrificing your vision.`,
    },
  ],
  "Engage Your Community": [
    {
      icon: <Icon icon="ic:baseline-gpp-good" />,
      title: "Foster Meaningful Relationships",
      description:
        `Build deep, personal connections with your supporters away from the noise and distractions. ${branding.name} provides private messaging, members-only discussion spaces, and interactive Q&As.`,
    },
    {
      icon: <Icon icon="iconoir:community" />,
      title: "Build a Valued Community",
      description: `Your followers aren't just numbers — they're people seeking
                  connection. ${branding.name} transforms passive followers into active
                  community members who feel seen, heard, and valued through
                  tools designed specifically for creators and communities.`,
    },
  ],
  "Simplify Your Work": [
    {
      icon: <Icon icon="streamline-ultimate:layout-content-bold" />,
      title: "Focus on Your Content",
      description:
        `Stop juggling multiple platforms and services. ${branding.name} combines everything you need into one seamless experience: publish posts, run events, track growth, and receive payments.`,
    },
    {
      icon: <Icon icon="icon-park-solid:thinking-problem" />,
      title: "All-In-One Solution",
      description: `Memberships, premium content, events, and digital product
                  sales — all in one place. With direct access to your audience
                  through chat groups, direct messages, and feed posts, you can
                  focus on creating value rather than fighting with technology.`,
    },
  ],
  "Creator Values": [
    {
      icon: <Icon icon="mdi:account-heart" />,
      title: "Built for Creators",
      description: `Unlike mainstream platforms, ${branding.name} was built from the ground
                  up for creators. Everything reflects the needs of a modern creator,
                  from flexible scheduling to content moderation aligned with community values.`,
    },
    {
      icon: <Icon icon="game-icons:peace-dove" />,
      title: "A Peaceful, Creator-Centered Environment",
      description: `Enjoy a space free from trolls, spam, and the distractions of
                  mainstream social media. ${branding.name} provides a respectful
                  environment where creators can share their work authentically,
                  without fear of censorship or harassment.`,
    },
  ],
};

export function FeaturesSection() {
  const [activeTab, setActiveTab] = useState("Monetize Your Passion");

  return (
    <Box
      as="section"
      py="6rem"
      css={{
        background: "linear-gradient(135deg, hsl(211, 71%, 43% / 0.03) 0%, hsl(335, 27%, 64% / 0.04) 50%, transparent 100%)",
      }}
    >
      <Box maxW="1200px" mx="auto" px={{ base: 4, md: 8 }}>
        <VStack gap={4} align="flex-start" mb={12}>
          <Text
            bg={branding.colors.bgWarm}
            color={branding.colors.primary}
            fontWeight="600"
            px={4}
            py={2}
            borderRadius="full"
            fontSize={".75rem"}
          >
            {marketing.featureSection.pillLabel}
          </Text>
          <Heading as="h2" size="3xl" color={branding.colors.textDark}>
            {marketing.featureSection.heading}
          </Heading>
          <Text fontSize="lg" color={branding.colors.star} maxW="700px">
            {marketing.featureSection.description}
          </Text>
        </VStack>
        <HStack gap={2} flexWrap="wrap" mb={10}>
          {(Object.keys(featuresData) as Array<keyof typeof featuresData>).map(
            (tabKey) => (
              <Button
                key={tabKey}
                bg={activeTab === tabKey ? branding.colors.primary : branding.colors.bgWarm}
                color={activeTab === tabKey ? "white" : branding.colors.star}
                boxShadow={
                  activeTab === tabKey
                    ? "0 4px 12px rgba(29, 112, 191, 0.25)"
                    : "none"
                }
                onClick={() => setActiveTab(tabKey)}
                _hover={{
                  bg:
                    activeTab !== tabKey
                      ? "rgba(29, 112, 191, 0.1)"
                      : undefined,
                }}
                px={6}
                py={5}
              >
                {tabKey}
              </Button>
            )
          )}
        </HStack>
        <Flex
          direction={{ base: "column", md: "row" }}
          gap={{ base: 8, md: 12 }}
          align="center"
        >
          <Box
            flex={1}
            w="100%"
            borderRadius="16px"
            boxShadow="0 20px 60px rgba(0,0,0,0.1)"
            overflow="hidden"
          >
            <Image
              src="https://images.unsplash.com/photo-1543269865-cbf427effbad?auto=format&fit=crop&w=800"
              alt="Creators collaborating"
            />
          </Box>
          <VStack flex={1} align="start" gap={8} w="100%">
            {featuresData[activeTab].map((tab, i) => (
              <HStack align="start" key={i} gap={4}>
                <Flex
                  bg="rgba(29, 112, 191, 0.1)"
                  boxSize="48px"
                  borderRadius="12px"
                  align="center"
                  justify="center"
                  flexShrink={0}
                  css={{
                    "& svg": {
                      color: branding.colors.primary,
                      boxSize: "24px",
                    },
                  }}
                >
                  {/* <Icon
                  // as=
                  color="#1D70BF"
                  boxSize="24px"
                >
                  {featuresData[activeTab].icon}
                </Icon> */}
                  {tab.icon}
                </Flex>
                <Box>
                  <Heading as="h3" size="xl" mb={2}>
                    {tab.title}
                  </Heading>
                  <Text color={branding.colors.star}>{tab.description}</Text>
                </Box>
              </HStack>
            ))}
          </VStack>
        </Flex>
      </Box>
    </Box>
  );
}

export function TestimonialsSlider() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const currentTestimonial = marketing.testimonials[currentIndex];
  const quoteWithName = currentTestimonial.quote.replace(
    "{name}",
    branding.name
  );

  return (
    <Box as="section" bg={branding.colors.bgWarm} py="6rem">
      <Box maxW="800px" mx="auto" px={{ base: 4, md: 6 }}>
        <VStack gap={8} textAlign="center">
          <Text
            bg={branding.colors.duneLight}
            color={branding.colors.accentDark}
            fontWeight="600"
            px={4}
            py={2}
            borderRadius="full"
          >
            {marketing.testimonialsSection.pillLabel}
          </Text>
          <Heading as="h2" size="xl">
            {marketing.testimonialsSection.heading}
          </Heading>
          <Text fontSize="lg">
            {marketing.testimonialsSection.subheading}
          </Text>

          <Box
            position="relative"
            w="full"
            className="glass-card"
            p={{ base: 8, md: 12 }}
            borderRadius="16px"
          >
            <Text
              fontSize="5rem"
              color="rgba(29, 112, 191, 0.1)"
              position="absolute"
              top="-20px"
              left={{ base: "1rem", md: "1.5rem" }}
              lineHeight={1}
            >
              &quot;
            </Text>
            <VStack gap={10}>
              <Text
                fontSize={{ base: "lg", md: "xl" }}
                lineHeight="1.8"
                color={branding.colors.textDark}
              >
                {quoteWithName}
              </Text>
              <VStack>
                <Image
                  borderRadius="full"
                  boxSize="70px"
                  src={currentTestimonial.avatar}
                  alt={currentTestimonial.author}
                  border={`3px solid ${branding.colors.bgWarm}`}
                />
                <Text fontWeight="600" color={branding.colors.textDark} fontSize="lg">
                  {currentTestimonial.author}
                </Text>
                <Text fontSize="sm" color={branding.colors.star}>
                  {currentTestimonial.title}
                </Text>
              </VStack>
            </VStack>
          </Box>

          <HStack>
            <IconButton
              onClick={() =>
                setCurrentIndex(
                  (p) =>
                    (p - 1 + marketing.testimonials.length) % marketing.testimonials.length
                )
              }
              aria-label="Previous"
              rounded={"full"}
              size="md"
              css={{
                "& svg": {
                  width: 6,
                  height: 6,
                },
              }}
            >
              <Icon icon={"ic:round-chevron-left"} />
            </IconButton>
            {marketing.testimonials.map((_, index) => (
              <Box
                key={index}
                as="button"
                h="10px"
                w="10px"
                borderRadius="full"
                bg={index === currentIndex ? branding.colors.primary : "gray.300"}
                onClick={() => setCurrentIndex(index)}
              />
            ))}
            <IconButton
              onClick={() =>
                setCurrentIndex((p) => (p + 1) % marketing.testimonials.length)
              }
              aria-label="Next"
              rounded={"full"}
              size="md"
              css={{
                "& svg": {
                  width: 6,
                  height: 6,
                },
              }}
            >
              <Icon icon={"ic:round-chevron-right"} />
            </IconButton>
          </HStack>
        </VStack>
      </Box>
    </Box>
  );
}
