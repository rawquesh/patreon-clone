/* eslint-disable @next/next/no-img-element */
import { Box, Grid } from "@chakra-ui/react";
import React, { Suspense } from "react";
import LayoutRight from "./layout-right";

export default async function OnboardingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Grid
      pos={"relative"}
      gridTemplateColumns={{ base: "1fr", lg: "1.75fr 1fr" }}
      h={"100vh"}
    >
      <Box
        pos={"absolute"}
        top={0}
        css={{
          "& img": {
            maxW: "56px",
          },
        }}
        left={0}
        p={6}
        zIndex={10}
      >
        <img src={"/icons/logo.svg"} alt="logo" />
      </Box>
      <Box
        maxW={"440px"}
        w={"95vw"}
        mx={"auto"}
        pt={{ base: "80px", lg: "160px" }}
        textAlign={"center"}
        className="animate-fade-in-up"
        css={{ paddingBottom: "40px" }}
      >
        {children}
      </Box>
      <Suspense>
        <LayoutRight />
      </Suspense>
    </Grid>
  );
}
