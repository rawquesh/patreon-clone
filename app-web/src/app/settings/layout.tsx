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
        ml={{ base: 0, md: "300px" }}
        // bg={"#F7F5ED"}
        minH={"100vh"}
        mt={{ base: "48px", md: 0 }}
      >
        <Box pt={"56px"} maxW={"648px"} w={"90vw"} mx={"auto"}>
          {/* <NotificationSettings /> */}
          <Box mt={6}>{children}</Box>
        </Box>
      </Box>
    </>
  );
}
