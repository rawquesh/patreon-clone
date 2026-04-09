"use client";
import { Box, Flex, Stack, Text, Heading } from "@chakra-ui/react";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { toaster } from "@/components/ui/toaster";
import api from "@/lib/api";
import { CreateMembershipForm } from "@/components/forms/create-membership-form";

const CreateMembershipPage = () => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (formDataToSend: FormData) => {
    setIsSubmitting(true);

    try {
      await api.post("/memberships", formDataToSend, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      toaster.create({
        title: "Success",
        description: "Membership tier created successfully",
        type: "success",
        duration: 3000,
      });
      router.push("/profile?tab=membership");
    } catch (error: any) {
      toaster.create({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to create membership tier",
        type: "error",
        duration: 3000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push("/profile?tab=membership");
  };

  return (
    <Stack
      maxW="800px"
      mx="auto"
      p={8}
      gap={6}
      className="animate-fade-in-up"
    >
      <Flex justifyContent="space-between" alignItems="center">
        <Heading
          fontSize="2xl"
          fontWeight="bold"
          css={{
            background: "linear-gradient(135deg, hsl(211, 71%, 43%), hsl(335, 27%, 64%))",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          Create New Tier
        </Heading>
      </Flex>

      <Box className="glass-card" p={6} borderRadius="16px">
        <CreateMembershipForm
          onSubmit={handleSubmit}
          isLoading={isSubmitting}
          onCancel={handleCancel}
          submitButtonText="Create Tier"
        />
      </Box>
    </Stack>
  );
};

export default CreateMembershipPage;
