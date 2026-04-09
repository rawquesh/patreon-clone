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
        display="flex"
        h="52px"
        alignItems="center"
        justifyContent="start"
        w="100%"
        _hover={{ bg: "primary.50" }}
        px="20px"
        transition="all 0.15s ease"
      >
        <Avatar
          shape="rounded"
          src={
            user?.profilePicture ||
            `https://${branding.assets.assetBucketBase}/profile-pictures/placeholder-male.jpg`
          }
          h="40px"
          w="40px"
        />
        <Box textAlign="left" ml="12px" gap={0}>
          <Text fontWeight={500} fontSize="sm">
            {user?.firstName || "User"}
          </Text>
          <Text lineHeight={1} color="star.500" fontSize="xs" textTransform="capitalize">
            {currentMode} mode
          </Text>
        </Box>
      </DrawerTrigger>
      <DrawerContent
        px={0}
        borderTopRadius="16px"
        py="20px"
        className="glass-card-static"
        css={{
          background: "linear-gradient(180deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.7) 100%)",
        }}
      >
        <Stack>
          <Flex
            justifyContent="space-between"
            alignItems="center"
            px="20px"
            py="8px"
            borderRadius="10px"
            _hover={{ bg: "primary.50" }}
            cursor="pointer"
            transition="all 0.15s ease"
            onClick={() => handleModeSwitch("creator")}
          >
            <AvatarButton
              avatarUrl={user?.profilePicture || ""}
              isCreator={Boolean(user?.isCreator)}
              mode="creator"
              username={user?.firstName || ""}
            />
            {currentMode === "creator" && (
              <Icon height="20px" icon={"iconamoon:check-bold"} css={{ color: "hsl(211, 71%, 43%)" }} />
            )}
          </Flex>
          <Flex
            justifyContent="space-between"
            alignItems="center"
            px="20px"
            py="8px"
            borderRadius="10px"
            _hover={{ bg: "primary.50" }}
            cursor="pointer"
            transition="all 0.15s ease"
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
            {currentMode === "user" && (
              <Icon height="20px" icon={"iconamoon:check-bold"} css={{ color: "hsl(211, 71%, 43%)" }} />
            )}
          </Flex>
          <Separator my={3} />
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
                <Text
                  _hover={{ bg: "primary.50" }}
                  py="8px"
                  px="20px"
                  fontSize="sm"
                  transition="all 0.15s ease"
                >
                  {title}
                </Text>
              </Link>
            )}
          </For>
          <Separator my={3} />
          <Box pb="10px">
            <Text
              _hover={{ bg: "red.50", color: "red.500" }}
              py="8px"
              px="20px"
              fontSize="sm"
              cursor="pointer"
              transition="all 0.15s ease"
            >
              Log out
            </Text>
          </Box>
        </Stack>
      </DrawerContent>
    </DrawerRoot>
  );
};

export default MobileBottomDrawer;
