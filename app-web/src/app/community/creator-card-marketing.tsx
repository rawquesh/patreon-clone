"use client";

import { Box, Stack, Text, VStack } from "@chakra-ui/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React from "react";

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
      as={"a"}
      onClick={() => {
        router.push(href);
      }}
      alignSelf={"stretch"}
      justifySelf={"center"}
      cursor="pointer"
    >
      <Stack
        w={"min"}
        gap={0}
        h={"100%"}
        borderRadius="16px"
        overflow="hidden"
        className="glass-card hover-lift"
      >
        <Box
          position={"relative"}
          height={"280px"}
          width={"357px"}
          maxW={"100%"}
          borderRadius="12px 12px 0 0"
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
          <Box
            css={{
              background: "var(--gradient-primary)",
              color: "white",
              fontWeight: "600",
              px: 3,
              py: 1,
              borderRadius: "full",
              fontSize: "xs",
            }}
          >
            {category}
          </Box>
          <Text
            maxW={"233px"}
            mt={2}
            fontWeight={600}
            css={{ color: "hsl(222.2, 47.4%, 11.2%)" }}
          >
            {name}
          </Text>
          <Text
            maxW={"233px"}
            fontSize={"sm"}
            css={{ color: "hsl(215.4, 16.3%, 46.9%)" }}
          >
            {description}
          </Text>
          <VStack align="start" gap={0}>
            <Text
              css={{
                color: "hsl(211, 71%, 43%)",
                cursor: "pointer",
                fontWeight: "bold",
                fontSize: "sm",
              }}
            >
              @{username}
            </Text>
          </VStack>
        </VStack>
      </Stack>
    </Box>
  );
};

export default CreatorCardMarketing;
