/* eslint-disable @typescript-eslint/ban-ts-comment */
"use client";

import {
  AspectRatio,
  Box,
  Image,
  Kbd,
  Table,
  Text,
  Flex,
  Spinner,
  Tag,
} from "@chakra-ui/react";
import {
  ActionBarContent,
  ActionBarRoot,
  ActionBarSelectionTrigger,
  ActionBarSeparator,
} from "@/components/ui/action-bar";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useState, useEffect } from "react";
import { Icon } from "@iconify/react/dist/iconify.js";
import { usePostsFilter } from "@/context/posts.provider";
import TableCellMenu from "./TableCellMenu";

const LibraryPageTable = ({ isCreatorView = false }) => {
  const [selection, setSelection] = useState<string[]>([]);
  const {
    posts,
    creatorPosts,
    isLoading,
    pagination,
    creatorPagination,
    nextPage,
    prevPage,
  } = usePostsFilter();

  const displayPosts = isCreatorView ? creatorPosts : posts;
  const displayPagination = isCreatorView ? creatorPagination : pagination;

  const hasSelection = selection.length > 0;
  const indeterminate = hasSelection && selection.length < displayPosts.length;

  useEffect(() => {
    setSelection([]);
  }, [displayPosts]);

  const getPostTypeIcon = (postType: string) => {
    switch (postType) {
      case "Text": return "ph:text-t-fill";
      case "Picture": return "mdi:image";
      case "Audio": return "mdi:music";
      case "Video": return "mynaui:video-solid";
      case "Link": return "mdi:link-variant";
      default: return "ic:baseline-document";
    }
  };

  const rows = displayPosts.map((item) => (
    <Table.Row
      key={item.id}
      data-selected={selection.includes(item.id) ? "" : undefined}
      bg={"white"}
      css={{
        "&:hover": {
          background: "hsl(210, 20%, 96%) !important",
        },
      }}
    >
      <Table.Cell w={"min"}>
        <Checkbox
          top="1"
          aria-label="Select row"
          checked={selection.includes(item.id)}
          onCheckedChange={(changes) => {
            setSelection((prev) =>
              changes.checked
                ? [...prev, item.id]
                : selection.filter((id) => id !== item.id)
            );
          }}
        />
      </Table.Cell>
      <Table.Cell>
        <Text fontWeight={600} fontSize="14px" css={{ color: "hsl(222.2, 47.4%, 11.2%)" }}>
          {item.title}
        </Text>
      </Table.Cell>
      <Table.Cell>
        <Text fontSize="12px" css={{ color: "hsl(215.4, 16.3%, 46.9%)" }}>
          {item.publishDate}
        </Text>
      </Table.Cell>
      <Table.Cell>
        <Flex flexWrap="wrap" gap={1}>
          {item.tierAccess.map((i) => (
            //@ts-ignore
            <Tag.Root ml={1} key={i.id}>
              {/* @ts-ignore */}
              <Tag.Label fontSize="11px">{i.name}</Tag.Label>
            </Tag.Root>
          ))}
        </Flex>
      </Table.Cell>
      <Table.Cell>
        <Box css={{ color: "hsl(215.4, 16.3%, 46.9%)" }}>
          <Icon width={"20px"} icon={getPostTypeIcon(item.postType)} />
        </Box>
      </Table.Cell>
      <Table.Cell>
        <AspectRatio ratio={3 / 4} w="48px">
          <Image alt="thumbnail" borderRadius={"8px"} src={item.thumbnail} />
        </AspectRatio>
      </Table.Cell>
      <Table.Cell>
        <TableCellMenu
          postId={item.id}
          postType={item.postType.toLowerCase()}
          // @ts-ignore
          status={item.status}
          collections={item.collections}
        />
      </Table.Cell>
    </Table.Row>
  ));

  if (isLoading) {
    return (
      <Flex justify="center" align="center" minH="200px">
        <Box
          w="48px"
          h="48px"
          borderRadius="full"
          border="3px solid hsl(210, 30%, 88%)"
          borderTopColor="hsl(211, 71%, 43%)"
          animation="spin 0.8s linear infinite"
          css={{
            "@keyframes spin": {
              "0%": { transform: "rotate(0deg)" },
              "100%": { transform: "rotate(360deg)" },
            },
          }}
        />
      </Flex>
    );
  }

  return (
    <Box>
      <Table.Root className="glass-card" overflow={"hidden"} borderRadius="16px">
        <Table.Header>
          <Table.Row bg={"transparent"}>
            <Table.ColumnHeader w="6">
              <Checkbox
                top="1"
                aria-label="Select all rows"
                checked={indeterminate ? "indeterminate" : selection.length > 0}
                onCheckedChange={(changes) => {
                  setSelection(
                    changes.checked ? displayPosts.map((item) => item.id) : []
                  );
                }}
              />
            </Table.ColumnHeader>
            <Table.ColumnHeader css={{ color: "hsl(215.4, 16.3%, 46.9%)", fontWeight: 600, fontSize: "12px" }}>Title</Table.ColumnHeader>
            <Table.ColumnHeader css={{ color: "hsl(215.4, 16.3%, 46.9%)", fontWeight: 600, fontSize: "12px" }}>Publish Date</Table.ColumnHeader>
            <Table.ColumnHeader css={{ color: "hsl(215.4, 16.3%, 46.9%)", fontWeight: 600, fontSize: "12px" }}>Tier Access</Table.ColumnHeader>
            <Table.ColumnHeader css={{ color: "hsl(215.4, 16.3%, 46.9%)", fontWeight: 600, fontSize: "12px" }}>Post Type</Table.ColumnHeader>
            <Table.ColumnHeader></Table.ColumnHeader>
            <Table.ColumnHeader></Table.ColumnHeader>
          </Table.Row>
        </Table.Header>
        <Table.Body>{rows}</Table.Body>
      </Table.Root>

      {displayPagination && (
        <Flex justify="space-between" align="center" mt={4}>
          <Text fontSize="14px" css={{ color: "hsl(215.4, 16.3%, 46.9%)" }}>
            Showing {displayPosts.length} of {displayPagination.total} posts
          </Text>
          <Flex gap={2}>
            <Button
              size="sm"
              onClick={prevPage}
              disabled={displayPagination.page <= 1}
              variant="outline"
            >
              Previous
            </Button>
            <Button
              size="sm"
              onClick={nextPage}
              disabled={displayPagination.page >= displayPagination.totalPages}
              className="btn-gradient"
            >
              Next
            </Button>
          </Flex>
        </Flex>
      )}

      <ActionBarRoot open={hasSelection}>
        <ActionBarContent
          className="glass-card"
          borderRadius="12px"
        >
          <ActionBarSelectionTrigger>
            {selection.length} selected
          </ActionBarSelectionTrigger>
          <ActionBarSeparator />
          <Button variant="outline" size="sm">
            Delete <Kbd>⌫</Kbd>
          </Button>
          <Button variant="outline" size="sm">
            Share <Kbd>T</Kbd>
          </Button>
        </ActionBarContent>
      </ActionBarRoot>
    </Box>
  );
};

export default LibraryPageTable;
