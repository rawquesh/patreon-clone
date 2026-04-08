import { createSystem, defaultConfig, defineConfig } from "@chakra-ui/react";
import { branding } from "@/config/branding";

const c = branding.colors;

const customConfig = defineConfig({
	theme: {
		keyframes: {
			bounce: {
				"0%, 80%, 100%": { transform: "translateY(0)" },
				"40%": { transform: "translateY(-5px)" },
			},
		},

		tokens: {
			colors: {
				star: {
					50: { value: "#FBFBF9" },
					100: { value: "#F7F5ED" },
					200: { value: "#E0DDCE" },
					300: { value: "#C4C1B5" },
					400: { value: "#A6A59C" },
					500: { value: "#8C8B84" },
					600: { value: c.star },
					700: { value: "#474641" },
					800: { value: "#24231F" },
					900: { value: c.textHeader },
					950: { value: c.textHeader },
				},
				blue: {
					50: { value: "#EBF5FF" },
					100: { value: "#BADBFB" },
					200: { value: "#81BEF7" },
					300: { value: "#59AEFE" },
					400: { value: "#3FA0FB" },
					500: { value: "#2B85D9" },
					600: { value: c.primary },
					700: { value: c.primaryDark },
					800: { value: "#134B80" },
					900: { value: "#0D3459" },
					950: { value: "#0D3459" },
				},
				orange: {
					50: { value: "#FFF1ED" },
					100: { value: "#FADBD1" },
					200: { value: "#FABCA7" },
					300: { value: "#E3967D" },
					400: { value: c.accent },
					500: { value: "#BD6547" },
					600: { value: c.accentDark },
					700: { value: "#994B31" },
					800: { value: "#8C4932" },
					900: { value: "#7C412D" },
					950: { value: "#7C412D" },
				},
				desert: {
					50: { value: "#FFF5ED" },
					100: { value: "#FAE2D1" },
					200: { value: "#FACAA7" },
					300: { value: "#F0B890" },
					400: { value: "#D4A27F" },
					500: { value: c.desert },
					600: { value: c.desertDark },
					700: { value: "#997154" },
					800: { value: "#8C6346" },
					900: { value: "#7C583E" },
					950: { value: "#7C583E" },
				},
				dune: {
					50: { value: "#FFF9ED" },
					100: { value: c.duneLight },
					200: { value: "#EBDBBC" },
					300: { value: "#E0D1B4" },
					400: { value: "#D4C29F" },
					500: { value: c.dune },
					600: { value: "#AD9F82" },
					700: { value: "#998C73" },
					800: { value: "#8C8169" },
					900: { value: "#7C7057" },
					950: { value: "#7C7057" },
				},
				green: {
					50: { value: "#EBF7ED" },
					100: { value: "#D9F1DD" },
					200: { value: "#B8E5BE" },
					300: { value: "#A6DEAE" },
					400: { value: "#94D49E" },
					500: { value: c.green },
					600: { value: "#72A57A" },
					700: { value: c.greenDark },
					800: { value: "#4A7C52" },
					900: { value: "#426E49" },
					950: { value: "#426E49" },
				},
			},
			fonts: {
				heading: { value: "tiempostFont, sans-serif" },
				body: { value: "Epilogue, sans-serif" },
			},
		},
	},
});

export const system = createSystem(defaultConfig, customConfig);
