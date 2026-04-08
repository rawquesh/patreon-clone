"use client";

import { Button } from "@/components/ui/button";
import { InputGroup } from "@/components/ui/input-group";
import { toaster } from "@/components/ui/toaster";
import { useAuth } from "@/context/auth.provider";
import { Input, Stack, Text, NativeSelect } from "@chakra-ui/react";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useState } from "react";
import { Gender } from "@/types/auth";

const CompleteAccountPage: React.FC = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [gender, setGender] = useState<Gender | undefined>(undefined);
  const { push } = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email");

  const { registerWithEmail } = useAuth();

  const handleContinue = async () => {
    if (!firstName || !lastName || !gender || !password || !email) {
      toaster.create({
        title: "Error",
        description: "Please fill out all fields",
        type: "error",
        duration: 3000,
      });
      return;
    }

    if (password.length < 8) {
      toaster.create({
        title: "Error",
        description: "Password must be at least 8 characters long",
        type: "error",
        duration: 3000,
      });
      return;
    }

    try {
      await registerWithEmail.mutateAsync({
        email,
        password,
        firstName,
        lastName,
        gender,
      });
      push("/explore");
    } catch (error) {
      console.log(error);
      toaster.create({
        title: "Error",
        description: "Something went wrong. Please try again.",
        type: "error",
        duration: 3000,
      });
    }
  };

  return (
    <Stack
      minW={"300px"}
      maxW={"350px"}
      mx={"auto"}
      h={"100vh"}
      alignItems={"center"}
      justifyContent={"center"}
      gap={4}
    >
      <Text fontSize={"2xl"} fontWeight={600} textAlign={"center"}>
        Complete your account
      </Text>

      <Text color={"gray.800"} fontSize={"md"} textAlign={"center"}>
        Signing up as {email}
      </Text>

      <Stack w={"100%"} gap={6}>
        <Stack gap={2}>
          <Text fontWeight={500}>First Name</Text>
          <InputGroup w={"100%"}>
            <Input
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="First Name"
              border="1px solid"
            />
          </InputGroup>
        </Stack>

        <Stack gap={2}>
          <Text fontWeight={500}>Last Name</Text>
          <InputGroup w={"100%"}>
            <Input
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Last Name"
              border="1px solid"
            />
          </InputGroup>
        </Stack>

        <Stack gap={2}>
          <Text fontWeight={500}>Gender</Text>
          <NativeSelect.Root>
            <NativeSelect.Field
              border="1px solid"
              borderColor="inherit"
              value={gender || ""}
              onChange={(e) => setGender(e.currentTarget.value as Gender)}
            >
              <option value="" disabled>
                Select Gender
              </option>
              <option value={Gender.MALE}>Male</option>
              <option value={Gender.FEMALE}>Female</option>
              <option value={Gender.OTHER}>Other</option>
            </NativeSelect.Field>
            <NativeSelect.Indicator />
          </NativeSelect.Root>
        </Stack>

        <Stack gap={2}>
          <Text fontWeight={500}>Create a password</Text>
          <InputGroup w={"100%"}>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
            />
          </InputGroup>
          <Text color={"gray.400"} fontSize={"sm"}>
            Passwords need to have at least 8 characters.
          </Text>
        </Stack>

        <Button
          disabled={
            firstName.length < 1 ||
            lastName.length < 1 ||
            !gender ||
            password.length < 8
          }
          mt={2}
          w={"100%"}
          onClick={handleContinue}
          loading={registerWithEmail.isPending}
        >
          Continue
        </Button>
      </Stack>
    </Stack>
  );
};

export default CompleteAccountPage;
