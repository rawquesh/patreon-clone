"use client";

import ButtonWithIcon from "@/components/ui/button-with-icon";
import {
  // PopoverBody,
  PopoverContent,
  // PopoverHeader,
  PopoverRoot,
} from "@/components/ui/popover";
import { RadioCardItem, RadioCardRoot } from "@/components/ui/radio-card";
import {
  Flex,
  Heading,
  IconButton,
  Input,
  PopoverTrigger,
  Stack,
} from "@chakra-ui/react";
import { Icon } from "@iconify/react/dist/iconify.js";
import React, { useState, useEffect } from "react";
import {
  MenuContent,
  MenuItem,
  MenuItemGroup,
  MenuRoot,
  MenuTrigger,
} from "@/components/ui/menu";
import { InputGroup } from "@/components/ui/input-group";
import { useCreator } from "@/lib/backend-services/creator-service";

const icons: Record<string, string> = {
  image: "bxs:image",
  text: "mingcute:text-fill",
  video: "fluent:video-clip-48-filled",
  audio: "simple-line-icons:earphones",
};

interface FilterOptions {
  type?: string;
  tier?: string;
  datePublished?: string;
  search?: string;
}

interface CreatorPostsFilterProps {
  onFilterChange?: (options: FilterOptions) => void;
}

const CreatorPostsFilter: React.FC<CreatorPostsFilterProps> = ({
  onFilterChange,
}) => {
  const [postType, setPostType] = useState<string | undefined>(undefined);
  const [tier, setTier] = useState<string | undefined>(undefined);
  const [datePublished, setDatePublished] = useState<string | undefined>(
    undefined
  );
  const [search, setSearch] = useState<string>("");
  const { data: creator } = useCreator();

  // Handle post type change
  const handlePostTypeChange = (value: string) => {
    // If "all" is selected, set to undefined
    setPostType(value === "all" ? undefined : value);
  };

  useEffect(() => {
    const filterOptions = {
      type: postType,
      tier,
      datePublished,
      search: search && search.trim().length > 0 ? search : undefined,
    };

    if (onFilterChange) {
      onFilterChange(filterOptions);
    }
  }, [postType, tier, datePublished, search, onFilterChange]);

  return (
    <Stack my={6} w={"100%"} maxW={"680px"} mx={"auto"}>
      <Heading textAlign={"center"} fontSize={"2xl"} fontWeight={600}>
        Recent posts by {creator?.displayName || "this creator"}
      </Heading>
      <Flex
        alignItems={"center"}
        direction={{ base: "column", lg: "row" }}
        mt={4}
        gap={3}
      >
        <InputGroup>
          <Input
            placeholder="Search posts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </InputGroup>

        <PopoverRoot>
          <PopoverTrigger>
            <ButtonWithIcon
              icon={postType ? icons[postType] : "ph:funnel-simple"}
              variant="outline"
              as={"div"}
            >
              {postType ? `Type: ${postType}` : "Post Type"}
            </ButtonWithIcon>
          </PopoverTrigger>
          <PopoverContent py={"16px"} px={"12px"} bg={"star.50"}>
            <RadioCardRoot
              value={postType || "all"}
              onChange={(e) => {
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                //@ts-ignore
                const value = e.target.value;
                handlePostTypeChange(value);
              }}
              css={{
                "& .wrapper": {
                  // color: "red",
                  display: "flex",
                  flexDirection: "row",
                  gap: "8px",
                },
              }}
            >
              <RadioCardItem
                wrapperClassname="wrapper"
                value="image"
                label="Images"
                icon={<Icon icon={"bxs:image"} />}
              />
              <RadioCardItem
                wrapperClassname="wrapper"
                value="text"
                label="Text"
                icon={<Icon icon={"mingcute:text-fill"} />}
              />
              <RadioCardItem
                wrapperClassname="wrapper"
                value="video"
                label="Videos"
                icon={<Icon icon={"fluent:video-clip-48-filled"} />}
              />
              <RadioCardItem
                wrapperClassname="wrapper"
                value="audio"
                label="Audio"
                icon={<Icon icon={"simple-line-icons:earphones"} />}
              />
              <RadioCardItem
                wrapperClassname="wrapper"
                value="all"
                label="All Types"
                icon={<Icon icon={"ph:funnel-simple"} />}
              />
            </RadioCardRoot>
          </PopoverContent>
        </PopoverRoot>

        <MenuRoot>
          <MenuTrigger>
            <ButtonWithIcon
              as="div"
              variant="outline"
              icon={"carbon:categories"}
            >
              {tier ? `Tier: ${tier}` : "Tier"}
            </ButtonWithIcon>
          </MenuTrigger>
          <MenuContent>
            <MenuItemGroup title="Post Tier">
              <MenuItem value="free" onClick={() => setTier("free")}>
                Free
              </MenuItem>
              <MenuItem value="paid" onClick={() => setTier("paid")}>
                Paid
              </MenuItem>
              <MenuItem value="all" onClick={() => setTier(undefined)}>
                All
              </MenuItem>
            </MenuItemGroup>
          </MenuContent>
        </MenuRoot>

        <MenuRoot>
          <MenuTrigger>
            <ButtonWithIcon as={"div"} variant="outline" icon={"uil:calender"}>
              {datePublished ? `Published: ${datePublished}` : "Date Published"}
            </ButtonWithIcon>
          </MenuTrigger>
          <MenuContent>
            <MenuItemGroup title="Date Published">
              <MenuItem value="year" onClick={() => setDatePublished("year")}>
                This Year
              </MenuItem>
              <MenuItem value="month" onClick={() => setDatePublished("month")}>
                This Month
              </MenuItem>
              <MenuItem value="week" onClick={() => setDatePublished("week")}>
                This Week
              </MenuItem>
              <MenuItem value="all" onClick={() => setDatePublished(undefined)}>
                All Time
              </MenuItem>
            </MenuItemGroup>
          </MenuContent>
        </MenuRoot>

        {(postType || tier || datePublished || search) && (
          <IconButton
            variant={"outline"}
            aria-label="Clear filters"
            onClick={() => {
              setPostType(undefined);
              setTier(undefined);
              setDatePublished(undefined);
              setSearch("");
            }}
          >
            <Icon icon={"carbon:close"} />
          </IconButton>
        )}
      </Flex>
    </Stack>
  );
};

export default CreatorPostsFilter;
