"use client";

import React, { useEffect, useState } from "react";
import {
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogRoot,
} from "@/components/ui/dialog";
import {
  Box,
  Center,
  IconButton,
  Input,
  Spinner,
  Stack,
  Text,
  useDisclosure,
  Flex,
} from "@chakra-ui/react";
import { Button } from "@/components/ui/button";
import { Icon } from "@iconify/react/dist/iconify.js";
import { Avatar } from "@/components/ui/avatar";
import { Field } from "@/components/ui/field";
import {
  RadioCardItem,
  RadioCardLabel,
  RadioCardRoot,
} from "@/components/ui/radio-card";
import { useChat } from "@/context/chat.provider";
import { useAuth } from "@/context/auth.provider";
import { toaster } from "@/components/ui/toaster";
import api from "@/lib/api";
interface MembershipTier {
  id: string;
  _id: string;
  name: string;
  subscriberCount?: number;
}

const NewChatModal: React.FC = () => {
  const { open, onOpen, onClose } = useDisclosure();
  const [accessType, setAccessType] = useState<string>("all");
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [selectedTier, setSelectedTier] = useState<string[]>([]);
  const [membershipTiers, setMembershipTiers] = useState<MembershipTier[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [creating, setCreating] = useState<boolean>(false);

  const { createGroupChat, loadChats } = useChat();
  const { user } = useAuth();

  useEffect(() => {
    if (open) {
      setLoading(true);
      api
        .get("/memberships/creator")
        .then((response) => {
          setMembershipTiers(response.data.memberships || []);
        })
        .catch((error) => {
          console.error("Failed to load membership tiers:", error);
          toaster.create({
            title: "Error",
            description: "Failed to load membership tiers",
            type: "error",
            duration: 3000,
          });
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [open]);

  const handleClose = () => {
    setTitle("");
    setDescription("");
    setAccessType("all");
    setSelectedTier([]);
    onClose();
  };

  const handleCreateChat = async () => {
    if (!title.trim()) {
      toaster.create({
        title: "Error",
        description: "Title is required",
        type: "error",
        duration: 3000,
      });
      return;
    }

    if (accessType === "select" && !selectedTier) {
      toaster.create({
        title: "Error",
        description: "You must select at least one tier",
        type: "error",
        duration: 3000,
      });
      return;
    }

    setCreating(true);

    try {
      const chatData = {
        title: title.trim(),
        description: description.trim() || undefined,
        accessType: accessType as "all" | "paid" | "select",
        accessTiers: accessType === "select" ? selectedTier : undefined,
      };

      await createGroupChat(chatData);

      toaster.create({
        title: "Success",
        description: "Chat created successfully",
        type: "success",
        duration: 3000,
      });

      await loadChats();
      handleClose();
    } catch (error) {
      console.error("Failed to create chat:", error);
      toaster.create({
        title: "Error",
        description: "Failed to create chat",
        type: "error",
        duration: 3000,
      });
    } finally {
      setCreating(false);
    }
  };

  return (
    <DialogRoot
      motionPreset={"slide-in-bottom"}
      placement={"center"}
      open={open}
    >
      <Button onClick={onOpen} w="full" mt={4} variant="outline">
        New chat
      </Button>
      <DialogContent>
        <DialogHeader
          alignItems={"center"}
          display={"flex"}
          justifyContent={"space-between"}
        >
          <Text fontSize={"xl"} fontWeight={600} flex={1}>
            New Chat
          </Text>
          <IconButton
            rounded="999px"
            variant={"ghost"}
            onClick={handleClose}
            aria-label="Close"
          >
            <Icon icon={"ic:round-close"} />
          </IconButton>
        </DialogHeader>
        <DialogBody>
          <Stack gap={6}>
            <Center>
              <Avatar
                width={"90px"}
                height={"90px"}
                shape={"rounded"}
                src={user?.profilePicture}
                name={user?.firstName || "Creator"}
              />
            </Center>
            <Field label="Chat name">
              <Input
                placeholder="Chat name"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </Field>
            <Field label="Description (optional)">
              <Input
                placeholder="Chat description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </Field>
            <RadioCardRoot
              value={accessType}
              onChange={(e) =>
                setAccessType((e.target as unknown as { value: string }).value)
              }
              css={{
                '& [data-state="checked"]': {
                  border: "none",
                },
                "& label": {
                  border: "none",
                  boxShadow: "none",
                },
              }}
            >
              <RadioCardLabel>Who can access this chat?</RadioCardLabel>
              <RadioCardItem
                border={"none"}
                label="All members"
                value="all"
                wrapperClassname=""
              ></RadioCardItem>
              <RadioCardItem
                border={"none"}
                label="Paid members only"
                value="paid"
                wrapperClassname=""
              ></RadioCardItem>
              <RadioCardItem
                border={"none"}
                label="Select tier"
                value="select"
                wrapperClassname=""
              ></RadioCardItem>
            </RadioCardRoot>
            {accessType === "select" && (
              <Field
                css={{
                  '& [data-state="checked"]': {
                    border: "none",
                  },
                  "& label": {
                    border: "none",
                  },
                }}
                label="Select which tier can access this chat"
              >
                {loading ? (
                  <Center py={4}>
                    <Spinner size="md" color="blue.500" />
                  </Center>
                ) : (
                  <Box
                    // onChange={(e) => {
                    //   console.log(e.target.value);
                    // }}
                    w={"full"}
                  >
                    {membershipTiers.map((tier) => {
                      const id = tier._id;
                      return (
                        <Box
                          onClick={() => {
                            setSelectedTier((prev) => {
                              if (prev.includes(id)) {
                                return prev.filter((t) => t !== id);
                              }
                              return [...prev, id];
                            });
                          }}
                          key={id}
                        >
                          <Flex
                            px={2}
                            py={4}
                            my={2}
                            rounded={"xl"}
                            justifyContent={"space-between"}
                            border={
                              selectedTier.includes(id)
                                ? "1px solid #000"
                                : "none"
                            }
                          >
                            <Stack>
                              <Text fontSize={"lg"}>{tier.name}</Text>
                              <Text fontSize={"sm"} color={"gray.500"}>
                                {Math.max(tier.subscriberCount || 0, 0)} members
                              </Text>
                            </Stack>
                            <Icon
                              width={"30px"}
                              icon={
                                selectedTier.includes(id)
                                  ? "carbon:checkbox-checked-filled"
                                  : "carbon:checkbox"
                              }
                            />
                          </Flex>
                        </Box>
                      );
                    })}
                  </Box>
                )}
              </Field>
            )}
          </Stack>
        </DialogBody>
        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            onClick={handleCreateChat}
            loading={creating}
            disabled={
              !title.trim() || (accessType === "select" && !selectedTier)
            }
          >
            Create Chat
          </Button>
        </DialogFooter>
      </DialogContent>
    </DialogRoot>
  );
};

export default NewChatModal;
