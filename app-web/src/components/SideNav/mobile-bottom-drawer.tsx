"use client";
import React from "react";
import {
  DrawerBackdrop,
  DrawerContent,
  DrawerRoot,
  DrawerTrigger,
} from "../ui/drawer";
import AvatarButton from "./avatar-button";
import { Box, Flex, For, Separator, Stack, Text } from "@chakra-ui/react";
import { Icon } from "@iconify/react/dist/iconify.js";
import Link from "next/link";
import { Avatar } from "../ui/avatar";
import { useAuth } from "@/context/auth.provider";
import { useRouter } from "next/navigation";
import { branding } from "@/config/branding";

interface Props {
  currentMode: "creator" | "user";
  onModeChange: (mode: "creator" | "user") => void;
}

const MobileBottomDrawer: React.FC<Props> = ({ currentMode, onModeChange }) => {
  const { user } = useAuth();
  const router = useRouter();

  const handleModeSwitch = (mode: "creator" | "user") => {
    onModeChange(mode);
    if (mode === "creator") {
      router.push("/profile");
    } else {
      router.push("/explore");
    }
  };

  return (
    <DrawerRoot placement={"bottom"}>
      <DrawerBackdrop />
      <DrawerTrigger
        display={"flex"}
        h={"52px"}
        alignItems={"center"}
        justifyContent={"start"}
        w={"100%"}
        _hover={{ bg: "star.100" }}
      >
        <Avatar
          shape={"rounded"}
          src={
            user?.profilePicture ||
            `https://${branding.assets.assetBucketBase}/profile-pictures/placeholder-male.jpg`
          }
          h={"40px"}
          w={"40px"}
        />
        <Box textAlign={"left"} ml={"12px"} gap={0}>
          <Text fontWeight={500} fontSize={"sm"}>
            {user?.firstName || "User"}
          </Text>
          <Text lineHeight={1} color={"star.500"} fontSize={"xs"}>
            {currentMode}
          </Text>
        </Box>
      </DrawerTrigger>
      <DrawerContent px={0} borderTopRadius={"8px"} py={"20px"}>
        <Stack>
          <Flex
            css={{
              "& svg": {
                color: currentMode === "creator" ? "green.500" : "transparent",
              },
            }}
            justifyContent={"space-between"}
            alignItems={"center"}
            onClick={() => handleModeSwitch("creator")}
          >
            <AvatarButton
              avatarUrl={user?.profilePicture || ""}
              isCreator={Boolean(user?.isCreator)}
              mode="creator"
              username={user?.firstName || ""}
            />
            <Icon height={"32px"} icon={"iconamoon:check-bold"} />
          </Flex>
          <Flex
            css={{
              "& svg": {
                color: currentMode === "user" ? "green.500" : "transparent",
              },
            }}
            justifyContent={"space-between"}
            onClick={() => handleModeSwitch("user")}
          >
            <AvatarButton
              isCreator={Boolean(user?.isCreator)}
              username={user?.firstName || "User"}
              avatarUrl={
                user?.profilePicture ||
                "https://cdn.myanimelist.net/r/84x124/images/characters/9/131317.webp?s=d4b03c7291407bde303bc0758047f6bd"
              }
              mode="user"
            />
            <Icon height={"32px"} icon={"iconamoon:check-bold"} />
          </Flex>
          <Separator />
          {/* <Stack py={"10px"} px={"20px"}>
            <Text color={"star.600"}>Appearance</Text>
            <Tabs.Root fitted defaultValue={"light"} variant={"plain"}>
              <Tabs.List pos={"relative"} bg={"star.100"} rounded={"8px"}>
                <Tabs.Trigger value="light">Light</Tabs.Trigger>
                <Tabs.Trigger value="dark">Dark</Tabs.Trigger>
                <Tabs.Trigger value="system">System</Tabs.Trigger>
                <Tabs.Indicator bg={"star.200"} rounded={"8px"} />
              </Tabs.List>
            </Tabs.Root>
          </Stack> */}
          {/* <Separator /> */}
          <For
            each={[
              { title: "News", link: "#" },
              { title: "Creator Hub", link: "#" },
              { title: "Help Center & FAQ", link: "#" },
              { title: "Feature Requests", link: "#" },
              { title: "Terms Of User", link: "#" },
              { title: "Privacy Policy", link: "#" },
              { title: "Community Policies", link: "#" },
            ]}
          >
            {({ title, link }) => (
              <Link href={link} key={title}>
                <Text _hover={{ bg: "star.100" }} py={"8px"} px={"20px"}>
                  {title}
                </Text>
              </Link>
            )}
          </For>
          <Separator />
          <Box pb={"10px"}>
            <Text _hover={{ bg: "star.100" }} py={"8px"} px={"20px"}>
              Log out
            </Text>
          </Box>
        </Stack>
      </DrawerContent>
    </DrawerRoot>
  );
};

export default MobileBottomDrawer;
