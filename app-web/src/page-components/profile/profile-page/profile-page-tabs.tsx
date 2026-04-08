"use client";
import { Flex, Tabs } from "@chakra-ui/react";
import { useSearchParams, useRouter } from "next/navigation";
import React from "react";
import HomePage from "./home-page";
import Collection from "./collection";
import MembershipPage from "./membership-page";
import AboutPage from "./about-page";
import { useAuth } from "@/context/auth.provider";

const ProfilePageTabs: React.FC = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  let tab = searchParams.get("tab");
  tab = ["home", "collection", "membership", "about"].includes(tab || "")
    ? tab
    : "home";
  return (
    <Tabs.Root
      onValueChange={(t) => {
        router.push(`/profile?tab=${t.value}`);
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
          <Tabs.Trigger color={"green.800"} value="collection">
            Collection
          </Tabs.Trigger>
          <Tabs.Trigger color={"green.800"} value="membership">
            Membership
          </Tabs.Trigger>
          <Tabs.Trigger color={"green.800"} value="about">
            About
          </Tabs.Trigger>
        </Flex>
      </Tabs.List>
      <Tabs.Content value="home">
        <HomePage />
      </Tabs.Content>
      <Tabs.Content value="collection">
        <Collection />
      </Tabs.Content>
      <Tabs.Content value="membership">
        <MembershipPage />
      </Tabs.Content>
      <Tabs.Content pb={"100px"} value="about">
        <AboutPage creatorUsername={user?.creatorUsername || ""} />
      </Tabs.Content>
    </Tabs.Root>
  );
};

export default ProfilePageTabs;
