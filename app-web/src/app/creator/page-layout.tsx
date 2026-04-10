"use client";
import SideNav from "@/components/SideNav";
import { useAuth } from "@/context/auth.provider";
import { Box, Flex, Heading } from "@chakra-ui/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { branding } from "@/config/branding";

export const PageLayout = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();

  return (
    <Box maxW="100vw" overflow="hidden">
      {Boolean(user) && <SideNav mode="user" />}
      {!Boolean(user) && (
        <Flex
          pos="fixed"
          w="100%"
          top={0}
          left={0}
          className="glass-card-static"
          css={{
            background: "linear-gradient(180deg, rgba(255,255,255,0.92) 0%, rgba(255,255,255,0.75) 100%)",
            "&::before": {
              content: '""',
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: "1px",
              background: "var(--glass-border)",
            },
          }}
          gap={4}
          px={6}
          py={3}
          zIndex={10000}
        >
          <Flex alignItems="center" gap={2}>
            <img
              src="/icons/logo.png"
              alt="logo"
              style={{ width: "32px", height: "32px", borderRadius: "8px" }}
            />
            <Heading
              size="lg"
              fontWeight={700}
              css={{
                background: "linear-gradient(135deg, hsl(211, 71%, 43%), hsl(335, 27%, 64%))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                fontSize: "1.1rem",
              }}
            >
              {branding.name}
            </Heading>
          </Flex>

          <Flex ml="auto" gap={3}>
            <Link href={"/auth/login"}>
              <Button
                size="sm"
                variant="outline"
                css={{
                  borderColor: "hsl(211, 71%, 43%)",
                  color: "hsl(211, 71%, 43%)",
                  borderRadius: "10px",
                  fontWeight: 600,
                  "&:hover": {
                    background: "hsl(211, 71%, 43% / 0.05)",
                  },
                }}
              >
                Login
              </Button>
            </Link>
            <Link href={"/auth/login"}>
              <Button
                size="sm"
                css={{
                  background: "var(--gradient-primary)",
                  borderRadius: "10px",
                  fontWeight: 600,
                }}
              >
                Sign Up
              </Button>
            </Link>
          </Flex>
        </Flex>
      )}
      {!Boolean(user) && <Box h="64px" w="100%" />}
      <Box
        ml={{ base: 0, lg: Boolean(user) ? "280px" : 0 }}
        className="bg-gradient-overlay"
        minH="100vh"
        mt={{ base: "48px", lg: 0 }}
      >
        {children}
      </Box>
    </Box>
  );
};
