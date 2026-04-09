import React from "react";
import {
  Box,
  Button,
  Flex,
  Grid,
  GridItem,
  Heading,
  List,
  ListItem,
  Text,
} from "@chakra-ui/react";
import Link from "next/link";
import { branding } from "@/config/branding";

interface LayoutProps {
  children: React.ReactNode;
  currentPageName: string;
}

export default function Layout({ children }: LayoutProps) {
  // Define colors (from branding config)
  const primaryColor = branding.colors.primaryDark;
  const primaryHoverColor = branding.colors.primary;
  const textHeaderColor = branding.colors.textHeader;
  const textSubheaderColor = branding.colors.star;
  const borderColor = branding.colors.border;
  const bgColor = branding.colors.bgLight;

  return (
    <Box
      minH="100vh"
      display={{ base: "block", md: "grid" }}
      gridTemplateRows={"64px 1fr auto"}
      bg={bgColor}
    >
      {/* <Global styles={fontStyles} /> */}

      <Box as="header" bg="white" borderBottom="1px" borderColor={borderColor}>
        <Box maxW="7xl" mx="auto" px={{ base: 4, sm: 6, lg: 8 }}>
          <Flex justify="space-between" h="16" align="center">
            <Flex
              css={{
                "& a": {
                  fontSize: "2xl",
                  fontWeight: "bold",
                  color: textHeaderColor,
                  textDecoration: "none",
                  _hover: { textDecoration: "none" },
                },
              }}
              align="center"
            >
              <Link href={"/"}>{branding.name}</Link>
              <Flex
                fontFamily={"sans-serif"}
                display={{ base: "none", sm: "flex" }}
                ml={10}
                gap={8}
                css={{
                  "& a": {
                    fontWeight: 500,
                    fontSize: "18px",
                  },
                }}
              >
                <Link href={"/"}>Home</Link>
                <Link href={"/about"}>About</Link>
                <Link href={"/pricing"}>Pricing</Link>
              </Flex>
            </Flex>
            <Flex align="center" gap={4}>
              <Link href={"/auth/login"}>
                <Button
                  variant="outline"
                  borderColor={primaryColor}
                  color={primaryColor}
                  _hover={{
                    bg: primaryColor,
                    color: "white",
                  }}
                >
                  Login
                </Button>
              </Link>
              <Link href={"/auth/login"}>
                <Button
                  bg={primaryColor}
                  color="white"
                  _hover={{
                    bg: primaryHoverColor,
                  }}
                >
                  Sign Up
                </Button>
              </Link>
            </Flex>
          </Flex>
        </Box>
      </Box>

      <Box as="main">{children}</Box>

      <Box as="footer" bg={textHeaderColor} color="white" py={12}>
        <Box maxW="7xl" mx="auto" px={{ base: 4, sm: 6, lg: 8 }}>
          <Grid
            templateColumns={{ base: "repeat(1, 1fr)", md: "repeat(3, 1fr)" }}
            gap={8}
          >
            <GridItem>
              <Heading as="h3" fontSize="xl" fontWeight="bold" mb={4}>
                {branding.name}
              </Heading>
              <Text color={textSubheaderColor}>
                Empowering creators to share their voices and build
                thriving communities.
              </Text>
            </GridItem>
            <GridItem>
              <Heading as="h3" fontSize="xl" fontWeight="bold" mb={4}>
                Quick Links
              </Heading>
              <List.Root gap={2}>
                <ListItem
                  css={{
                    "& a": {
                      color: textSubheaderColor,
                      _hover: { color: "white" },
                    },
                  }}
                >
                  <Link href={"/"}>Home</Link>
                </ListItem>
                <ListItem>
                  <Link href={"/about"}>About</Link>
                </ListItem>
                <ListItem>
                  <Link href={"/pricing"}>Pricing</Link>
                </ListItem>
                <ListItem>
                  <Link href={"/privacy-policy"}>Privacy Policy</Link>
                </ListItem>
                <ListItem>
                  <Link href={"/tos"}>Terms of Service</Link>
                </ListItem>
              </List.Root>
            </GridItem>
            <GridItem>
              <Heading as="h3" fontSize="xl" fontWeight="bold" mb={4}>
                Contact
              </Heading>
              <Text color={textSubheaderColor}>
                Questions? Reach out to us at {branding.contact.supportEmail}
              </Text>
            </GridItem>
          </Grid>
        </Box>
      </Box>
    </Box>
  );
}
