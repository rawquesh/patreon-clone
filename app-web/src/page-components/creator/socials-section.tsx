"use client";
import { branding } from "@/config/branding";
import { Editable, EditableRoot, Flex, Stack, Text } from "@chakra-ui/react";
import { Icon } from "@iconify/react/dist/iconify.js";
import React, { useState } from "react";

const SocialsSection: React.FC = () => {
  const [username, setUsername] = useState<string | undefined>("Username");
  const [headline, setHeadline] = useState<string | undefined>(undefined);

  return (
    <Stack
      textAlign={"center"}
      pt={6}
      alignItems={"center"}
      justifyContent={"center"}
      gap={0}
    >
      <EditableRoot
        value={username}
        onChange={(e) =>
          setUsername((e as unknown as { value: string | undefined }).value)
        }
        w={"180px"}
      >
        <Editable.Preview
          minW={"100%"}
          textAlign={"center"}
          display={"block"}
          fontWeight={600}
          fontSize={"xl"}
        ></Editable.Preview>
        <Editable.Input />
      </EditableRoot>
      <EditableRoot
        value={headline}
        onChange={(e) =>
          setHeadline((e as unknown as { value: string | undefined }).value)
        }
        w={"180px"}
        fontSize={"sm"}
        color={"star.600"}
        placeholder={"Add headline"}
      >
        <Editable.Preview
          minW={"100%"}
          textAlign={"center"}
          display={"block"}
        ></Editable.Preview>
        <Editable.Input />
      </EditableRoot>
      <Flex color={"star.600"} gap={2}>
        <Icon icon={"solar:link-bold"} />
        <Text transform={"translateY(-2px)"} fontSize={"sm"}>
          {branding.urls.frontend}/username
        </Text>
      </Flex>
    </Stack>
  );
};

export default SocialsSection;
