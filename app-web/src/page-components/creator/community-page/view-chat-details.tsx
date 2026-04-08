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
          color="gray.600"
          cursor="pointer"
          _hover={{ textDecoration: "underline" }}
        >
          View chat details
        </Text>
      </DrawerTrigger>
      <DrawerBackdrop />
      <DrawerContent>
        <DrawerHeader>
          <Text fontSize="lg" fontWeight="bold">
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
                <Text fontWeight="bold">Description</Text>
                <Text fontSize="sm">{chat.description}</Text>
              </Stack>
            )}

            <Stack gap={2}>
              <Text fontWeight="bold">Created by</Text>
              <Flex gap={4} alignItems="center">
                <Avatar
                  src={chat.creator.profilePicture}
                  size="lg"
                  name={chat.creator.displayName}
                />
                <Stack gap={1}>
                  <Text>{chat.creator.displayName}</Text>
                  {/* <Badge colorScheme="blue" variant="solid">
                    Creator
                  </Badge> */}
                </Stack>
              </Flex>
            </Stack>

            <Stack gap={2}>
              <Text fontWeight="bold">
                Members ({chat.participants.length})
              </Text>
              {chat.participants.map((participant) => (
                <Flex
                  key={participant.id}
                  gap={4}
                  alignItems="center"
                  p={2}
                  borderRadius="md"
                  _hover={{ bg: "gray.50" }}
                >
                  <Avatar
                    src={participant.profilePicture}
                    size="md"
                    name={participant.displayName}
                  />
                  <Stack gap={1}>
                    <Text>{participant.displayName}</Text>
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
                <Text fontWeight="bold">Access Type</Text>
                <Text fontSize="sm" textTransform="capitalize">
                  {chat.accessType === "all" && "All members"}
                  {chat.accessType === "paid" && "Paid members only"}
                  {chat.accessType === "select" && "Selected tiers only"}
                </Text>

                {chat.accessType === "select" &&
                  chat.accessTiers &&
                  chat.accessTiers.length > 0 && (
                    <Stack gap={1}>
                      <Text fontSize="sm" fontWeight="medium">
                        Available to:
                      </Text>
                      <Flex gap={2} flexWrap="wrap">
                        {chat.accessTiers.map((tier) => (
                          <Badge key={tier} colorScheme="green" variant="solid">
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
                  colorScheme="red"
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
                  colorScheme="red"
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
