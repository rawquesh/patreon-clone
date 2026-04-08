"use client";

import React, { useState, ChangeEvent, FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { toaster } from "@/components/ui/toaster";
import { Icon } from "@iconify/react/dist/iconify.js";
import {
  Box,
  Flex,
  IconButton,
  Image,
  Input,
  Stack,
  Text,
  Textarea,
} from "@chakra-ui/react";

interface MembershipFormData {
  name: string;
  description: string;
  monthlyRate: number;
  benefits?: string[];
  isActive?: boolean;
}

interface CreateMembershipFormProps {
  initialData?: Partial<MembershipFormData> & { coverImage?: string | null };
  initialCoverImageUrl?: string | null;
  onSubmit: (formData: FormData) => Promise<void>;
  isLoading: boolean;
  submitButtonText?: string;
  onCancel?: () => void;
}

export const CreateMembershipForm: React.FC<CreateMembershipFormProps> = ({
  initialData = {
    name: "",
    description: "",
    monthlyRate: 0,
    benefits: [],
    isActive: true,
  },
  // initialCoverImageUrl = null,
  onSubmit,
  isLoading,
  submitButtonText = "Create Tier",
  onCancel,
}) => {
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(
    initialData.coverImage ?? null
  );
  const [formData, setFormData] = useState<MembershipFormData>({
    name: initialData.name ?? "",
    description: initialData.description ?? "",
    monthlyRate: initialData.monthlyRate ?? 0,
    benefits: initialData.benefits ?? [],
    isActive: initialData.isActive ?? true,
  });


  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toaster.create({
          title: "Invalid file type",
          description: "Please upload an image file",
          type: "error",
          duration: 3000,
        });
        return;
      }

      if (file.size > 2 * 1024 * 1024) {
        toaster.create({
          title: "File too large",
          description: "Image size should be less than 2MB",
          type: "error",
          duration: 3000,
        });
        return;
      }

      setCoverImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    let value: string | number = e.target.value;
    if (e.target.name === "monthlyRate") {
      value = parseFloat(value) || 0;
    }

    setFormData((prev) => ({
      ...prev,
      [e.target.name]: value,
    }));
  };

  const prepareFormData = (): FormData => {
    const formDataToSend = new FormData();
    formDataToSend.append("name", formData.name);
    formDataToSend.append("description", formData.description);
    formDataToSend.append("monthlyRate", formData.monthlyRate.toString());
    if (formData.benefits?.length) {
      formDataToSend.append("benefits", JSON.stringify(formData.benefits));
    }
    formDataToSend.append(
      "isActive",
      JSON.stringify(formData.isActive ?? true)
    ); // Default to true if undefined

    if (coverImage) {
      formDataToSend.append("coverImage", coverImage);
    } else if (imagePreview === null) {
      // If the preview is null (meaning remove was clicked) and no new image is set,
      // signal removal. Adjust backend to handle this field (e.g., set coverImage to null).
      formDataToSend.append("removeCoverImage", "true");
    }

    return formDataToSend;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const dataToSend = prepareFormData();
    await onSubmit(dataToSend);
  };

  return (
    <Box as="form" onSubmit={handleSubmit}>
      <Stack gap={6}>
        <Field label="Cover Image">
          <Stack
            alignItems="center"
            borderRadius="md"
            bg="gray.100"
            p={6}
            gap={2}
            pos="relative"
          >
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
                  onClick={() => {
                    setCoverImage(null);
                    setImagePreview(null);
                  }}
                >
                  <Icon icon="mingcute:close-fill" />
                </IconButton>
              </Box>
            ) : (
              <>
                <Icon icon="mdi:image" fontSize={24} />
                <Text>Recommended size: 460 by 200 pixels</Text>
                <Text color="gray.500" fontSize="sm">
                  JPG, JPEG, PNG, or GIF. Max 2MB.
                </Text>
                <Input
                  type="file"
                  accept="image/*"
                  id="cover-upload"
                  display="none"
                  onChange={handleImageChange}
                />
                <label htmlFor="cover-upload">
                  <Button as="span" size="sm">
                    Select image
                  </Button>
                </label>
              </>
            )}
          </Stack>
        </Field>

        <Field label="Name">
          <Input
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter tier name"
            required
          />
        </Field>

        <Field label="Monthly price">
          <Input
            name="monthlyRate"
            type="number"
            min={1}
            step={0.01}
            value={formData.monthlyRate}
            onChange={handleChange}
            placeholder="Enter monthly price"
            required
          />
        </Field>

        <Field label="Description">
          <Textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Describe the benefits and exclusive content people can expect to get when they join"
            rows={4}
            required
          />
        </Field>

        {/* TODO: Add UI for managing benefits array */}

        <Flex gap={4} justifyContent="flex-end">
          {onCancel && (
            <Button variant="ghost" onClick={onCancel} disabled={isLoading}>
              Cancel
            </Button>
          )}
          {/* Consider using next/link for cancel if cancelHref is provided */}
          <Button
            type="submit"
            loading={isLoading}
            loadingText={isLoading ? "Saving..." : undefined} // Show dynamic loading text
          >
            {submitButtonText}
          </Button>
        </Flex>
      </Stack>
    </Box>
  );
};
