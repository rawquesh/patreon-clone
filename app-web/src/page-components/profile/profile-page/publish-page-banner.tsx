"use client";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/auth.provider";
import { Box, Flex, HStack, Text, VStack } from "@chakra-ui/react";
import React, { useState } from "react";
import {
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogRoot,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { toaster } from "@/components/ui/toaster";
import { AlertTriangle } from "lucide-react";
import api from "@/lib/api";

const PublishPageBanner: React.FC = () => {
  const { user } = useAuth();
  const [isPublishing, setIsPublishing] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);

  const currentStatus = user?.creatorStatus?.toUpperCase() || "PENDING";

  if (!user?.isCreator || currentStatus === "PUBLISHED") {
    return null;
  }

  const handlePublish = async () => {
    if (!acceptTerms) {
      toaster.create({
        title: "Error",
        description: "You must accept the terms to publish your page",
        type: "error",
        duration: 3000,
      });
      return;
    }

    setIsPublishing(true);
    try {
      const { data } = await api.post("/users/publish-creator", {
        acceptTerms,
      });

      toaster.create({
        title: "Success",
        description: "Redirecting to Stripe to complete your onboarding",
        type: "success",
        duration: 3000,
      });

      window.location.href = data.stripeOnboardingUrl;
    } catch (error: any) {
      toaster.create({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to publish your page",
        type: "error",
        duration: 3000,
      });
    } finally {
      setIsPublishing(false);
      setIsDialogOpen(false);
    }
  };

  if (currentStatus === "SUSPENDED") {
    return (
      <Box
        position="fixed"
        bottom={0}
        left={{ base: 0, lg: "280px" }}
        right={0}
        bg="red.600"
        color="white"
        p={4}
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        zIndex={100}
        borderTop="1px solid"
        borderColor="red.700"
        boxShadow="0 -4px 6px -1px rgba(0, 0, 0, 0.1)"
      >
        <HStack gap={4}>
          <Box p={2} bg="whiteAlpha.200" borderRadius="md">
            <AlertTriangle size={24} color="white" />
          </Box>
          <VStack align="start" gap={0}>
            <Text fontWeight="bold" fontSize="md">
              Creator Account Suspended
            </Text>
            <Text fontSize="sm" color="whiteAlpha.900">
              Your creator privileges have been revoked by administrators.
            </Text>
          </VStack>
        </HStack>
      </Box>
    );
  }

  if (currentStatus === "REQUIRE_APPROVAL") {
    return (
      <Box
        position="fixed"
        top={{ base: "48px", md: 0 }}
        left={{ base: 0, lg: "300px" }}
        right={0}
        zIndex={100}
        css={{ background: "linear-gradient(135deg, hsl(32.1, 94.6%, 43.7%), hsl(22.7, 92%, 45.9%))" }}
        color="white"
        px={4}
        py={3}
      >
        <Flex
          maxW="1024px"
          mx="auto"
          justifyContent="space-between"
          alignItems="center"
        >
          <Text fontWeight={500}>
            Your creator page is currently pending admin approval. You will be
            notified once it is approved!
          </Text>
        </Flex>
      </Box>
    );
  }

  return (
    <>
      <Box
        position="fixed"
        top={{ base: "48px", md: 0 }}
        left={{ base: 0, lg: "300px" }}
        right={0}
        zIndex={100}
        css={{ background: "linear-gradient(135deg, hsl(211, 71%, 43%), hsl(335, 27%, 64%))" }}
        color="white"
        px={4}
        py={3}
      >
        <Flex
          maxW="1024px"
          mx="auto"
          justifyContent="space-between"
          alignItems="center"
        >
          <Text fontWeight={500}>
            Your page is currently in draft mode. Publish it to make it visible
            to everyone.
          </Text>
          <Button
            colorScheme="white"
            onClick={() => setIsDialogOpen(true)}
            css={{ backgroundColor: "white", color: "hsl(211, 71%, 43%)", fontWeight: 600, "&:hover": { backgroundColor: "rgba(255,255,255,0.9)" } }}
          >
            Publish Page
          </Button>
        </Flex>
      </Box>

      <DialogRoot
        open={isDialogOpen}
        onOpenChange={(v) => setIsDialogOpen(v.open)}
      >
        <DialogContent className="glass-dialog-content">
          <DialogHeader>Publish Your Creator Page</DialogHeader>
          <DialogBody>
            <Text mb={4}>
              Publishing your page will make it visible to everyone and allow
              you to start accepting payments from your supporters.
            </Text>
            <Text mb={4}>
              You&apos;ll need to complete a few steps with Stripe, our payment
              processor, to set up your account and verify your identity.
            </Text>
            <Checkbox
              checked={acceptTerms}
              onCheckedChange={(e) => setAcceptTerms(!!e.checked)}
            >
              I accept the terms and conditions for creators
            </Checkbox>
          </DialogBody>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsDialogOpen(false)} className="glass-card">
              Cancel
            </Button>
            <Button
              className="btn-gradient"
              onClick={handlePublish}
              loading={isPublishing}
              disabled={!acceptTerms || isPublishing}
            >
              Continue to Stripe
            </Button>
          </DialogFooter>
        </DialogContent>
      </DialogRoot>
    </>
  );
};

export default PublishPageBanner;
