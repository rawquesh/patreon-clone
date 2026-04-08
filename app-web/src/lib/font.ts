import localFont from "next/font/local";

export const tiempostFont = localFont({
	variable: "--tiempos-headline-sans",
	// Define variants for your font.
	// weight = "font-weight". will use the matching variant when you
	// set font-weight CSS prop on your text elements
	src: [
		{
			path: "../../public/fonts/TestTiemposHeadline-Black.otf",
			weight: "800",
			style: "normal",
		},
		// {
		// 	path: "path/to/public/fonts/fonts/MyCustomFontNarrow-Bold_Web.woff2",
		// 	weight: "500",
		// 	style: "normal",
		// },
		// {
		// 	path: "path/to/public/fonts/fonts/MyCustomFont-Bold_Web.woff2",
		// 	weight: "700",
		// 	style: "normal",
		// },
	],
	// Or, you can define a single font instead e.g.
	// src: "path/to/public/fonts/MyCustomFont-Book_Web.woff2"
});
