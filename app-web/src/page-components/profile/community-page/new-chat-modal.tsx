"use client";

import React from "react";
import {
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogRoot,
} from "@/components/ui/dialog";
import {
  Center,
  CheckboxGroup,
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

const NewChatModal: React.FC = () => {
  const { open, onOpen, onClose } = useDisclosure();
  const [selected, setSelected] = React.useState<string>("all");
  console.log({ selected });

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
          <IconButton rounded="999px" variant={"ghost"} onClick={onClose}>
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
                src="https://patreon-clone-test-dps.s3.eu-north-1.amazonaws.com/profile-pictures/placeholder-male.jpg"
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
                wrapperClassname="w-full"
              ></RadioCardItem>
              <RadioCardItem
                border={"none"}
                label="Paid members only"
                value="paid"
                wrapperClassname="w-full"
              ></RadioCardItem>
              <RadioCardItem
                border={"none"}
                label="Select tier"
                value="select"
                wrapperClassname="w-full"
              ></RadioCardItem>
            </RadioCardRoot>
            {selected === "select" && (
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
                <CheckboxGroup defaultValue={["free", "premium"]} w={"full"}>
                  <CheckboxCard
                    border={"none"}
                    w={"full"}
                    label="Free"
                    description="Your free members | 100 members"
                    value="free"
                  />
                  <CheckboxCard
                    border={"none"}
                    w={"full"}
                    label="test"
                    description="Your test members | 10 members"
                    value="test"
                  />
                  <CheckboxCard
                    border={"none"}
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
          <Button variant="outline">Cancel</Button>
          <Button>Create</Button>
        </DialogFooter>
      </DialogContent>
    </DialogRoot>
  );
};

export default NewChatModal;
