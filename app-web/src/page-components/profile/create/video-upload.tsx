"use client";
import React, { useCallback, useState, useEffect, useRef } from "react";
import {
  Box,
  Button,
  Center,
  Text,
  VStack,
  AspectRatio,
} from "@chakra-ui/react";
import { useDropzone } from "react-dropzone";
import { Icon } from "@iconify/react";
import SimpleVideoPlayer from "@/components/simple-video-player";

interface Props {
  onUpload?: (file: File) => void;
  onVideoFileSelect: (file: File | null) => void;
  existingVideoUrl?: string | null;
}

const VideoUpload: React.FC<Props> = ({
  onUpload,
  onVideoFileSelect,
  existingVideoUrl = null,
}) => {
  const [videoUrl, setVideoUrl] = useState<string | null>(existingVideoUrl);
  const blobUrlRef = useRef<string | null>(null);

  useEffect(() => {
    if (existingVideoUrl) {
      setVideoUrl(existingVideoUrl);
      blobUrlRef.current = null; // Existing URLs are not blob URLs
    }
  }, [existingVideoUrl]);

  // Cleanup blob URLs on unmount
  useEffect(() => {
    return () => {
      // Cleanup any blob URLs when component unmounts
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
        blobUrlRef.current = null;
      }
    };
  }, []);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (file) {
        // Revoke previous blob URL if exists
        if (blobUrlRef.current) {
          URL.revokeObjectURL(blobUrlRef.current);
          blobUrlRef.current = null;
        }

        // Create preview URL and update state
        const previewUrl = URL.createObjectURL(file);
        blobUrlRef.current = previewUrl;
        setVideoUrl(previewUrl);
        onVideoFileSelect(file);
        onUpload?.(file);
      }
    },
    [onUpload, onVideoFileSelect]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "video/*": [".mp4", ".mov", ".avi", ".wmv", ".flv", ".webm", ".mkv"],
    },
    multiple: false,
  });

  const handleRemove = () => {
    // Revoke blob URL if it's a newly created one (not from server)
    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current);
      blobUrlRef.current = null;
    }
    setVideoUrl(null);
    onVideoFileSelect(null);
  };

  return (
    <VStack gap={6} w="full">
      {videoUrl ? (
        <Box w="full" position="relative" minH="400px">
          <AspectRatio ratio={16 / 9} w="full">
            <SimpleVideoPlayer src={videoUrl} width="100%" height="100%" />
          </AspectRatio>
          <Button
            size="xs"
            variant="outline"
            position="absolute"
            top={2}
            right={2}
            onClick={handleRemove}
            className="glass-card"
            _hover={{ bg: "rgba(255,255,255,0.8)" }}
            zIndex={10}
          >
            Remove
          </Button>
        </Box>
      ) : (
        <Box
          w="full"
          h="400px"
          borderWidth="1px"
          borderStyle="dashed"
          borderColor={isDragActive ? "hsl(211, 71%, 43%)" : "hsl(215.4, 16.3%, 46.9%)"}
          borderRadius="xl"
          transition="all 0.2s"
          _hover={{ borderColor: "hsl(211, 71%, 43%)" }}
          bg="transparent"
          {...getRootProps()}
          cursor="pointer"
        >
          <input {...getInputProps()} />
          <Center h="full">
            <VStack gap={4}>
              <Icon
                icon="material-symbols:video-file"
                width="48"
                height="48"
                css={{ color: "hsl(215.4, 16.3%, 46.9%)" }}
              />
              <Text fontSize={"sm"} css={{ color: "hsl(215.4, 16.3%, 46.9%)" }} textAlign="center">
                Drag and drop a video <br /> file to upload
              </Text>
              <Button size={"xs"} variant="outline" className="glass-card">
                Select video file
              </Button>
            </VStack>
          </Center>
        </Box>
      )}
    </VStack>
  );
};

export default VideoUpload;
