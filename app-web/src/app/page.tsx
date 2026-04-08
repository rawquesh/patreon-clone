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

const communityCardsData = [
  {
    imageSrc:
      "https://images.unsplash.com/photo-1576267423445-b2e0074d68a4?auto=format&fit=crop&w=400",
    tag: "Torah Learning",
    title: "Daily Daf Insights",
    description:
      "A community dedicated to daily Talmud study with insightful commentary and discussion.",
    stat1: "5.2K Members",
    stat2: "Daily",
    author: {
      name: "Rabbi David Katz",
      title: "Torah Educator",
      avatar: "https://randomuser.me/api/portraits/men/32.jpg",
    },
  },
  {
    imageSrc:
      "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?auto=format&fit=crop&w=400",
    tag: "Jewish Art",
    title: "Modern Judaica",
    description:
      "Contemporary Jewish artists exploring traditional themes through modern artistic expressions.",
    stat1: "3.8K Members",
    stat2: "Weekly",
    author: {
      name: "Sarah Goldstein",
      title: "Jewish Visual Artist",
      avatar: "https://randomuser.me/api/portraits/women/44.jpg",
    },
  },
  {
    imageSrc:
      "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=400",
    tag: "Podcast",
    title: "Jewish History Unveiled",
    description:
      "Exploring the rich tapestry of Jewish history through engaging storytelling and scholarly research.",
    stat1: "7.4K Listeners",
    stat2: "Bi-weekly",
    author: {
      name: "Josh Levine",
      title: "Jewish History Podcaster",
      avatar: "https://randomuser.me/api/portraits/men/75.jpg",
    },
  },
];

export default function MarketingPage() {
  return (
    <Box
      color="#5A5954"
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
                bg="#F7F5ED"
                color="#1D70BF"
                fontWeight="600"
                px={4}
                py={2}
                borderRadius="full"
                fontSize={".75rem"}
              >
                Find Your Patreon Clone
              </Text>
              <Heading as="h2" size="3xl">
                Join Thriving Jewish Communities
              </Heading>
              <Text fontSize="lg">
                Discover spaces where Jewish voices are celebrated, shared, and
                supported. From Torah scholars to Jewish artists, find your
                place in our growing patreon-clone.
              </Text>
            </VStack>
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={8}>
              {communityCardsData.map((card, index) => (
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
                      color="#1D70BF"
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
                    <HStack gap={6} color="#5A5954" fontSize="sm" w="full">
                      {/* Added boxSize="16px" to both Icons */}
                      <HStack gap={2}>
                        <Icon as={UserIcon} color="#1D70BF" boxSize="16px" />{" "}
                        <Text>{card.stat1}</Text>
                      </HStack>
                      <HStack gap={2}>
                        <Icon as={PostIcon} color="#1D70BF" boxSize="16px" />{" "}
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
                  bg="#1D70BF"
                  color="white"
                  _hover={{ bg: "#3283d1" }}
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
          bg="#1D70BF"
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
                <Heading size="2xl">Start building your Patreon Clone today</Heading>
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
                      color="#1D70BF"
                      _hover={{ bg: "gray.200" }}
                    >
                      Get Started
                    </Button>
                  </Link>
                  <Link
                    href={"https://app.simplymeet.me/patreon-clone/patreon-clone-intro"}
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
                color="#201F18"
                p={{ base: 6, md: 10 }}
                borderRadius="16px"
                boxShadow="0 20px 60px rgba(0,0,0,0.1)"
              >
                <VStack gap={4} align="stretch">
                  <Heading size="lg" textAlign="center" mb={4}>
                    Join Patreon Clone
                  </Heading>
                  <HomePageForm />
                  <Text
                    css={{
                      "& a": {
                        color: "#1D70BF",
                      },
                    }}
                    fontSize="xs"
                    textAlign="center"
                    color="#5A5954"
                    pt={2}
                  >
                    By signing up, you agree to our{" "}
                    <Link href="/tos" target="_blank" color="#1D70BF">
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
