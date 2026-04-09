"use client";
import { AspectRatio, Box, Flex, Image } from "@chakra-ui/react";
import { usePathname } from "next/navigation";
import React from "react";

const images: Record<string, string> = {
  creator: "/images/onboarding/create.png",
  "choose-url": "/images/onboarding/url.png",
  connect: "/images/onboarding/connect.png",
};

const LayoutRight: React.FC = () => {
  const pathname = usePathname();

  const path = pathname?.split("/")[2];

  return (
    <Flex
      display={{ base: "none", lg: "flex" }}
      w={"full"}
      pos={"relative"}
      alignItems={"center"}
      justifyContent={"center"}
      overflow="hidden"
      css={{
        background: "linear-gradient(135deg, hsl(211, 71%, 43% / 0.08), hsl(335, 27%, 64% / 0.06))",
      }}
    >
      <Box
        pos="absolute"
        w="100%"
        h="100%"
        css={{
          background: "radial-gradient(ellipse at 30% 50%, hsl(211, 71%, 43% / 0.12), transparent 60%), radial-gradient(ellipse at 70% 30%, hsl(335, 27%, 64% / 0.1), transparent 60%)",
        }}
      />
      <Box w={"100%"} pos="relative">
        <AspectRatio maxW="90%" mx={"auto"} ratio={1 / 1}>
          <Image
            src={images[path] || "/images/onboarding/create-right.png"}
            alt="onboarding illustration"
            objectFit="cover"
            borderRadius="24px"
            css={{
              boxShadow: "0 20px 60px hsl(211, 71%, 43% / 0.15)",
            }}
          />
        </AspectRatio>
      </Box>
    </Flex>
  );
};

export default LayoutRight;
