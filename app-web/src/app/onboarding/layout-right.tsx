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
      bg={"blue.900"}
      pos={"relative"}
      alignItems={"center"}
      justifyContent={"center"}
    >
      <Box w={"100%"}>
        <AspectRatio maxW="90%" mx={"auto"} ratio={1 / 1}>
          <Image
            src={images[path] || "/images/onboarding/create-right.png"}
            alt="naruto"
            objectFit="cover"
          />
        </AspectRatio>
      </Box>
    </Flex>
  );
};

export default LayoutRight;
