import React from "react";
import { Box, Heading, Text, VStack } from "@chakra-ui/react";
import ExploreSearchBar from "@/page-components/explore/search-bar";
import { MarketingHeader } from "@/components/marketing-header";
import { MarketingPageFooter } from "../marketing-page-footer";
import { MarketingComponents } from "./marketing-components";
import { branding, marketing } from "@/config";

export default function CommunityPage() {
  return (
    <Box color={branding.colors.star} bg="white">
      <MarketingHeader />

      <Box
        as="section"
        textAlign="center"
        pt={{ base: "5rem", md: "8rem" }}
        pb="3rem"
      >
        <Box maxW="1200px" mx="auto" px={{ base: 4, md: 6 }}>
          <VStack gap={4}>
            <Text
              bg={branding.colors.bgWarm}
              color={branding.colors.primary}
              fontWeight="600"
              px={4}
              py={2}
              borderRadius="full"
              fontSize={".75rem"}
            >
              Find your Community
            </Text>
            <Heading
              as="h1"
              size="5xl"
              textDecorationColor="rgba(29, 112, 191, 0.2)"
            >
              <Box textDecoration={"none"} as="span" color="#333">
                Discover{" "}
              </Box>
              <Box
                color={branding.colors.primary}
                as={"span"}
                textDecorationColor="rgba(29, 112, 191, 0.2) !important"
                textDecoration={"underline"}
                textUnderlineOffset="8px"
              >
                Creator Communities{" "}
              </Box>
              <Box textDecoration={"none"} as="span" color="#333">
                to Follow
              </Box>
            </Heading>
            <Text fontSize="lg" color={branding.colors.star} maxW="80%">
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
