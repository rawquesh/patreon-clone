import { Flex, Text } from "@chakra-ui/react";
import { Icon } from "@iconify/react/dist/iconify.js";
import React from "react";

interface Props {
  id: string;
  icon: string;
  text: string;
  onClick: (id: string) => void;
}

const IconListItem: React.FC<Props> = ({ icon, text, id, onClick }) => {
  return (
    <Flex
      _hover={{
        bg: "star.100",
      }}
      py={2}
      px={2}
      gap={4}
      alignItems={"center"}
      cursor={"pointer"}
      onClick={() => onClick(id)}
    >
      <Icon width={"20px"} icon={icon} />
      <Text transform={"translateY(2px)"} fontWeight={600}>
        {text}
      </Text>
    </Flex>
  );
};

export default IconListItem;
