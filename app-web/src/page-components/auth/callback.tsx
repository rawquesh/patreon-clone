"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Flex, Heading, Spinner, VStack, Box } from "@chakra-ui/react";
import { setCookie } from "cookies-next";

const setAuthToken = (token: string) => {
  localStorage.setItem("token", token);
  setCookie("token", token, {
    path: "/",
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 30 * 24 * 60 * 60,
  });
};

export default function AuthCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get("token");
    if (token) {
      setAuthToken(token);
      if (typeof window !== "undefined") {
        window.location.replace("/home");
      } else {
        router.push("/home");
      }
    } else {
      router.push("/");
    }
  }, [router, searchParams]);

  return (
    <Flex minH="100vh" alignItems="center" justifyContent="center" className="animate-fade-in-up">
      <VStack gap={6}>
        <Box className="glass-card" p={8} borderRadius="20px" css={{ boxShadow: "var(--glow-primary)" }}>
          <Heading
            size="lg"
            mb={4}
            textAlign="center"
            css={{
              background: "linear-gradient(135deg, hsl(211, 71%, 43%), hsl(335, 27%, 64%))",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Completing login...
          </Heading>
          <Flex justify="center">
            <Spinner
              borderWidth="4px"
              animationDuration="0.65s"
              css={{
                color: "hsl(211, 71%, 43%)",
                "& .chakra-spinner__track": {
                  borderColor: "hsl(211, 71%, 43% / 0.1)",
                },
              }}
              size="xl"
            />
          </Flex>
        </Box>
      </VStack>
    </Flex>
  );
}
