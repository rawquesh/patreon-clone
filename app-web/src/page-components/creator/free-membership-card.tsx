import { Button } from "@/components/ui/button";
import { Box, Stack, Text } from "@chakra-ui/react";
import React from "react";
import { useRouter } from "next/navigation";
import { branding } from "@/config/branding";

interface Props {
  creatorId: string;
  creatorName: string;
}

const FreeMembershipCard: React.FC<Props> = ({ creatorId, creatorName }) => {
  const router = useRouter();

  const handleJoinClick = () => {
    router.push(`/checkout/membership/${creatorId}/free`);
  };

  return (
    <Box
      w={{ base: "100%", md: "317px" }}
      maxW={"350px"}
      mx={"auto"}
      bg={"white"}
      shadow={"md"}
      overflow={"hidden"}
      rounded={"12px"}
      color={"star.800"}
      mb={4}
      position="relative"
      border={`2px solid ${branding.colors.success}`}
    >
      <Box
        position="absolute"
        top={0}
        right={0}
        bg={branding.colors.success}
        color="white"
        px={2}
        py={1}
        fontSize="xs"
        zIndex={2}
        borderBottomLeftRadius="md"
      >
        Free
      </Box>

      <Stack gap={0} px={"16px"} py={"24px"}>
        <Text fontSize={"xl"} fontWeight={600}>
          Free Membership
        </Text>
        <Stack direction="row" gap={4} align="baseline">
          <Text fontSize={"sm"} color={"star.600"}>
            <Text
              as="span"
              color={"star.800"}
              fontSize={"3xl"}
              fontWeight={600}
            >
              $0
            </Text>
            /month
          </Text>
        </Stack>
        <Button my={2} onClick={handleJoinClick} colorScheme="green">
          Join for free
        </Button>

        <Box fontSize={"sm"} letterSpacing={"wide"} my={3}>
          <Text mb={2}>
            Join {creatorName}&apos;s community for free and get:
          </Text>
          <Stack gap={2}>
            <Text display="flex" alignItems="center">
              <Box as="span" mr={2}>
                ✓
              </Box>
              Access to public posts
            </Text>
            <Text display="flex" alignItems="center">
              <Box as="span" mr={2}>
                ✓
              </Box>
              Join the community
            </Text>
            <Text display="flex" alignItems="center">
              <Box as="span" mr={2}>
                ✓
              </Box>
              Get notified of new content
            </Text>
          </Stack>
        </Box>
      </Stack>
    </Box>
  );
};

export default FreeMembershipCard;
