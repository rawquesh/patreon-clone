import { Flex, Text, Input } from "@chakra-ui/react";
import { Icon } from "@iconify/react/dist/iconify.js";
import React from "react";

export const SocialLink: React.FC<{
  icon: string;
  text: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled: boolean;
}> = ({ icon, text, value, onChange, disabled }) => {
  return (
    <Flex mb={2} gap={3} alignItems={"center"}>
      <Icon width={"24px"} height={"24px"} icon={icon} />
      <Text minW="80px" fontWeight="medium">
        {text}
      </Text>
      <Input
        placeholder={`Enter ${text} URL`}
        value={value}
        onChange={onChange}
        disabled={disabled}
        size="sm"
      />
    </Flex>
  );
};
