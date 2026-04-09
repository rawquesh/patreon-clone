import React from "react";
import { Box, Heading, Text, VStack } from "@chakra-ui/react";
import ExploreSearchBar from "@/page-components/explore/search-bar";
import { MarketingHeader } from "@/components/marketing-header";
import { MarketingPageFooter } from "../marketing-page-footer";
import { MarketingComponents } from "./marketing-components";
import { branding, marketing } from "@/config";

export default function CommunityPage() {
  return (
    <Box css={{ background: "var(--app-bg)" }}>
      <MarketingHeader />

      <Box
        as="section"
        textAlign="center"
        pt={{ base: "5rem", md: "8rem" }}
        pb="3rem"
        className="page-header"
      >
        <Box maxW="1200px" mx="auto" px={{ base: 4, md: 6 }}>
          <VStack gap={4}>
            <Box
              px={4}
              py={2}
              borderRadius="full"
              fontSize={".75rem"}
              fontWeight="600"
              css={{ background: "var(--gradient-primary)", color: "white" }}
            >
              Find your Community
            </Box>
            <Heading
              as="h1"
              size="5xl"
              css={{
                background: "linear-gradient(135deg, hsl(211, 71%, 43%), hsl(335, 27%, 64%))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                lineHeight: 1.15,
              }}
            >
              Discover Creator Communities to Follow
            </Heading>
            <Text
              fontSize="lg"
              css={{ color: "hsl(215.4, 16.3%, 46.9%)" }}
              maxW="80%"
            >
              {marketing.communityPage.subtitle}. {marketing.heroSection.fromText}
            </Text>
          </VStack>
        </Box>
      </Box>

      <ExploreSearchBar />
      <MarketingComponents />
      <MarketingPageFooter />
    </Box>
  );
}
