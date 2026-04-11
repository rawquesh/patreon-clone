"use client";

import { ChakraProvider } from "@chakra-ui/react";
import { ColorModeProvider, type ColorModeProviderProps } from "./color-mode";
import { system } from "@/lib/theme";

export function Provider({ children, ...props }: ColorModeProviderProps) {
	return (
		<ColorModeProvider defaultTheme="light" {...props}>
			<ChakraProvider value={system}>
				{children}
			</ChakraProvider>
		</ColorModeProvider>
	);
}
