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
            borderRadius="12px"
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
            css={{
              background: "rgba(255,255,255,0.9)",
              backdropFilter: "blur(8px)",
              "&:hover": {
                background: "hsl(0, 84.2%, 60.2%)",
                color: "white",
              },
            }}
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

      <Box
        className="glass-card"
        borderRadius="16px"
        p={2}
      >
        <Flex gap={2} align="center">
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
            css={{
              color: "hsl(215.4, 16.3%, 46.9%)",
              "&:hover": {
                color: "hsl(211, 71%, 43%)",
                background: "linear-gradient(135deg, hsl(211, 71%, 43% / 0.1), hsl(335, 27%, 64% / 0.08))",
              },
            }}
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
            border="none"
            bg="transparent"
            _focus={{ boxShadow: "none", border: "none" }}
            css={{
              "& textarea": {
                background: "transparent",
                padding: "8px",
              },
            }}
          />
          <ButtonWithIcon
            className="btn-gradient"
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
      </Box>
    </Stack>
  );
};

export default ChatInput;
