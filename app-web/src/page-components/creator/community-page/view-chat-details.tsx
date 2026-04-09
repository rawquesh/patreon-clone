"use client";

import React from "react";
import {
  DrawerBackdrop,
  DrawerBody,
  DrawerCloseTrigger,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerRoot,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Badge, Button, Separator, Flex, Stack, Text } from "@chakra-ui/react";
import { Avatar } from "@/components/ui/avatar";
import { Chat } from "@/lib/backend-services/chat-service";
import { useAuth } from "@/context/auth.provider";
import { toaster } from "@/components/ui/toaster";

interface ViewChatDetailsProps {
  chat: Chat;
}

const ViewChatDetails: React.FC<ViewChatDetailsProps> = ({ chat }) => {
  const { user } = useAuth();
  const isCreator = user?._id === chat.creator.id;

  return (
    <DrawerRoot>
      <DrawerTrigger asChild>
        <Text
          fontSize="xs"
          css={{ color: "hsl(215.4, 16.3%, 46.9%)" }}
          cursor="pointer"
          _hover={{ textDecoration: "underline" }}
        >
          View chat details
        </Text>
      </DrawerTrigger>
      <DrawerBackdrop />
      <DrawerContent>
        <DrawerHeader>
          <Text fontSize="lg" fontWeight="bold" css={{ color: "hsl(222.2, 47.4%, 11.2%)" }}>
            {chat.title}
          </Text>
          <DrawerCloseTrigger asChild>
            <Button variant="ghost" size="sm">
              Close
            </Button>
          </DrawerCloseTrigger>
        </DrawerHeader>
        <Separator />
        <DrawerBody>
          <Stack gap={6}>
            {chat.description && (
              <Stack gap={2}>
                <Text fontWeight="bold" css={{ color: "hsl(222.2, 47.4%, 11.2%)" }}>Description</Text>
                <Text fontSize="sm" css={{ color: "hsl(215.4, 16.3%, 46.9%)" }}>{chat.description}</Text>
              </Stack>
            )}

            <Stack gap={2}>
              <Text fontWeight="bold" css={{ color: "hsl(222.2, 47.4%, 11.2%)" }}>Created by</Text>
              <Flex gap={4} alignItems="center">
                <Avatar
                  src={chat.creator.profilePicture}
                  size="lg"
                  name={chat.creator.displayName}
                />
                <Stack gap={1}>
                  <Text css={{ color: "hsl(222.2, 47.4%, 11.2%)" }}>{chat.creator.displayName}</Text>
                  {/* <Badge colorScheme="blue" variant="solid">
                    Creator
                  </Badge> */}
                </Stack>
              </Flex>
            </Stack>

            <Stack gap={2}>
              <Text fontWeight="bold" css={{ color: "hsl(222.2, 47.4%, 11.2%)" }}>
                Members ({chat.participants.length})
              </Text>
              {chat.participants.map((participant) => (
                <Flex
                  key={participant.id}
                  gap={4}
                  alignItems="center"
                  p={2}
                  borderRadius="md"
                  _hover={{ bg: "rgba(255,255,255,0.6)" }}
                  transition="all 0.15s ease"
                >
                  <Avatar
                    src={participant.profilePicture}
                    size="md"
                    name={participant.displayName}
                  />
                  <Stack gap={1}>
                    <Text css={{ color: "hsl(222.2, 47.4%, 11.2%)" }}>{participant.displayName}</Text>
                    {/* {participant.isCreator && (
                      <Badge colorScheme="blue" variant="solid">
                        Creator
                      </Badge>
                    )} */}
                  </Stack>
                </Flex>
              ))}
            </Stack>

            {chat.type === "group" && (
              <Stack gap={2}>
                <Text fontWeight="bold" css={{ color: "hsl(222.2, 47.4%, 11.2%)" }}>Access Type</Text>
                <Text fontSize="sm" textTransform="capitalize" css={{ color: "hsl(215.4, 16.3%, 46.9%)" }}>
                  {chat.accessType === "all" && "All members"}
                  {chat.accessType === "paid" && "Paid members only"}
                  {chat.accessType === "select" && "Selected tiers only"}
                </Text>

                {chat.accessType === "select" &&
                  chat.accessTiers &&
                  chat.accessTiers.length > 0 && (
                    <Stack gap={1}>
                      <Text fontSize="sm" fontWeight="medium" css={{ color: "hsl(222.2, 47.4%, 11.2%)" }}>
                        Available to:
                      </Text>
                      <Flex gap={2} flexWrap="wrap">
                        {chat.accessTiers.map((tier) => (
                          <Badge key={tier} css={{
                            background: "var(--gradient-primary)",
                            color: "white",
                            borderRadius: "9999px",
                            px: 2,
                            py: 0.5,
                            fontSize: "xs",
                          }}>
                            {tier}
                          </Badge>
                        ))}
                      </Flex>
                    </Stack>
                  )}
              </Stack>
            )}
          </Stack>
        </DrawerBody>
        <Separator />
        <DrawerFooter>
          {chat.type === "group" && (
            <Stack width="100%" gap={3}>
              {isCreator ? (
                <Button
                  css={{
                    background: "hsl(0, 84.2%, 60.2%)",
                    color: "white",
                    "&:hover": {
                      background: "hsl(0, 78%, 52%)",
                    },
                  }}
                  onClick={() => {
                    toaster.create({
                      title: "Not available",
                      description: "This feature is not available yet",
                      type: "info",
                      duration: 3000,
                    });
                  }}
                >
                  Delete Chat
                </Button>
              ) : (
                <Button
                  css={{
                    background: "hsl(0, 84.2%, 60.2%)",
                    color: "white",
                    "&:hover": {
                      background: "hsl(0, 78%, 52%)",
                    },
                  }}
                  onClick={() => {
                    toaster.create({
                      title: "Not available",
                      description: "This feature is not available yet",
                      type: "info",
                      duration: 3000,
                    });
                  }}
                >
                  Leave Chat
                </Button>
              )}
            </Stack>
          )}
        </DrawerFooter>
      </DrawerContent>
    </DrawerRoot>
  );
};

export default ViewChatDetails;
