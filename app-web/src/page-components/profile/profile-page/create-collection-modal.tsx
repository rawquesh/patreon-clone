"use client";
import React, { useState } from "react";
import {
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogHeader,
  DialogRoot,
} from "@/components/ui/dialog";
import {
  Box,
  Flex,
  IconButton,
  Image,
  Input,
  Stack,
  Text,
  Textarea,
  useDisclosure,
} from "@chakra-ui/react";
import ButtonWithIcon from "@/components/ui/button-with-icon";
import { Icon } from "@iconify/react/dist/iconify.js";
import { toaster } from "@/components/ui/toaster";
import { Button } from "@/components/ui/button";
import api from "@/lib/api";

const CreateCollectionModal: React.FC<{ onSubmit: (id: string) => void }> = ({
  onSubmit,
}) => {
  const { open, onOpen, onClose } = useDisclosure();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setCoverImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!title.trim()) return;

    try {
      const formData = new FormData();
      formData.append("title", title.trim());

      if (description.trim()) {
        formData.append("description", description.trim());
      }

      if (coverImage) {
        if (coverImage.size > 2 * 1024 * 1024) {
          toaster.create({
            title: "Error",
            description: "Image size should be less than 2MB",
            type: "error",
            duration: 3000,
          });
          return;
        }

        if (!coverImage.type.match(/^image\/(jpeg|jpg|png|gif)$/)) {
          toaster.create({
            title: "Error",
            description: "Only JPG, JPEG, PNG, or GIF files are allowed",
            type: "error",
            duration: 3000,
          });
          return;
        }

        formData.append("coverImage", coverImage);
      }

      const { data } = await api.post("/collections", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      toaster.create({
        title: "Success",
        description: "Collection created successfully",
        type: "success",
        duration: 3000,
      });

      setTitle("");
      setDescription("");
      setCoverImage(null);
      setImagePreview("");
      onClose();

      onSubmit(data._id);
    } catch (error: any) {
      toaster.create({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to create collection",
        type: "error",
        duration: 3000,
      });
    }
  };

  return (
    <DialogRoot
      open={open}
      onOpenChange={onOpen}
      motionPreset={"slide-in-bottom"}
      placement={"center"}
    >
      <ButtonWithIcon
        as={"div"}
        borderRadius={"28px"}
        icon="ic:round-plus"
        bgColor={"star.100"}
        color={"star.800"}
        _hover={{
          bgColor: "star.200",
        }}
        onClick={() => {
          onOpen();
        }}
      >
        Create Collection
      </ButtonWithIcon>
      <DialogContent className="glass-dialog-content">
        <DialogHeader
          alignItems={"center"}
          display={"flex"}
          justifyContent={"space-between"}
        >
          <Text fontSize={"xl"} fontWeight={600} flex={1}>
            New Collection
          </Text>
          <DialogCloseTrigger />
        </DialogHeader>
        <DialogBody>
          <Stack gap={6}>
            <Box>
              {imagePreview ? (
                <Box position="relative" width="fit-content">
                  <Image
                    src={imagePreview}
                    alt="Cover preview"
                    maxH="200px"
                    objectFit="cover"
                    borderRadius="md"
                  />
                  <IconButton
                    position="absolute"
                    top={2}
                    right={2}
                    size="sm"
                    aria-label="Remove image"
                    // icon={}
                    onClick={() => {
                      setCoverImage(null);
                      setImagePreview("");
                    }}
                  >
                    <Icon icon="mingcute:close-fill" />
                  </IconButton>
                </Box>
              ) : (
                <Stack
                  alignItems="center"
                  borderRadius="md"
                  className="glass-card"
                  p={6}
                  gap={2}
                >
                  <Icon icon="mdi:image" fontSize={24} />
                  <Text>Recommended size</Text>
                  <Text css={{ color: "hsl(215.4, 16.3%, 46.9%)" }} fontSize="sm">
                    1024x1024px. JPG, JPEG, PNG, or GIF. Max 2 GB.
                  </Text>
                  <Button
                    size="sm"
                    onClick={() =>
                      document.getElementById("cover-upload")?.click()
                    }
                  >
                    Select image
                  </Button>
                  <Input
                    id="cover-upload"
                    type="file"
                    accept="image/*"
                    display="none"
                    onChange={handleImageSelect}
                  />
                </Stack>
              )}
            </Box>

            <Stack gap={4}>
              <Stack gap={2}>
                <Text fontWeight="medium">Collection title</Text>
                <Input
                  placeholder="Add title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </Stack>

              <Stack gap={2}>
                <Text fontWeight="medium">Description</Text>
                <Textarea
                  placeholder="(Optional) Add description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  maxLength={180}
                />
                <Text fontSize="sm" css={{ color: "hsl(215.4, 16.3%, 46.9%)" }} alignSelf="flex-end">
                  {description.length} / 180
                </Text>
              </Stack>
            </Stack>

            <Flex gap={3} justifyContent="flex-end">
              <Button
                onClick={() => {
                  onClose();
                }}
                variant="ghost"
              >
                Cancel
              </Button>
              <Button
                className="btn-gradient"
                onClick={handleSubmit}
                disabled={!title.trim()}
              >
                Create collection
              </Button>
            </Flex>
          </Stack>
        </DialogBody>
      </DialogContent>
    </DialogRoot>
  );
};

export default CreateCollectionModal;
