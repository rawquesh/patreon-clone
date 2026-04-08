"use client";

import {
  Flex,
  Stack,
  Text,
  useDisclosure,
  Spinner,
  Box,
  NativeSelect,
} from "@chakra-ui/react";
import { Icon } from "@iconify/react/dist/iconify.js";
import React, { useState, useEffect } from "react";
import CreateCollectionForm from "./create-collection-form";
import ButtonWithIcon from "@/components/ui/button-with-icon";
import api from "@/lib/api";

interface Collection {
  _id: string;
  title: string;
}

const CreateCollection: React.FC<{
  onCreateCollection?: (id: string) => void;
  initialCollectionId?: string;
}> = ({ onCreateCollection = () => {}, initialCollectionId = "" }) => {
  const { open, onClose, onOpen } = useDisclosure();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCollectionId, setSelectedCollectionId] =
    useState<string>(initialCollectionId);

  useEffect(() => {
    const fetchCollections = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const { data } = await api.get<{ collections: Collection[] }>(
          "/collections"
        );
        setCollections(data.collections || []);
      } catch (err: any) {
        console.error("Failed to fetch collections:", err);
        setError("Failed to load collections.");
        setCollections([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCollections();
  }, []);

  useEffect(() => {
    if (initialCollectionId) {
      setSelectedCollectionId((prev) =>
        prev === initialCollectionId ? prev : initialCollectionId
      );
    } else if (!initialCollectionId) {
      setSelectedCollectionId((prev) => {
        if (prev && !initialCollectionId) {
          return "";
        } else {
          return prev;
        }
      });
    }
  }, [initialCollectionId]);

  const handleCollectionSelect = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const id = event.target.value;
    setSelectedCollectionId(id);
    onCreateCollection(id);
  };

  const handleNewCollectionSubmit = (newCollectionId: string) => {
    const fetchCollections = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const { data } = await api.get<{ collections: Collection[] }>(
          "/collections/my-collections"
        );
        setCollections(data.collections || []);
        setSelectedCollectionId(newCollectionId);
        onCreateCollection(newCollectionId);
      } catch (err: any) {
        console.error("Failed to refetch collections:", err);
        setError("Failed update collections list.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCollections();
    onClose();
  };

  return (
    <Stack bg={"white"} maxW={"224px"} borderRadius={"12px"} p={"12px"} gap={3}>
      <Flex gap={2} alignItems="center">
        <Icon icon={"tdesign:collection-filled"} fontSize="16px" />
        <Text fontSize={"sm"} fontWeight={600}>
          Collections
        </Text>
      </Flex>
      <Box>
        {isLoading ? (
          <Spinner size="sm" />
        ) : error ? (
          <Text color="red.500" fontSize="xs">
            {error}
          </Text>
        ) : (
          <NativeSelect.Root size="sm" disabled={isLoading}>
            <NativeSelect.Field
              placeholder="Select a collection"
              value={selectedCollectionId}
              onChange={handleCollectionSelect}
            >
              {collections.map((collection) => (
                <option key={collection._id} value={collection._id}>
                  {collection.title}
                </option>
              ))}
            </NativeSelect.Field>
          </NativeSelect.Root>
        )}
      </Box>
      <Text fontSize={"xs"} color={"star.600"}>
        Help fans explore your work with collections of related posts.
      </Text>
      {!selectedCollectionId && (
        <ButtonWithIcon
          as={"div"}
          size={"xs"}
          variant={"outline"}
          icon="ic:round-plus"
          onClick={onOpen}
          disabled={isLoading}
        >
          Create collection
        </ButtonWithIcon>
      )}
      <CreateCollectionForm
        open={open}
        onClose={onClose}
        onSubmit={handleNewCollectionSubmit}
      />
    </Stack>
  );
};

export default CreateCollection;
