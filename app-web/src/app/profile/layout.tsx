import type { Metadata } from "next";
import SideNav from "@/components/SideNav";
import { Box } from "@chakra-ui/react";

export const metadata: Metadata = {
  title: "Patreon Clone",
  description: "Patreon Clone app",
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
