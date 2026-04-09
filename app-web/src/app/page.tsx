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
  Container,
  Icon,
} from "@chakra-ui/react";
// Import the interactive components
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
      color={branding.colors.star}
      // maxW="99vw"
      // border={"2px solid red"}
      mx={"auto"}
      bg="white"
    >
      <MarketingHeader />
      <>
        {/* Hero Section */}
        <InteractiveHero />

        <FeaturesSection />
        <TestimonialsSlider />

        {/* Community Section */}
        <Box as="section" py="6rem" bg="white">
          <Container maxW="1200px">
            <VStack gap={4} align="start" mb={12}>
              <Text
                bg={branding.colors.bgWarm}
                color={branding.colors.primary}
                fontWeight="600"
                px={4}
                py={2}
                borderRadius="full"
                fontSize={".75rem"}
              >
                {marketing.communitySection.pillLabel}
              </Text>
              <Heading as="h2" size="3xl">
                Join Thriving Jewish Communities
              </Heading>
              <Text fontSize="lg">
                Discover spaces where Jewish voices are celebrated, shared, and
                supported. From Torah scholars to Jewish artists, find your
                place in our growing {branding.name}.
              </Text>
            </VStack>
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={8}>
              {marketing.communityCards.map((card, index) => (
                <Box
                  key={index}
                  bg="white"
                  borderRadius="16px"
                  boxShadow="0 10px 30px rgba(0,0,0,0.05)"
                  overflow="hidden"
                  _hover={{
                    transform: "translateY(-5px)",
                    boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
                  }}
                  transition="all 0.3s ease"
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
                      bg="rgba(29, 112, 191, 0.1)"
                      color={branding.colors.primary}
                      fontWeight="600"
                      px={3}
                      py={1}
                      borderRadius="full"
                      fontSize="xs"
                    >
                      {card.tag}
                    </Text>
                    <Heading size="md">{card.title}</Heading>
                    <Text fontSize="sm" flexGrow={1}>
                      {card.description}
                    </Text>
                    {/* STATS HSTACK - CORRECTED */}
                    <HStack gap={6} color={branding.colors.star} fontSize="sm" w="full">
                      {/* Added boxSize="16px" to both Icons */}
                      <HStack gap={2}>
                        <Icon as={UserIcon} color={branding.colors.primary} boxSize="16px" />{" "}
                        <Text>{card.stat1}</Text>
                      </HStack>
                      <HStack gap={2}>
                        <Icon as={PostIcon} color={branding.colors.primary} boxSize="16px" />{" "}
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
                        <Text fontWeight="bold" fontSize="sm">
                          {card.author.name}
                        </Text>
                        <Text fontSize="xs">{card.author.title}</Text>
                      </VStack>
                    </HStack>
                  </VStack>
                </Box>
              ))}
            </SimpleGrid>
            <Flex justify="center" mt={12}>
              <Link href={"/community"}>
                <Button
                  bg={branding.colors.primary}
                  color="white"
                  _hover={{ bg: branding.colors.primaryHover }}
                  size="lg"
                >
                  Explore All Communities
                </Button>
              </Link>
            </Flex>
          </Container>
        </Box>

        {/* CTA Section */}
        <Box
          as="section"
          py={{ base: "4rem", md: "6rem" }}
          bg={branding.colors.primary}
          color="white"
        >
          <Container maxW="1200px">
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
                  bg="whiteAlpha.200"
                  color="white"
                  fontWeight="600"
                  px={4}
                  py={2}
                  borderRadius="full"
                >
                  Ready to Share Your Voice?
                </Text>
                <Heading size="2xl">Start building your {branding.name} today</Heading>
                <Text color="whiteAlpha.800" maxW="550px">
                  Join hundreds of Jewish creators building meaningful
                  communities and sustainable income through their passion and
                  creativity.
                </Text>

                {/* Corrected VStack for feature points */}
                <VStack align="start" gap={3} pt={4} w="full">
                  <Heading size="sm">For Creators:</Heading>
                  <HStack gap={4}>
                    <Icon
                      as={CheckIcon}
                      color="white"
                      boxSize="24px"
                      flexShrink={0}
                    />
                    <Text>
                      Turn your existing audience into an intentional,
                      high-converting community
                    </Text>
                  </HStack>
                  <HStack gap={4}>
                    <Icon
                      as={CheckIcon}
                      color="white"
                      boxSize="24px"
                      flexShrink={0}
                    />
                    <Text>Simple setup, launch in minutes</Text>
                  </HStack>
                  <HStack gap={4}>
                    <Icon
                      as={CheckIcon}
                      color="white"
                      boxSize="24px"
                      flexShrink={0}
                    />
                    <Text>No algorithms to fight, no trolls to manage</Text>
                  </HStack>

                  <Heading size="sm" pt={4}>
                    For Community Members:
                  </Heading>
                  <HStack gap={4}>
                    <Icon
                      as={CheckIcon}
                      color="white"
                      boxSize="24px"
                      flexShrink={0}
                    />
                    <Text>Direct access to the Jewish voices you love</Text>
                  </HStack>
                  <HStack gap={4}>
                    <Icon
                      as={CheckIcon}
                      color="white"
                      boxSize="24px"
                      flexShrink={0}
                    />
                    <Text>
                      Exclusive content and experiences not found elsewhere
                    </Text>
                  </HStack>
                  <HStack gap={4}>
                    <Icon
                      as={CheckIcon}
                      color="white"
                      boxSize="24px"
                      flexShrink={0}
                    />
                    <Text>
                      A peaceful, focused environment free from distractions
                    </Text>
                  </HStack>
                </VStack>

                <HStack gap={4} pt={6}>
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
                      bg="whiteAlpha.200"
                      color="white"
                      borderWidth="1px"
                      borderColor="whiteAlpha.300"
                      _hover={{ bg: "whiteAlpha.300" }}
                      fontWeight="normal"
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
                bg="white"
                color={branding.colors.textDark}
                p={{ base: 6, md: 10 }}
                borderRadius="16px"
                boxShadow="0 20px 60px rgba(0,0,0,0.1)"
              >
                <VStack gap={4} align="stretch">
                  <Heading size="lg" textAlign="center" mb={4}>
                    Join {branding.name}
                  </Heading>
                  <HomePageForm />
                  <Text
                    css={{
                      "& a": {
                        color: branding.colors.primary,
                      },
                    }}
                    fontSize="xs"
                    textAlign="center"
                    color={branding.colors.star}
                    pt={2}
                  >
                    By signing up, you agree to our{" "}
                    <Link href="/tos" target="_blank" color={branding.colors.primary}>
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link href={"/privacy-policy"} target="_blank">
                      Privacy Policy
                    </Link>
                    .
                  </Text>
                </VStack>
              </Box>
            </Flex>
          </Container>
        </Box>
      </>

      <MarketingPageFooter />
    </Box>
  );
}
