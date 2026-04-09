import React, { Suspense } from "react";
import InsightsPageTabs from "./ingishts-page-tabs";
import { Box, Heading } from "@chakra-ui/react";

const InsightsPage: React.FC = () => {
  return (
    <Box className="animate-fade-in-up" minH="100vh" py="56px">
      <Box pt="56px" maxW="1024px" w="90vw" mx="auto" px={{ base: 0, md: 4 }}>
        <Box mb={6} position="relative">
          <Box
            position="absolute"
            w="300px"
            h="60px"
            borderRadius="full"
            css={{
              background: "linear-gradient(135deg, hsl(211, 71%, 43% / 0.08), hsl(335, 27%, 64% / 0.06))",
              filter: "blur(40px)",
              top: "-10px",
              left: "0",
              pointerEvents: "none",
            }}
          />
          <Heading
            fontSize="xl"
            fontWeight={700}
            mb={1}
            css={{ color: "hsl(222.2, 47.4%, 11.2%)" }}
          >
            Insights
          </Heading>
          <Box
            h="1px"
            background="linear-gradient(90deg, transparent, hsl(210, 30%, 88%), transparent)"
          />
        </Box>
        <Suspense>
          <InsightsPageTabs />
        </Suspense>
      </Box>
    </Box>
  );
};

export default InsightsPage;
