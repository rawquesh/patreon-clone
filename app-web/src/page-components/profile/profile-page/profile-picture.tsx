"use client";
import { Avatar } from "@/components/ui/avatar";
import { toaster } from "@/components/ui/toaster";
import { Box, Flex, IconButton, Input } from "@chakra-ui/react";
import { Icon } from "@iconify/react/dist/iconify.js";
import React, { useState } from "react";
import { useAuth } from "@/context/auth.provider";

interface Props {
  profilePicture?: string;
  username: string;
}

const ProfilePicture: React.FC<Props> = ({ profilePicture, username }) => {
  const [previewUrl, setPreviewUrl] = useState(profilePicture);
  const [showButton, setShowButton] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const { updateProfilePhoto } = useAuth();

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toaster.create({
          title: "Invalid file type",
          description: "Please upload an image file",
          duration: 3000,
          type: "error",
        });
        return;
      }

      // Set local state for preview
      setPreviewUrl(URL.createObjectURL(file));

      // Upload to backend
      setIsUploading(true);
      try {
        const formData = new FormData();
        formData.append("photo", file);
        await updateProfilePhoto.mutateAsync(formData);

        toaster.create({
          title: "Success",
          description: "Profile picture updated successfully",
          duration: 3000,
          type: "success",
        });
      } catch (error) {
        console.error("Error updating profile picture:", error);
        toaster.create({
          title: "Error",
          description: "Failed to update profile picture",
          duration: 3000,
          type: "error",
        });
      } finally {
        setIsUploading(false);
      }
    }
  };

  return (
    <Flex
      transform={"translateY(-50%)"}
      position={"absolute"}
      justifyContent={"center"}
      // left={"50%"}
      w={"100%"}
    >
      <Box
        onMouseEnter={() => setShowButton(true)}
        onMouseLeave={() => setShowButton(false)}
        position={"relative"}
      >
        <Avatar
          h={"120px"}
          w={"120px"}
          shape={"rounded"}
          name={username}
          src={previewUrl}
        />
        <Input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          display="none"
          id="image-upload-input"
          ref={inputRef}
          disabled={isUploading}
        />
        {showButton && (
          <label htmlFor="image-upload-input">
            <IconButton
              id="btn"
              bg={"star.100"}
              color={"star.700"}
              _hover={{ bg: "star.200", color: "star.700" }}
              rounded={"999px"}
              position={"absolute"}
              bottom={"-18px"}
              right={"-18px"}
              onClick={() => {
                if (!inputRef.current) return;
                inputRef.current.click();
              }}
              loading={isUploading}
              aria-label="Upload profile picture"
            >
              <Icon icon={"fe:picture"} />
            </IconButton>
          </label>
        )}
      </Box>
    </Flex>
  );
};

export default ProfilePicture;
