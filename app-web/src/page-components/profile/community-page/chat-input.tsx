"use client";
import React, { useState, useRef } from "react";
import {
  Box,
  IconButton,
  Flex,
  Textarea,
  Image,
  Stack,
} from "@chakra-ui/react";
import { toaster } from "@/components/ui/toaster";
import { Icon } from "@iconify/react/dist/iconify.js";
import ButtonWithIcon from "@/components/ui/button-with-icon";

interface ChatInputProps {
  onSendMessage: (content: string, attachment?: File) => Promise<void>;
  isDisabled?: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, isDisabled }) => {
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toaster.create({
          title: "Invalid file type",
          description: "Please upload an image file",
          duration: 3000,
          type: "error",
        });
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        setSelectedFile(null);
        setPreviewUrl(null);
        return;
      }
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async () => {
    if ((!message.trim() && !selectedFile) || isDisabled) return;

    try {
      setIsSubmitting(true);
      await onSendMessage(message.trim(), selectedFile || undefined);
      setMessage("");
      setSelectedFile(null);
      setPreviewUrl(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error(error);
      toaster.create({
        title: "Error sending message",
        description: "Please try again",
        type: "error",
        duration: 3000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  React.useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        console.log("Revoked preview URL:", previewUrl);
      }
    };
  }, [previewUrl]);

  return (
    <Stack gap={2}>
      {previewUrl && (
        <Box position="relative" w="fit-content" maxW="200px" mb={2}>
          <Image
            src={previewUrl}
            alt="Selected image preview"
            borderRadius="md"
            maxH="150px"
            objectFit="contain"
          />
          <IconButton
            position="absolute"
            top={-2}
            right={-2}
            size="sm"
            borderRadius="full"
            aria-label="Remove image"
            colorScheme="red"
            onClick={() => {
              setSelectedFile(null);
              setPreviewUrl(null);
              if (fileInputRef.current) {
                fileInputRef.current.value = "";
              }
            }}
          >
            <Icon icon="material-symbols:close-rounded" />
          </IconButton>
        </Box>
      )}

      <Flex gap={2}>
        <input
          type="file"
          ref={fileInputRef}
          style={{ display: "none" }}
          onChange={handleFileChange}
          accept="image/*"
          disabled={isDisabled || isSubmitting}
        />
        <IconButton
          aria-label="Attach file"
          variant="ghost"
          onClick={() => fileInputRef.current?.click()}
          disabled={isDisabled || isSubmitting}
        >
          <Icon icon={"material-symbols:image-outline-rounded"} />
        </IconButton>

        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="Type a message..."
          resize="none"
          disabled={isDisabled || isSubmitting}
          rows={1}
          flex={1}
        />
        <ButtonWithIcon
          colorScheme="blue"
          loading={isSubmitting}
          onClick={handleSubmit}
          icon="material-symbols-light:send-rounded"
          disabled={
            isDisabled || isSubmitting || (!message.trim() && !selectedFile)
          }
        >
          Send
        </ButtonWithIcon>
      </Flex>
    </Stack>
  );
};

export default ChatInput;
