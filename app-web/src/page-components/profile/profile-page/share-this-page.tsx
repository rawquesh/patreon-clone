"use client";

import { IconButton, Stack, Text, useDisclosure } from "@chakra-ui/react";
import { Icon } from "@iconify/react/dist/iconify.js";
import {
  DialogBody,
  DialogContent,
  DialogHeader,
  DialogRoot,
} from "@/components/ui/dialog";
import React from "react";
import ProfilePreview from "./profile-preview";
import IconListItem from "./icon-list-item";
import { toaster } from "@/components/ui/toaster";
import { useAuth } from "@/context/auth.provider";

export const sharePageDialogActionList: {
  id: string;
  icon: string;
  text: string;
}[] = [
  {
    id: "copy",
    icon: "uil:link",
    text: "Copy link",
  },
  {
    id: "twitter",
    icon: "prime:twitter",
    text: "Share on Twitter",
  },
  {
    id: "facebook",
    icon: "lucide:facebook",
    text: "Share on Facebook",
  },
  {
    id: "instagram",
    icon: "lucide:instagram",
    text: "Share on Instagram",
  },
  {
    id: "tiktok",
    icon: "mingcute:tiktok-line",
    text: "Share on TikTok",
  },
];

interface Props {}

const ShareThisPage: React.FC<Props> = () => {
  const { open, onOpen, onClose } = useDisclosure();
  const { user } = useAuth();

  const handleShare = (id: string) => {
    if (!user?.creatorUsername) {
      console.error("Creator username not found.");
      toaster.create({
        title: "Error",
        description: "Could not find creator username to share.",
        type: "error",
        duration: 3000,
      });
      return;
    }
    const baseUrl = window.location.origin;
    const pageUrl = `${baseUrl}/creator/${user.creatorUsername}`;

    switch (id) {
      case "copy":
        navigator.clipboard
          .writeText(pageUrl)
          .then(() => {
            toaster.create({
              title: "Link copied!",
              type: "success",
              duration: 2000,
            });
            onClose();
          })
          .catch((err) => {
            console.error("Failed to copy: ", err);
            toaster.create({
              title: "Failed to copy link",
              type: "error",
              duration: 2000,
            });
          });
        break;
      case "twitter":
        window.open(
          `https://twitter.com/intent/tweet?url=${encodeURIComponent(pageUrl)}`,
          "_blank"
        );
        onClose();
        break;
      case "facebook":
        window.open(
          `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
            pageUrl
          )}`,
          "_blank"
        );
        onClose();
        break;
      case "instagram":
      case "tiktok":
        navigator.clipboard
          .writeText(pageUrl)
          .then(() => {
            toaster.create({
              title: "Link copied!",
              description: `Sharing directly to ${id} is not supported from web. Please paste the link in the app.`,
              type: "info",
              duration: 5000,
            });
            onClose();
          })
          .catch((err) => {
            console.error("Failed to copy: ", err);
            toaster.create({
              title: "Failed to copy link",
              type: "error",
              duration: 2000,
            });
          });
        break;
      default:
        console.warn("Unknown share action:", id);
    }
  };

  return (
    <DialogRoot
      motionPreset={"slide-in-bottom"}
      placement={"center"}
      open={open}
      onOpenChange={(change) => (change.open ? onOpen() : onClose())}
    >
      <IconButton
        onClick={onOpen}
        bg={"star.200"}
        color={"star.700"}
        _hover={{
          bg: "star.100",
          color: "star.700",
        }}
        rounded={"8px"}
      >
        <Icon icon={"mingcute:upload-line"} />
      </IconButton>
      <DialogContent>
        <DialogHeader
          alignItems={"center"}
          display={"flex"}
          justifyContent={"space-between"}
        >
          <Text fontSize={"xl"} fontWeight={600} flex={1} textAlign={"center"}>
            Share this page
          </Text>
          <IconButton rounded="999px" variant={"ghost"} onClick={onClose}>
            <Icon icon={"ic:round-close"} />
          </IconButton>
        </DialogHeader>
        <DialogBody>
          <Stack>
            <ProfilePreview
              username="goutham"
              profilePicture="https://patreon-clone-test-dps.s3.eu-north-1.amazonaws.com/profile-pictures/placeholder-male.jpg"
              coverImage="/icons/cover.svg"
            />
            <Stack mt={"24px"}>
              {sharePageDialogActionList.map((action) => (
                <IconListItem
                  key={action.id}
                  {...action}
                  onClick={handleShare}
                />
              ))}
            </Stack>
          </Stack>
        </DialogBody>
      </DialogContent>
    </DialogRoot>
  );
};

export default ShareThisPage;
