"use client";
import {
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogRoot,
} from "@/components/ui/dialog";
import {
  MenuContent,
  MenuItem,
  MenuRoot,
  MenuTrigger,
} from "@/components/ui/menu";
import { toaster } from "@/components/ui/toaster";
import {
  IconButton,
  Text,
  Input,
  Textarea,
  Stack,
  Box,
  Image,
  Flex,
} from "@chakra-ui/react";
import { Icon } from "@iconify/react/dist/iconify.js";
import { useState } from "react";
import api from "@/lib/api";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";

interface Collection {
  _id: string;
  title: string;
  description: string;
  coverImageUrl: string;
}

interface CollectionActionsMenuProps {
  collection: Collection;
}

const CollectionActionsMenu: React.FC<CollectionActionsMenuProps> = ({
  collection,
}) => {
  const queryClient = useQueryClient();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const [title, setTitle] = useState(collection.title);
  const [description, setDescription] = useState(collection.description || "");

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await api.delete(`/collections/${collection._id}`);
      toaster.create({
        title: "Success",
        description: "Collection deleted successfully",
        type: "success",
        duration: 3000,
      });
      queryClient.invalidateQueries({ queryKey: ["collections"] });
      setIsDeleteModalOpen(false);
    } catch (error: any) {
      toaster.create({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to delete collection",
        type: "error",
        duration: 3000,
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleUpdate = async () => {
    if (!title.trim()) {
      toaster.create({
        title: "Error",
        description: "Collection title is required",
        type: "error",
        duration: 3000,
      });
      return;
    }

    setIsUpdating(true);
    try {
      await api.put(`/collections/${collection._id}`, {
        title,
        description: description.trim() || undefined,
      });

      toaster.create({
        title: "Success",
        description: "Collection updated successfully",
        type: "success",
        duration: 3000,
      });

      queryClient.invalidateQueries({ queryKey: ["collections"] });
      setIsEditModalOpen(false);
    } catch (error: any) {
      toaster.create({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to update collection",
        type: "error",
        duration: 3000,
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <>
      <MenuRoot>
        <MenuTrigger>
          <IconButton
            as={"div"}
            variant={"ghost"}
            borderRadius={"999px"}
            aria-label="Options"
          >
            <Icon icon={"mi:options-horizontal"} />
          </IconButton>
        </MenuTrigger>
        <MenuContent>
          <MenuItem
            onClick={() => setIsEditModalOpen(true)}
            color={"blue.600"}
            value="edit"
          >
            Edit Collection
          </MenuItem>
          <MenuItem
            onClick={() => setIsDeleteModalOpen(true)}
            color={"red.600"}
            value="delete"
          >
            Delete Collection
          </MenuItem>
        </MenuContent>
      </MenuRoot>

      <DialogRoot
        open={isDeleteModalOpen}
        onOpenChange={(v) => setIsDeleteModalOpen(v.open)}
      >
        <DialogContent>
          <DialogHeader>Delete Collection</DialogHeader>
          <DialogBody>
            <Text>
              {`Are you sure you want to delete collection ${collection.title}? This action cannot be undone.`}
            </Text>
          </DialogBody>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              colorPalette="red"
              onClick={handleDelete}
              loading={isDeleting}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </DialogRoot>

      <DialogRoot
        open={isEditModalOpen}
        onOpenChange={(v) => setIsEditModalOpen(v.open)}
      >
        <DialogContent>
          <DialogHeader>Edit Collection</DialogHeader>
          <DialogBody>
            <Stack gap={6}>
              {collection.coverImageUrl && (
                <Box
                  borderRadius="md"
                  overflow="hidden"
                  maxHeight="200px"
                  position="relative"
                >
                  <Image
                    src={collection.coverImageUrl}
                    alt={collection.title}
                    objectFit="cover"
                  />
                </Box>
              )}

              <Field label="Collection title">
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Collection title"
                />
              </Field>

              <Field label="Description">
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Collection description"
                  maxLength={180}
                />
                <Flex justifyContent="flex-end" mt={1}>
                  <Text fontSize="xs" color="gray.500">
                    {description.length}/180
                  </Text>
                </Flex>
              </Field>
            </Stack>
          </DialogBody>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdate} loading={isUpdating}>
              Update
            </Button>
          </DialogFooter>
        </DialogContent>
      </DialogRoot>
    </>
  );
};

export default CollectionActionsMenu;
