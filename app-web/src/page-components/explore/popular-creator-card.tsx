import { Flex, Text, Image, Stack } from "@chakra-ui/react";
import Link from "next/link";
import React from "react";
import RecentlyVisitedPopover from "./recently-visited-popover";

interface Props {
  image: string;
  name: string;
  href: string;
  description: string;
}

const PopularCreatorCard: React.FC<Props> = ({
  href,
  image,
  name,
  description,
}) => {
  return (
    <Link href={href}>
      <Flex
        bg={"transparent"}
        borderRadius={"8px"}
        alignItems={"center"}
        padding={"8px"}
        // w={"326px"}
        gap={3}
        _hover={{
          bg: "star.100",
          "& .recently-visited-popover": {
            visibility: "visible",
          },
        }}
        css={{
          "& .recently-visited-popover": {
            visibility: "hidden",
          },
        }}
      >
        <Image
          width={"48px"}
          rounded={"8px"}
          height={"48px"}
          src={image}
          alt={name}
        />
        <Stack>
          <Text fontWeight={500}>{name}</Text>
          <Text maxW={"100%"} truncate color={"star.600"} fontSize={"sm"}>
            {description.slice(0, 35)}...
          </Text>
        </Stack>
        <RecentlyVisitedPopover />
      </Flex>
    </Link>
  );
};

export default PopularCreatorCard;
