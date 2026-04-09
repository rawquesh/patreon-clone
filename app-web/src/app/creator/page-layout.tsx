"use client";
import SideNav from "@/components/SideNav";
import { useAuth } from "@/context/auth.provider";
import { Box, Flex, Image } from "@chakra-ui/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { branding } from "@/config/branding";

export const PageLayout = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();

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
          bg={branding.colors.bgWarm}
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
                borderColor={branding.colors.primaryDark}
                color={branding.colors.primaryDark}
                _hover={{
                  bg: branding.colors.primaryDark,
                  color: "white",
                }}
              >
                Login
              </Button>
            </Link>
            <Link href={"/auth/login"}>
              <Button
                bg={branding.colors.primaryDark}
                color="white"
                _hover={{
                  bg: branding.colors.primary,
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
        bg={branding.colors.bgWarm}
        minH={"100vh"}
        mt={{ base: "48px", md: 0 }}
      >
        {children}
      </Box>
    </Box>
  );
};
