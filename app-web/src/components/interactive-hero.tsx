"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  Flex,
  Heading,
  Text,
  Button,
  VStack,
  HStack,
  Container,
  Image,
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import Link from "next/link";
import { branding, marketing } from "@/config";

const MotionFlex = motion(Flex);
const MotionImage = motion(Image);

export function InteractiveHero() {
  const [rotate, setRotate] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const tiltX = (y / rect.height - 0.5) * 20;
    const tiltY = (x / rect.width - 0.5) * -20;
    setRotate({ x: tiltX, y: tiltY });
  };

  const handleMouseLeave = () => {
    setRotate({ x: 0, y: 0 });
  };

  useEffect(() => {
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener("click", (e) => {
        const targetId = anchor.getAttribute("href");
        if (targetId && targetId !== "#") {
          e.preventDefault();
          const targetElement = document.querySelector(targetId);
          if (targetElement) {
            window.scrollTo({
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              //@ts-ignore
              top: targetElement.offsetTop - 80,
              behavior: "smooth",
            });
          }
        }
      });
    });
  }, []);

  return (
    <Box as="section" pt={{ base: "5rem", md: "8rem" }} pb="5rem">
      <Container maxW="1200px">
        <Flex
          direction={{ base: "column-reverse", lg: "row" }}
          align="center"
          gap={16}
        >
          <VStack
            align={{ base: "center", lg: "start" }}
            gap={6}
            flex={1.2}
            textAlign={{ base: "center", lg: "left" }}
          >
            <Text
              bg="rgba(29, 112, 191, 0.08)"
              color={branding.colors.primary}
              fontWeight="600"
              px={4}
              py={2}
              borderRadius="full"
              fontSize={".75rem"}
            >
              Create with Purpose
            </Text>
            <Heading
              as="h1"
              fontSize={{ base: "2.5rem", md: "3rem" }}
              color={branding.colors.textHeader}
              lineHeight="1.2"
            >
              Build a thriving{" "}
              <Box
                as="span"
                color={branding.colors.primary}
                textDecoration="underline"
                textDecorationColor="rgba(29, 112, 191, 0.2)"
                textUnderlineOffset="8px"
              >
                Jewish Community
              </Box>{" "}
              online
            </Heading>
            <Text fontSize="lg" color={branding.colors.star} maxW="550px">
              {branding.description}
            </Text>
            <HStack gap={4} pt={4}>
              <Link href={"/auth/login"}>
                <Button
                  bg={branding.colors.primary}
                  color="white"
                  _hover={{ bg: branding.colors.primaryHover }}
                  size="lg"
                >
                  Join {branding.name}
                </Button>
              </Link>
              <Link href={"/community"}>
                <Button
                  variant="outline"
                  borderColor={branding.colors.primary}
                  color={branding.colors.primary}
                  size="lg"
                >
                  Explore Creators
                </Button>
              </Link>
            </HStack>
            <HStack gap={10} pt={8}>
              <VStack alignItems={"start"}>
                <Heading textAlign={"left"} size="2xl">
                  {marketing.heroStats.activeCommunities}
                </Heading>
                <Text>Active Communities</Text>
              </VStack>
              <VStack alignItems={"start"}>
                <Heading textAlign={"left"} size="2xl">
                  {marketing.heroStats.communityMembers}
                </Heading>
                <Text>Community Members</Text>
              </VStack>
              <VStack alignItems={"start"}>
                <Heading textAlign={"left"} size="2xl">
                  {marketing.heroStats.generatedRevenue}
                </Heading>
                <Text>Generated Revenue</Text>
              </VStack>
            </HStack>
          </VStack>
          <MotionFlex
            flex={1}
            justify="center"
            align="center"
            style={{ perspective: "1000px" }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            pos={"relative"}
            css={{
              "& .pattern": {
                position: "absolute",
                bordeRadius: "50%",
                rounded: "50%",
                zIndex: -1,
                display: { base: "none", md: "block" },
              },
              "& .pattern-1": {
                width: { base: "150px", md: "300px" },
                height: { base: "150px", md: "300px" },
                backgroundColor: `${branding.colors.primary}0d`,
                top: "-100px",
                right: "-100px",
              },
              "& .pattern-2": {
                width: { base: "125px", md: "250px" },
                height: { base: "125px", md: "250px" },
                backgroundColor: `${branding.colors.accent}0d`,
                bottom: "-80px",
                left: "-100px",
              },
            }}
          >
            <MotionImage
              src="/hero.png"
              alt="hero image"
              id="hero-image"
              className="hero"
              style={{
                rotateX: rotate.x,
                rotateY: rotate.y,
              }}
              transition={{
                type: "tween",
                stiffness: 350,
                damping: 40,
              }}
            />
            <div className="pattern pattern-1"></div>
            <div className="pattern pattern-2"></div>
          </MotionFlex>
        </Flex>
      </Container>
    </Box>
  );
}
