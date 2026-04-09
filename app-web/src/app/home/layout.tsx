import type { Metadata } from "next";
import SideNav from "@/components/SideNav";
import { Box } from "@chakra-ui/react";
import { branding } from "@/config/branding";

export const metadata: Metadata = {
  title: branding.name,
  description: `${branding.name} home`,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <SideNav mode="user" />
      <Box
        ml={{ base: 0, lg: "280px" }}
        className="bg-gradient-overlay"
        minH={"100vh"}
        mt={{ base: "48px", lg: 0 }}
      >
        {children}
      </Box>
    </>
  );
}
