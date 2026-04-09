"use client";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/auth.provider";
import { Box, Flex, Text } from "@chakra-ui/react";
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
import api from "@/lib/api";

const PublishPageBanner: React.FC = () => {
  const { user } = useAuth();
  const [isPublishing, setIsPublishing] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);

  if (!user?.isCreator || user?.creatorStatus?.toLowerCase() === "published") {
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
          <Text>
            Your page is currently in draft mode. Publish it to make it visible
            to everyone.
          </Text>
          <Button
            colorScheme="white"
            // variant="outline"
            onClick={() => setIsDialogOpen(true)}
            // _hover={{ bg: "blue.600" }}
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
