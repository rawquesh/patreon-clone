import React from "react";
import { Box, Text } from "@chakra-ui/react";
import RestrictedContentWrapper from "./RestrictedContentWrapper";

interface RestrictedTextContentProps {
  children: React.ReactNode;
  creatorId: string;
  isRestrictedView?: boolean;
  text: string;
  title?: string;
  creatorName?: string;
  onSubscribeClick?: () => void;
}

const RestrictedTextContent: React.FC<RestrictedTextContentProps> = ({
  children,
  creatorId,
  isRestrictedView,
  text,
  title,
  creatorName,
  onSubscribeClick,
}) => {
  // Create a text preview (first 150 characters)
  const textPreview = isRestrictedView ? (
    <Box>
      <Text>
        {text.substring(0, 150)}
        {text.length > 150 && "..."}
      </Text>
      <Text mt={4} color="gray.500" fontStyle="italic">
        Subscribe to read the full post
      </Text>
    </Box>
  ) : null;

  return (
    <RestrictedContentWrapper
      creatorId={creatorId}
      isRestrictedView={isRestrictedView}
      preview={textPreview}
      contentType="text"
      title={title}
      creatorName={creatorName}
      onSubscribeClick={onSubscribeClick}
    >
      {children}
    </RestrictedContentWrapper>
  );
};

export default RestrictedTextContent;
