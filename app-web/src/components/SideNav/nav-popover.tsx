import React from "react";
import {
  PopoverBody,
  PopoverContent,
  PopoverRoot,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Box, Flex, For, Separator, Stack, Text } from "@chakra-ui/react";
import { Icon } from "@iconify/react/dist/iconify.js";
import Link from "next/link";
import { useAuth } from "@/context/auth.provider";

interface Props {}

const NavPopover: React.FC<Props> = () => {
  const { logout } = useAuth();

  return (
    <PopoverRoot positioning={{ placement: "top" }}>
      <PopoverTrigger>
        <Flex
          _hover={{
            bg: "primary.50",
          }}
          w="40px"
          h="40px"
          borderRadius="10px"
          justifyContent="center"
          alignItems="center"
          cursor="pointer"
          transition="all 0.15s ease"
          css={{
            "&:hover": {
              background: "rgba(29, 112, 191, 0.06)",
            },
          }}
        >
          <Icon icon={"qlementine-icons:menu-dots-16"} />
        </Flex>
      </PopoverTrigger>
      <PopoverContent
        className="glass-menu"
        borderRadius="12px"
        overflow="hidden"
        w="260px"
      >
        <PopoverBody padding={0}>
          <Stack>
            <For
              each={[
                {
                  title: "News (coming soon)",
                  link: "#",
                },
                {
                  title: "Feature Requests",
                  link: "https://docs.google.com/forms/d/e/1FAIpQLSfMySU7JoNG-stwmFVSBIcockr0-7nw1P1vlymSJe8hfsF6Ag/viewform",
                },
                {
                  title: "Terms Of Service",
                  link: "tos",
                },
                {
                  title: "Privacy Policy",
                  link: "/privacy-policy",
                },
                {
                  title: "Community Policies",
                  link: "/community-guidelines",
                },
              ]}
            >
              {({ title, link }) => (
                <Link href={link} key={title}>
                  <Text
                    _hover={{
                      bg: "primary.50",
                    }}
                    py="8px"
                    px="16px"
                    fontSize="sm"
                    transition="all 0.15s ease"
                  >
                    {title}
                  </Text>
                </Link>
              )}
            </For>
            <Separator />
            <Box pb="10px">
              <Text
                _hover={{
                  bg: "red.50",
                  color: "red.500",
                }}
                py="8px"
                px="16px"
                fontSize="sm"
                cursor="pointer"
                transition="all 0.15s ease"
                onClick={() => {
                  logout();
                }}
              >
                Log out
              </Text>
            </Box>
          </Stack>
        </PopoverBody>
      </PopoverContent>
    </PopoverRoot>
  );
};

export default NavPopover;
