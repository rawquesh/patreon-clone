/* eslint-disable @next/next/no-img-element */
"use client";
import React from "react";
import {
  Box,
  Flex,
  IconButton,
  Separator,
  Stack,
  Text,
  useDisclosure,
  Heading,
  VStack,
} from "@chakra-ui/react";
import {
  DrawerBackdrop,
  DrawerContent,
  DrawerRoot,
} from "@/components/ui/drawer";
import { Icon } from "@iconify/react/dist/iconify.js";
import { navItems } from "./data";
import NavLinkItem from "./nav-link-item";
import { Button } from "@/components/ui/button";
import MobileBottomDrawer from "./mobile-bottom-drawer";
import { useUserMode } from "@/context/user-mode.provider";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth.provider";

interface Props {
  mode: "creator" | "user";
}

const MobileDrawer: React.FC<Props> = ({ mode }) => {
  const { open, onClose, onOpen } = useDisclosure();
  const { setMode } = useUserMode();
  const router = useRouter();
  const { logout } = useAuth();

  const handleCreateClick = () => {
    router.push("/profile/create/text");
    onClose();
  };

  return (
    <DrawerRoot
      closeOnInteractOutside={false}
      closeOnEscape={false}
      placement={"start"}
      size={"full"}
      open={open}
    >
      <DrawerBackdrop
        css={{
          background: "rgba(0, 0, 0, 0.4)",
          backdropFilter: "blur(4px)",
        }}
      />
      <IconButton
        onClick={onOpen}
        variant="ghost"
        aria-label="Open menu"
        size="sm"
      >
        <Icon icon={"mage:dash-menu"} />
      </IconButton>
      <DrawerContent
        className="glass-card-static"
        borderRightRadius="0"
        p={0}
        css={{
          background: "linear-gradient(180deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.7) 100%)",
        }}
      >
        <Flex
          justifyContent="space-between"
          mx="20px"
          mt="20px"
          alignItems="center"
        >
          <Flex alignItems="center" gap={2}>
            <img
              src="/icons/logo.png"
              alt="logo"
              style={{ width: "32px", height: "32px", borderRadius: "8px" }}
            />
            <Text
              fontWeight={700}
              fontSize="lg"
              css={{
                background: "linear-gradient(135deg, hsl(211, 71%, 43%), hsl(335, 27%, 64%))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Patreon Clone
            </Text>
          </Flex>
          <IconButton onClick={onClose} variant="ghost" aria-label="Close menu">
            <Icon icon={"mingcute:close-fill"} />
          </IconButton>
        </Flex>
        <Stack p="20px" gap={2}>
          {navItems[mode].map((item) => (
            <NavLinkItem key={item.link} {...item} />
          ))}
          {mode === "creator" ? (
            <Button
              display="flex"
              justifyContent="center"
              alignItems="center"
              variant="outline"
              className="btn-gradient-ghost"
              css={{
                borderRadius: "10px",
                height: "40px",
                fontSize: "0.875rem",
                fontWeight: 600,
              }}
              onClick={handleCreateClick}
            >
              <Icon icon={"ion:create"} />
              <Text transform="translateY(1px)" ml={2}>
                Create
              </Text>
            </Button>
          ) : null}
        </Stack>
        <Box mt="auto">
          <Separator />
          <MobileBottomDrawer currentMode={mode} onModeChange={setMode} />
        </Box>
      </DrawerContent>
    </DrawerRoot>
  );
};

export default MobileDrawer;
