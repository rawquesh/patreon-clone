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
  Container,
} from "@chakra-ui/react";
import { Icon } from "@iconify/react";
// import { ChevronLeftIcon, ChevronRightIcon } from "@chakra-ui/icons";

// --- SVGs for Feature Icons ---
// In a real project, you might import these from separate files
// const MonetizeIcon = (props: any) => (
//   <Icon viewBox="0 0 24 24" {...props}>
//     <path
//       fill="currentColor"
//       d="M7,15H9C9,16.08 10.37,17 12,17C13.63,17 15,16.08 15,15C15,13.9 13.96,13.5 11.76,12.97C9.64,12.44 7,11.78 7,9C7,7.21 8.47,5.69 10.5,5.18V3H13.5V5.18C15.53,5.69 17,7.21 17,9H15C15,7.92 13.63,7 12,7C10.37,7 9,7.92 9,9C9,10.1 10.04,10.5 12.24,11.03C14.36,11.56 17,12.22 17,15C17,16.79 15.53,18.31 13.5,18.82V21H10.5V18.82C8.47,18.31 7,16.79 7,15Z"
//     />
//   </Icon>
// );
// const ValuesIcon = (props: any) => (
//   <Icon viewBox="0 0 24 24" {...props}>
//     <path
//       fill="currentColor"
//       d="M12,13A5,5 0 0,1 7,8H9A3,3 0 0,0 12,11A3,3 0 0,0 15,8H17A5,5 0 0,1 12,13M12,3A3,3 0 0,1 15,6H9A3,3 0 0,1 12,3M19,6H17A5,5 0 0,0 12,1A5,5 0 0,0 7,6H5C3.89,6 3,6.89 3,8V20A2,2 0 0,0 5,22H19A2,2 0 0,0 21,20V8C21,6.89 20.1,6 19,6Z"
//     />
//   </Icon>
// );
// const MonetizeIcon = createIcon({
//   displayName: "MonetizeIcon",
//   path: (
//     <path
//       fill="currentColor"
//       d="M7,15H9C9,16.08 10.37,17 12,17C13.63,17 15,16.08 15,15C15,13.9 13.96,13.5 11.76,12.97C9.64,12.44 7,11.78 7,9C7,7.21 8.47,5.69 10.5,5.18V3H13.5V5.18C15.53,5.69 17,7.21 17,9H15C15,7.92 13.63,7 12,7C10.37,7 9,7.92 9,9C9,10.1 10.04,10.5 12.24,11.03C14.36,11.56 17,12.22 17,15C17,16.79 15.53,18.31 13.5,18.82V21H10.5V18.82C8.47,18.31 7,16.79 7,15Z"
//     />
//   ),
// });

// const ValuesIcon = createIcon({
//   displayName: "ValuesIcon",
//   path: (
//     <path
//       fill="currentColor"
//       d="M12,13A5,5 0 0,1 7,8H9A3,3 0 0,0 12,11A3,3 0 0,0 15,8H17A5,5 0 0,1 12,13M12,3A3,3 0 0,1 15,6H9A3,3 0 0,1 12,3M19,6H17A5,5 0 0,0 12,1A5,5 0 0,0 7,6H5C3.89,6 3,6.89 3,8V20A2,2 0 0,0 5,22H19A2,2 0 0,0 21,20V8C21,6.89 20.1,6 19,6Z"
//     />
//   ),
// });

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
        "Transform your Torah, creativity, and expertise into sustainable income. With Patreon Clone, you can offer paid subscriptions, host live events or shiurim, share exclusive content, or teach classes — all on a platform that respects your values and mission.",
    },
    {
      icon: <Icon icon="hugeicons:honor" />,
      title: "Honor Your Values",
      description:
        "No more compromising your content to please algorithms. Patreon Clone lets you earn from your work while maintaining authenticity and integrity. Even a small dedicated community can generate meaningful income — without chasing trends or sacrificing your vision.",
    },
  ],
  "Engage Your Community": [
    {
      icon: <Icon icon="ic:baseline-gpp-good" />, // Placeholder
      title: "Foster Meaningful Relationships",
      description:
        "Build deep, personal connections with your supporters away from the noise and distractions. Patreon Clone provides private messaging, members-only discussion spaces, and interactive Q&As.",
    },
    {
      icon: <Icon icon="iconoir:community" />, // Placeholder
      title: "Build a Valued Community",
      description: `Your followers aren't just numbers — they're people seeking
                  connection. Patreon Clone transforms passive followers into active
                  community members who feel seen, heard, and valued through
                  tools designed specifically for Jewish creators and
                  communities.`,
    },
  ],
  "Simplify Your Work": [
    {
      icon: <Icon icon="streamline-ultimate:layout-content-bold" />, // Placeholder
      title: "Focus on Your Content",
      description:
        "Stop juggling multiple platforms and services. Patreon Clone combines everything you need into one seamless experience: publish posts, run events, track growth, and receive payments.",
    },
    {
      icon: <Icon icon="icon-park-solid:thinking-problem" />, // Placeholder
      title: "All-In-One Solution",
      description: `Memberships, premium content, events, and digital product
                  sales — all in one place. With direct access to your audience
                  through chat groups, direct messages, and feed posts, you can
                  focus on creating value rather than fighting with technology.`,
    },
  ],
  "Torah Values": [
    {
      icon: <Icon icon="mdi:jewish" />,
      title: "Built for Jewish Creators",
      description: `Unlike mainstream platforms, Patreon Clone was built from the ground
                  up for Jewish creators. Everything reflects the needs of a
                  Torah-centered life, from scheduling around holidays to
                  content moderation aligned with Jewish values.`,
    },
    {
      icon: <Icon icon="game-icons:peace-dove" />,
      title: "A Peaceful, Jewish-Centered Environment",
      description: `Enjoy a space free from trolls, spam, and the distractions of
                  mainstream social media. Patreon Clone provides a respectful
                  environment where Jewish voices can be shared authentically,
                  without fear of censorship or harassment.`,
    },
  ],
};

export function FeaturesSection() {
  const [activeTab, setActiveTab] = useState("Monetize Your Passion");

  return (
    <Box as="section" py="6rem">
      <Container maxW="1200px" px={{ base: 4, md: 8 }}>
        <VStack gap={4} align="flex-start" mb={12}>
          <Text
            bg="#F7F5ED"
            color="#1D70BF"
            fontWeight="600"
            px={4}
            py={2}
            borderRadius="full"
            fontSize={".75rem"}
          >
            Why Creators Choose Patreon Clone
          </Text>
          <Heading as="h2" size="3xl" color="#201F18">
            A space built for Jewish voices to thrive
          </Heading>
          <Text fontSize="lg" color="#5A5954" maxW="700px">
            In a digital landscape that wasn&apos;t designed with us in mind,
            Patreon Clone offers Jewish creators and their communities a dedicated
            platform to connect, create, and grow together.
          </Text>
        </VStack>
        <HStack gap={2} flexWrap="wrap" mb={10}>
          {(Object.keys(featuresData) as Array<keyof typeof featuresData>).map(
            (tabKey) => (
              <Button
                key={tabKey}
                bg={activeTab === tabKey ? "#1D70BF" : "#F7F5ED"}
                color={activeTab === tabKey ? "white" : "#5A5954"}
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
                      color: "#1D70BF",
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
                  <Text color="#5A5954">{tab.description}</Text>
                </Box>
              </HStack>
            ))}
          </VStack>
        </Flex>
      </Container>
    </Box>
  );
}

// --- Testimonials Slider Component ---
const testimonialsData = [
  // This matches the second testimonial in the image
  {
    id: 2,
    quote:
      "After years of fighting Instagram's algorithm, Patreon Clone feels like coming home. I create Jewish art that doesn't always fit the 'trending' mold, and here I can share my work with people who truly appreciate it. My subscription community is smaller than my social following, but it generates 5x more income and feels infinitely more meaningful. The best part? Direct connection with my community without algorithm interference.",
    author: "Sarah Goldstein",
    title: "Jewish Visual Artist",
    avatar: "https://randomuser.me/api/portraits/women/44.jpg",
  },
  // Add other testimonials to make the slider work
  {
    id: 1,
    quote:
      "Patreon Clone has transformed how I share my Torah insights. I've built a supportive community that values depth and authenticity, away from the noise of mainstream platforms. The sustainable income has allowed me to dedicate more time to learning and teaching without constantly chasing algorithms or trends.",
    author: "Rabbi David Katz",
    title: "Torah Educator",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
  },
  {
    id: 3,
    quote:
      "My Jewish history podcast was growing steadily, but monetization was a constant struggle. On Patreon Clone, I've built a thriving community that supports my work directly. The platform makes it easy to share exclusive episodes, host live discussions, and connect with listeners who care deeply about our shared heritage. I've finally found the perfect balance between creative freedom and sustainable income — all in a space that respects and celebrates Jewish voices.",
    author: "Josh Levine",
    title: "Jewish History Podcaster",
    avatar: "https://randomuser.me/api/portraits/men/75.jpg",
  },
];

export function TestimonialsSlider() {
  const [currentIndex, setCurrentIndex] = useState(0);

  return (
    <Box as="section" bg="#F7F5ED" py="6rem">
      <Container maxW="800px" px={4}>
        <VStack gap={8} textAlign="center">
          <Text
            bg="#F1E6D0"
            color="#AB5437"
            fontWeight="600"
            px={4}
            py={2}
            borderRadius="full"
          >
            Success Stories
          </Text>
          <Heading as="h2" size="xl">
            Voices from Our Patreon Clone
          </Heading>
          <Text fontSize="lg">
            Hear from creators who&apos;ve found their home with us
          </Text>

          <Box
            position="relative"
            w="full"
            bg="white"
            p={{ base: 8, md: 12 }}
            borderRadius="16px"
            boxShadow="0 10px 30px rgba(0,0,0,0.05)"
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
                color="#201F18"
              >
                {testimonialsData[currentIndex].quote}
              </Text>
              <VStack>
                <Image
                  borderRadius="full"
                  boxSize="70px"
                  src={testimonialsData[currentIndex].avatar}
                  alt={testimonialsData[currentIndex].author}
                  border="3px solid #F7F5ED"
                />
                <Text fontWeight="600" color="#201F18" fontSize="lg">
                  {testimonialsData[currentIndex].author}
                </Text>
                <Text fontSize="sm" color="#5A5954">
                  {testimonialsData[currentIndex].title}
                </Text>
              </VStack>
            </VStack>
          </Box>

          <HStack>
            <IconButton
              onClick={() =>
                setCurrentIndex(
                  (p) =>
                    (p - 1 + testimonialsData.length) % testimonialsData.length
                )
              }
              aria-label="Previous"
              // icon={}
              // isRound
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
            {testimonialsData.map((_, index) => (
              <Box
                key={index}
                as="button"
                h="10px"
                w="10px"
                borderRadius="full"
                bg={index === currentIndex ? "#1D70BF" : "gray.300"}
                onClick={() => setCurrentIndex(index)}
              />
            ))}
            <IconButton
              onClick={() =>
                setCurrentIndex((p) => (p + 1) % testimonialsData.length)
              }
              aria-label="Next"
              // icon={}
              // isRound
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
      </Container>
    </Box>
  );
}
