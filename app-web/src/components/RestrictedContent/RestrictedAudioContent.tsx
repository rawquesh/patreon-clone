import React from "react";
import { Box, Flex, Text, Image, Icon } from "@chakra-ui/react";
import { Music } from "lucide-react";
import RestrictedContentWrapper from "./RestrictedContentWrapper";

interface RestrictedAudioContentProps {
  children: React.ReactNode;
  creatorId: string;
  isRestrictedView?: boolean;
  title?: string;
  creatorName?: string;
  coverImage?: string;
  duration?: number; // in seconds
  onSubscribeClick?: () => void;
}

const RestrictedAudioContent: React.FC<RestrictedAudioContentProps> = ({
  children,
  creatorId,
  isRestrictedView,
  title,
  creatorName,
  coverImage,
  duration,
  onSubscribeClick,
}) => {
  // Format the duration as MM:SS
  const formattedDuration = formatDuration(duration || 0);

  // Create an audio preview
  const audioPreview = isRestrictedView ? (
    <Box
      position="relative"
      borderRadius="md"
      overflow="hidden"
      bg="gray.100"
      p={4}
    >
      <Flex align="center">
        {coverImage ? (
          <Box
            width="80px"
            height="80px"
            borderRadius="md"
            overflow="hidden"
            flexShrink={0}
            mr={4}
          >
            <Image
              src={coverImage}
              alt={title || "Audio content"}
              width="100%"
              height="100%"
              objectFit="cover"
            />
          </Box>
        ) : (
          <Flex
            width="80px"
            height="80px"
            borderRadius="md"
            bg="gray.200"
            alignItems="center"
            justifyContent="center"
            flexShrink={0}
            mr={4}
          >
            <Icon as={Music} boxSize={8} color="gray.500" />
          </Flex>
        )}

        <Box flex="1">
          <Text fontWeight="bold" lineClamp={2}>
            {title || "Audio content"}
          </Text>

          {duration && (
            <Text fontSize="sm" color="gray.600" mt={1}>
              Duration: {formattedDuration}
            </Text>
          )}

          <Text mt={2} fontSize="sm" fontWeight="medium" color="blue.600">
            Subscribe to listen
          </Text>
        </Box>
      </Flex>

      {/* Audio player preview (disabled) */}
      <Box
        mt={4}
        bg="gray.200"
        height="24px"
        borderRadius="full"
        position="relative"
      >
        <Box
          position="absolute"
          left={0}
          top={0}
          width="30%"
          height="100%"
          bg="gray.400"
          borderRadius="full"
        />
      </Box>
    </Box>
  ) : null;

  return (
    <RestrictedContentWrapper
      creatorId={creatorId}
      isRestrictedView={isRestrictedView}
      preview={audioPreview}
      contentType="audio"
      title={title}
      creatorName={creatorName}
      onSubscribeClick={onSubscribeClick}
    >
      {children}
    </RestrictedContentWrapper>
  );
};

// Helper function to format duration in seconds to MM:SS format
function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
}

export default RestrictedAudioContent;
