import { Box, Heading } from "@chakra-ui/react";
import React, { Suspense } from "react";
import PromotionsPageTabs from "./promotions-page-tabs";

const PromotionsPage: React.FC = () => {
  return (
    <Box pt={"56px"} maxW={"1024px"} w={"90vw"} mx={"auto"}>
      <Heading fontSize={"xl"} fontWeight={600}>
        Promotions
      </Heading>
      <Suspense>
        <PromotionsPageTabs />
      </Suspense>
    </Box>
  );
};

export default PromotionsPage;
