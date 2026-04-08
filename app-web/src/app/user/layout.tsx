import type { Metadata } from "next";
import SideNav from "@/components/SideNav";
import { Box } from "@chakra-ui/react";
import { branding } from "@/config/branding";

export const metadata: Metadata = {
	title: branding.name,
	description: `${branding.name} messages`,
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<Box maxW={"100vw"} overflow={"hidden"}>
			<SideNav mode="user" />
			<Box
				ml={{ base: 0, lg: "300px" }}
				bg={"#F7F5ED"}
				minH={"100vh"}
				mt={{ base: "48px", md: 0 }}
			>
				{children}
			</Box>
		</Box>
	);
}
