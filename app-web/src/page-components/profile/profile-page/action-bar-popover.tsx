"use client";
import {
  PopoverContent,
  PopoverRoot,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Flex, IconButton, Separator, Text } from "@chakra-ui/react";
import { Icon } from "@iconify/react/dist/iconify.js";
import React from "react";
import { useRouter } from "next/navigation";
import { useUserMode } from "@/context/user-mode.provider";
import { useAuth } from "@/context/auth.provider";

// Define constants for routes
const LIBRARY_ROUTE = "/profile/library";
const EDIT_TIERS_ROUTE = "/profile?tab=membership";
const CREATOR_PROFILE_ROUTE = "/profile";
// const USER_EXPLORE_ROUTE = "/explore";

interface Props {}

const ActionBarPopover: React.FC<Props> = () => {
  const router = useRouter();
  const { mode, setMode } = useUserMode();
  const { user } = useAuth();

  const handleNavigation = (route: string) => {
    router.push(route);
    // Optionally close the popover here if needed, depends on PopoverRoot implementation
  };

  const handleModeSwitch = (newMode: "creator" | "user") => {
    if (mode === newMode) return; // Don't do anything if mode is already selected

    setMode(newMode);

    if (newMode === "creator") {
      router.push(CREATOR_PROFILE_ROUTE);
    } else {
      router.push(`/creator/${user!.creatorUsername}`);
    }
    // Optionally close the popover here
  };

  return (
    <PopoverRoot size={"xs"}>
      <PopoverTrigger>
        <IconButton
          bg={"star.200"}
          color={"star.700"}
          _hover={{
            bg: "star.100",
            color: "star.700",
          }}
          h={"40px"}
          w={"40px"}
          as={"div"}
          aria-label="Profile Actions Menu"
        >
          <Icon icon={"charm:menu-meatball"} />
        </IconButton>
      </PopoverTrigger>
      <PopoverContent w={"217px"} py={"12px"}>
        <PopoverItem
          text={"Go to library"}
          onClick={() => handleNavigation(LIBRARY_ROUTE)}
        />
        <PopoverItem
          text={"Edit tiers"}
          onClick={() => handleNavigation(EDIT_TIERS_ROUTE)}
        />
        <Separator my={"8px"} />
        <Text fontWeight={500} mb={"4px"} px={"12px"}>
          Viewing as:
        </Text>
        <PopoverItem
          text={"Creator"}
          active={mode === "creator"}
          onClick={() => handleModeSwitch("creator")}
        />
        <PopoverItem
          text={"User"}
          active={mode === "user"}
          onClick={() => {
            handleModeSwitch("user");
            // router.push();
          }}
        />
      </PopoverContent>
    </PopoverRoot>
  );
};

const PopoverItem: React.FC<{
  text: string;
  active?: boolean;
  onClick?: () => void;
}> = ({ text, active, onClick }) => {
  return (
    <Flex
      as="button"
      w="100%"
      textAlign="left"
      justifyContent={"space-between"}
      alignItems={"center"}
      px={"12px"}
      py={"8px"}
      cursor={"pointer"}
      _hover={{ bg: "star.100" }}
      onClick={onClick}
      bg={active ? "star.100" : "transparent"}
      border="none"
    >
      <Text>{text}</Text>
      {active && <Icon icon={"ic:baseline-check"} />}
    </Flex>
  );
};

export default ActionBarPopover;
