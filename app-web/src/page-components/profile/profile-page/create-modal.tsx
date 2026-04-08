"use client";
import ButtonWithIcon from "@/components/ui/button-with-icon";
import {
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogRoot,
} from "@/components/ui/dialog";
import {
  Box,
  Grid,
  IconButton,
  Separator,
  Stack,
  Text,
  useDisclosure,
} from "@chakra-ui/react";
import { Icon } from "@iconify/react/dist/iconify.js";
import Link from "next/link";
import React from "react";

const createTypes: {
  icon: string;
  text: string;
  link?: string;
}[] = [
  {
    icon: "ion:text-outline",
    text: "Text",
    link: "/profile/create/text",
  },
  {
    icon: "mynaui:video-solid",
    text: "Video",
    link: "/profile/create/video",
  },
  {
    icon: "ant-design:audio-filled",
    text: "Audio",
    link: "/profile/create/audio",
  },
  {
    icon: "fe:picture",
    text: "Image",
    link: "/profile/create/image",
  },
  {
    icon: "solar:link-outline",
    text: "Link",
    link: "/profile/create/link",
  },
  // {
  // 	icon: "fluent:poll-horizontal-20-filled",
  // 	text: "Poll",
  // },
  // {
  // 	icon: "solar:play-stream-bold",
  // 	text: "Livestream",
  // },
];

const CreateModal: React.FC<{ outline?: boolean }> = ({ outline }) => {
  const { open, onOpen, onClose } = useDisclosure();

  return (
    <DialogRoot
      motionPreset={"slide-in-bottom"}
      placement={"center"}
      open={open}
    >
      <ButtonWithIcon
        variant={outline ? "outline" : "solid"}
        onClick={onOpen}
        color={outline ? "star.700" : "star.100"}
        icon="ion:create"
      >
        Create
      </ButtonWithIcon>
      <DialogContent>
        <DialogHeader
          alignItems={"center"}
          display={"flex"}
          justifyContent={"space-between"}
        >
          <Text fontSize={"xl"} fontWeight={600} flex={1} textAlign={"center"}>
            Select a type
          </Text>
          <IconButton rounded="999px" variant={"ghost"} onClick={onClose}>
            <Icon icon={"ic:round-close"} />
          </IconButton>
        </DialogHeader>
        <DialogBody>
          <Grid templateColumns={"repeat(3, 1fr)"}>
            {createTypes.map((type) => {
              return (
                <Link onClick={onClose} href={type.link || "#"} key={type.text}>
                  {/* {index === 6 && <Box></Box>} */}
                  <Stack
                    cursor={"pointer"}
                    color="star.800"
                    _hover={{
                      bg: "star.100",
                      color: "star.600",
                    }}
                    rounded={"8px"}
                    gap={"8px"}
                    alignItems={"center"}
                    p={"16px"}
                  >
                    <Icon width={"24px"} icon={type.icon} />
                    <Text>{type.text}</Text>
                  </Stack>
                </Link>
              );
            })}
            <Box></Box>
          </Grid>
        </DialogBody>
        <Separator />
        <DialogFooter justifyContent={"center"}>
          <ButtonWithIcon icon="material-symbols:draft-rounded">
            View drafts
          </ButtonWithIcon>
        </DialogFooter>
      </DialogContent>
    </DialogRoot>
  );
};

export default CreateModal;
