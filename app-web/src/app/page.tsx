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
  Image,
  Icon,
} from "@chakra-ui/react";
import {
  TestimonialsSlider,
  FeaturesSection,
} from "./marketing-page-components";
import { CheckIcon, PostIcon, UserIcon } from "./icons";
import Link from "next/link";
import { MarketingHeader } from "@/components/marketing-header";
import { InteractiveHero } from "@/components/interactive-hero";
import { HomePageForm } from "./home-page-form";
import { MarketingPageFooter } from "./marketing-page-footer";
import { branding, marketing } from "@/config";

export default function MarketingPage() {
  return (
    <Box
      css={{
        color: "hsl(215.4, 16.3%, 46.9%)",
        background: "hsl(210, 20%, 98%)",
      }}
      mx="auto"
    >
      <MarketingHeader />
      <>
        {/* Hero Section */}
        <InteractiveHero />

        <FeaturesSection />
        <TestimonialsSlider />

        {/* Community Section */}
        <Box as="section" py="6rem">
          <Box maxW="1200px" mx="auto" px={{ base: 4, md: 6 }}>
            <VStack gap={4} align="start" mb={12}>
              <Text
                css={{
                  background: "linear-gradient(135deg, hsl(211, 71%, 43% / 0.08), hsl(335, 27%, 64% / 0.08))",
                  color: "hsl(211, 71%, 43%)",
                  fontWeight: 600,
                  padding: "6px 16px",
                  borderRadius: "9999px",
                  fontSize: "0.75rem",
                }}
              >
                {marketing.communitySection.pillLabel}
              </Text>
              <Heading
                as="h2"
                size="3xl"
                css={{
                  color: "hsl(222.2, 47.4%, 11.2%)",
                  lineHeight: 1.2,
                }}
              >
                {marketing.heroSection.joinMessage}
              </Heading>
              <Text fontSize="lg" css={{ color: "hsl(215.4, 16.3%, 46.9%)" }}>
                {marketing.heroSection.discoverMessage} {marketing.heroSection.fromText}
              </Text>
            </VStack>
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={6}>
              {marketing.communityCards.map((card, index) => (
                <Box
                  key={index}
                  className="glass-card"
                  css={{
                    borderRadius: "16px",
                    overflow: "hidden",
                    transition: "all 0.2s ease",
                    cursor: "pointer",
                  }}
                  _hover={{
                    transform: "translateY(-4px)",
                    boxShadow: "0 12px 40px rgba(29, 112, 191, 0.15)",
                  }}
                >
                  <Image
                    src={card.imageSrc}
                    h="200px"
                    w="100%"
                    objectFit="cover"
                    alt={card.title}
                  />
                  <VStack p={6} align="start" gap={4}>
                    <Text
                      css={{
                        background: "linear-gradient(135deg, hsl(211, 71%, 43% / 0.08), hsl(335, 27%, 64% / 0.08))",
                        color: "hsl(211, 71%, 43%)",
                        fontWeight: 600,
                        padding: "4px 12px",
                        borderRadius: "9999px",
                        fontSize: "0.7rem",
                      }}
                    >
                      {card.tag}
                    </Text>
                    <Heading size="md" css={{ color: "hsl(222.2, 47.4%, 11.2%)" }}>
                      {card.title}
                    </Heading>
                    <Text fontSize="sm" flexGrow={1} css={{ color: "hsl(215.4, 16.3%, 46.9%)" }}>
                      {card.description}
                    </Text>
                    <HStack gap={6} fontSize="sm" w="full" css={{ color: "hsl(215.4, 16.3%, 46.9%)" }}>
                      <HStack gap={2}>
                        <Icon as={UserIcon} css={{ color: "hsl(211, 71%, 43%)", width: "16px", height: "16px" }} />
                        <Text>{card.stat1}</Text>
                      </HStack>
                      <HStack gap={2}>
                        <Icon as={PostIcon} css={{ color: "hsl(211, 71%, 43%)", width: "16px", height: "16px" }} />
                        <Text>{card.stat2}</Text>
                      </HStack>
                    </HStack>
                    <HStack pt={2}>
                      <Image
                        borderRadius="full"
                        boxSize="40px"
                        src={card.author.avatar}
                        alt={card.author.name}
                      />
                      <VStack align="start" gap={0}>
                        <Text fontWeight="bold" fontSize="sm" css={{ color: "hsl(222.2, 47.4%, 11.2%)" }}>
                          {card.author.name}
                        </Text>
                        <Text fontSize="xs" css={{ color: "hsl(215.4, 16.3%, 46.9%)" }}>
                          {card.author.title}
                        </Text>
                      </VStack>
                    </HStack>
                  </VStack>
                </Box>
              ))}
            </SimpleGrid>
            <Flex justify="center" mt={12}>
              <Link href={"/community"}>
                <Button
                  size="lg"
                  css={{
                    background: "var(--gradient-primary)",
                    borderRadius: "12px",
                    fontWeight: 600,
                    transition: "all 0.15s ease",
                    "&:hover": {
                      boxShadow: "0 0 20px hsl(211, 71%, 43% / 0.3)",
                      transform: "translateY(-1px)",
                    },
                  }}
                >
                  Explore All Communities
                </Button>
              </Link>
            </Flex>
          </Box>
        </Box>

        {/* CTA Section */}
        <Box
          as="section"
          py={{ base: "4rem", md: "6rem" }}
          css={{
            background: "var(--gradient-primary)",
            position: "relative",
            overflow: "hidden",
          }}
          color="white"
        >
          {/* Decorative orbs */}
          <Box
            position="absolute"
            w="400px"
            h="400px"
            borderRadius="full"
            css={{
              background: "hsl(335, 27%, 64% / 0.15)",
              filter: "blur(80px)",
              top: "-150px",
              right: "-100px",
            }}
          />
          <Box
            position="absolute"
            w="300px"
            h="300px"
            borderRadius="full"
            css={{
              background: "hsl(211, 71%, 43% / 0.2)",
              filter: "blur(60px)",
              bottom: "-100px",
              left: "-50px",
            }}
          />
          <Box maxW="1200px" mx="auto" px={{ base: 4, md: 6 }} position="relative">
            <Flex
              direction={{ base: "column", lg: "row" }}
              gap={{ base: 12, lg: 16 }}
              align="center"
            >
              {/* Left Column */}
              <VStack
                align={{ base: "center", lg: "start" }}
                flex={1}
                gap={6}
                textAlign={{ base: "center", lg: "left" }}
              >
                <Text
                  css={{
                    background: "rgba(255,255,255,0.15)",
                    backdropFilter: "blur(8px)",
                    color: "white",
                    fontWeight: 600,
                    padding: "6px 16px",
                    borderRadius: "9999px",
                    fontSize: "0.75rem",
                  }}
                >
                  Ready to Share Your Voice?
                </Text>
                <Heading
                  size="2xl"
                  css={{
                    color: "white",
                    lineHeight: 1.2,
                  }}
                >
                  Start building your {branding.name} today
                </Heading>
                <Text css={{ color: "rgba(255,255,255,0.85)", maxW: "550px" }}>
                  {marketing.heroSection.joinCreators} and sustainable income through their passion and
                  creativity.
                </Text>

                <VStack align="start" gap={3} pt={4} w="full">
                  <Heading size="sm" css={{ color: "white" }}>
                    For Creators:
                  </Heading>
                  <HStack gap={4} align="start">
                    <Icon
                      as={CheckIcon}
                      css={{ color: "white", width: "24px", height: "24px", flexShrink: 0 }}
                    />
                    <Text css={{ color: "rgba(255,255,255,0.9)" }}>
                      Turn your existing audience into an intentional,
                      high-converting community
                    </Text>
                  </HStack>
                  <HStack gap={4} align="start">
                    <Icon
                      as={CheckIcon}
                      css={{ color: "white", width: "24px", height: "24px", flexShrink: 0 }}
                    />
                    <Text css={{ color: "rgba(255,255,255,0.9)" }}>
                      Simple setup, launch in minutes
                    </Text>
                  </HStack>
                  <HStack gap={4} align="start">
                    <Icon
                      as={CheckIcon}
                      css={{ color: "white", width: "24px", height: "24px", flexShrink: 0 }}
                    />
                    <Text css={{ color: "rgba(255,255,255,0.9)" }}>
                      No algorithms to fight, no trolls to manage
                    </Text>
                  </HStack>

                  <Heading size="sm" pt={4} css={{ color: "white" }}>
                    For Community Members:
                  </Heading>
                  <HStack gap={4} align="start">
                    <Icon
                      as={CheckIcon}
                      css={{ color: "white", width: "24px", height: "24px", flexShrink: 0 }}
                    />
                    <Text css={{ color: "rgba(255,255,255,0.9)" }}>
                      {marketing.heroSection.directAccess}
                    </Text>
                  </HStack>
                  <HStack gap={4} align="start">
                    <Icon
                      as={CheckIcon}
                      css={{ color: "white", width: "24px", height: "24px", flexShrink: 0 }}
                    />
                    <Text css={{ color: "rgba(255,255,255,0.9)" }}>
                      Exclusive content and experiences not found elsewhere
                    </Text>
                  </HStack>
                  <HStack gap={4} align="start">
                    <Icon
                      as={CheckIcon}
                      css={{ color: "white", width: "24px", height: "24px", flexShrink: 0 }}
                    />
                    <Text css={{ color: "rgba(255,255,255,0.9)" }}>
                      A peaceful, focused environment free from distractions
                    </Text>
                  </HStack>
                </VStack>

                <HStack gap={4} pt={6}>
                  <Link href={"/auth/login"}>
                    <Button
                      size="lg"
                      css={{
                        background: "white",
                        color: "hsl(211, 71%, 43%)",
                        borderRadius: "12px",
                        fontWeight: 600,
                        transition: "all 0.15s ease",
                        "&:hover": {
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
                      css={{
                        background: "rgba(255,255,255,0.15)",
                        backdropFilter: "blur(8px)",
                        color: "white",
                        borderWidth: "1px",
                        borderColor: "rgba(255,255,255,0.3)",
                        borderRadius: "12px",
                        fontWeight: 500,
                        transition: "all 0.15s ease",
                        "&:hover": {
                          background: "rgba(255,255,255,0.25)",
                        },
                      }}
                    >
                      Schedule Creator Demo
                    </Button>
                  </Link>
                </HStack>
              </VStack>

              {/* Right Column (Form) */}
              <Box
                flex={1}
                w="full"
                className="glass-card"
                css={{
                  color: "hsl(222.2, 47.4%, 11.2%)",
                  padding: { base: 6, md: 10 },
                  borderRadius: "16px",
                }}
              >
                <VStack gap={4} align="stretch">
                  <Heading size="lg" textAlign="center" mb={4}>
                    Join {branding.name}
                  </Heading>
                  <HomePageForm />
                  <Text
                    fontSize="xs"
                    textAlign="center"
                    css={{ color: "hsl(215.4, 16.3%, 46.9%)" }}
                    pt={2}
                  >
                    By signing up, you agree to our{" "}
                    <Link href="/tos" target="_blank" css={{ color: "hsl(211, 71%, 43%)", fontWeight: 500 }}>
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link href={"/privacy-policy"} target="_blank" css={{ color: "hsl(211, 71%, 43%)", fontWeight: 500 }}>
                      Privacy Policy
                    </Link>
                    .
                  </Text>
                </VStack>
              </Box>
            </Flex>
          </Box>
        </Box>
      </>

      <MarketingPageFooter />
    </Box>
  );
}
