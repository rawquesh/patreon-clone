import {
  Box,
  Flex,
  Heading,
  HStack,
  IconButton,
  Image,
  Stack,
  VStack,
  Text,
} from "@chakra-ui/react";
import Link from "next/link";
import { Button } from "./ui/button";
import {
  DrawerBackdrop,
  DrawerCloseTrigger,
  DrawerContent,
  DrawerHeader,
  DrawerRoot,
  DrawerTrigger,
} from "./ui/drawer";
import { Icon } from "@iconify/react/dist/iconify.js";
import { branding } from "@/config/branding";

export const MarketingHeader = () => {
  return (
    <>
      <Desktop />
      <Mobile />
    </>
  );
};

const Desktop = () => {
  return (
    <Box
      display={{ base: "none", md: "block" }}
      as="header"
      w="100%"
      zIndex="1000"
      pos={"fixed"}
      top={0}
      left={0}
      className="glass-card-static"
      css={{
        background: "linear-gradient(180deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%)",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "2px",
          background: "var(--gradient-primary)",
        },
      }}
    >
      <Box maxW="1200px" mx="auto" px={{ base: 4, md: 6 }} py={3}>
        <Flex justify="space-between" align="center">
          <HStack gap={3}>
            <Box
              w="36px"
              h="36px"
              borderRadius="10px"
              background="var(--gradient-primary)"
              display="flex"
              alignItems="center"
              justifyContent="center"
              flexShrink={0}
            >
              <Image src="/icons/logo.png" alt="logo" boxSize="22px" />
            </Box>
            <Heading
              size="lg"
              fontWeight={700}
              css={{
                background: "linear-gradient(135deg, hsl(211, 71%, 43%), hsl(335, 27%, 64%))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                fontSize: "1.25rem",
              }}
            >
              {branding.name}
            </Heading>
          </HStack>
          <HStack gap={{ base: 4, md: 8 }} display={{ base: "none", md: "flex" }}>
            <Link href="/">
              <Text
                fontSize="sm"
                fontWeight={500}
                css={{
                  color: "hsl(215.4, 16.3%, 46.9%)",
                  transition: "color 0.15s ease",
                  "&:hover": {
                    color: "hsl(211, 71%, 43%)",
                  },
                }}
              >
                Home
              </Text>
            </Link>
            <Link href="/pricing">
              <Text
                fontSize="sm"
                fontWeight={500}
                css={{
                  color: "hsl(215.4, 16.3%, 46.9%)",
                  transition: "color 0.15s ease",
                  "&:hover": {
                    color: "hsl(211, 71%, 43%)",
                  },
                }}
              >
                Pricing
              </Text>
            </Link>
            <Link href="/community">
              <Text
                fontSize="sm"
                fontWeight={500}
                css={{
                  color: "hsl(215.4, 16.3%, 46.9%)",
                  transition: "color 0.15s ease",
                  "&:hover": {
                    color: "hsl(211, 71%, 43%)",
                  },
                }}
              >
                Community
              </Text>
            </Link>
          </HStack>
          <HStack gap={4}>
            <Link href={"/auth/login"}>
              <Button
                size="sm"
                css={{
                  background: "var(--gradient-primary)",
                  borderRadius: "10px",
                  fontWeight: 600,
                  transition: "all 0.15s ease",
                }}
              >
                Login
              </Button>
            </Link>
          </HStack>
        </Flex>
      </Box>
    </Box>
  );
};

const Mobile = () => {
  return (
    <Box
      w="100%"
      px={6}
      zIndex="1000"
      pos={"fixed"}
      top={0}
      left={0}
      display={{ base: "flex", md: "none" }}
      className="glass-card-static"
      css={{
        background: "linear-gradient(180deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%)",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "2px",
          background: "var(--gradient-primary)",
        },
      }}
    >
      <Box
        justifyContent="space-between"
        display="flex"
        alignItems="center"
        maxW="100vw"
        py={3}
      >
        <HStack gap={2}>
          <Box
            w="32px"
            h="32px"
            borderRadius="8px"
            background="var(--gradient-primary)"
            display="flex"
            alignItems="center"
            justifyContent="center"
            flexShrink={0}
          >
            <Image src="/icons/logo.png" alt="logo" boxSize="20px" />
          </Box>
          <Heading
            size="lg"
            fontWeight={700}
            css={{
              background: "linear-gradient(135deg, hsl(211, 71%, 43%), hsl(335, 27%, 64%))",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              fontSize: "1.1rem",
            }}
          >
            {branding.name}
          </Heading>
        </HStack>
        <DrawerRoot
          closeOnInteractOutside={true}
          closeOnEscape={true}
          placement={"start"}
          size={"full"}
        >
          <DrawerBackdrop />
          <DrawerTrigger as={"div"}>
            <IconButton mx={4} my={4} variant={"surface"} aria-label="Open menu">
              <Icon icon={"mage:dash-menu"} />
            </IconButton>
          </DrawerTrigger>
          <DrawerContent
            p={6}
            className="glass-card-static"
            css={{
              background: "linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(255,255,255,0.85) 100%)",
            }}
          >
            <DrawerHeader>
              <DrawerCloseTrigger />
            </DrawerHeader>
            <HStack gap={2} mb={8}>
              <Box
                w="32px"
                h="32px"
                borderRadius="8px"
                background="var(--gradient-primary)"
                display="flex"
                alignItems="center"
                justifyContent="center"
                flexShrink={0}
              >
                <Image src="/icons/logo.png" alt="logo" boxSize="20px" />
              </Box>
              <Heading
                size="lg"
                fontWeight={700}
                css={{
                  background: "linear-gradient(135deg, hsl(211, 71%, 43%), hsl(335, 27%, 64%))",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  fontSize: "1.1rem",
                }}
              >
                {branding.name}
              </Heading>
            </HStack>
            <Stack gap={6} fontSize="lg" fontWeight={500}>
              <Link href="/">
                <Text css={{ color: "hsl(211, 71%, 43%)" }}>Home</Text>
              </Link>
              <Link href="/pricing">
                <Text css={{ color: "hsl(215.4, 16.3%, 46.9%)" }}>Pricing</Text>
              </Link>
              <Link href="/community">
                <Text css={{ color: "hsl(215.4, 16.3%, 46.9%)" }}>Community</Text>
              </Link>
            </Stack>
            <Link href={"/auth/login"} style={{ marginTop: "auto" }}>
              <Button
                mt={10}
                css={{
                  background: "var(--gradient-primary)",
                  borderRadius: "10px",
                  fontWeight: 600,
                  width: "100%",
                }}
              >
                Login
              </Button>
            </Link>
          </DrawerContent>
        </DrawerRoot>
      </Box>
    </Box>
  );
};
