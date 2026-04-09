"use client";
import { Suspense } from "react";
import ActionBar from "./action-bar";
import ProfileCover from "./profile-cover";
import ProfilePageTabs from "./profile-page-tabs";
import SocialsSection from "./socials-section";
import { useAuth } from "@/context/auth.provider";
import { Box, Center, Spinner } from "@chakra-ui/react";
import PublishPageBanner from "./publish-page-banner";

export function ProfilePage() {
  const { isLoadingUser } = useAuth();

  return (
    <Box className="animate-fade-in-up">
      {isLoadingUser ? (
        <Center h="100vh">
          <Spinner
            borderWidth="4px"
            animationDuration="0.65s"
            css={{ borderColor: "hsl(211, 71%, 43%)", borderTopColor: "transparent" }}
            size="xl"
          />
        </Center>
      ) : (
        <>
          <PublishPageBanner />
          <ProfileCover coverImage="/icons/cover.png" />
          <ActionBar />
          <SocialsSection />
          <Suspense>
            <ProfilePageTabs />
          </Suspense>
        </>
      )}
    </Box>
  );
}
