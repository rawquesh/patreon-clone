"use client";

import {
  Box,
  Flex,
  Grid,
  Heading,
  Link,
  SimpleGrid,
  Text,
  VStack,
} from "@chakra-ui/react";
import NextLink from "next/link";
import { QrDownload } from "@/components/QrDownload";
import { branding } from "@/config/branding";

export const MarketingPageFooter = () => {
  return (
    <Box
      as="footer"
      py={20}
      className="glass-card-static"
      css={{
        background: "rgba(255,255,255,0.5)",
        backdropFilter: "blur(12px)",
        borderTop: "1px solid rgba(255,255,255,0.5)",
      }}
    >
      <Box maxW="1200px" mx="auto" px={{ base: 4, md: 6 }}>
        <Flex alignItems={"start"} justify="space-between" direction={{ base: "column", lg: "row" }} gap={10}>
          <SimpleGrid columns={{ base: 1, md: 3 }} gap={10} flex={1}>
            <VStack align="start" gap={4}>
              <Box
                px={3}
                py={1.5}
                borderRadius="8px"
                css={{ background: "var(--gradient-primary)" }}
              >
                <Heading
                  size="sm"
                  css={{
                    background: "white",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                    fontWeight: 800,
                    letterSpacing: "-0.02em",
                  }}
                >
                  {branding.name}
                </Heading>
              </Box>
              <Text fontSize="sm" css={{ color: "hsl(215.4, 16.3%, 46.9%)", lineHeight: 1.7 }}>
                Empowering creators to share their voices, build thriving
                communities, and generate meaningful connections.
              </Text>
            </VStack>
            <VStack align="start">
              <Heading
                size="xs"
                fontWeight={700}
                mb={2}
                css={{ color: "hsl(222.2, 47.4%, 11.2%)" }}
              >
                Platform
              </Heading>
              <Grid
                templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }}
                gap={2}
                gridColumnGap={6}
              >
                <VStack align={"start"} gap={3}>
                  {[
                    { href: "/", label: "Home" },
                    { href: "/pricing", label: "Pricing" },
                    { href: "/community", label: "Communities" },
                  ].map((item) => (
                    <Link
                      as={NextLink}
                      key={item.href}
                      href={item.href}
                      css={{
                        color: "hsl(215.4, 16.3%, 46.9%)",
                        fontSize: "14px",
                        fontWeight: 500,
                        transition: "color 0.15s ease",
                        "&:hover": {
                          color: "hsl(211, 71%, 43%)",
                        },
                      }}
                    >
                      {item.label}
                    </Link>
                  ))}
                </VStack>
                <VStack align={"start"} gap={3}>
                  {[
                    { href: "/support", label: "Support" },
                    { href: "/privacy-policy", label: "Privacy Policy" },
                    { href: "/tos", label: "Terms of Service" },
                  ].map((item) => (
                    <Link
                      as={NextLink}
                      key={item.href}
                      href={item.href}
                      css={{
                        color: "hsl(215.4, 16.3%, 46.9%)",
                        fontSize: "14px",
                        fontWeight: 500,
                        transition: "color 0.15s ease",
                        "&:hover": {
                          color: "hsl(211, 71%, 43%)",
                        },
                      }}
                    >
                      {item.label}
                    </Link>
                  ))}
                </VStack>
              </Grid>
            </VStack>
          </SimpleGrid>
          <VStack w={{ base: "100%", lg: "400px" }} gap={3} align="center">
            <Heading
              size="xs"
              fontWeight={700}
              css={{ color: "hsl(222.2, 47.4%, 11.2%)" }}
            >
              Get the app
            </Heading>
            <Box
              className="glass-card"
              p={4}
              borderRadius="16px"
            >
              <QrDownload size={100} />
            </Box>
          </VStack>
        </Flex>

        <Box
          h="1px"
          background="linear-gradient(90deg, transparent, hsl(210, 30%, 88%), transparent)"
          mt={10}
          mb={6}
        />
        <Text
          textAlign="center"
          fontSize="13px"
          css={{ color: "hsl(215.4, 16.3%, 46.9%)" }}
        >
          {branding.copyright}
        </Text>
      </Box>
    </Box>
  );
};
