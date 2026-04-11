import React, { ReactNode } from "react";
import { Button } from "./button";
import { Icon } from "@iconify/react/dist/iconify.js";
import { Text } from "@chakra-ui/react";

interface Props extends React.ComponentProps<typeof Button> {
  icon: string;
  children: ReactNode;
  textProps?: React.ComponentProps<typeof Text>;
  iconProps?: Partial<React.ComponentProps<typeof Icon>>;
  iconStart?: boolean;
}

const ButtonWithIcon: React.FC<Props> = ({
  children,
  icon,
  textProps,
  iconProps,
  iconStart = true,
  ...buttonProps
}) => {
  return (
    <Button {...buttonProps}>
      {iconStart && <Icon {...iconProps} icon={icon} />}
      <Text as="span" {...textProps} transform={"translateY(1px)"}>
        {children}
      </Text>
      {!iconStart && <Icon {...iconProps} icon={icon} />}
    </Button>
  );
};

export default ButtonWithIcon;
