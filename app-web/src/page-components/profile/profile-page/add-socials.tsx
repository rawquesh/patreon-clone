import ButtonWithIcon from "@/components/ui/button-with-icon";
import {
  DialogContent,
  DialogHeader,
  DialogRoot,
  DialogBackdrop,
  DialogBody,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Flex,
  IconButton,
  Input,
  Stack,
  Text,
  useDisclosure,
  Button,
  Spinner,
  Field,
  FieldLabel,
} from "@chakra-ui/react";
import { Icon } from "@iconify/react/dist/iconify.js";
import React, { useState, useEffect } from "react";
import api from "@/lib/api";

interface SocialLinkDto {
  platform: string;
  url: string;
  icon: string;
}

interface UpdateSocialLinksDto {
  socialLinks: SocialLinkDto[];
}
import { toaster } from "@/components/ui/toaster";
import { useAuth } from "@/context/auth.provider";

const editableSocialPlatforms = [
  {
    platform: "Twitter",
    icon: "mdi:twitter",
    placeholder: "https://twitter.com/username",
  },
  {
    platform: "Instagram",
    icon: "mdi:instagram",
    placeholder: "https://instagram.com/username",
  },
  {
    platform: "TikTok",
    icon: "ic:baseline-tiktok",
    placeholder: "https://tiktok.com/@username",
  },
  {
    platform: "YouTube",
    icon: "mdi:youtube",
    placeholder: "https://youtube.com/channel/...",
  },
  {
    platform: "Twitch",
    icon: "mdi:twitch",
    placeholder: "https://twitch.tv/username",
  },
  {
    platform: "Website",
    icon: "mdi:web",
    placeholder: "https://yourwebsite.com",
  },
];

const AddSocials: React.FC = () => {
  const { open, onClose, onOpen } = useDisclosure();
  const { user } = useAuth();
  const [socialLinks, setSocialLinks] = useState<SocialLinkDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open && user?.creatorUsername) {
      setIsLoading(true);
      api
        .get<{
          introVideoUrl?: string;
          bio?: string;
          socialLinks?: SocialLinkDto[];
        }>(`/users/creator/${user.creatorUsername}/about`)
        .then((response) => {
          const fetchedLinks = response.data.socialLinks || [];
          const initialLinks = editableSocialPlatforms.map((platformInfo) => {
            const existingLink = fetchedLinks.find(
              (link) =>
                link.platform.toLowerCase() ===
                platformInfo.platform.toLowerCase()
            );
            return {
              platform: platformInfo.platform,
              url: existingLink?.url || "",
              icon: platformInfo.icon,
            };
          });
          setSocialLinks(initialLinks);
        })
        .catch((error) => {
          console.error("Error fetching creator about data:", error);
          toaster.create({
            title: "Error",
            description: "Could not load your social links.",
            type: "error",
            duration: 5000,
          });
          const initialLinks = editableSocialPlatforms.map((platformInfo) => ({
            platform: platformInfo.platform,
            url: "",
            icon: platformInfo.icon,
          }));
          setSocialLinks(initialLinks);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [open, user?.creatorUsername]);

  const handleInputChange = (platform: string, value: string) => {
    setSocialLinks((prevLinks) =>
      prevLinks.map((link) =>
        link.platform === platform ? { ...link, url: value } : link
      )
    );
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    const linksToSubmit = socialLinks.filter((link) => link.url.trim() !== "");
    const payload: UpdateSocialLinksDto = { socialLinks: linksToSubmit };

    try {
      await api.put("/users/social-links", payload);
      toaster.create({
        title: "Success",
        description: "Social links updated successfully.",
        type: "success",
        duration: 3000,
      });
      onClose();
    } catch (error: any) {
      console.error("Error updating social links:", error);
      toaster.create({
        title: "Update Failed",
        description:
          error.response?.data?.message ||
          "Could not update social links. Please try again.",
        type: "error",
        duration: 5000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DialogRoot
      motionPreset={"slide-in-bottom"}
      placement={"center"}
      open={open}
      // onClose={onClose}
    >
      <ButtonWithIcon
        color={"green.800"}
        variant={"ghost"}
        icon="mynaui:plus-solid"
        fontSize={"lg"}
        onClick={onOpen}
      >
        Edit Socials
      </ButtonWithIcon>
      <DialogBackdrop />
      <DialogContent>
        <DialogHeader
          alignItems={"center"}
          display={"flex"}
          justifyContent={"space-between"}
        >
          <Text fontSize={"xl"} fontWeight={600} flex={1}>
            Edit your social links
          </Text>
          <IconButton rounded="999px" variant={"ghost"} onClick={onClose}>
            <Icon icon={"ic:round-close"} />
          </IconButton>
        </DialogHeader>
        <DialogBody>
          {isLoading ? (
            <Spinner />
          ) : (
            <>
              <Text fontSize={"sm"} color={"star.600"}>
                Social links will show up on your profile so fans can verify
                it&apos;s you and find your other creator profiles.
              </Text>
              <Text mt={2} fontSize={"sm"} color={"star.600"}>
                We&apos;ll never post on your behalf.
              </Text>
              <Stack mt={3}>
                {socialLinks.map((linkData) => {
                  const platformInfo = editableSocialPlatforms.find(
                    (p) => p.platform === linkData.platform
                  );
                  return (
                    <SocialLinkInput
                      key={linkData.platform}
                      icon={linkData.icon || platformInfo?.icon || "mdi:link"}
                      platform={linkData.platform}
                      value={linkData.url}
                      placeholder={
                        platformInfo?.placeholder ||
                        `Enter ${linkData.platform} URL`
                      }
                      onChange={handleInputChange}
                    />
                  );
                })}
              </Stack>
            </>
          )}
        </DialogBody>
        <DialogFooter borderTopWidth="1px" pt={4} mt={4}>
          <Button
            variant="ghost"
            mr={3}
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            className="btn-gradient"
            onClick={handleSubmit}
            loading={isSubmitting}
            disabled={isLoading || isSubmitting}
          >
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </DialogRoot>
  );
};

export default AddSocials;

export const SocialLinkInput: React.FC<{
  icon: string;
  platform: string;
  value: string;
  placeholder: string;
  onChange: (platform: string, value: string) => void;
}> = ({ icon, platform, value, placeholder, onChange }) => {
  return (
    <Field.Root w={"100%"}>
      <Flex w={"100%"} gap={3} alignItems={"center"}>
        <Icon width={"24px"} height={"24px"} icon={icon} />
        <FieldLabel minW="80px" fontWeight="medium" mb="0">
          {platform}
        </FieldLabel>
        <Input
          placeholder={placeholder}
          size="sm"
          value={value}
          onChange={(e) => onChange(platform, e.target.value)}
        />
      </Flex>
    </Field.Root>
  );
};
