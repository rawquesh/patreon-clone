"use client";

import { Box, Stack, Text, VStack } from "@chakra-ui/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React from "react";
import { branding } from "@/config/branding";

interface Props {
  image: string;
  name: string;
  description: string;
  href: string;
  category: string;
  username: string;
}

const CreatorCardMarketing: React.FC<Props> = ({
  description,
  image,
  name,
  href,
  category,
  username,
}) => {
  const router = useRouter();
  return (
    <Box
      // border={"2px solid red"}
      as={"a"}
      onClick={() => {
        router.push(href);
      }}
      alignSelf={"stretch"}
      justifySelf={"center"}
    >
      <Stack
        // border={"2px solid green"}
        // boxShadow={"2xl"}

        // rounded={"lg"}
        w={"min"}
        gap={0}
        h={"100%"}
        bg="white"
        borderRadius="16px"
        boxShadow="0 10px 30px rgba(0,0,0,0.05)"
        overflow="hidden"
        _hover={{
          transform: "translateY(-5px)",
          boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
        }}
        transition="all 0.3s ease"
      >
        <Box
          position={"relative"}
          height={"280px"}
          width={"357px"}
          maxW={"100%"}
          borderRadius={"8px"}
          overflow={"hidden"}
          css={{
            "& img": {
              objectPosition: "top",
              objectFit: "cover",
            },
          }}
        >
          <Image layout="fill" src={image} alt={name} />
        </Box>

        <VStack p={6} align="start" gap={4}>
          <Text
            bg="rgba(29, 112, 191, 0.1)"
            color={branding.colors.primary}
            fontWeight="600"
            px={3}
            py={1}
            borderRadius="full"
            fontSize="xs"
          >
            {category}
          </Text>
          <Text maxW={"233px"} mt={2} fontWeight={600}>
            {name}
          </Text>
          <Text maxW={"233px"} fontSize={"sm"} color={"star.600"}>
            {description}
          </Text>
          <VStack align="start" gap={0}>
            <Text
              color={"blue.500"}
              cursor={"pointer"}
              fontWeight="bold"
              fontSize="sm"
            >
              @{username}
            </Text>
            {/* <Text fontSize="xs">{card.author.title}</Text> */}
          </VStack>
        </VStack>
      </Stack>
    </Box>
  );
};

export default CreatorCardMarketing;
