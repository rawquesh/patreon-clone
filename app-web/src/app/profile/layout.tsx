import type { Metadata } from "next";
import SideNav from "@/components/SideNav";
import { Box } from "@chakra-ui/react";
import { branding } from "@/config/branding";

export const metadata: Metadata = {
  title: branding.name,
  description: `Manage your ${branding.name} profile`,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <SideNav mode="creator" />
      <Box
        ml={{ base: 0, lg: "300px" }}
        bg={"#F7F5ED"}
        minH={"100vh"}
        mt={{ base: "48px", md: 0 }}
        // pb={"100px"}
        // border={"2px solid blue"}
      >
        {children}
      </Box>
    </>
  );
}
