import {
  Box,
  Container,
  Flex,
  Heading,
  HStack,
  IconButton,
  Image,
  Stack,
  VStack,
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
      // position="fixed"
      w="100%"
      bg="whiteAlpha.950"
      zIndex="1000"
      boxShadow="0 2px 20px rgba(0,0,0,0.05)"
      backdropFilter="blur(8px)"
      pos={"fixed"}
      top={0}
      left={0}
    >
      <Container maxW="1200px" py={3}>
        <Flex justify="space-between" align="center">
          <HStack>
            <Image src="/icons/logo.png" h={"36px"} alt="logo" />
            <VStack align="start" gap={0}>
              <Heading size="3xl" color="#141413">
                Patreon Clone
              </Heading>
              {/* <Text fontSize="12px" color="#5A5954">
            Jewish Community Hub
          </Text> */}
            </VStack>
          </HStack>
          <HStack
            gap={{ base: 2, md: 8 }}
            display={{ base: "none", md: "flex" }}
          >
            <Link href={"/"}>Home</Link>
            <Link href={"/pricing"}>Pricing</Link>
            <Link href={"/community"}>Community</Link>
          </HStack>
          <HStack gap={4}>
            {/* <Link href={"/auth/login"}>
          <Button
            bg="transparent"
            color="#1D70BF"
            borderColor="#1D70BF"
            borderWidth="1px"
            _hover={{ bg: "rgba(29, 112, 191, 0.05)" }}
          >
            Log In
          </Button>
        </Link> */}
            <Link href={"/auth/login"}>
              <Button bg="#1D70BF" color="white" _hover={{ bg: "#3283d1" }}>
                Login
              </Button>
            </Link>
          </HStack>
        </Flex>
      </Container>
    </Box>
  );
};

const Mobile = () => {
  return (
    <Box
      w="100%"
      px={6}
      bg="whiteAlpha.950"
      zIndex="1000"
      pos={"fixed"}
      top={0}
      left={0}
      display={{ base: "flex", md: "none" }}
      boxShadow="0 2px 20px rgba(0,0,0,0.05)"
      backdropFilter="blur(8px)"

      // border={"2px solid red"}
    >
      <Container
        justifyContent={"space-between"}
        display={"flex"}
        alignItems={"center"}
        maxW={"100vw"}
      >
        <HStack>
          <Image src="/icons/logo.png" h={"36px"} alt="logo" />
          <VStack align="start" gap={0}>
            <Heading size="3xl" color="#141413">
              Patreon Clone
            </Heading>
            {/* <Text fontSize="12px" color="#5A5954">
            Jewish Community Hub
          </Text> */}
          </VStack>
        </HStack>
        <DrawerRoot
          closeOnInteractOutside={true}
          closeOnEscape={true}
          placement={"start"}
          size={"full"}
        >
          <DrawerBackdrop />
          <DrawerTrigger as={"div"}>
            <IconButton mx={4} my={4} variant={"surface"}>
              <Icon icon={"mage:dash-menu"} />
            </IconButton>
          </DrawerTrigger>
          <DrawerContent p={6}>
            <DrawerHeader>
              <DrawerCloseTrigger />
            </DrawerHeader>
            <HStack>
              <Image src="/icons/logo.png" h={"36px"} alt="logo" />
              <VStack align="start" gap={0}>
                <Heading size="3xl" color="#141413">
                  Patreon Clone
                </Heading>
                {/* <Text fontSize="12px" color="#5A5954">
            Jewish Community Hub
          </Text> */}
              </VStack>
            </HStack>
            <Stack
              gap={{ base: 6 }}
              // display={{ base: "none", md: "flex" }}
              fontSize={"xl"}
              fontWeight={"bold"}
              color={"blue.800"}
              my={10}
            >
              <Link href={"/"}>Home</Link>
              <Link href={"/pricing"}>Pricing</Link>
              <Link href={"/community"}>Community</Link>
            </Stack>
            <Link href={"/auth/login"}>
              <Button bg="#1D70BF" color="white" _hover={{ bg: "#3283d1" }}>
                Login
              </Button>
            </Link>
          </DrawerContent>
        </DrawerRoot>
      </Container>
    </Box>
  );
};
