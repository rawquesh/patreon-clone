"use client";
import { Box, Flex, Heading } from "@chakra-ui/react";
import React, { useState } from "react";
import ActionBar from "./action-bar";
import FilterBar from "./filter-bar";
import VisibleColumnsPopover from "./visible-columns-popover";
import { columnsList } from "./data";
import AudienceTable from "./audience-table";
import { MembersProvider } from "@/context/members-provider";

const AudiencePage: React.FC = () => {
  const [visibleCols, setVisibleCols] = useState(columnsList);

  return (
    <MembersProvider>
      <Box minH={"100vh"} maxW={"1024px"} w={"90vw"} mx={"auto"} pt={"56px"}>
        <Heading fontSize={"xl"} fontWeight={600}>
          Audience
        </Heading>
        <ActionBar />
        <FilterBar />
        <Flex mt={2} justifyContent={"end"}>
          <VisibleColumnsPopover
            visibleCols={visibleCols}
            setVisibleCols={setVisibleCols}
          />
        </Flex>
        <AudienceTable visibleColumns={visibleCols} />
      </Box>
    </MembersProvider>
  );
};

export default AudiencePage;
