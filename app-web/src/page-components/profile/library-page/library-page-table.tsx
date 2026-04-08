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
// import { PostItem, PostType } from "@/typings/IPost";

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

  // Use the appropriate posts and pagination based on whether we're viewing creator posts
  const displayPosts = isCreatorView ? creatorPosts : posts;
  const displayPagination = isCreatorView ? creatorPagination : pagination;

  const hasSelection = selection.length > 0;
  const indeterminate = hasSelection && selection.length < displayPosts.length;

  useEffect(() => {
    setSelection([]);
  }, [displayPosts]);

  const getPostTypeIcon = (postType: string) => {
    switch (postType) {
      case "Text":
        return "ph:text-t-fill";
      case "Picture":
        return "mdi:image";
      case "Audio":
        return "mdi:music";
      case "Video":
        return "mynaui:video-solid";
      case "Link":
        return "mdi:link-variant";
      default:
        return "ic:baseline-document";
    }
  };

  const rows = displayPosts.map((item) => {
    console.log(item);
    return (
      <Table.Row
        key={item.id}
        data-selected={selection.includes(item.id) ? "" : undefined}
        bg={"white"}
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
        <Table.Cell>{item.title}</Table.Cell>
        <Table.Cell>{item.publishDate}</Table.Cell>
        <Table.Cell>
          {item.tierAccess.map((i) => (
            //@ts-ignore
            <Tag.Root ml={1} key={i.id}>
              {/* @ts-ignore */}
              <Tag.Label>{i.name}</Tag.Label>
            </Tag.Root>
          ))}
        </Table.Cell>
        <Table.Cell>
          <Icon width={"24px"} icon={getPostTypeIcon(item.postType)} />
        </Table.Cell>
        <Table.Cell>
          <AspectRatio ratio={3 / 4}>
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
    );
  });

  if (isLoading) {
    return (
      <Flex justify="center" align="center" minH="200px">
        <Spinner size="xl" color="blue.500" />
      </Flex>
    );
  }

  return (
    <Box>
      <Table.Root overflow={"hidden"} boxShadow={"md"} borderRadius={"lg"}>
        <Table.Header>
          <Table.Row bg={"white"}>
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
            <Table.ColumnHeader w={"auto"}>Title</Table.ColumnHeader>
            <Table.ColumnHeader>Publish Date</Table.ColumnHeader>
            <Table.ColumnHeader>Tier Access</Table.ColumnHeader>
            <Table.ColumnHeader>Post Type</Table.ColumnHeader>
            <Table.ColumnHeader></Table.ColumnHeader>
            <Table.ColumnHeader></Table.ColumnHeader>
          </Table.Row>
        </Table.Header>
        <Table.Body>{rows}</Table.Body>
      </Table.Root>

      {displayPagination && (
        <Flex justify="space-between" align="center" mt={4}>
          <Text>
            Showing {displayPosts.length} of {displayPagination.total} posts
          </Text>
          <Flex gap={2}>
            <Button
              size="sm"
              onClick={prevPage}
              disabled={displayPagination.page <= 1}
            >
              Previous
            </Button>
            <Button
              size="sm"
              onClick={nextPage}
              disabled={displayPagination.page >= displayPagination.totalPages}
            >
              Next
            </Button>
          </Flex>
        </Flex>
      )}

      <ActionBarRoot open={hasSelection}>
        <ActionBarContent>
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
