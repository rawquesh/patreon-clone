"use client";
import Logo from "@/assets/logo";
import SideNav from "@/components/SideNav";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/auth.provider";
import { Box, Flex } from "@chakra-ui/react";
import Link from "next/link";

export const PageLayout = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoadingUser } = useAuth();

  return (
    <Box maxW={"100vw"} overflow={"hidden"}>
      {Boolean(user) && <SideNav mode="user" />}
      {!isLoadingUser && !Boolean(user) && (
        <Flex
          w={"100vw"}
          p={6}
          justifyContent={"space-between"}
          alignItems={"center"}
          bg={"#F7F5ED"}
          borderBottom={"1px solid #E0E0E0"}
          boxShadow={"xl"}
        >
          <Logo />
          <Link href="/auth/login">
            <Button>Become a member</Button>
          </Link>
        </Flex>
      )}
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
