import React from "react";
import { ChevronRight, Users, Heart, Shield, Clock } from "lucide-react";
import {
  Box,
  Button,
  Container,
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
import { branding } from "@/config/branding";

// interface TeamMember {
//   name: string;
//   role: string;
//   bio: string;
//   image: string;
// }

interface ValueCard {
  icon: React.ReactNode;
  title: string;
  description: string;
  bgColor: string;
  iconColor: string;
}

const AboutPage: React.FC = () => {
  // const teamMembers: TeamMember[] = [
  //   {
  //     name: "David Goldstein",
  //     role: "Founder & CEO",
  //     bio: "Former tech executive with a passion for Jewish education and community building",
  //     image:
  //       "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=774&q=80",
  //   },
  //   {
  //     name: "Rebecca Levy",
  //     role: "Head of Creator Relations",
  //     bio: "Former community manager with extensive experience in Jewish non-profits",
  //     image:
  //       "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1770&q=80",
  //   },
  //   {
  //     name: "Jonathan Meyer",
  //     role: "CTO",
  //     bio: "Tech entrepreneur with a background in building community platforms",
  //     image:
  //       "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1770&q=80",
  //   },
  // ];

  const values: ValueCard[] = [
    {
      icon: <Users size={24} />,
      title: "Community First",
      description:
        "We believe in the power of patreon-clone—community—to nurture, support, and inspire. Our platform is designed to strengthen these bonds.",
      bgColor: branding.colors.lightBlue,
      iconColor: branding.colors.primaryDark,
    },
    {
      icon: <Heart size={24} />,
      title: "Jewish Values",
      description:
        "Our platform is built with an understanding of Jewish traditions, cultural nuances, and community needs at its core.",
      bgColor: branding.colors.desertLight,
      iconColor: branding.colors.accent,
    },
    {
      icon: <Shield size={24} />,
      title: "Creator Dignity",
      description:
        "We honor creators by providing fair compensation and a platform that respects their work, voice, and contribution to Jewish culture.",
      bgColor: branding.colors.greenLight,
      iconColor: branding.colors.greenDark,
    },
    {
      icon: <Clock size={24} />,
      title: "Lasting Impact",
      description:
        "We're building for the long term, creating sustainable infrastructure for Jewish creators to thrive for generations to come.",
      bgColor: branding.colors.grayTan,
      iconColor: branding.colors.star,
    },
  ];

  return (
    <HomeLayout currentPageName="About">
      <Box bg="white">
        {/* Hero Section */}
        <Box as="section" py="20" bg={branding.colors.duneLight}>
          <Container maxW="7xl" px={{ base: 4, sm: 6, lg: 8 }}>
            <Box maxW="3xl">
              <Heading
                as="h1"
                fontSize="4xl"
                fontWeight="bold"
                color=branding.colors.textHeader
                mb="6"
              >
                Our Mission
              </Heading>
              <Text color=branding.colors.star fontSize="xl" mb="8">
                Patreon Clone empowers Jewish creators to share their voices, build
                thriving communities, and generate meaningful connections and
                sustainable income.
              </Text>
              <Link href={"/pricing"}>
                <Button bg=branding.colors.primaryDark color="white" _hover={{ bg: branding.colors.primary }}>
                  <ChevronRight size={16} />
                  <Text>Start Creating</Text>
                </Button>
              </Link>
            </Box>
          </Container>
        </Box>

        {/* Our Story */}
        <Box as="section" py="20">
          <Container maxW="7xl" px={{ base: 4, sm: 6, lg: 8 }}>
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
                  color=branding.colors.textHeader
                  mb="6"
                >
                  Our Story
                </Heading>
                <Stack gap={4} color=branding.colors.star>
                  <Text>
                    Patreon Clone was founded with a clear vision: to create a
                    platform that specifically addresses the needs of Jewish
                    creators and their communities. We recognized that existing
                    creator platforms weren&apos;t designed with the unique
                    aspects of Jewish community-building in mind.
                  </Text>
                  <Text>
                    Our team of Jewish creators, technologists, and community
                    leaders came together to build something different – a
                    platform that understands the importance of tradition
                    alongside innovation, of meaningful content alongside
                    sustainable income.
                  </Text>
                  <Text>
                    The name &quot;Patreon Clone&quot; (קהילה) means
                    &quot;community&quot; in Hebrew, reflecting our core belief
                    that creation is not just about content, but about the
                    connections and communities that form around shared values
                    and ideas.
                  </Text>
                </Stack>
              </GridItem>
              <GridItem>
                <Box borderRadius="lg" overflow="hidden" boxShadow="xl">
                  <Image
                    src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2389&q=80"
                    alt="Jewish community gathering"
                    w="full"
                    h="full"
                    objectFit="cover"
                  />
                </Box>
              </GridItem>
            </Grid>
          </Container>
        </Box>

        {/* Our Values */}
        <Box as="section" py="20" bg=branding.colors.bgLight>
          <Container maxW="7xl" px={{ base: 4, sm: 6, lg: 8 }}>
            <VStack textAlign="center" mb="16">
              <Heading
                as="h2"
                fontSize="3xl"
                fontWeight="bold"
                color=branding.colors.textHeader
                mb="4"
              >
                Our Values
              </Heading>
              <Text color=branding.colors.star fontSize="lg" maxW="3xl" mx="auto">
                At Patreon Clone, our work is guided by a set of core principles that
                shape everything we do
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
                    color=branding.colors.textHeader
                    mb="3"
                  >
                    {value.title}
                  </Heading>
                  <Text color=branding.colors.star>{value.description}</Text>
                </GridItem>
              ))}
            </Grid>
          </Container>
        </Box>

        {/* Team Section */}
        {/* <Box as="section" py="20">
          <Container maxW="7xl" px={{ base: 4, sm: 6, lg: 8 }}>
            <VStack textAlign="center" mb="16">
              <Heading
                as="h2"
                fontSize="3xl"
                fontWeight="bold"
                color=branding.colors.textHeader
                mb="4"
              >
                Our Team
              </Heading>
              <Text color=branding.colors.star fontSize="lg" maxW="3xl" mx="auto">
                Patreon Clone is built by a diverse team of Jewish creators,
                technologists, and community builders
              </Text>
            </VStack>

            <Grid
              templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }}
              gap={8}
            >
              {teamMembers.map((member, idx) => (
                <GridItem
                  key={idx}
                  bg="white"
                  borderRadius="lg"
                  overflow="hidden"
                  boxShadow="md"
                >
                  <Image
                    src={member.image}
                    alt={member.name}
                    w="full"
                    h="64"
                    objectFit="cover"
                  />
                  <Box p={6}>
                    <Heading
                      as="h3"
                      fontSize="xl"
                      fontWeight="bold"
                      color=branding.colors.textHeader
                    >
                      {member.name}
                    </Heading>
                    <Text color=branding.colors.accent fontWeight="medium" mb="3">
                      {member.role}
                    </Text>
                    <Text color=branding.colors.star>{member.bio}</Text>
                  </Box>
                </GridItem>
              ))}
            </Grid>
          </Container>
        </Box> */}

        {/* CTA Section */}
        <Box as="section" py="20" bg=branding.colors.primary color="white">
          <Container
            maxW="7xl"
            px={{ base: 4, sm: 6, lg: 8 }}
            textAlign="center"
          >
            <Heading as="h2" fontSize="3xl" fontWeight="bold" mb="6">
              Join Our Growing Community
            </Heading>
            <Text color=branding.colors.lightBlue fontSize="xl" mb="8" maxW="2xl" mx="auto">
              Become part of the Patreon Clone family and help us build the future of
              Jewish creator communities
            </Text>
            <Link href={"/pricing"}>
              <Button
                bg="white"
                color=branding.colors.primaryDark
                _hover={{ bg: branding.colors.desertLight, color: branding.colors.accent }}
              >
                Get Started Today
              </Button>
            </Link>
          </Container>
        </Box>
      </Box>
    </HomeLayout>
  );
};

export default AboutPage;
