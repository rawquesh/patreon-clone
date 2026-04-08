import { Button } from "@/components/ui/button";
import { Box, Stack, Strong, Text } from "@chakra-ui/react";
import Image from "next/image";
import React, { useState } from "react";
import { toaster } from "@/components/ui/toaster";
import { useSubscribeToPaidMembership } from "@/lib/backend-services/subscription-service";

interface Props {
  image?: string;
  title: string;
  pricePerMonth: number;
  pricePerYear?: number;
  limited: boolean;
  seatsLeft: number;
  description: string | TrustedHTML;
  featured: boolean;
  membershipId?: string;
  creatorId?: string;
}

const PricingCard: React.FC<Props> = ({
  description,
  featured,
  limited,
  pricePerMonth,
  seatsLeft,
  title,
  image,
  membershipId,
}) => {
  const soldOut = limited && seatsLeft < 1;
  const subscribeMutation = useSubscribeToPaidMembership();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubscribe = async () => {
    if (!membershipId) return;

    setIsProcessing(true);
    subscribeMutation.mutate(
      {
        membershipId,
      },
      {
        onSuccess: () => {
          toaster.create({
            title: "Subscription successful",
            description: `You are now a member of ${title} tier`,
            type: "success",
            duration: 5000,
          });
          // router.push(`/creator/${creatorId}`);
        },
        onError: (error: any) => {
          toaster.create({
            title: "Subscription failed",
            description:
              error.message || "An error occurred during subscription",
            type: "error",
            duration: 5000,
          });
          setIsProcessing(false);
        },
      }
    );
  };

  return (
    <Box
      w={{ base: "100%", md: "300px" }}
      maxW={"300px"}
      mx={"auto"}
      bg={"white"}
      shadow={"md"}
      overflow={"hidden"}
      rounded={"12px"}
      color={"star.800"}
      mb={4}
      position="relative"
      minW={"300px"}
      border={featured ? "2px solid" : "none"}
      borderColor={"green.500"}
    >
      {featured && (
        <Box
          position="absolute"
          top={0}
          right={0}
          bg="green.700"
          color="white"
          px={2}
          py={1}
          fontSize="xs"
          zIndex={2}
          borderBottomLeftRadius="md"
        >
          Featured
        </Box>
      )}
      {image && (
        <Box
          css={{
            "& img": {
              objectPosition: "50% 25%",
              objectFit: "cover",
            },
          }}
          h={"135px"}
          w={"full"}
          position={"relative"}
        >
          <Image alt={title} layout="fill" src={image} />
        </Box>
      )}
      <Stack gap={0} px={"16px"} py={"24px"}>
        <Text fontSize={"xl"} fontWeight={600}>
          {title}
        </Text>
        <Stack direction="row" mt={3} gap={4} align="baseline">
          <Text fontSize={"sm"} color={"star.600"}>
            <Strong color={"star.800"} fontSize={"3xl"}>
              ${pricePerMonth}
            </Strong>
            /month
          </Text>
          {/* {pricePerYear && (
            <Text fontSize={"xs"} color={"star.600"}>
              ${pricePerYear}/year
            </Text>
          )} */}
        </Stack>
        <Button
          disabled={soldOut || isProcessing}
          my={2}
          onClick={handleSubscribe}
        >
          {soldOut ? "Sold out" : "Join"}
        </Button>
        {limited &&
          (soldOut ? (
            <Text textAlign={"center"}>Limited spaces - SOLD OUT</Text>
          ) : (
            <Text textAlign={"center"}>
              Limited spaces - {seatsLeft} remaining
            </Text>
          ))}
        <Box
          fontSize={"sm"}
          letterSpacing={"wide"}
          className="rich-text"
          my={3}
          dangerouslySetInnerHTML={{
            __html: typeof description === "string" ? description : "",
          }}
        />
      </Stack>
    </Box>
  );
};

export { PricingCard };
export default PricingCard;
