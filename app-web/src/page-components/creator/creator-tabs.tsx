"use client";
import { Flex, Tabs, Text } from "@chakra-ui/react";
import { useSearchParams, useRouter } from "next/navigation";
import React from "react";
import HomePage from "./home-page";
import AboutPage from "./about-page";
import CollectionsPage from "./creator-collections-page";

const CreatorTabs: React.FC<{
  creatorId: string;
  creatorUsername: string;
}> = ({ creatorId, creatorUsername }) => {
  const searchParams = useSearchParams();
  const router = useRouter();
  let tab = searchParams.get("tab");
  tab = ["home", "collections", "about"].includes(tab || "") ? tab : "home";

  return (
    <Tabs.Root
      onValueChange={(t) => {
        router.push(`/creator/${creatorUsername}?tab=${t.value}`);
      }}
      defaultValue={tab}
      mt={8}
    >
      <Tabs.List
        className="glass-card-static"
        borderRadius="12px"
        p={1}
        gap={1}
        mx="auto"
        maxW="fit-content"
        css={{
          background: "rgba(255,255,255,0.7)",
          backdropFilter: "blur(12px)",
        }}
      >
        <Tabs.Indicator height={0} />
        <Flex mx="auto">
          {["home", "collections", "about"].map((value) => (
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
        </Flex>
      </Tabs.List>
      <Tabs.Content value="home">
        <HomePage creatorId={creatorId} creatorUsername={creatorUsername} />
      </Tabs.Content>
      <Tabs.Content value="collections">
        <CollectionsPage creatorId={creatorId} />
      </Tabs.Content>
      <Tabs.Content value="about">
        <AboutPage creatorId={creatorId} creatorUsername={creatorUsername} />
      </Tabs.Content>
    </Tabs.Root>
  );
};

export default CreatorTabs;
