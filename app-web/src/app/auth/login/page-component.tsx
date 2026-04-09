"use client";

import { branding } from "@/config/branding";
import { Button } from "@/components/ui/button";
import ButtonWithIcon from "@/components/ui/button-with-icon";
import { InputGroup } from "@/components/ui/input-group";
import { toaster } from "@/components/ui/toaster";
import { useAuth } from "@/context/auth.provider";
import api from "@/lib/api";
import { IconButton, Input, Stack, Text, Box, Flex, VStack } from "@chakra-ui/react";
import { Icon } from "@iconify/react/dist/iconify.js";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";

const checkEmail = async (
  email: string
): Promise<{
  isInUse: boolean;
  passwordSet: boolean;
}> => {
  try {
    const {
      data: { isInUse, passwordSet },
    } = await api.get(`/auth/check-email/${email}`);
    return { isInUse, passwordSet };
  } catch (error) {
    console.error("Error checking email:", error);
    throw error;
  }
};

const LoginPages: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isPasswordStep, setIsPasswordStep] = useState(false);
  const { loginWithEmail, handleGoogleLogin } = useAuth();
  const searchParams = useSearchParams();

  const { push } = useRouter();

  useEffect(() => {
    const em = searchParams.get("email");
    if (em) {
      setEmail(em);
    }
  }, [searchParams]);

  const handleContinue = async () => {
    if (!email) {
      return;
    }
    const { isInUse, passwordSet } = await checkEmail(email);

    console.log({ isInUse });

    if (!isPasswordStep && isInUse && passwordSet) {
      setIsPasswordStep(true);
      return;
    } else if (isPasswordStep && email && password) {
      try {
        await loginWithEmail.mutateAsync({ email, password });
      } catch (error) {
        console.log(error);
        toaster.create({
          title: "Error",
          description: "Invalid email or password",
          type: "error",
          duration: 3000,
        });
      }
    } else {
      push(`/auth/login/set-password?email=${email}`);
      return;
    }
  };

  return (
    <Box
      className="bg-animated-gradient"
      minW="300px"
      maxW="420px"
      mx="auto"
      h="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      py={8}
    >
      <Box
        className="glass-card"
        w="100%"
        maxW="400px"
        mx={4}
        p={8}
        borderRadius="20px"
        css={{
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Gradient top accent */}
        <Box
          position="absolute"
          top={0}
          left={0}
          right={0}
          h="3px"
          css={{
            background: "var(--gradient-primary)",
          }}
        />

        <VStack gap={5}>
          {/* Logo + Brand */}
          <Flex alignItems="center" gap={3} mb={2}>
            <Box
              w="44px"
              h="44px"
              borderRadius="12px"
              background="var(--gradient-primary)"
              display="flex"
              alignItems="center"
              justifyContent="center"
              flexShrink={0}
            >
              <Box as="img" src="/icons/logo.png" alt="logo" boxSize="26px" />
            </Box>
            <Text
              fontWeight={700}
              fontSize="xl"
              css={{
                background: "linear-gradient(135deg, hsl(211, 71%, 43%), hsl(335, 27%, 64%))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              {branding.name}
            </Text>
          </Flex>

          <Text
            fontSize="xl"
            fontWeight={700}
            textAlign="center"
            css={{ color: "hsl(222.2, 47.4%, 11.2%)" }}
          >
            Log in or Sign up
          </Text>

          {/* Google Button */}
          <ButtonWithIcon
            variant="outline"
            w="100%"
            icon="flat-color-icons:google"
            css={{
              borderRadius: "12px",
              height: "48px",
              border: "1px solid hsl(210, 30%, 88%)",
              fontWeight: 600,
              "&:hover": {
                background: "hsl(210, 20%, 98%)",
                borderColor: "hsl(211, 71%, 43%)",
              },
            }}
            onClick={() => handleGoogleLogin()}
          >
            <Text fontWeight={500}>Continue with Google</Text>
          </ButtonWithIcon>

          {/* Divider */}
          <Flex alignItems="center" w="100%" gap={3}>
            <Box flex={1} h="1px" css={{ background: "hsl(210, 30%, 88%)" }} />
            <Text fontSize="sm" css={{ color: "hsl(215.4, 16.3%, 46.9%)" }}>
              or
            </Text>
            <Box flex={1} h="1px" css={{ background: "hsl(210, 30%, 88%)" }} />
          </Flex>

          {/* Email Input */}
          <InputGroup w="100%">
            <Input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              borderRadius="12px"
              h="48px"
              css={{
                background: "rgba(255, 255, 255, 0.7)",
                backdropFilter: "blur(8px)",
                border: "1px solid hsl(210, 30%, 88%)",
                fontSize: "0.9rem",
                transition: "all 0.15s ease",
                "&:focus": {
                  background: "rgba(255, 255, 255, 0.9)",
                  borderColor: "hsl(211, 71%, 43%)",
                  boxShadow: "0 0 0 3px hsl(211, 71%, 43% / 0.1), 0 0 20px hsl(211, 71%, 43% / 0.2)",
                  outline: "none",
                },
              }}
            />
          </InputGroup>

          {/* Password Input (shown when on password step) */}
          {isPasswordStep && (
            <InputGroup w="100%">
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                borderRadius="12px"
                h="48px"
                css={{
                  background: "rgba(255, 255, 255, 0.7)",
                  backdropFilter: "blur(8px)",
                  border: "1px solid hsl(210, 30%, 88%)",
                  fontSize: "0.9rem",
                  transition: "all 0.15s ease",
                  "&:focus": {
                    background: "rgba(255, 255, 255, 0.9)",
                    borderColor: "hsl(211, 71%, 43%)",
                    boxShadow: "0 0 0 3px hsl(211, 71%, 43% / 0.1), 0 0 20px hsl(211, 71%, 43% / 0.2)",
                    outline: "none",
                  },
                }}
              />
            </InputGroup>
          )}

          {/* Submit Button */}
          <Button
            disabled={email.length < 1 || (isPasswordStep && password.length < 1)}
            w="100%"
            h="48px"
            borderRadius="12px"
            fontWeight={600}
            onClick={handleContinue}
            loading={loginWithEmail.isPending}
            css={{
              background: "var(--gradient-primary)",
              "&:hover": {
                boxShadow: "0 0 20px hsl(211, 71%, 43% / 0.3)",
              },
            }}
          >
            {isPasswordStep ? "Log in" : "Continue"}
          </Button>

          {/* Terms */}
          <Text
            fontSize="xs"
            textAlign="center"
            css={{ color: "hsl(215.4, 16.3%, 46.9%)" }}
          >
            By continuing, you agree to our{" "}
            <Box as="a" href="/tos" target="_blank" css={{ color: "hsl(211, 71%, 43%)", fontWeight: 500 }}>
              Terms of Service
            </Box>{" "}
            and{" "}
            <Box as="a" href="/privacy-policy" target="_blank" css={{ color: "hsl(211, 71%, 43%)", fontWeight: 500 }}>
              Privacy Policy
            </Box>
            .
          </Text>
        </VStack>
      </Box>
    </Box>
  );
};

export default LoginPages;
