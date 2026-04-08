import React from "react";
import { Box, Button, Flex, Stack, Text } from "@chakra-ui/react";
import { Lock } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSubscriptionStatus } from "@/lib/backend-services/subscription-service";

interface RestrictedContentWrapperProps {
  children: React.ReactNode;
  creatorId: string;
  isRestrictedView?: boolean;
  preview?: React.ReactNode;
  contentType?: "text" | "image" | "video" | "audio";
  title?: string;
  creatorName?: string;
  onSubscribeClick?: () => void;
}

const RestrictedContentWrapper: React.FC<RestrictedContentWrapperProps> = ({
  children,
  creatorId,
  isRestrictedView,
  preview,
  contentType = "text",
  title,
  creatorName,
  onSubscribeClick,
}) => {
  const router = useRouter();
  const { data: subscriptionData, isLoading } =
    useSubscriptionStatus(creatorId);

  const hasAccess =
    !isRestrictedView || (subscriptionData?.isSubscribed ?? false);

  const handleSubscribeClick = () => {
    if (onSubscribeClick) {
      onSubscribeClick();
    } else {
      router.push(`/membership/${creatorId}`);
    }
  };

  if (isLoading) {
    // You could add a loading state here if needed
    return <>{children}</>;
  }

  if (hasAccess) {
    return <>{children}</>;
  }

  return (
    <Box position="relative" overflow="hidden">
      {/* Preview content (blurred, partial, etc.) */}
      {preview ? (
        preview
      ) : (
        <Box filter="blur(6px)" pointerEvents="none" opacity={0.7}>
          {children}
        </Box>
      )}

      {/* Overlay with subscription CTA */}
      <Flex
        position="absolute"
        top={0}
        left={0}
        right={0}
        bottom={0}
        bg="rgba(255, 255, 255, 0.85)"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        padding={6}
        textAlign="center"
        zIndex={2}
      >
        <Stack gap={4} maxW="400px">
          <Flex
            width="48px"
            height="48px"
            borderRadius="full"
            bg="gray.100"
            alignItems="center"
            justifyContent="center"
            margin="0 auto"
          >
            <Lock size={24} />
          </Flex>

          <Text fontWeight="bold" fontSize="xl">
            {getContentTypeMessage(contentType, title)}
          </Text>

          <Text color="gray.600">
            {creatorName
              ? `Subscribe to ${creatorName} to access this and all other exclusive ${contentType} content.`
              : `Subscribe to access this and all other exclusive ${contentType} content.`}
          </Text>

          <Button
            colorScheme="blue"
            onClick={handleSubscribeClick}
            size="lg"
            mt={2}
          >
            Join to unlock
          </Button>
        </Stack>
      </Flex>
    </Box>
  );
};

function getContentTypeMessage(contentType: string, title?: string): string {
  const contentTitle = title ? ` "${title}"` : "";

  switch (contentType) {
    case "text":
      return `This post${contentTitle} is for subscribers only`;
    case "image":
      return `This image${contentTitle} is for subscribers only`;
    case "video":
      return `This video${contentTitle} is for subscribers only`;
    case "audio":
      return `This audio${contentTitle} is for subscribers only`;
    default:
      return `This content${contentTitle} is for subscribers only`;
  }
}

export default RestrictedContentWrapper;
