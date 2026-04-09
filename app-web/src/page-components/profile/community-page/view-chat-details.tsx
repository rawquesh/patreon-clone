import React from "react";
import { branding } from "@/config/branding";
import {
  DrawerBackdrop,
  DrawerBody,
  DrawerCloseTrigger,
  DrawerContent,
  DrawerHeader,
  DrawerRoot,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Flex, Separator, Stack, Text } from "@chakra-ui/react";
import { Avatar } from "@/components/ui/avatar";

const ViewChatDetails: React.FC = () => {
  return (
    <DrawerRoot closeOnEscape closeOnInteractOutside placement={"end"}>
      <DrawerTrigger cursor={"pointer"}>
        <Text
          fontSize={"xs"}
          css={{ color: "hsl(215.4, 16.3%, 46.9%)" }}
        >
          View chat details
        </Text>
      </DrawerTrigger>
      <DrawerBackdrop />
      <DrawerContent>
        <DrawerHeader>
          <Text
            fontWeight={600}
            css={{ color: "hsl(222.2, 47.4%, 11.2%)" }}
          >
            Chat details
          </Text>
          <DrawerCloseTrigger />
        </DrawerHeader>
        <Separator />
        <DrawerBody>
          <Text
            fontWeight={500}
            css={{ color: "hsl(222.2, 47.4%, 11.2%)" }}
          >
            Members
          </Text>
          <Stack gap={4} my={4}>
            <Flex gap={4} alignItems={"center"}>
              <Avatar
                src={branding.assets.placeholderProfilePicture}
                size={"2xl"}
              />
              <Text css={{ color: "hsl(222.2, 47.4%, 11.2%)", fontWeight: 500 }}>
                User 1
              </Text>
            </Flex>
            <Flex gap={4} alignItems={"center"}>
              <Avatar
                src={
                  "https://images.unsplash.com/photo-1593642532932-8e1c7d7d9e6c?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
                }
                size={"2xl"}
              />
              <Text css={{ color: "hsl(222.2, 47.4%, 11.2%)", fontWeight: 500 }}>
                User 2
              </Text>
            </Flex>
          </Stack>
        </DrawerBody>
      </DrawerContent>
    </DrawerRoot>
  );
};

export default ViewChatDetails;
