import React from "react";
import {
  Box,
  Button,
  Container,
  Flex,
  Grid,
  GridItem,
  Heading,
  List,
  ListItem,
  Text,
} from "@chakra-ui/react";
import Link from "next/link";

interface LayoutProps {
  children: React.ReactNode;
  currentPageName: string;
}

export default function Layout({ children }: LayoutProps) {
  // const fontStyles = `
  //   @font-face {
  //     font-family: 'Tiempos Headline';
  //     src: url('https://use.typekit.net/af/c0843b/00000000000000007735e13b/30/l?primer=7cdcb44be4a7db8877ffa5c0007b8dd865b3bbc383831fe2ea177f62257a9191&fvd=n7&v=3') format('woff2');
  //     font-display: swap;
  //     font-style: normal;
  //     font-weight: 700;
  //   }

  //   h1, h2, h3 {
  //     font-family: 'Tiempos Headline', serif;
  //   }
  // `;

  // Define colors
  const primaryColor = "#1962A5";
  const primaryHoverColor = "#1D70BF";
  // const secondaryColor = "#CB785C";
  // const secondaryHoverColor = "#D4A27F";
  const textHeaderColor = "#141413";
  const textSubheaderColor = "#C4C3BB";
  // const textBodyColor = "#5A5954";
  // const accentGreenColor = "#618967";
  // const accentGreenLightColor = "#7EB286";
  const borderColor = "#E6E5DD";
  const bgColor = "#EBEAE4";

  // Navigation link style function
  // const getLinkStyle = (pageName: string) => {
  //   return {
  //     display: "inline-flex",
  //     alignItems: "center",
  //     px: 1,
  //     pt: 1,
  //     fontSize: "sm",
  //     fontWeight: "medium",
  //     color: currentPageName === pageName ? primaryColor : textBodyColor,
  //     borderBottom:
  //       currentPageName === pageName ? `2px solid ${primaryColor}` : "none",
  //     _hover: {
  //       color: currentPageName === pageName ? primaryColor : textHeaderColor,
  //     },
  //   };
  // };

  return (
    <Box
      minH="100vh"
      display={{ base: "block", md: "grid" }}
      gridTemplateRows={"64px 1fr auto"}
      bg={bgColor}
    >
      {/* <Global styles={fontStyles} /> */}

      <Box as="header" bg="white" borderBottom="1px" borderColor={borderColor}>
        <Container maxW="7xl" px={{ base: 4, sm: 6, lg: 8 }}>
          <Flex justify="space-between" h="16" align="center">
            <Flex
              css={{
                "& a": {
                  fontSize: "2xl",
                  fontWeight: "bold",
                  color: textHeaderColor,
                  fontFamily: "'Tiempos Headline', serif",
                  textDecoration: "none",
                  _hover: { textDecoration: "none" },
                },
              }}
              align="center"
            >
              <Link href={"/"}>Patreon Clone</Link>
              <Flex
                fontFamily={"sans-serif"}
                display={{ base: "none", sm: "flex" }}
                ml={10}
                gap={8}
                css={{
                  "& a": {
                    fontFamily: "Epilogue",
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
        </Container>
      </Box>

      <Box as="main">{children}</Box>

      <Box as="footer" bg={textHeaderColor} color="white" py={12}>
        <Container maxW="7xl" px={{ base: 4, sm: 6, lg: 8 }}>
          <Grid
            templateColumns={{ base: "repeat(1, 1fr)", md: "repeat(3, 1fr)" }}
            gap={8}
          >
            <GridItem>
              <Heading as="h3" fontSize="xl" fontWeight="bold" mb={4}>
                Patreon Clone
              </Heading>
              <Text color={textSubheaderColor}>
                Empowering Jewish creators to share their voices and build
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
                Questions? Reach out to us at support@patreon-clone.example.com
              </Text>
            </GridItem>
          </Grid>
        </Container>
      </Box>
    </Box>
  );
}
