"use client";
import { Box, Flex, Tabs } from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import React from "react";
import DiscountsTable from "./discounts-table";
import GiftsTable from "./gifts-table";

const PromotionsPageTabs: React.FC = () => {
  const router = useRouter();

  return (
    <Tabs.Root
      onValueChange={(t) => {
        router.push(`/profile/promotions?tab=${t.value}`);
      }}
      defaultValue="discounts"
      mt={6}
    >
      <Tabs.List
        className="glass-card-static"
        borderRadius="12px"
        p={1}
        gap={1}
        css={{
          background: "rgba(255,255,255,0.7)",
          backdropFilter: "blur(12px)",
        }}
      >
        {["discounts", "gifts"].map((value) => (
          <Tabs.Trigger
            key={value}
            value={value}
            borderRadius="10px"
            px={5}
            py={2}
            fontSize="sm"
            fontWeight={500}
            textTransform="capitalize"
            css={{
              color: "hsl(215.4, 16.3%, 46.9%)",
              transition: "all 0.15s ease",
              "&[data-state=active]": {
                background: "var(--gradient-primary)",
                color: "white",
                fontWeight: 600,
                boxShadow: "0 2px 8px hsl(211, 71%, 43% / 0.3)",
              },
              "&:hover:not([data-state=active])": {
                color: "hsl(222.2, 47.4%, 11.2%)",
                background: "rgba(255,255,255,0.6)",
              },
            }}
          >
            {value}
          </Tabs.Trigger>
        ))}
      </Tabs.List>
      <Tabs.Content value="discounts">
        <Box mt={6}>
          <DiscountsTable />
        </Box>
      </Tabs.Content>
      <Tabs.Content value="gifts">
        <Box mt={6}>
          <GiftsTable />
        </Box>
      </Tabs.Content>
    </Tabs.Root>
  );
};

export default PromotionsPageTabs;
