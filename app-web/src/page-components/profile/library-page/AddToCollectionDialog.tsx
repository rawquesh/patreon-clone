/* eslint-disable @typescript-eslint/ban-ts-comment */
"use client";

import React, { useState } from "react";
import {
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogRoot,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckboxCard } from "@/components/ui/checkbox-card";
import { CheckboxGroup, Stack, Text, Spinner, Flex } from "@chakra-ui/react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchMyCollections,
  addPostToCollection,
  removePostFromCollection,
} from "@/lib/backend-services/posts-service";
import { toaster } from "@/components/ui/toaster";
import { CollectionDetails } from "@/typings/ICollection";

interface AddToCollectionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  postId: string;
  initialCollectionIds?: string[]; // Optional: Pre-select collections the post is already in
  onSuccess?: () => void; // Optional callback on successful update
}

const AddToCollectionDialogComponent: React.FC<AddToCollectionDialogProps> = ({
  isOpen,
  onClose,
  postId,
  initialCollectionIds = [],
  onSuccess,
}) => {
  const queryClient = useQueryClient();
  const [selectedCollections, setSelectedCollections] =
    useState<string[]>(initialCollectionIds);

  // console.log({ initialCollectionIds, postId });

  // Fetch the user's collections
  const {
    data: collectionsData,
    isLoading: isLoadingCollections,
    isError,
    error,
  } = useQuery({
    queryKey: ["myCollections"],
    queryFn: fetchMyCollections,
    enabled: isOpen, // Only fetch when the dialog is open
    staleTime: 5 * 60 * 1000, // Add staleTime (5 minutes) to reduce refetching
  });

  // Mutation for adding/removing post from collections
  const mutation = useMutation({
    mutationFn: async (updates: {
      additions: string[];
      removals: string[];
    }) => {
      console.log({ updates });
      const promises: Promise<void>[] = [];
      updates.additions.forEach((collectionId) =>
        promises.push(addPostToCollection(collectionId, postId))
      );
      updates.removals.forEach((collectionId) =>
        promises.push(removePostFromCollection(collectionId, postId))
      );
      await Promise.all(promises);
    },
    onSuccess: () => {
      toaster.create({
        title: "Success",
        description: "Collections updated successfully.",
        type: "success",
        duration: 3000,
      });
      // Optionally invalidate queries related to the post or collections
      queryClient.invalidateQueries({ queryKey: ["post", postId] });
      queryClient.invalidateQueries({ queryKey: ["myCollections"] });
      onSuccess?.(); // Call optional success callback
      onClose(); // Close the dialog
    },
    onError: (err: any) => {
      toaster.create({
        title: "Error",
        description:
          err.response?.data?.message || "Failed to update collections.",
        type: "error",
        duration: 3000,
      });
    },
  });

  const handleSubmit = () => {
    console.log({ selectedCollections });
    const additions = selectedCollections.filter(
      (id) => !initialCollectionIds.includes(id)
    );
    const removals = initialCollectionIds.filter(
      (id) => !selectedCollections.includes(id)
    );
    if (additions.length === 0 && removals.length === 0) {
      onClose(); // No changes, just close
      return;
    }

    mutation.mutate({ additions, removals });
  };

  const collections = collectionsData?.collections || [];

  console.log({ selectedCollections });

  return (
    <DialogRoot open={isOpen} onOpenChange={(v) => !v.open && onClose()}>
      <DialogContent className="glass-dialog-content">
        <DialogHeader css={{ color: "hsl(222.2, 47.4%, 11.2%)" }}>Add to Collection</DialogHeader>
        <DialogBody>
          {isLoadingCollections ? (
            <Flex justify="center" align="center" h="100px">
              <Spinner css={{ color: "hsl(211, 71%, 43%)" }} />
            </Flex>
          ) : isError ? (
            <Text css={{ color: "hsl(0, 84.2%, 60.2%)" }}>
              Error loading collections: {error?.message || "Unknown error"}
            </Text>
          ) : collections.length === 0 ? (
            <Text css={{ color: "hsl(215.4, 16.3%, 46.9%)" }}>You haven&apos;t created any collections yet.</Text>
          ) : (
            <CheckboxGroup
              value={selectedCollections}
            >
              <Stack gap={3}>
                {collections.map((collection: CollectionDetails) => (
                  <CheckboxCard
                    label={collection.title}
                    key={collection._id}
                    value={collection._id}
                    onChange={(e) => {
                      setSelectedCollections((pre) => {
                        //@ts-ignore
                        if (e.target.checked) {
                          return [...pre, collection._id];
                        }
                        return pre.filter((id) => id !== collection._id);
                      });
                    }}
                  >
                    <Text fontWeight="medium" css={{ color: "hsl(222.2, 47.4%, 11.2%)" }}>
                      {collection.title}
                    </Text>
                    {collection.description && (
                      <Text fontSize="sm" css={{ color: "hsl(215.4, 16.3%, 46.9%)" }}>
                        {collection.description}
                      </Text>
                    )}
                  </CheckboxCard>
                ))}
              </Stack>
            </CheckboxGroup>
          )}
        </DialogBody>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={mutation.isPending}
            className="glass-card"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            loading={mutation.isPending}
            disabled={
              isLoadingCollections || isError || collections.length === 0
            }
            className="btn-gradient"
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </DialogRoot>
  );
};

// Memoize the component
const AddToCollectionDialog = React.memo(AddToCollectionDialogComponent);

export default AddToCollectionDialog;
