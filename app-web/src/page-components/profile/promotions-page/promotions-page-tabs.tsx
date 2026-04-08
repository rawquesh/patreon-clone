"use client";
import { Flex, Tabs, TabsContent } from "@chakra-ui/react";
import { useSearchParams, useRouter } from "next/navigation";
import React from "react";
import DiscountsTable from "./discounts-table";
import GiftsTable from "./gifts-table";

const PromotionsPageTabs: React.FC = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  let tab = searchParams.get("tab");
  tab = ["autopilot", "discounts", "gifts"].includes(tab || "")
    ? tab
    : "discounts";
  return (
    <Tabs.Root
      onValueChange={(t) => {
        router.push(`/profile/promotions?tab=${t.value}`);
      }}
      defaultValue={tab}
      mt={6}
    >
      <Tabs.List borderBottom={"0px"}>
        {/* <Tabs.Indicator height={0} /> */}
        <Flex
          css={{
            "& [aria-selected=true]": {
              fontWeight: 600,
              bgColor: "transparant",
              border: "none",
              boxShadow: "none",
            },
            // "& [aria-selected=true]::before": {
            // 	bgColor: "red",
            // 	// width: "50%",
            // 	// left: "50%",
            // },
          }}
        >
          {/* <Tabs.Trigger value="autopilot">Autopilot</Tabs.Trigger> */}
          <Tabs.Trigger value="discounts">Discounts</Tabs.Trigger>
          <Tabs.Trigger value="gifts">Gifts</Tabs.Trigger>
        </Flex>
      </Tabs.List>
      <TabsContent value="discounts">
        <DiscountsTable />
      </TabsContent>
      <TabsContent value="gifts">
        <GiftsTable />
      </TabsContent>
    </Tabs.Root>
  );
};

export default PromotionsPageTabs;
