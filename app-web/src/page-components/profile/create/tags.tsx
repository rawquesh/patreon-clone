"use client";

import { Tag } from "@/components/ui/tag";
import { Flex, Input, Stack, Text } from "@chakra-ui/react";
import { Icon } from "@iconify/react/dist/iconify.js";
import React, { useEffect, useState } from "react";

interface Props {
  onTagsChange?: (tags: string[]) => void;
  initialTags?: string[];
}

const Tags: React.FC<Props> = ({
  onTagsChange = () => {},
  initialTags = [],
}) => {
  const [tags, setTags] = useState<string[]>(initialTags);
  const [value, setValue] = useState("");

  useEffect(() => {
    onTagsChange(tags);
  }, [tags, onTagsChange]);

  return (
    <Stack bg={"white"} maxW={"224px"} borderRadius={"12px"} p={"12px"}>
      <Flex gap={2}>
        <Icon icon={"mdi:tags"} />
        <Text fontSize={"sm"} fontWeight={600}>
          Tags
        </Text>
      </Flex>
      <Input
        border={"none"}
        outline={"none"}
        ring={"none"}
        boxShadow={"none"}
        variant={"flushed"}
        placeholder="Add tag"
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            if (value.length > 1) {
              setTags((p) => [...p, value]);
              setValue("");
            }
          }
          if (e.key === "Escape") {
            setValue("");
          }
        }}
      />
      <Flex gap={1} flexWrap={"wrap"}>
        {tags.map((t, i) => (
          <Tag
            maxW={"150px"}
            key={i}
            onClose={() => {
              setTags((p) => p.filter((_, index) => index !== i));
            }}
            closable
          >
            {t}
          </Tag>
        ))}
      </Flex>
    </Stack>
  );
};

export default Tags;
