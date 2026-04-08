import React from "react";
import { Flex, Text } from "@chakra-ui/react";
import Link from "next/link";
import { Avatar } from "../ui/avatar";

const MembershipItem: React.FC<{
  link: string;
  title: string;
  imageUrl?: string;
}> = ({ link, title, imageUrl }) => {
  const isActive = false;
  return (
    <Link href={link}>
      <Flex
        color={{
          base: isActive ? "black" : "star.400",
        }}
        bg={{ base: isActive ? "star.100" : "white" }}
        css={{
          "& p": {
            base: {
              color: isActive ? "black" : "star.500",
            },
          },
        }}
        _hover={{
          base: {
            bg: "star.100",
            color: "black",
            "& p": {
              color: "black",
            },
          },
          _dark: {
            bg: "star.700",
          },
        }}
        borderRadius={"8px"}
        px={"15px"}
        // mb={2}
        py={"10px"}
        gap={"12px"}
        alignItems={"center"}
      >
        <Avatar
          size={"xs"}
          shape={"rounded"}
          src={
            imageUrl ||
            "https://patreon-clone-test-dps.s3.eu-north-1.amazonaws.com/profile-pictures/placeholder-male.jpg"
          }
        />

        <Text fontSize={"sm"} fontWeight={600}>
          {title}
        </Text>
      </Flex>
    </Link>
  );
};

export default MembershipItem;
