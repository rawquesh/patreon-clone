import { Checkbox as ChakraCheckbox } from "@chakra-ui/react";
import * as React from "react";

export interface CheckboxProps extends ChakraCheckbox.RootProps {
	icon?: React.ReactNode;
	inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
	rootRef?: React.Ref<HTMLLabelElement>;
	lableProps?: React.ComponentProps<typeof ChakraCheckbox.Label>;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
	function Checkbox(props, ref) {
		const { icon, children, inputProps, rootRef, lableProps, ...rest } = props;
		return (
			<ChakraCheckbox.Root ref={rootRef} {...rest}>
				<ChakraCheckbox.HiddenInput ref={ref} {...inputProps} />
				<ChakraCheckbox.Control>
					{icon || <ChakraCheckbox.Indicator />}
				</ChakraCheckbox.Control>
				{children != null && (
					<ChakraCheckbox.Label {...lableProps}>
						{children}
					</ChakraCheckbox.Label>
				)}
			</ChakraCheckbox.Root>
		);
	}
);
