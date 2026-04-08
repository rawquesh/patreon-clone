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
            bg: "gray.100",
          }}
          w={"40px"}
          h={"40px"}
          borderRadius={"999px"}
          justifyContent={"center"}
          alignItems={"center"}
          cursor={"pointer"}
        >
          <Icon icon={"qlementine-icons:menu-dots-16"} />
        </Flex>
      </PopoverTrigger>
      <PopoverContent>
        <PopoverBody padding={0}>
          <Stack>
            {/* <Stack p={"20px"}>
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
            <Separator />
            <For
              each={[
                {
                  title: "News (coming soon)",
                  link: "#",
                },
                // {
                // 	title: "Creator Hub",
                // 	link: "#",
                // },
                // {
                //   title: "Help Center & FAQ",
                //   link: "#",
                // },
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
                      bg: "star.100",
                    }}
                    py={"8px"}
                    px={"20px"}
                  >
                    {title}
                  </Text>
                </Link>
              )}
            </For>
            <Separator />
            <Box pb={"10px"}>
              <Text
                _hover={{
                  bg: "star.100",
                }}
                py={"8px"}
                px={"20px"}
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
