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
      className={featured ? "glass-card border-gradient" : "glass-card"}
      w={{ base: "100%", md: "300px" }}
      maxW={"300px"}
      mx={"auto"}
      overflow={"hidden"}
      color={"star.800"}
      mb={4}
      position="relative"
      minW={"300px"}
    >
      {featured && (
        <Box
          position="absolute"
          top={0}
          right={0}
          css={{
            background: "var(--gradient-primary)",
          }}
          color="white"
          px={3}
          py={1.5}
          fontSize="xs"
          fontWeight={700}
          zIndex={2}
          borderBottomLeftRadius="10px"
          letterSpacing="0.02em"
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
          <Image alt={title} fill src={image} style={{ objectFit: "cover" }} />
        </Box>
      )}
      <Stack gap={0} px={"20px"} py={"24px"}>
        <Text
          fontSize={"xl"}
          fontWeight={700}
          css={{ color: "hsl(222.2, 47.4%, 11.2%)" }}
        >
          {title}
        </Text>
        <Stack direction="row" mt={3} gap={4} align="baseline">
          <Text fontSize={"sm"} css={{ color: "hsl(215.4, 16.3%, 46.9%)" }}>
            <Strong
              css={{
                color: "hsl(222.2, 47.4%, 11.2%)",
                fontSize: "30px",
                fontWeight: 800,
                background: "linear-gradient(135deg, hsl(211, 71%, 43%), hsl(335, 27%, 64%))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              ${pricePerMonth}
            </Strong>
            /month
          </Text>
        </Stack>
        <Button
          disabled={soldOut || isProcessing}
          my={3}
          onClick={handleSubscribe}
          className="btn-gradient"
        >
          {soldOut ? "Sold out" : "Join"}
        </Button>
        {limited &&
          (soldOut ? (
            <Text
              textAlign={"center"}
              fontSize="12px"
              css={{ color: "hsl(0, 84.2%, 60.2%)" }}
            >
              Limited spaces - SOLD OUT
            </Text>
          ) : (
            <Text
              textAlign={"center"}
              fontSize="12px"
              css={{ color: "hsl(215.4, 16.3%, 46.9%)" }}
            >
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
          css={{
            "& p": { color: "hsl(215.4, 16.3%, 46.9%)" },
            "& ul": { color: "hsl(215.4, 16.3%, 46.9%)" },
          }}
        />
      </Stack>
    </Box>
  );
};

export { PricingCard };
export default PricingCard;
