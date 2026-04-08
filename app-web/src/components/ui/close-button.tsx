import type { ButtonProps } from "@chakra-ui/react";
import { IconButton as ChakraIconButton } from "@chakra-ui/react";
import { Icon } from "@iconify/react/dist/iconify.js";
import * as React from "react";

export type CloseButtonProps = ButtonProps;

export const CloseButton = React.forwardRef<
  HTMLButtonElement,
  CloseButtonProps
>(function CloseButton(props, ref) {
  return (
    <ChakraIconButton variant="ghost" aria-label="Close" ref={ref} {...props}>
      {props.children ?? <Icon icon="mdi:close" />}
    </ChakraIconButton>
  );
});
