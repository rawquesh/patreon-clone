"use client";

import { Button } from "@/components/ui/button";
import ButtonWithIcon from "@/components/ui/button-with-icon";
import { InputGroup } from "@/components/ui/input-group";
import { toaster } from "@/components/ui/toaster";
import { useAuth } from "@/context/auth.provider";
import api from "@/lib/api";
import { IconButton, Image, Input, Stack, Text } from "@chakra-ui/react";
import { Icon } from "@iconify/react/dist/iconify.js";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";
// import Logo from "./logo";

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
          // isClosable: true,
        });
      }
    } else {
      push(`/auth/login/set-password?email=${email}`);
      return;
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
    >
      <Image w={"56px"} src="/icons/logo.svg" alt="Patreon Clone" />
      {/* <Logo /> */}
      <Text fontSize={"xl"} fontWeight={600} textAlign={"center"}>
        Log in or Sign up
      </Text>

      <ButtonWithIcon
        variant={"outline"}
        w={"100%"}
        icon="flat-color-icons:google"
        mt={3}
        onClick={() => handleGoogleLogin()}
      >
        <Text>Continue with Google</Text>
      </ButtonWithIcon>

      <Text color={"star.600"}>or</Text>

      <InputGroup
        w={"100%"}
        endElement={
          <IconButton
            onClick={() => {
              setEmail("");
            }}
            variant={"ghost"}
            size={"sm"}
          >
            <Icon icon={"mingcute:close-fill"} />
          </IconButton>
        }
      >
        <Input
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
          }}
          placeholder="Email"
        />
      </InputGroup>

      {isPasswordStep && (
        <InputGroup w={"100%"}>
          <Input
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
            }}
            placeholder="Password"
          />
        </InputGroup>
      )}

      <Button
        disabled={email.length < 1 || (isPasswordStep && password.length < 1)}
        mt={5}
        w={"100%"}
        onClick={handleContinue}
        loading={loginWithEmail.isPending}
      >
        {isPasswordStep ? "Log in" : "Continue"}
      </Button>
    </Stack>
  );
};

export default LoginPages;
