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
      bgColor: branding.colors.lightBlue,
      iconColor: branding.colors.primaryDark,
    },
    {
      icon: <Heart size={24} />,
      title: marketing.aboutPage.values[1].title,
      description: marketing.aboutPage.values[1].description,
      bgColor: branding.colors.desertLight,
      iconColor: branding.colors.accent,
    },
    {
      icon: <Shield size={24} />,
      title: marketing.aboutPage.values[2].title,
      description: marketing.aboutPage.values[2].description,
      bgColor: branding.colors.greenLight,
      iconColor: branding.colors.greenDark,
    },
    {
      icon: <Clock size={24} />,
      title: marketing.aboutPage.values[3].title,
      description: marketing.aboutPage.values[3].description,
      bgColor: branding.colors.grayTan,
      iconColor: branding.colors.star,
    },
  ];

  return (
    <HomeLayout currentPageName="About">
      <Box bg="white">
        {/* Hero Section */}
        <Box as="section" py="20" bg={branding.colors.duneLight}>
          <Box maxW="7xl" mx="auto" px={{ base: 4, sm: 6, lg: 8 }}>
            <Box maxW="3xl">
              <Heading
                as="h1"
                fontSize="4xl"
                fontWeight="bold"
                color={branding.colors.textHeader}
                mb="6"
              >
                {marketing.aboutPage.missionHeading}
              </Heading>
              <Text color={branding.colors.star} fontSize="xl" mb="8">
                {branding.name} {marketing.aboutPage.missionTextFull}
              </Text>
              <Link href={"/pricing"}>
                <Button bg={branding.colors.primaryDark} color="white" _hover={{ bg: branding.colors.primary }}>
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
                  color={branding.colors.textHeader}
                  mb="6"
                >
                  {marketing.aboutPage.ourStoryHeading}
                </Heading>
                <Stack gap={4} color={branding.colors.star}>
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
                <Box borderRadius="lg" overflow="hidden" boxShadow="xl">
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
        <Box as="section" py="20" bg={branding.colors.bgLight}>
          <Box maxW="7xl" mx="auto" px={{ base: 4, sm: 6, lg: 8 }}>
            <VStack textAlign="center" mb="16">
              <Heading
                as="h2"
                fontSize="3xl"
                fontWeight="bold"
                color={branding.colors.textHeader}
                mb="4"
              >
                {marketing.aboutPage.ourValuesHeading}
              </Heading>
              <Text color={branding.colors.star} fontSize="lg" maxW="3xl" mx="auto">
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
                  bg="white"
                  p={8}
                  borderRadius="lg"
                  boxShadow="md"
                >
                  <Circle size="14" bg={value.bgColor} mb={6}>
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
                    color={branding.colors.textHeader}
                    mb="3"
                  >
                    {value.title}
                  </Heading>
                  <Text color={branding.colors.star}>{value.description}</Text>
                </GridItem>
              ))}
            </Grid>
          </Box>
        </Box>

        {/* CTA Section */}
        <Box as="section" py="20" bg={branding.colors.primary} color="white">
          <Box
            maxW="7xl"
            mx="auto"
            px={{ base: 4, sm: 6, lg: 8 }}
            textAlign="center"
          >
            <Heading as="h2" fontSize="3xl" fontWeight="bold" mb="6">
              {marketing.aboutPage.joinHeading}
            </Heading>
            <Text color={branding.colors.lightBlue} fontSize="xl" mb="8" maxW="2xl" mx="auto">
              {marketing.aboutPage.ctaText} {marketing.aboutPage.ctaFull}
            </Text>
            <Link href={"/pricing"}>
              <Button
                bg="white"
                color={branding.colors.primaryDark}
                _hover={{ bg: branding.colors.desertLight, color: branding.colors.accent }}
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
