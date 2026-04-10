"use client";

import { branding } from "@/config/branding";
import ButtonWithIcon from "@/components/ui/button-with-icon";
import { toaster } from "@/components/ui/toaster";
import { useAuth } from "@/context/auth.provider";
import api from "@/lib/api";
import { ApiEndpoints } from "@/lib/backend-services/api_endpoints";
import { getErrorMessage } from "@/lib/toasts";
import { AlertCircle, Eye, EyeOff, Loader2 } from "lucide-react";
import { Box, Flex, Text, VStack, Input } from "@chakra-ui/react";
import Link from "next/link";
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
    } = await api.get(ApiEndpoints.authCheckEmail(email));
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
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
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
    setError(null);
    if (!email) return;

    if (!isPasswordStep) {
      const { isInUse, passwordSet } = await checkEmail(email);
      if (isInUse && passwordSet) {
        setIsPasswordStep(true);
        return;
      } else {
        push(`/auth/login/set-password?email=${email}`);
        return;
      }
    } else {
      if (!password) return;
      setIsLoading(true);
      try {
        await loginWithEmail.mutateAsync({ email, password });
      } catch (error) {
        const message = getErrorMessage(error, "Invalid email or password");
        setError(message);
        toaster.create({
          title: "Login failed",
          description: message,
          type: "error",
          duration: 4000,
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <Box
      className="bg-animated-gradient"
      position="fixed"
      inset={0}
      display="flex"
      alignItems="center"
      justifyContent="center"
      overflow="hidden"
    >
      {/* Decorative floating orbs */}
      <Box
        className="orb orb-lg"
        position="absolute"
        top="-48"
        left="-48"
        w="450px"
        h="450px"
        borderRadius="full"
        css={{ background: "hsl(211, 71%, 43% / 0.1)", filter: "blur(60px)" }}
      />
      <Box
        className="orb orb-md"
        position="absolute"
        bottom="20"
        right="-20"
        w="300px"
        h="300px"
        borderRadius="full"
        css={{ background: "hsl(335, 27%, 64% / 0.1)", filter: "blur(60px)" }}
      />
      <Box
        className="orb orb-sm"
        position="absolute"
        top="33%"
        left="25%"
        w="200px"
        h="200px"
        borderRadius="full"
        css={{ background: "hsl(160, 60%, 45% / 0.1)", filter: "blur(60px)" }}
      />

      {/* Grid pattern overlay */}
      <Box
        position="absolute"
        inset={0}
        pointerEvents="none"
        opacity={0.02}
        css={{
          backgroundImage: `linear-gradient(hsl(222.2, 47.4%, 11.2%, 0.05) 1px, transparent 1px),
                           linear-gradient(90deg, hsl(222.2, 47.4%, 11.2%, 0.05) 1px, transparent 1px)`,
          backgroundSize: "48px 48px",
        }}
      />

      {/* Glass Login Card */}
      <Box
        className="glass-card"
        position="relative"
        w="100%"
        maxW="md"
        mx={4}
        borderRadius="2xl"
        overflow="hidden"
        css={{
          animation: "fade-in-up 0.4s ease-out forwards",
        }}
      >
        {/* Gradient top bar */}
        <Box
          h="1.5"
          css={{ background: "var(--gradient-primary)" }}
        />

        <VStack gap={5} textAlign="center" py={8} px={8}>
          {/* Logo + Brand */}
          <Link href="/">
            <Flex alignItems="center" gap={3} cursor="pointer">
              <img
                src="/icons/logo.png"
                alt="logo"
                style={{ width: "44px", height: "44px", borderRadius: "12px" }}
              />
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
          </Link>

          {/* Title */}
          <VStack gap={1}>
            <Text
              fontSize="2xl"
              fontWeight={700}
              css={{
                background: "linear-gradient(135deg, hsl(211, 71%, 43%), hsl(335, 27%, 64%))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              {isPasswordStep ? "Welcome back" : "Log in or Sign up"}
            </Text>
            <Text fontSize="sm" css={{ color: "hsl(215.4, 16.3%, 46.9%)" }}>
              {isPasswordStep
                ? `Sign in to your ${branding.name} account`
                : "Enter your email to continue"}
            </Text>
          </VStack>

          {/* Error alert */}
          {error && (
            <Flex
              alignItems="center"
              gap={2.5}
              w="100%"
              borderRadius="xl"
              className="glass-card"
              p={3.5}
              css={{ border: "1px solid hsl(0, 84.2%, 60.2% / 0.2)" }}
            >
              <Box
                p={1}
                borderRadius="full"
                css={{ background: "hsl(0, 84.2%, 60.2% / 0.1)" }}
              >
                <AlertCircle size={16} color="hsl(0, 84.2%, 60.2%)" />
              </Box>
              <Text fontSize="sm" fontWeight={500} css={{ color: "hsl(0, 84.2%, 60.2%)" }}>
                {error}
              </Text>
            </Flex>
          )}

          {/* Google Button */}
          <ButtonWithIcon
            variant="outline"
            w="100%"
            h="48px"
            icon="flat-color-icons:google"
            borderRadius="12px"
            css={{
              border: "1px solid hsl(210, 30%, 88%)",
              fontWeight: 600,
            }}
            onClick={() => handleGoogleLogin()}
          >
            <Text fontWeight={500}>Continue with Google</Text>
          </ButtonWithIcon>

          {/* Divider */}
          <Flex alignItems="center" w="100%" gap={3}>
            <Box flex={1} h="1px" css={{ background: "hsl(210, 30%, 88%)" }} />
            <Text fontSize="sm" css={{ color: "hsl(215.4, 16.3%, 46.9%)" }}>or</Text>
            <Box flex={1} h="1px" css={{ background: "hsl(210, 30%, 88%)" }} />
          </Flex>

          {/* Email Input */}
          <Box w="100%" textAlign="left">
            <Text fontSize="sm" fontWeight={500} mb={1.5} css={{ color: "hsl(222.2, 47.4%, 11.2%)" }}>
              Email Address
            </Text>
            <Input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !isPasswordStep) handleContinue();
              }}
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              h="44px"
              borderRadius="12px"
              css={{
                background: "rgba(255, 255, 255, 0.6)",
                backdropFilter: "blur(8px)",
                border: "1px solid rgba(255, 255, 255, 0.5)",
                fontSize: "0.9rem",
                transition: "all 0.2s ease",
              }}
              _focus={{
                background: "rgba(255, 255, 255, 0.8)",
                borderColor: "hsl(211, 71%, 43%)",
                boxShadow: "0 0 0 3px hsl(211, 71%, 43% / 0.1), 0 0 20px hsl(211, 71%, 43% / 0.2)",
                outline: "none",
              }}
            />
          </Box>

          {/* Password Input */}
          {isPasswordStep && (
            <Box w="100%" textAlign="left">
              <Text fontSize="sm" fontWeight={500} mb={1.5} css={{ color: "hsl(222.2, 47.4%, 11.2%)" }}>
                Password
              </Text>
              <Box position="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleContinue();
                  }}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  h="44px"
                  borderRadius="12px"
                  pr={10}
                  css={{
                    background: "rgba(255, 255, 255, 0.6)",
                    backdropFilter: "blur(8px)",
                    border: "1px solid rgba(255, 255, 255, 0.5)",
                    fontSize: "0.9rem",
                    transition: "all 0.2s ease",
                  }}
                  _focus={{
                    background: "rgba(255, 255, 255, 0.8)",
                    borderColor: "hsl(211, 71%, 43%)",
                    boxShadow: "0 0 0 3px hsl(211, 71%, 43% / 0.1), 0 0 20px hsl(211, 71%, 43% / 0.2)",
                    outline: "none",
                  }}
                />
                <Box
                  as="button"
                  position="absolute"
                  right={3}
                  top="50%"
                  transform="translateY(-50%)"
                  cursor="pointer"
                  color="hsl(215.4, 16.3%, 46.9%)"
                  transition="color 0.15s ease"
                  _hover={{ color: "hsl(222.2, 47.4%, 11.2%)" }}
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </Box>
              </Box>
            </Box>
          )}

          {/* Submit Button */}
          <Box
            as="button"
            w="100%"
            h="44px"
            borderRadius="12px"
            fontWeight={600}
            fontSize="0.9rem"
            className="btn-gradient"
            display="flex"
            alignItems="center"
            justifyContent="center"
            gap={2}
            onClick={
              isLoading ||
              email.length < 1 ||
              (isPasswordStep && password.length < 1)
                ? undefined
                : handleContinue
            }
            cursor={
              isLoading ||
              email.length < 1 ||
              (isPasswordStep && password.length < 1)
                ? "not-allowed"
                : "pointer"
            }
            opacity={
              isLoading ||
              email.length < 1 ||
              (isPasswordStep && password.length < 1)
                ? 0.6
                : 1
            }
            transition="all 0.2s ease"
          >
            {isLoading ? (
              <>
                <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} />
                <span>Signing in...</span>
              </>
            ) : (
              <span>{isPasswordStep ? "Sign In" : "Continue"}</span>
            )}
          </Box>

          {/* Back button when on password step */}
          {isPasswordStep && (
            <Box
              as="button"
              fontSize="sm"
              css={{
                color: "hsl(211, 71%, 43%)",
                fontWeight: 500,
                cursor: "pointer",
                background: "none",
                border: "none",
              }}
              onClick={() => {
                setIsPasswordStep(false);
                setPassword("");
                setError(null);
              }}
            >
              Use a different email address
            </Box>
          )}

          {/* Terms */}
          <Text fontSize="xs" css={{ color: "hsl(215.4, 16.3%, 46.9%)" }}>
            By continuing, you agree to our{" "}
            <a href="/tos" target="_blank" style={{ color: "hsl(211, 71%, 43%)", fontWeight: 500 }}>
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="/privacy-policy" target="_blank" style={{ color: "hsl(211, 71%, 43%)", fontWeight: 500 }}>
              Privacy Policy
            </a>
            .
          </Text>
        </VStack>
      </Box>
    </Box>
  );
};

export default LoginPages;
