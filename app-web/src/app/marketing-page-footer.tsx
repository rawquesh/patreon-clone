import {
  Box,
  Container,
  Flex,
  Grid,
  Heading,
  SimpleGrid,
  Text,
  VStack,
} from "@chakra-ui/react";
import Link from "next/link";
import { QrDownload } from "@/components/QrDownload";

export const MarketingPageFooter = () => {
  return (
    <Box as="footer" py={20} bg="white">
      <Container maxW="1200px">
        <Flex alignItems={"start"} justify="space-between">
          <SimpleGrid columns={{ base: 1, md: 3 }} gap={10}>
            <VStack align="start" gap={4}>
              <Heading size="sm">Patreon Clone</Heading>
              <Text fontSize="sm">
                Empowering Jewish creators to share their voices, build thriving
                communities, and generate meaningful connections.
              </Text>
            </VStack>
            <VStack align="start">
              <Heading size="xs">Platform</Heading>
              <Grid
                templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }}
                gap={2}
                gridColumnGap={6}
              >
                <VStack align={"start"}>
                  <Link href={"/"}>Home</Link>
                  <Link href={"/pricing"}>Pricing</Link>
                  <Link href={"#"}>Communities</Link>
                </VStack>
                <VStack align={"start"}>
                  <Link href={"/support"}>Support</Link>
                  <Link href={"/privacy-policy"}>Privacy Policy</Link>
                  <Link href={"/tos"}>Terms of Service</Link>
                </VStack>
              </Grid>
            </VStack>
          </SimpleGrid>
          <VStack w="400px" gap={3}>
            <Heading size="xs">Get the app</Heading>
            <QrDownload size={100} />
          </VStack>
        </Flex>

        <Text
          textAlign="center"
          pt={10}
          mt={10}
          borderTopWidth="1px"
          fontSize="sm"
          color="#5A5954"
        >
          &copy; {new Date().getFullYear()} Patreon Clone. All rights reserved.
        </Text>
      </Container>
    </Box>
  );
};
