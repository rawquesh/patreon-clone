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
  Image,
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import Link from "next/link";
import { branding, marketing } from "@/config";

const MotionFlex = motion.create(Flex);
const MotionImage = motion.create(Image);

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
              top: (targetElement as HTMLElement).offsetTop - 80,
              behavior: "smooth",
            });
          }
        }
      });
    });
  }, []);

  return (
    <Box as="section" pt={{ base: "7rem", md: "9rem" }} pb="5rem" position="relative" overflow="hidden">
      {/* Background orbs */}
      <Box
        position="absolute"
        w="400px"
        h="400px"
        borderRadius="full"
        css={{
          background: "hsl(211, 71%, 43% / 0.08)",
          filter: "blur(100px)",
          top: "-100px",
          right: "-100px",
          pointerEvents: "none",
        }}
      />
      <Box
        position="absolute"
        w="350px"
        h="350px"
        borderRadius="full"
        css={{
          background: "hsl(335, 27%, 64% / 0.06)",
          filter: "blur(80px)",
          bottom: "-50px",
          left: "-100px",
          pointerEvents: "none",
        }}
      />

      <Box maxW="1200px" mx="auto" px={{ base: 4, md: 6 }} position="relative">
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
              css={{
                background: "linear-gradient(135deg, hsl(211, 71%, 43% / 0.08), hsl(335, 27%, 64% / 0.08))",
                color: "hsl(211, 71%, 43%)",
                fontWeight: 600,
                padding: "6px 16px",
                borderRadius: "9999px",
                fontSize: "0.75rem",
                border: "1px solid hsl(211, 71%, 43% / 0.15)",
              }}
            >
              Create with Purpose
            </Text>
            <Heading
              as="h1"
              fontSize={{ base: "2.5rem", md: "3rem" }}
              fontWeight={700}
              lineHeight={1.2}
              css={{ color: "hsl(222.2, 47.4%, 11.2%)" }}
            >
              Build a thriving{" "}
              <Box
                as="span"
                css={{
                  background: "linear-gradient(135deg, hsl(211, 71%, 43%), hsl(335, 27%, 64%))",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Creator Community
              </Box>{" "}
              online
            </Heading>
            <Text fontSize="lg" css={{ color: "hsl(215.4, 16.3%, 46.9%)", maxW: "550px" }}>
              {branding.description}
            </Text>
            <HStack gap={4} pt={4}>
              <Link href={"/auth/login"}>
                <Button
                  size="lg"
                  css={{
                    background: "var(--gradient-primary)",
                    borderRadius: "12px",
                    fontWeight: 600,
                    transition: "all 0.15s ease",
                    "&:hover": {
                      boxShadow: "0 0 20px hsl(211, 71%, 43% / 0.3)",
                      transform: "translateY(-1px)",
                    },
                  }}
                >
                  Join {branding.name}
                </Button>
              </Link>
              <Link href={"/community"}>
                <Button
                  size="lg"
                  variant="outline"
                  css={{
                    borderColor: "hsl(211, 71%, 43%)",
                    color: "hsl(211, 71%, 43%)",
                    borderRadius: "12px",
                    fontWeight: 600,
                    transition: "all 0.15s ease",
                    "&:hover": {
                      background: "hsl(211, 71%, 43% / 0.05)",
                      borderColor: "hsl(211, 71%, 43%)",
                    },
                  }}
                >
                  Explore Creators
                </Button>
              </Link>
            </HStack>
            <HStack gap={10} pt={8}>
              <VStack alignItems="start">
                <Heading textAlign="left" size="2xl" css={{ color: "hsl(211, 71%, 43%)" }}>
                  {marketing.heroStats.activeCommunities}
                </Heading>
                <Text fontSize="sm" css={{ color: "hsl(215.4, 16.3%, 46.9%)" }}>Active Communities</Text>
              </VStack>
              <VStack alignItems="start">
                <Heading textAlign="left" size="2xl" css={{ color: "hsl(211, 71%, 43%)" }}>
                  {marketing.heroStats.communityMembers}
                </Heading>
                <Text fontSize="sm" css={{ color: "hsl(215.4, 16.3%, 46.9%)" }}>Community Members</Text>
              </VStack>
              <VStack alignItems="start">
                <Heading textAlign="left" size="2xl" css={{ color: "hsl(211, 71%, 43%)" }}>
                  {marketing.heroStats.generatedRevenue}
                </Heading>
                <Text fontSize="sm" css={{ color: "hsl(215.4, 16.3%, 46.9%)" }}>Generated Revenue</Text>
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
          >
            {/* Decorative background */}
            <Box
              position="absolute"
              w="300px"
              h="300px"
              borderRadius="full"
              css={{
                background: "hsl(211, 71%, 43% / 0.08)",
                filter: "blur(60px)",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                zIndex: -1,
              }}
            />
            <MotionImage
              src="/hero.png"
              alt="hero image"
              id="hero-image"
              className="hero"
              style={{
                rotateX: rotate.x,
                rotateY: rotate.y,
                borderRadius: "16px",
              }}
              transition={{
                type: "tween",
                stiffness: 350,
                damping: 40,
              }}
              css={{
                boxShadow: "0 20px 60px rgba(29, 112, 191, 0.15), 0 8px 24px rgba(0,0,0,0.08)",
                maxWidth: "100%",
                height: "auto",
              }}
            />
          </MotionFlex>
        </Flex>
      </Box>
    </Box>
  );
}
