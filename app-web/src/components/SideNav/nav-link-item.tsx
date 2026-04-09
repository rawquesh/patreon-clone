"use client";
import React from "react";
import { Box, Flex, Text } from "@chakra-ui/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import NotificationsBadge from "@/components/notifications-badge";
import { NavItem } from "./types";

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
        position="relative"
        css={{
          "&::before": isActive
            ? {
                content: '""',
                position: "absolute",
                left: "-20px",
                top: "50%",
                transform: "translateY(-50%)",
                width: "3px",
                height: "60%",
                borderRadius: "0 3px 3px 0",
                background: "var(--gradient-primary)",
                boxShadow: "var(--glow-primary)",
              }
            : {},
        }}
        color={isActive ? "primary.500" : "star.500"}
        bg={isActive ? "primary.50" : "transparent"}
        borderRadius="10px"
        px="12px"
        py="10px"
        gap="12px"
        alignItems="center"
        _hover={{
          bg: isActive
            ? "primary.50"
            : "rgba(0,0,0,0.03)",
          color: isActive ? "primary.500" : "hsl(222.2, 47.4%, 11.2%)",
          transform: "translateX(2px)",
        }}
        transition="all 0.15s ease"
      >
        {showBadge ? (
          <NotificationsBadge>{iconComponent}</NotificationsBadge>
        ) : (
          <Box
            css={{
              flexShrink: 0,
            }}
          >
            {iconComponent}
          </Box>
        )}
        <Text
          transform="translateY(1px)"
          fontSize="sm"
          fontWeight={isActive ? 600 : 500}
        >
          {title}
        </Text>
        {/* Active dot indicator */}
        {isActive && (
          <Box
            position="absolute"
            right="12px"
            w="6px"
            h="6px"
            borderRadius="full"
            background="var(--gradient-primary)"
            css={{
              boxShadow: "0 0 8px hsl(211, 71%, 43% / 0.5)",
            }}
          />
        )}
      </Flex>
    </Link>
  );
};

export default NavLinkItem;
