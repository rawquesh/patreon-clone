"use client";

import { Button } from "@/components/ui/button";
import { Stack, Text, HStack, Link } from "@chakra-ui/react";
import React, { useState, useEffect } from "react";
import { Creator } from "@/lib/backend-services/creator-service";
import { useCreatorPosts } from "@/lib/backend-services/creator-service";
// import { useCreatorMemberships } from "@/lib/backend-services/subscription-service";
import api from "@/lib/api";
import { toaster } from "@/components/ui/toaster";
import { Icon } from "@iconify/react/dist/iconify.js";
import { useAuth } from "@/context/auth.provider";
import { useRouter } from "next/navigation";

const platformIcons = [
  { icon: "mingcute:youtube-fill", title: "Youtube" },
  { icon: "mdi:instagram", title: "Instagram" },
  { icon: "prime:twitter", title: "Twitter" },
  { icon: "ic:baseline-facebook", title: "Facebook" },
  { icon: "ri:twitch-fill", title: "Twitch" },
  { icon: "ic:baseline-tiktok", title: "Tiktok" },
];

// Helper function to get the icon for a platform
const getIconForPlatform = (platform: string) => {
  const normalizedPlatform = platform.toLowerCase().trim();
  const match = platformIcons.find((item) =>
    normalizedPlatform.includes(item.title.toLowerCase())
  );
  return match?.icon || "mdi:link";
};

const CreatorDetails: React.FC<{ creator: Creator; isMember: boolean }> = ({
  creator,
  isMember,
}) => {
  const { data: posts } = useCreatorPosts(creator._id);
  const [isLoading, setIsLoading] = useState(false);
  const [socialLinks, setSocialLinks] = useState<
    { platform: string; url: string; icon?: string }[]
  >([]);
  const postCount = posts?.length || 0;
  const { user } = useAuth();
  const router = useRouter();
  useEffect(() => {
    const fetchCreatorSocialLinks = async () => {
      try {
        const { data } = await api.get(`/creator/${creator._id}/stats`);
        if (data.socialLinks && Array.isArray(data.socialLinks)) {
          setSocialLinks(data.socialLinks);
        }
      } catch (error) {
        console.error("Error fetching creator social links:", error);
      }
    };

    if (creator._id) {
      fetchCreatorSocialLinks();
    }
  }, [creator._id]);

  const handleJoinForFree = async () => {
    if (!user) {
      router.push(`/auth/login`);
    } else {
      try {
        setIsLoading(true);
        await api.post(`/memberships/subscribe/free/${creator._id}`);
        toaster.create({
          title: "Success",
          description: "You have successfully joined the free membership",
          type: "success",
          duration: 3000,
        });
        window.location.reload();
      } catch (error) {
        console.error("Error subscribing to free membership:", error);
        toaster.create({
          title: "Error",
          description: "Failed to join the free membership. Please try again.",
          type: "error",
          duration: 3000,
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <Stack
      textAlign="center"
      pt={6}
      alignItems="center"
      justifyContent="center"
      gap={2}
    >
      <Text fontWeight={600} fontSize="xl">
        {creator.creatorUsername}
      </Text>
      <Text fontSize="sm" maxW="300px" color="star.600">
        {creator.creatorHeadline || "No description provided."}
      </Text>
      <Text fontSize="sm" fontWeight={600} maxW="300px">
        {postCount} {postCount === 1 ? "Post" : "Posts"}
      </Text>

      {socialLinks.length > 0 && (
        <HStack justify="center" gap={3} mt={2}>
          {socialLinks.map((link) => (
            <Link
              key={link.platform}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={link.platform}
            >
              <Icon icon={getIconForPlatform(link.platform)} fontSize="20px" />
            </Link>
          ))}
        </HStack>
      )}

      {!isMember && (user?._id || "") !== creator._id && (
        <Button
          minW="250px"
          onClick={handleJoinForFree}
          loading={isLoading}
          loadingText="Joining..."
        >
          Join for free
        </Button>
      )}
    </Stack>
  );
};

export default CreatorDetails;
