import type { BoxProps, InputElementProps } from "@chakra-ui/react";
import { Group, InputElement } from "@chakra-ui/react";
import * as React from "react";

type InputElementChildProps = Omit<
  React.ComponentProps<typeof InputElement>,
  keyof BoxProps
>;

export interface InputGroupProps extends BoxProps {
  startElementProps?: InputElementProps;
  endElementProps?: InputElementProps;
  startElement?: React.ReactNode;
  endElement?: React.ReactNode;
  children: React.ReactElement<InputElementChildProps>;
  startOffset?: InputElementProps["paddingStart"];
  endOffset?: InputElementProps["paddingEnd"];
  glass?: boolean;
}

export const InputGroup = React.forwardRef<HTMLDivElement, InputGroupProps>(
  function InputGroup(props, ref) {
    const {
      startElement,
      startElementProps,
      endElement,
      endElementProps,
      children,
      startOffset = "6px",
      endOffset = "6px",
      glass = false,
      ...rest
    } = props;

    const child = React.Children.only(children);

    return (
      <Group ref={ref} {...rest}>
        {startElement && (
          <InputElement pointerEvents="none" {...startElementProps}>
            {startElement}
          </InputElement>
        )}
        {React.cloneElement(child, {
          ...(startElement && {
            ps: `calc(var(--input-height) - ${startOffset})`,
          }),
          ...(endElement && { pe: `calc(var(--input-height) - ${endOffset})` }),
          ...child.props,
          ...(glass && {
            css: {
              background: "rgba(255, 255, 255, 0.7)",
              backdropFilter: "blur(12px)",
              border: "1px solid rgba(255,255,255,0.5)",
              borderRadius: "10px",
              transition: "all 0.2s ease",
              "&:focus": {
                background: "rgba(255, 255, 255, 0.9)",
                borderColor: "hsl(211, 71%, 43%)",
                boxShadow: "0 0 0 3px hsl(211, 71%, 43% / 0.1), 0 0 20px hsl(211, 71%, 43% / 0.3)",
                outline: "none",
              },
            },
          }),
        } as Partial<InputElementChildProps>)}
        {endElement && (
          <InputElement placement="end" {...endElementProps}>
            {endElement}
          </InputElement>
        )}
      </Group>
    );
  }
);
