import { Flex } from "@chakra-ui/react";
import React from "react";
import {
  MenuContent,
  MenuItem,
  MenuRoot,
  MenuTrigger,
} from "@/components/ui/menu";
import AvatarButton from "./avatar-button";
import { Icon } from "@iconify/react/dist/iconify.js";
import {
  PopoverBody,
  PopoverContent,
  PopoverRoot,
  PopoverTrigger,
} from "../ui/popover";
import { Button } from "../ui/button";
import Link from "next/link";
import { useAuth } from "@/context/auth.provider";
import { useRouter } from "next/navigation";
import { useUserMode } from "@/context/user-mode.provider";

export const getUserMode = (): "creator" | "user" => {
  if (typeof window !== "undefined") {
    const savedMode = localStorage.getItem("userMode");
    return savedMode === "creator" || savedMode === "user" ? savedMode : "user";
  }
  return "user";
};

interface Props {
  username?: string;
  mode: "creator" | "user";
  avatarUrl?: string;
  isCreator: boolean;
}

const UserAvatar: React.FC<Props> = (props) => {
  if (props.isCreator) {
    return <UserAvatarMenu {...props} />;
  } else {
    return (
      <PopoverRoot>
        <PopoverTrigger>
          <AvatarButton {...props} />
        </PopoverTrigger>
        <PopoverContent w={"fit"}>
          <PopoverBody>
            <Link href={"/onboarding/creator"}>
              <Button>Become a creator</Button>
            </Link>
          </PopoverBody>
        </PopoverContent>
      </PopoverRoot>
    );
  }
};

const UserAvatarMenu: React.FC<Props> = (props) => {
  const router = useRouter();
  const { user } = useAuth();

  const { mode, setMode } = useUserMode();
  const handleModeSwitch = (newMode: "creator" | "user") => {
    setMode(newMode);

    if (newMode === "creator") {
      router.push("/profile");
    } else {
      router.push("/explore");
    }
  };

  return (
    <>
      <MenuRoot positioning={{ placement: "top" }}>
        <MenuTrigger asChild>
          <AvatarButton {...props} />
        </MenuTrigger>
        <MenuContent w={"300px"}>
          <MenuItem asChild value="creator">
            <Flex
              css={{
                "& svg": {
                  color: mode === "creator" ? "green.500" : "transparent",
                },
              }}
              justifyContent={"space-between"}
              onClick={() => handleModeSwitch("creator")}
            >
              <AvatarButton
                username={user?.creatorUsername}
                avatarUrl={props.avatarUrl}
                isCreator
                mode="creator"
              />
              <Icon height={"32px"} icon={"iconamoon:check-bold"} />
            </Flex>
          </MenuItem>
          <MenuItem asChild value="user">
            <Flex
              css={{
                "& svg": {
                  color: mode === "user" ? "green.500" : "transparent",
                },
              }}
              justifyContent={"space-between"}
              onClick={() => handleModeSwitch("user")}
            >
              <AvatarButton
                username={user?.firstName || "User"}
                avatarUrl={props.avatarUrl}
                mode="user"
                isCreator={props.isCreator}
              />
              <Icon height={"32px"} icon={"iconamoon:check-bold"} />
            </Flex>
          </MenuItem>
        </MenuContent>
      </MenuRoot>
    </>
  );
};

export default UserAvatar;
