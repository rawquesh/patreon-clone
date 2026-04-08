import type { Metadata } from "next";
import SideNav from "@/components/SideNav";
import { Box } from "@chakra-ui/react";

export const metadata: Metadata = {
  title: "Patreon Clone",
  description: "Patreon Clone explore",
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
        ml={{ base: 0, md: "300px" }}
        // bg={"#F7F5ED"}
        minH={"100vh"}
        mt={{ base: "48px", md: 0 }}
      >
        {children}
      </Box>
    </>
  );
}
