import SideNav from "@/components/SideNav";
import { Box } from "@chakra-ui/react";

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
        <Box pt={"56px"} maxW={"648px"} w={"90vw"} mx={"auto"}>
          <Box mt={6}>{children}</Box>
        </Box>
      </Box>
    </>
  );
}
