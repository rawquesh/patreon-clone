import React from "react";
import { ChevronRight, Users, Heart, Shield, Clock } from "lucide-react";
import {
  Box,
  Button,
  Grid,
  GridItem,
  Heading,
  Image,
  Text,
  VStack,
  Circle,
  Stack,
} from "@chakra-ui/react";
import Link from "next/link";
import HomeLayout from "../home-layout";
import { branding, marketing } from "@/config";

interface ValueCard {
  icon: React.ReactNode;
  title: string;
  description: string;
  bgColor: string;
  iconColor: string;
}

const AboutPage: React.FC = () => {
  const values: ValueCard[] = [
    {
      icon: <Users size={24} />,
      title: marketing.aboutPage.values[0].title,
      description: marketing.aboutPage.values[0].description,
      bgColor: "hsl(211, 71%, 43% / 0.1)",
      iconColor: "hsl(211, 71%, 43%)",
    },
    {
      icon: <Heart size={24} />,
      title: marketing.aboutPage.values[1].title,
      description: marketing.aboutPage.values[1].description,
      bgColor: "hsl(335, 27%, 64% / 0.1)",
      iconColor: "hsl(335, 27%, 64%)",
    },
    {
      icon: <Shield size={24} />,
      title: marketing.aboutPage.values[2].title,
      description: marketing.aboutPage.values[2].description,
      bgColor: "hsl(160, 60%, 45% / 0.1)",
      iconColor: "hsl(160, 60%, 45%)",
    },
    {
      icon: <Clock size={24} />,
      title: marketing.aboutPage.values[3].title,
      description: marketing.aboutPage.values[3].description,
      bgColor: "hsl(215.4, 16.3%, 46.9% / 0.1)",
      iconColor: "hsl(215.4, 16.3%, 46.9%)",
    },
  ];

  return (
    <HomeLayout currentPageName="About">
      <Box css={{ background: "var(--app-bg)" }}>
        {/* Hero Section */}
        <Box
          as="section"
          py="20"
          css={{
            background: "rgba(255,255,255,0.5)",
            backdropFilter: "blur(8px)",
          }}
        >
          <Box maxW="7xl" mx="auto" px={{ base: 4, sm: 6, lg: 8 }}>
            <Box maxW="3xl">
              <Heading
                as="h1"
                fontSize="4xl"
                fontWeight="bold"
                css={{ color: "hsl(222.2, 47.4%, 11.2%)" }}
                mb="6"
              >
                {marketing.aboutPage.missionHeading}
              </Heading>
              <Text css={{ color: "hsl(215.4, 16.3%, 46.9%)" }} fontSize="xl" mb="8">
                {branding.name} {marketing.aboutPage.missionTextFull}
              </Text>
              <Link href={"/pricing"}>
                <Button className="btn-gradient" _hover={{ transform: "translateY(-1px)" }}>
                  <ChevronRight size={16} />
                  <Text>Start Creating</Text>
                </Button>
              </Link>
            </Box>
          </Box>
        </Box>

        {/* Our Story */}
        <Box as="section" py="20">
          <Box maxW="7xl" mx="auto" px={{ base: 4, sm: 6, lg: 8 }}>
            <Grid
              templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }}
              gap={12}
              alignItems="center"
            >
              <GridItem>
                <Heading
                  as="h2"
                  fontSize="3xl"
                  fontWeight="bold"
                  css={{ color: "hsl(222.2, 47.4%, 11.2%)" }}
                  mb="6"
                >
                  {marketing.aboutPage.ourStoryHeading}
                </Heading>
                <Stack gap={4} css={{ color: "hsl(215.4, 16.3%, 46.9%)" }}>
                  <Text>
                    {branding.name} {marketing.aboutPage.storyIntro} platform that addresses the needs of creators {marketing.aboutPage.storyMid}. We recognized that existing creator platforms were not designed with these needs in mind.
                  </Text>
                  <Text>
                    {marketing.aboutPage.storyTeam} builders came together to build something different — a platform that understands the importance of meaningful content alongside sustainable income.
                  </Text>
                  <Text>
                    {branding.name} reflects our core belief that creation is not just about content, but about the connections and communities that form around shared values and ideas.
                  </Text>
                </Stack>
              </GridItem>
              <GridItem>
                <Box
                  borderRadius="lg"
                  overflow="hidden"
                  css={{
                    boxShadow: "0 20px 60px hsl(211, 71%, 43% / 0.15)",
                  }}
                >
                  <Image
                    src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2389&q=80"
                    alt={marketing.aboutPage.altText}
                    w="full"
                    h="full"
                    objectFit="cover"
                  />
                </Box>
              </GridItem>
            </Grid>
          </Box>
        </Box>

        {/* Our Values */}
        <Box
          as="section"
          py="20"
          css={{
            background: "rgba(255,255,255,0.5)",
            backdropFilter: "blur(8px)",
          }}
        >
          <Box maxW="7xl" mx="auto" px={{ base: 4, sm: 6, lg: 8 }}>
            <VStack textAlign="center" mb="16">
              <Heading
                as="h2"
                fontSize="3xl"
                fontWeight="bold"
                css={{
                  background: "linear-gradient(135deg, hsl(211, 71%, 43%), hsl(335, 27%, 64%))",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
                mb="4"
              >
                {marketing.aboutPage.ourValuesHeading}
              </Heading>
              <Text css={{ color: "hsl(215.4, 16.3%, 46.9%)" }} fontSize="lg" maxW="3xl" mx="auto">
                {marketing.aboutPage.valuesIntro} {marketing.aboutPage.valuesFull}
              </Text>
            </VStack>

            <Grid
              templateColumns={{
                base: "1fr",
                md: "repeat(2, 1fr)",
                lg: "repeat(4, 1fr)",
              }}
              gap={8}
            >
              {values.map((value, idx) => (
                <GridItem
                  key={idx}
                  className="glass-card hover-lift"
                  p={8}
                  borderRadius="16px"
                >
                  <Circle
                    size="14"
                    css={{ background: value.bgColor }}
                    mb={6}
                  >
                    {React.cloneElement(value.icon as React.ReactElement, {
                      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                      //@ts-ignore
                      color: value.iconColor,
                    })}
                  </Circle>
                  <Heading
                    as="h3"
                    fontSize="xl"
                    fontWeight="bold"
                    css={{ color: "hsl(222.2, 47.4%, 11.2%)" }}
                    mb="3"
                  >
                    {value.title}
                  </Heading>
                  <Text css={{ color: "hsl(215.4, 16.3%, 46.9%)" }}>
                    {value.description}
                  </Text>
                </GridItem>
              ))}
            </Grid>
          </Box>
        </Box>

        {/* CTA Section */}
        <Box
          as="section"
          py="20"
          css={{ background: "var(--gradient-primary)" }}
          color="white"
        >
          <Box
            maxW="7xl"
            mx="auto"
            px={{ base: 4, sm: 6, lg: 8 }}
            textAlign="center"
          >
            <Heading as="h2" fontSize="3xl" fontWeight="bold" mb="6" color="white">
              {marketing.aboutPage.joinHeading}
            </Heading>
            <Text css={{ color: "rgba(255,255,255,0.85)" }} fontSize="xl" mb="8" maxW="2xl" mx="auto">
              {marketing.aboutPage.ctaText} {marketing.aboutPage.ctaFull}
            </Text>
            <Link href={"/pricing"}>
              <Button
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
                {marketing.aboutPage.getStartedCta}
              </Button>
            </Link>
          </Box>
        </Box>
      </Box>
    </HomeLayout>
  );
};

export default AboutPage;
