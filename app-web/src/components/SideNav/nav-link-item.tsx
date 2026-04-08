"use client";
import React from "react";
import { NavItem } from "./types";
import { Flex, Text } from "@chakra-ui/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import NotificationsBadge from "@/components/notifications-badge";

const NavLinkItem: React.FC<NavItem> = ({ link, title, iconComponent }) => {
  const pathname = usePathname();
  let isActive = false;

  if (link === "/profile/community" || link === "/user/messages") {
    isActive = pathname.includes("community") || pathname.includes("messages");
  } else if (link === "/profile/library") {
    isActive = pathname.includes("library");
  } else {
    isActive = pathname === link;
  }

  const showBadge = title === "Notifications";

  return (
    <Link href={link}>
      <Flex
        color={{
          base: isActive ? "black" : "star.400",
        }}
        bg={{
          base: isActive ? "star.100" : "white",
        }}
        css={{
          "& p": {
            base: {
              color: isActive ? "black" : "star.500",
            },
          },
        }}
        _hover={{
          base: {
            bg: "star.100",
            color: "black",
            "& p": {
              color: "black",
            },
          },
          _dark: {
            bg: "star.700",
          },
        }}
        borderRadius={"8px"}
        px={"15px"}
        py={"10px"}
        gap={"12px"}
        alignItems={"center"}
      >
        {showBadge ? (
          <NotificationsBadge>{iconComponent}</NotificationsBadge>
        ) : (
          iconComponent
        )}
        <Text transform={"translateY(2px)"} fontSize={"sm"} fontWeight={500}>
          {title}
        </Text>
      </Flex>
    </Link>
  );
};

export default NavLinkItem;
