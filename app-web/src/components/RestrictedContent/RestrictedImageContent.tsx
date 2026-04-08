import React from "react";
import { Box, Image as ChakraImage } from "@chakra-ui/react";
import RestrictedContentWrapper from "./RestrictedContentWrapper";

interface RestrictedImageContentProps {
  children: React.ReactNode;
  creatorId: string;
  isRestrictedView?: boolean;
  imageUrl: string;
  title?: string;
  creatorName?: string;
  onSubscribeClick?: () => void;
}

const RestrictedImageContent: React.FC<RestrictedImageContentProps> = ({
  children,
  creatorId,
  isRestrictedView,
  imageUrl,
  title,
  creatorName,
  onSubscribeClick,
}) => {
  // Create a blurred image preview
  const imagePreview = isRestrictedView ? (
    <Box position="relative" width="100%" overflow="hidden">
      <ChakraImage
        src={imageUrl}
        alt={title || "Restricted content"}
        width="100%"
        filter="blur(20px)"
        transform="scale(1.1)"
        objectFit="cover"
      />
    </Box>
  ) : null;

  return (
    <RestrictedContentWrapper
      creatorId={creatorId}
      isRestrictedView={isRestrictedView}
      preview={imagePreview}
      contentType="image"
      title={title}
      creatorName={creatorName}
      onSubscribeClick={onSubscribeClick}
    >
      {children}
    </RestrictedContentWrapper>
  );
};

export default RestrictedImageContent;
