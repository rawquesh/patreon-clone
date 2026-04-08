import React, { ComponentProps } from "react";
import { Button } from "../ui/button";
import { Avatar } from "../ui/avatar";
import { Box, Text } from "@chakra-ui/react";

interface Props extends ComponentProps<typeof Button> {
  username?: string;
  mode: "creator" | "user";
  avatarUrl?: string;
  fullWidth?: boolean;
  isCreator: boolean;
}

const AvatarButton: React.FC<Props> = ({
  mode,
  username,
  avatarUrl,
  fullWidth,
  ...buttonProps
}) => {
  return (
    <Button
      w={fullWidth ? "100%" : "auto"}
      display={"flex"}
      alignItems={"center"}
      variant={"ghost"}
      h={"52px"}
      justifyContent={"start"}
      {...buttonProps}
      as={"div"}
    >
      <Avatar
        shape={"rounded"}
        src={
          avatarUrl ||
          "https://patreon-clone-test-dps.s3.eu-north-1.amazonaws.com/profile-pictures/placeholder-male.jpg"
        }
        // borderRadius={"8px"}
        h={"40px"}
        w={"40px"}
      />
      <Box textAlign={"left"} ml={"12px"} gap={0}>
        <Text fontWeight={500} fontSize={"sm"}>
          {username}
        </Text>
        <Text lineHeight={1} color={"star.500"} fontSize={"xs"}>
          {mode}
        </Text>
      </Box>
    </Button>
  );
};

export default AvatarButton;
