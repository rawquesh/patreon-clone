"use client";
import SideNav from "@/components/SideNav";
import { useAuth } from "@/context/auth.provider";
import { Box, Flex, Image } from "@chakra-ui/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const PageLayout = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();

  const primaryColor = "#1962A5";
  const primaryHoverColor = "#1D70BF";

  return (
    <Box maxW={"100vw"} overflow={"hidden"}>
      {Boolean(user) && <SideNav mode="user" />}
      {/* {!Boolean(user) && <} */}
      {!Boolean(user) && (
        <Flex
          pos={"fixed"}
          w={"100%"}
          top={0}
          left={0}
          bg={"#F7F5ED"}
          gap={4}
          px={6}
          py={4}
          zIndex={10000}
          // border={"2px solid red"}
        >
          {/* <Logo /> */}
          <Image src="/icons/logo.png" h={"36px"} alt="logo" />

          <Flex ml={"auto"} gap={4}>
            <Link href={"/auth/login"}>
              <Button
                variant="outline"
                borderColor={primaryColor}
                color={primaryColor}
                _hover={{
                  bg: primaryColor,
                  color: "white",
                }}
              >
                Login
              </Button>
            </Link>
            <Link href={"/auth/login"}>
              <Button
                bg={primaryColor}
                color="white"
                _hover={{
                  bg: primaryHoverColor,
                }}
              >
                Sign Up
              </Button>
            </Link>
          </Flex>
        </Flex>
      )}
      {!Boolean(user) && <Box h={"72px"} w={"100%"}></Box>}
      <Box
        ml={{ base: 0, lg: Boolean(user) ? "300px" : 0 }}
        bg={"#F7F5ED"}
        minH={"100vh"}
        mt={{ base: "48px", md: 0 }}
      >
        {children}
      </Box>
    </Box>
  );
};
