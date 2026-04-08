"use client";

import { Button } from "@/components/ui/button";
import { Field, Input, VStack } from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import { useRef } from "react";

export const HomePageForm = () => {
  const router = useRouter();

  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleSubmit = () => {
    if (!inputRef.current) return;
    router.push(`/auth/login?email=${inputRef.current.value}`);
  };
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        handleSubmit();
      }}
    >
      <VStack gap={4} align="stretch">
        <Field.Root>
          <Field.Label fontSize="sm" fontWeight="600">
            Full Name
          </Field.Label>
          <Input placeholder="Your name" bg="gray.50" />
        </Field.Root>
        <Field.Root>
          <Field.Label fontSize="sm" fontWeight="600">
            Email Address
          </Field.Label>
          <Input
            required
            ref={inputRef}
            type="email"
            placeholder="you@example.com"
            bg="gray.50"
          />
        </Field.Root>
        <Button
          w="full"
          size="lg"
          bg="#1D70BF"
          color="white"
          _hover={{ bg: "#3283d1" }}
          mt={4}
          type="submit"
        >
          Create Your Community
        </Button>
      </VStack>
    </form>
  );
};
