"use client";
import React, { useState, useEffect, useCallback } from "react";
import {
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogRoot,
} from "@/components/ui/dialog";
import {
  Box,
  IconButton,
  Input,
  Separator,
  Stack,
  Text,
  Spinner,
} from "@chakra-ui/react";
import { Button } from "@/components/ui/button";
import { Icon } from "@iconify/react/dist/iconify.js";
import { Field } from "@/components/ui/field";
import { socialConnects } from "./data";
import { SocialLink } from "./social-link";
import api from "@/lib/api";
import { toaster } from "@/components/ui/toaster";
import { Editor, EditorTextChangeEvent } from "primereact/editor";

interface AboutData {
  introVideoUrl?: string;
  bio?: string;
  socialLinks?: { platform: string; url: string }[];
}

type SocialLinkBase = NonNullable<AboutData["socialLinks"]>[number];
interface SocialLinkState extends Omit<SocialLinkBase, "icon"> {
  icon: string;
  text: string;
  url: string;
}

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
  initialData: AboutData | null;
}

const AboutModal: React.FC<AboutModalProps> = ({
  isOpen,
  onClose,
  onUpdate,
  initialData,
}) => {
  const [introVideoUrl, setIntroVideoUrl] = useState("");
  const [bio, setBio] = useState("");
  const [socialLinksState, setSocialLinksState] = useState<SocialLinkState[]>(
    []
  );
  const [isSaving, setIsSaving] = useState(false);
  const [bioContentLength, setBioContentLength] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setIntroVideoUrl(initialData?.introVideoUrl || "");
      setBio(initialData?.bio || "");
      // ;
      console.log(initialData);
      // const initialLinksMap = [];
      const initialLinksMap = new Map(
        (initialData?.socialLinks || []).map((link) => [
          link.platform,
          link.url,
        ]) || []
      );

      const mergedLinks = socialConnects.map((platformInfo) => ({
        icon: platformInfo.icon,
        text: platformInfo.text,
        platform: platformInfo.text,
        url: initialLinksMap.get(platformInfo.text) || "",
      }));

      setSocialLinksState(mergedLinks);
    }
  }, [isOpen, initialData]);

  const handleSocialLinkChange = (platform: string, newUrl: string) => {
    setSocialLinksState((currentLinks) =>
      currentLinks.map((link) =>
        link.platform === platform ? { ...link, url: newUrl } : link
      )
    );
  };

  const handleSave = useCallback(async () => {
    setIsSaving(true);

    const payload: AboutData = {
      introVideoUrl: introVideoUrl.trim() || undefined,
      bio: bio || undefined,
      socialLinks: socialLinksState
        .filter((link) => link.url.trim() !== "")
        .map(({ platform, url }) => ({ platform, url: url.trim() })),
    };

    try {
      await api.put("/users/about", payload);

      toaster.create({
        title: "Success",
        description: "About information updated.",
        type: "success",
      });
      onUpdate();
      onClose();
    } catch (error: any) {
      console.error("Failed to update about data:", error);
      toaster.create({
        title: "Error",
        description: error.response?.data?.message || "Failed to save details.",
        type: "error",
      });
    } finally {
      setIsSaving(false);
    }
  }, [introVideoUrl, bio, socialLinksState, onClose, onUpdate]);

  return (
    <DialogRoot
      motionPreset={"slide-in-bottom"}
      placement={"center"}
      open={isOpen}
      size={"xl"}
    >
      <DialogContent className="glass-dialog-content">
        <DialogHeader
          alignItems={"center"}
          display={"flex"}
          justifyContent={"space-between"}
        >
          <Text fontSize={"xl"} fontWeight={600} flex={1}>
            About your page
          </Text>
          <IconButton
            rounded="999px"
            variant={"ghost"}
            onClick={onClose}
            disabled={isSaving}
          >
            <Icon icon={"ic:round-close"} />
          </IconButton>
        </DialogHeader>
        <Separator my={3} />
        <DialogBody>
          <Stack gap={4}>
            <Field label="Intro video">
              <Input
                placeholder="https://youtube.com/... or https://vimeo.com/..."
                value={introVideoUrl}
                onChange={(e) => setIntroVideoUrl(e.target.value)}
                disabled={isSaving}
              />
            </Field>
            <Field label="Bio">
              <Editor
                value={bio}
                onTextChange={(e: EditorTextChangeEvent) => {
                  setBio(e.htmlValue || "");
                  const tempDiv = document.createElement("div");
                  tempDiv.innerHTML = e.htmlValue || "";
                  setBioContentLength(tempDiv.textContent?.length || 0);
                }}
                style={{ height: "150px" }}
                readOnly={isSaving}
                placeholder="Add a short bio to let people know who you are."
                pt={{
                  toolbar: { className: "surface-ground" },
                  content: { className: "surface-ground" },
                }}
              />
              <Text fontSize="xs" css={{ color: "hsl(215.4, 16.3%, 46.9%)" }} textAlign="right">
                {bioContentLength} / 500 Characters
              </Text>
            </Field>
            <Box>
              <Text fontWeight={600}>Social Links</Text>
              <Text fontSize="sm" css={{ color: "hsl(215.4, 16.3%, 46.9%)" }}>
                Help people find you wherever you are. Connect your other
                accounts to show them on your page.
              </Text>
            </Box>
            <Stack gap={2} mt={2}>
              {socialLinksState.map((connect) => (
                <SocialLink
                  key={connect.platform}
                  icon={connect.icon}
                  text={connect.text}
                  value={connect.url}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    handleSocialLinkChange(connect.platform, e.target.value)
                  }
                  disabled={isSaving}
                />
              ))}
            </Stack>
          </Stack>
        </DialogBody>
        <DialogFooter gap={2}>
          <Button variant={"outline"} onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? <Spinner size="sm" /> : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </DialogRoot>
  );
};

export default AboutModal;
