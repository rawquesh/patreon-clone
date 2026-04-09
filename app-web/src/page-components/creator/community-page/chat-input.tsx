"use client";
import { toaster } from "@/components/ui/toaster";
import {
  Box,
  Flex,
  IconButton,
  Image,
  Stack,
  Textarea,
} from "@chakra-ui/react";
import { Icon } from "@iconify/react/dist/iconify.js";
import React, { useState, useRef } from "react";
import { useChat } from "@/context/chat.provider";
import { branding } from "@/config/branding";

// Define props
interface ChatInputProps {
  isDisabled?: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ isDisabled }) => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [message, setMessage] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messageInputRef = useRef<HTMLTextAreaElement>(null);
  const { sendMessage, isSending } = useChat();

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
        return;
      }
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSendMessage = async () => {
    if (isSending || isDisabled) return;

    if (!message.trim() && !selectedImage) {
      return;
    }

    try {
      await sendMessage(message.trim(), selectedImage || undefined);
      setMessage("");
      setSelectedImage(null);
      setPreviewUrl(null);
      messageInputRef.current?.focus();
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Box
      position="fixed"
      bottom={0}
      borderTopWidth="1px"
      w={{
        base: "calc(100% - 300px)",
        lg: "calc(100% - 600px)",
      }}
      p={4}
      zIndex={1000}
      className="glass-card"
      borderRadius={0}
      css={{
        backdropFilter: "blur(12px)",
        background: "rgba(255,255,255,0.85)",
      }}
    >
      <Stack gap={4}>
        {previewUrl && (
          <Box position="relative" maxWidth="200px">
            <Image
              src={previewUrl}
              alt="Selected image"
              borderRadius="md"
              maxHeight="200px"
              objectFit="contain"
            />
            <IconButton
              position="absolute"
              top={-2}
              right={-2}
              size="sm"
              borderRadius="full"
              aria-label="Remove image"
              onClick={() => {
                setSelectedImage(null);
                setPreviewUrl(null);
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
            onChange={handleFileChange}
            accept="image/*"
            disabled={isDisabled || isSending}
            style={{ display: "none" }}
          />
          <IconButton
            aria-label="Attach file"
            variant="ghost"
            onClick={() => fileInputRef.current?.click()}
            disabled={isDisabled || isSending}
          >
            <Icon icon="f7:photo-fill" />
          </IconButton>
          <Textarea
            ref={messageInputRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Type a message..."
            resize="none"
            rows={1}
            // maxRows={4}
            disabled={isDisabled || isSending}
            flex={1}
          />
          <IconButton
            aria-label="Send message"
            css={{
              background: "var(--gradient-primary)",
              "&:hover": {
                boxShadow: "0 0 16px hsl(211, 71%, 43% / 0.3)",
              },
            }}
            disabled={
              isDisabled || isSending || (!message.trim() && !selectedImage)
            }
            onClick={handleSendMessage}
          >
            <Icon icon="material-symbols:send-rounded" />
          </IconButton>
        </Flex>
      </Stack>
    </Box>
  );
};

export default ChatInput;
