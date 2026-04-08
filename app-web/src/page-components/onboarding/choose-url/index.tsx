"use client";

import {
  Group,
  Input,
  InputElement,
  Stack,
  Text,
  Box,
  Flex,
} from "@chakra-ui/react";
import React, { useState, useEffect, useCallback } from "react";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";
import { toaster } from "@/components/ui/toaster";
import { NativeSelect } from "@chakra-ui/react";
import { useAuth } from "@/context/auth.provider";
import api from "@/lib/api";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CreatorCategory,
  ContentVisibility,
} from "@/typings/IUser";
import { Gender } from "@/types/auth";

// Simple debounce hook implementation
const useDebounce = <T,>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

const OnboardingForm: React.FC = () => {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [contentVisibleTo, setContentVisibleTo] = useState<ContentVisibility>(
    ContentVisibility.BOTH
  );
  const [category, setCategory] = useState<CreatorCategory>(
    CreatorCategory.GENERAL_EDUCATION
  );
  const [gender, setGender] = useState<Gender | "">("");
  const [isLoading, setIsLoading] = useState(false);
  const [isUsernameAvailable, setIsUsernameAvailable] = useState<
    boolean | null
  >(null);
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const { onboardCreator, user } = useAuth();

  const debouncedUsername = useDebounce(username, 500);

  // Pre-fill gender if available from user context
  useEffect(() => {
    if (user?.gender) {
      setGender(user.gender as Gender);
    }
  }, [user]);

  const checkUsernameAvailability = useCallback(async (username: string) => {
    if (!username || username.length < 3) {
      setIsUsernameAvailable(null);
      return;
    }

    setIsCheckingUsername(true);
    try {
      const { data } = await api.get(`/users/check-username/${username}`);
      setIsUsernameAvailable(data.available);
    } catch (error) {
      console.error("Error checking username availability:", error);
      setIsUsernameAvailable(false);
    } finally {
      setIsCheckingUsername(false);
    }
  }, []);

  useEffect(() => {
    checkUsernameAvailability(debouncedUsername);
  }, [debouncedUsername, checkUsernameAvailability]);

  const validateUsername = (username: string) => {
    const regex = /^[a-zA-Z0-9_]+$/;
    if (username.length < 3) {
      return "Username must be at least 3 characters long";
    }
    if (!regex.test(username)) {
      return "Username can only contain letters, numbers, and underscores";
    }
    if (isUsernameAvailable === false) {
      return "This username is already taken";
    }
    return null;
  };

  const handleSubmit = async () => {
    const validationError = validateUsername(username);
    if (validationError) {
      toaster.create({
        title: "Invalid Username",
        description: validationError,
        type: "error",
        duration: 3000,
      });
      return;
    }

    if (!agreedToTerms) {
      toaster.create({
        title: "Agreement Required",
        description:
          "You must agree to the Terms of Service and Privacy Policy",
        type: "error",
        duration: 3000,
      });
      return;
    }

    setIsLoading(true);
    try {
      await onboardCreator.mutateAsync({
        username,
        contentVisibleTo,
        category,
        ...(gender ? { gender } : {}),
      });

      // window.location.href = stripeOnboardingUrl;
      window.localStorage.setItem("userMode", "creator");
      window.location.href = "/profile";
    } catch (error: any) {
      toaster.create({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to create creator profile",
        type: "error",
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getUsernameIcon = () => {
    if (username.length < 3) {
      return null;
    }

    if (isCheckingUsername) {
      return <Icon fontSize={"1rem"} icon="line-md:loading-twotone-loop" />;
    }

    if (isUsernameAvailable === true) {
      return (
        <Icon
          fontSize={"1rem"}
          icon="icon-park-solid:check-one"
          color="green.600"
        />
      );
    }

    if (isUsernameAvailable === false) {
      return (
        <Icon
          fontSize={"1rem"}
          icon="emojione:cross-mark-button"
          color="red.600"
        />
      );
    }

    return null;
  };

  return (
    <Stack gap={6}>
      <Stack gap={4}>
        <Text fontSize={"2xl"} fontWeight={"bold"} as={"h1"}>
          Choose your URL
        </Text>
        <Group w={"100%"}>
          <InputElement>
            <Text fontWeight={500}>patreon-clone.example.com/</Text>
          </InputElement>
          <Input
            w={"100%"}
            rounded={"8px"}
            bg={{ base: "gray.100", _dark: "gray.500" }}
            outlineColor={"star.400"}
            variant={"outline"}
            placeholder={"Your creator name"}
            pl={"105px"}
            color={"gray.800"}
            fontWeight={500}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <InputElement
            color={isUsernameAvailable ? "green.600" : "red.600"}
            placement={"end"}
          >
            {getUsernameIcon()}
          </InputElement>
        </Group>
      </Stack>

      <Stack gap={4}>
        <Text fontSize={"xl"} fontWeight={"bold"}>
          Gender
        </Text>
        <NativeSelect.Root>
          <NativeSelect.Field
            value={gender}
            onChange={(e) => setGender(e.target.value as Gender)}
            placeholder="Select your gender"
          >
            <option value={Gender.MALE}>Male</option>
            <option value={Gender.FEMALE}>Female</option>
            <option value={Gender.OTHER}>Other</option>
          </NativeSelect.Field>
        </NativeSelect.Root>
      </Stack>

      <Stack gap={4}>
        <Text fontSize={"xl"} fontWeight={"bold"}>
          Content Visibility
        </Text>
        <NativeSelect.Root>
          <NativeSelect.Field
            value={contentVisibleTo}
            onChange={(e) =>
              setContentVisibleTo(e.target.value as ContentVisibility)
            }
            placeholder="Select content visibility"
          >
            <option value={ContentVisibility.BOTH}>
              Everyone - Visible to all users
            </option>
            <option value={ContentVisibility.MALE}>
              Male Only - Only visible to male users
            </option>
            <option value={ContentVisibility.FEMALE}>
              Female Only - Only visible to female users
            </option>
          </NativeSelect.Field>
        </NativeSelect.Root>
      </Stack>

      <Stack gap={4}>
        <Text fontSize={"xl"} fontWeight={"bold"}>
          Creator Category
        </Text>
        <NativeSelect.Root>
          <NativeSelect.Field
            value={category}
            onChange={(e) => setCategory(e.target.value as CreatorCategory)}
            placeholder="Select creator category"
          >
            {Object.values(CreatorCategory).map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </NativeSelect.Field>
        </NativeSelect.Root>
      </Stack>

      <Stack gap={4}>
        <Flex
          alignItems="flex-start"
          onClick={() => setAgreedToTerms(!agreedToTerms)}
          cursor="pointer"
        >
          <Box
            css={{
              "& svg": {
                color: agreedToTerms ? "blue.500" : "gray.500",
                fontSize: "20px",
              },
            }}
            mr="10px"
            mt="2px"
          >
            <Icon
              icon={agreedToTerms ? "bxs:checkbox-checked" : "bx:checkbox"}
              color={agreedToTerms ? "blue.500" : "gray.500"}
              fontSize="20px"
            />
          </Box>
          <Text fontSize="sm">
            By creating an account and checking this box, you are providing your
            written agreement with, and consent to, (1) the Patreon Clone Privacy
            Policy, which cover your use of the Patreon Clone website and apps and can
            be found here:{" "}
            <Link href="/privacy-policy" passHref legacyBehavior>
              <a
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "blue", textDecoration: "underline" }}
              >
                Privacy Policy
              </a>
            </Link>
            ; and (2) the Patreon Clone Terms of Service, which cover your use of the
            Patreon Clone website and apps and can be found here:{" "}
            <Link href="/tos" passHref legacyBehavior>
              <a
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "blue", textDecoration: "underline" }}
              >
                Terms Of Service
              </a>
            </Link>
            .
          </Text>
        </Flex>
      </Stack>

      <Stack gap={3} mt={4}>
        <Button
          h={"42px"}
          borderColor={"black"}
          w={"100%"}
          onClick={handleSubmit}
          loading={isLoading}
          disabled={
            username.length < 3 ||
            isUsernameAvailable === false ||
            isCheckingUsername ||
            !contentVisibleTo ||
            !category ||
            !gender ||
            !agreedToTerms
          }
        >
          Continue
        </Button>
        <Button
          h={"42px"}
          onClick={() => router.back()}
          variant={"ghost"}
          w={"100%"}
        >
          Back
        </Button>
      </Stack>
    </Stack>
  );
};

export default OnboardingForm;
