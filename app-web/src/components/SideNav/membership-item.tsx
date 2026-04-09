import React from "react";
import { Flex, Text } from "@chakra-ui/react";
import Link from "next/link";
import { Avatar } from "../ui/avatar";
import { branding } from "@/config/branding";

const MembershipItem: React.FC<{
  link: string;
  title: string;
  imageUrl?: string;
}> = ({ link, title, imageUrl }) => {
  const isActive = false;

  return (
    <Link href={link}>
      <Flex
        color={isActive ? "primary.500" : "star.500"}
        bg={isActive ? "primary.50" : "transparent"}
        borderRadius="8px"
        px="12px"
        py="8px"
        gap="10px"
        alignItems="center"
        _hover={{
          bg: "rgba(0,0,0,0.03)",
          color: "hsl(222.2, 47.4%, 11.2%)",
        }}
        transition="all 0.15s ease"
      >
        <Avatar
          size="xs"
          shape="rounded"
          src={
            imageUrl ||
            `https://${branding.assets.assetBucketBase}/profile-pictures/placeholder-male.jpg`
          }
        />
        <Text fontSize="sm" fontWeight={500} css={{ color: "inherit" }}>
          {title}
        </Text>
      </Flex>
    </Link>
  );
};

export default MembershipItem;
