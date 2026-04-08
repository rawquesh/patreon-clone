"use client";

import { RoundedButton } from "@/components/ui/rounded-button";
import { toaster } from "@/components/ui/toaster";
import { Tooltip } from "@/components/ui/tooltip";
import { useAuth } from "@/context/auth.provider";
import { AspectRatio, Box, Center, Input, Text } from "@chakra-ui/react";
import { Icon } from "@iconify/react/dist/iconify.js";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import api from "@/lib/api";

interface Props {
  coverImage?: string;
}

const ProfileCover: React.FC<Props> = ({ coverImage }) => {
  const { user } = useAuth();
  const [previewUrl, setPreviewUrl] = useState(coverImage);
  const [buttonVisible, setButtonVisible] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const uploadCover = async (file: File) => {
    const formData = new FormData();
    formData.append("cover", file);

    setIsUploading(true);
    try {
      const { data } = await api.put("/users/profile/cover", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      toaster.create({
        title: "Success",
        description: "Cover image updated successfully",
        duration: 3000,
        type: "success",
      });

      return data.profileCover;
    } catch (error: any) {
      toaster.create({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to update cover image",
        duration: 3000,
        type: "error",
      });
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check file type
      if (!file.type.startsWith("image/")) {
        toaster.create({
          title: "Invalid file type",
          description: "Please upload an image file",
          duration: 3000,
          type: "error",
        });
        return;
      }

      // Check file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        toaster.create({
          title: "File too large",
          description: "Please upload an image smaller than 5MB",
          duration: 3000,
          type: "error",
        });
        return;
      }

      const localPreviewUrl = URL.createObjectURL(file);
      setPreviewUrl(localPreviewUrl);

      try {
        const newCoverUrl = await uploadCover(file);
        setPreviewUrl(newCoverUrl);
      } catch (error) {
        console.log(error);
        setPreviewUrl(user?.profileCover || coverImage);
      }
    }
  };

  useEffect(() => {
    if (user && user.profileCover) {
      setPreviewUrl(user.profileCover);
    }
  }, [user]);

  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  return (
    <AspectRatio ratio={4 / 1}>
      <Box
        onMouseEnter={() => {
          setButtonVisible(true);
        }}
        onMouseLeave={() => {
          setButtonVisible(false);
        }}
      >
        <Image src={previewUrl!} alt="cover" layout="fill" />
        <Box pos={"relative"}>
          <Input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            display="none"
            id="image-upload-input"
            disabled={isUploading}
          />
          {buttonVisible && (
            <Center>
              <label htmlFor="image-upload-input">
                <Tooltip
                  openDelay={250}
                  closeDelay={300}
                  content="1600px x 400px recommended"
                  contentProps={{
                    css: {
                      "--tooltip-bg": "rgb(0,0,0,0.5)",
                      fontSize: "xs",
                    },
                  }}
                >
                  <RoundedButton
                    pos={"relative"}
                    bg={"rgb(0,0,0,0.5)"}
                    as="span"
                    colorScheme="blue"
                    disabled={isUploading}
                  >
                    <Icon
                      icon={isUploading ? "eos-icons:loading" : "bxs:image"}
                    />
                    <Text
                      transform={"translateY(2px)"}
                      fontWeight={600}
                      fontSize={"sm"}
                    >
                      {isUploading ? "Uploading..." : "Set Cover"}
                    </Text>
                  </RoundedButton>
                </Tooltip>
              </label>
            </Center>
          )}
        </Box>
      </Box>
    </AspectRatio>
  );
};

export default ProfileCover;
