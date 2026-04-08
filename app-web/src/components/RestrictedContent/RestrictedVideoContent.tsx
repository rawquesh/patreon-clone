import React from "react";
import { Box, Image, Flex, Icon, Text } from "@chakra-ui/react";
import { PlayCircle } from "lucide-react";
import RestrictedContentWrapper from "./RestrictedContentWrapper";

interface RestrictedVideoContentProps {
  children: React.ReactNode;
  creatorId: string;
  isRestrictedView?: boolean;
  thumbnailUrl: string;
  title?: string;
  creatorName?: string;
  duration?: number; // in seconds
  onSubscribeClick?: () => void;
}

const RestrictedVideoContent: React.FC<RestrictedVideoContentProps> = ({
  children,
  creatorId,
  isRestrictedView,
  thumbnailUrl,
  title,
  creatorName,
  duration,
  onSubscribeClick,
}) => {
  // Format the duration as MM:SS
  const formattedDuration = formatDuration(duration || 0);

  // Create a video thumbnail preview
  const videoPreview = isRestrictedView ? (
    <Box position="relative" width="100%" overflow="hidden" borderRadius="md">
      <Image
        src={thumbnailUrl}
        alt={title || "Restricted video content"}
        width="100%"
        objectFit="cover"
      />

      <Flex
        position="absolute"
        top={0}
        left={0}
        right={0}
        bottom={0}
        alignItems="center"
        justifyContent="center"
        bg="rgba(0, 0, 0, 0.3)"
      >
        <Icon as={PlayCircle} color="white" boxSize={16} />
      </Flex>

      {/* Video duration badge */}
      {duration && (
        <Box
          position="absolute"
          bottom="8px"
          right="8px"
          bg="rgba(0, 0, 0, 0.7)"
          color="white"
          px={2}
          py={1}
          borderRadius="md"
          fontSize="sm"
        >
          {formattedDuration}
        </Box>
      )}

      {/* Restricted banner */}
      <Box
        position="absolute"
        bottom={0}
        left={0}
        right={0}
        bg="rgba(0, 0, 0, 0.7)"
        py={2}
        px={4}
      >
        <Text color="white" fontSize="sm" fontWeight="medium">
          Subscribe to watch this video
        </Text>
      </Box>
    </Box>
  ) : null;

  return (
    <RestrictedContentWrapper
      creatorId={creatorId}
      isRestrictedView={isRestrictedView}
      preview={videoPreview}
      contentType="video"
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

export default RestrictedVideoContent;
