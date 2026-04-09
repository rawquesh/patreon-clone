import { createSystem, defaultConfig, defineConfig } from "@chakra-ui/react";
import { branding } from "@/config/branding";

const c = branding.colors;

// Modern blue-to-rose color palette matching app-dashboard's design language
const customConfig = defineConfig({
  theme: {
    keyframes: {
      bounce: {
        "0%, 80%, 100%": { transform: "translateY(0)" },
        "40%": { transform: "translateY(-5px)" },
      },
      "fade-in-up": {
        from: { opacity: "0", transform: "translateY(16px)" },
        to: { opacity: "1", transform: "translateY(0)" },
      },
      "fade-in-scale": {
        from: { opacity: "0", transform: "scale(0.96) translateY(8px)" },
        to: { opacity: "1", transform: "scale(1) translateY(0)" },
      },
      "pulse-ring": {
        "0%": { boxShadow: "0 0 0 0 rgba(34, 122, 70, 0.5)" },
        "70%": { boxShadow: "0 0 0 8px rgba(34, 122, 70, 0)" },
        "100%": { boxShadow: "0 0 0 0 rgba(34, 122, 70, 0)" },
      },
      "shimmer": {
        "0%": { backgroundPosition: "-200% 0" },
        "100%": { backgroundPosition: "200% 0" },
      },
      "bounce-in": {
        "0%": { transform: "scale(0.8)", opacity: "0" },
        "60%": { transform: "scale(1.05)" },
        "100%": { transform: "scale(1)", opacity: "1" },
      },
    },

    tokens: {
      colors: {
        // Primary brand blue
        primary: {
          50:  { value: "#EBF5FF" },
          100: { value: "#BADBFB" },
          200: { value: "#81BEF7" },
          300: { value: "#59AEFE" },
          400: { value: "#3FA0FB" },
          500: { value: c.primary },
          600: { value: c.primaryDark },
          700: { value: "#134B80" },
          800: { value: "#0D3459" },
          900: { value: "#0D3459" },
          950: { value: "#0D3459" },
          DEFAULT: { value: c.primary },
        },
        // Rose/pink accent
        accent: {
          50:  { value: "#FFF1F5" },
          100: { value: "#FFE4EC" },
          200: { value: "#FFCDDF" },
          300: { value: "#F0A8C0" },
          400: { value: c.accent },
          500: { value: "#BD6547" },
          600: { value: c.accentDark },
          700: { value: "#994B31" },
          800: { value: "#8C4932" },
          900: { value: "#7C412D" },
          950: { value: "#7C412D" },
          DEFAULT: { value: c.accent },
        },
        // Warm neutral (star/text)
        star: {
          50:  { value: "#FBFBF9" },
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
          DEFAULT: { value: c.star },
        },
        // Desert warm tone
        desert: {
          50:  { value: "#FFF5ED" },
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
          DEFAULT: { value: c.desert },
        },
        // Dune warm tone
        dune: {
          50:  { value: "#FFF9ED" },
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
          DEFAULT: { value: c.dune },
        },
        // Success green
        green: {
          50:  { value: "#EBF7ED" },
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
          DEFAULT: { value: c.green },
        },
        // Glass background colors
        glass: {
          bg:     { value: "rgba(255, 255, 255, 0.72)" },
          hover:  { value: "rgba(255, 255, 255, 0.88)" },
          strong: { value: "rgba(255, 255, 255, 0.85)" },
          border: { value: "rgba(255, 255, 255, 0.5)" },
          borderStrong: { value: "rgba(255, 255, 255, 0.8)" },
        },
        // App background
        app: {
          bg:     { value: "hsl(210, 20%, 98%)" },
          bgDark: { value: "hsl(222, 84%, 4.9%)" },
        },
      },

      fonts: {
        heading: { value: "var(--font-sora), sans-serif" },
        body: { value: "var(--font-dm-sans), sans-serif" },
      },

      radii: {
        card: { value: "12px" },
        button: { value: "10px" },
        input: { value: "10px" },
      },
    },

    semanticTokens: {
      colors: {
        "bg.canvas": {
          DEFAULT: { value: { base: "hsl(210, 20%, 98%)", _dark: "hsl(222, 84%, 4.9%)" } },
        },
        "fg.default": {
          DEFAULT: { value: { base: "hsl(222.2, 47.4%, 11.2%)", _dark: "hsl(210, 40%, 98%)" } },
        },
        "border.default": {
          DEFAULT: { value: { base: "hsl(210, 30%, 88%)", _dark: "hsl(217.2, 32.6%, 17.5%)" } },
        },
      },
    },
  },
});

export const system = createSystem(defaultConfig, customConfig);
