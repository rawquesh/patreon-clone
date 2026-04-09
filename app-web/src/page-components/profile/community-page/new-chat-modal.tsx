"use client";

import React from "react";
import { branding } from "@/config/branding";
import {
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogRoot,
} from "@/components/ui/dialog";
import {
  Center,
  IconButton,
  Input,
  Stack,
  Text,
  useDisclosure,
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
import { CheckboxCard } from "@/components/ui/checkbox-card";
import { CheckboxGroup } from "@chakra-ui/react";

const NewChatModal: React.FC = () => {
  const { open, onOpen, onClose } = useDisclosure();
  const [selected, setSelected] = React.useState<string>("all");

  return (
    <DialogRoot
      motionPreset={"slide-in-bottom"}
      placement={"center"}
      open={open}
    >
      <Button
        onClick={onOpen}
        w="full"
        mt={4}
        variant="outline"
        className="btn-gradient-ghost"
      >
        New chat
      </Button>
      <DialogContent>
        <DialogHeader
          alignItems={"center"}
          display={"flex"}
          justifyContent={"space-between"}
        >
          <Text
            fontSize={"xl"}
            fontWeight={600}
            flex={1}
            css={{ color: "hsl(222.2, 47.4%, 11.2%)" }}
          >
            New Chat
          </Text>
          <IconButton
            rounded="999px"
            variant={"ghost"}
            onClick={onClose}
            css={{
              color: "hsl(215.4, 16.3%, 46.9%)",
              "&:hover": {
                background: "hsl(0, 84.2%, 60.2% / 0.08)",
                color: "hsl(0, 84.2%, 60.2%)",
              },
            }}
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
                src={branding.assets.placeholderProfilePicture}
              />
            </Center>
            <Field label="Name">
              <Input placeholder="Chat name" />
            </Field>
            <RadioCardRoot
              value={selected}
              onChange={(e) =>
                setSelected((e.target as unknown as { value: string }).value)
              }
            >
              <RadioCardLabel
                css={{ color: "hsl(222.2, 47.4%, 11.2%)", fontWeight: 600 }}
              >
                Who can access this chat?
              </RadioCardLabel>
              <RadioCardItem
                label="All members"
                value="all"
                wrapperClassname="w-full"
              />
              <RadioCardItem
                label="Paid members only"
                value="paid"
                wrapperClassname="w-full"
              />
              <RadioCardItem
                label="Select tier"
                value="select"
                wrapperClassname="w-full"
              />
            </RadioCardRoot>
            {selected === "select" && (
              <Field
                label="Select which tier can access this chat"
                css={{ color: "hsl(222.2, 47.4%, 11.2%)" }}
              >
                <CheckboxGroup defaultValue={["free", "premium"]} w={"full"}>
                  <CheckboxCard
                    w={"full"}
                    label="Free"
                    description="Your free members | 100 members"
                    value="free"
                  />
                  <CheckboxCard
                    w={"full"}
                    label="test"
                    description="Your test members | 10 members"
                    value="test"
                  />
                  <CheckboxCard
                    w={"full"}
                    label="Premium"
                    description="Your premium members | 20 members"
                    value="premium"
                  />
                </CheckboxGroup>
              </Field>
            )}
          </Stack>
        </DialogBody>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button className="btn-gradient">Create</Button>
        </DialogFooter>
      </DialogContent>
    </DialogRoot>
  );
};

export default NewChatModal;
