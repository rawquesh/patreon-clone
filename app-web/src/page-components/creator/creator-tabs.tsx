"use client";
import { Flex, Tabs } from "@chakra-ui/react";
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
      mt={6}
    >
      <Tabs.List>
        <Tabs.Indicator height={0} />
        <Flex
          css={{
            "& [aria-selected=true]": {
              fontWeight: 600,
              bgColor: "transparant",
              border: "none",
              boxShadow: "none",
            },
          }}
          mx={"auto"}
        >
          <Tabs.Trigger color={"green.800"} value="home">
            Home
          </Tabs.Trigger>
          <Tabs.Trigger color={"green.800"} value="collections">
            Collection
          </Tabs.Trigger>
          <Tabs.Trigger color={"green.800"} value="about">
            About
          </Tabs.Trigger>
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
