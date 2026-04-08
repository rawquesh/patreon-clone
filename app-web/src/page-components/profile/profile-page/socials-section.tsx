"use client";
import {
  Editable,
  EditableRoot,
  Flex,
  Stack,
  Text,
  HStack,
  Link,
} from "@chakra-ui/react";
import { Icon } from "@iconify/react/dist/iconify.js";
import React, { useEffect, useState } from "react";
import AddSocials from "./add-socials";
import { useAuth } from "@/context/auth.provider";
import { Button } from "@/components/ui/button";
import api from "@/lib/api";

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

const updateCreatorHeadline = async (headline: string) => {
  try {
    const { data } = await api.put("/users/creator/headline", { headline });
    return data;
  } catch (error) {
    console.error("Error updating creator headline:", error);
    throw error;
  }
};

const SocialsSection: React.FC = () => {
  const [headline, setHeadline] = useState<string | undefined>(undefined);
  const [hasHeadlineChanged, setHasHeadlineChanged] = useState(false);
  const [socialLinks, setSocialLinks] = useState<
    { platform: string; url: string; icon?: string }[]
  >([]);
  const [isPublished, setIsPublished] = useState(false);

  const { user } = useAuth();
  useEffect(() => {
    if (user) {
      setIsPublished(user?.creatorStatus?.toLowerCase() === "published");
    }
  }, [user]);

  useEffect(() => {
    if (user && user.creatorHeadline) {
      setHeadline(user.creatorHeadline);
    }

    const fetchSocialLinks = async () => {
      if (user && user._id) {
        try {
          const { data } = await api.get(`/creator/${user._id}/stats`);
          if (data.socialLinks && Array.isArray(data.socialLinks)) {
            setSocialLinks(data.socialLinks);
          }
        } catch (error) {
          console.error("Error fetching social links:", error);
        }
      }
    };

    fetchSocialLinks();
  }, [user]);

  return (
    <Stack
      textAlign={"center"}
      pt={6}
      alignItems={"center"}
      justifyContent={"center"}
      gap={0}
    >
      {hasHeadlineChanged && (
        <Flex
          pos={"fixed"}
          left={{ base: 0, md: "300px" }}
          p={"16px"}
          // top={0}
          maxW={{
            base: "100vw",
            md: "calc(100vw - 300px)",
          }}
          w={"100%"}
          bg={"white"}
          top={{ base: "48px", md: isPublished ? 0 : "64px" }}
          gap={6}
        >
          <Text mr={"auto"}>You have unpublished changes</Text>
          <Button
            onClick={() => {
              setHeadline(user?.creatorHeadline || "");
              setHasHeadlineChanged(false);
            }}
            colorPalette={"blue"}
            variant={"outline"}
          >
            Discard
          </Button>
          <Button
            onClick={async () => {
              await updateCreatorHeadline(headline || "");
              setHasHeadlineChanged(false);
            }}
            colorPalette={"blue"}
          >
            Save
          </Button>
        </Flex>
      )}

      <Text fontWeight={600} fontSize={"xl"}>
        {user?.creatorUsername}
      </Text>
      <EditableRoot
        value={headline}
        onChange={(e) =>
          setHeadline(() => {
            const val = (e.target as unknown as { value: string | undefined })
              .value;
            const pre = user?.creatorHeadline || "";

            setHasHeadlineChanged(val?.trim() !== pre?.trim());

            return val;
          })
        }
        w={"180px"}
        fontSize={"sm"}
        color={"star.600"}
        placeholder={"Add headline"}
        key={JSON.stringify(user)}
      >
        <Editable.Preview
          minW={"100%"}
          textAlign={"center"}
          display={"block"}
        ></Editable.Preview>
        <Editable.Input />
      </EditableRoot>
      <Flex color={"star.600"} gap={2} mb={2}>
        <Icon icon={"solar:link-bold"} />
        <Text transform={"translateY(-2px)"} fontSize={"sm"}>
          patreon-clone.example.com/creator/{user?.creatorUsername}
        </Text>
      </Flex>

      {socialLinks.length > 0 && (
        <HStack justify="center" alignItems={"center"} gap={3} mt={2} mb={3}>
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
          <AddSocials />
        </HStack>
      )}
    </Stack>
  );
};

export default SocialsSection;
