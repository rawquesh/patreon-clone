import { Flex, Text } from "@chakra-ui/react";
import { Icon } from "@iconify/react/dist/iconify.js";
import React, { ComponentProps } from "react";

interface Props {
  icon: string;
  text: string;
  iconProps?: Partial<ComponentProps<typeof Icon>>;
  textProps?: Partial<ComponentProps<typeof Text>>;
  containerProps?: Partial<ComponentProps<typeof Flex>>;
  asDiv?: boolean;
}

const IconText: React.FC<Props> = ({
  icon,
  text,
  containerProps,
  iconProps,
  textProps,
  asDiv,
}) => {
  return (
    <Flex as={asDiv ? "div" : "button"} gap={1} {...containerProps}>
      <Icon width={"20px"} {...iconProps} icon={icon} />
      <Text {...textProps}>{text}</Text>
    </Flex>
  );
};

export default IconText;
