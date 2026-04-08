import React, { Suspense } from "react";
import InsightsPageTabs from "./ingishts-page-tabs";
import { Box, Heading } from "@chakra-ui/react";

const InsightsPage: React.FC = () => {
  return (
    <Box minH={"100vh"} py={"56px"}>
      <Box pt={"56px"} maxW={"1024px"} w={"90vw"} mx={"auto"}>
        <Heading fontSize={"xl"} fontWeight={600}>
          Insights
        </Heading>
        <Suspense>
          <InsightsPageTabs />
        </Suspense>
      </Box>
    </Box>
  );
};

export default InsightsPage;
