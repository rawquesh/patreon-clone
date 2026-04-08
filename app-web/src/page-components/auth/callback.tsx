"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Flex, Heading, Spinner, VStack } from "@chakra-ui/react";
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
    <Flex minH="100vh" alignItems="center" justifyContent="center">
      <VStack gap={6}>
        <Heading size="lg">Completing login...</Heading>
        <Spinner
          borderWidth="4px"
          animationDuration="0.65s"
          color="blue.500"
          size="xl"
        />
      </VStack>
    </Flex>
  );
}
