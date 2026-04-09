"use client";

import { Button } from "@/components/ui/button";
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
import { usePostsFilter } from "@/context/posts.provider";
import {
  deletePost,
  publishPost,
  unpublishPost,
} from "@/lib/backend-services/posts-service";
import { IconButton, Text } from "@chakra-ui/react";
import { Icon } from "@iconify/react/dist/iconify.js";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { useDisclosure } from "@chakra-ui/react";
import AddToCollectionDialog from "./AddToCollectionDialog";

const TableCellMenu: React.FC<{
  postId: string;
  postType: string;
  status: "published" | "draft";
  collections: string[];
}> = ({ postId, postType, status, collections }) => {
  const router = useRouter();
  const { refetch } = usePostsFilter();
  const {
    open: isCollectionDialogOpen,
    onOpen: onCollectionDialogOpen,
    onClose: onCollectionDialogClose,
  } = useDisclosure();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isChangingStatus, setIsChangingStatus] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deletePost(postId);
      toaster.create({
        title: "Success",
        description: "Post deleted successfully",
        type: "success",
        duration: 3000,
      });
      setIsDeleteModalOpen(false);
      refetch();
    } catch (error: any) {
      toaster.create({
        title: "Error",
        description: error.response?.data?.message || "Failed to delete post",
        type: "error",
        duration: 3000,
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleStatusChange = async () => {
    setIsChangingStatus(true);
    try {
      if (status === "published") {
        await unpublishPost(postId);
        toaster.create({
          title: "Success",
          description: "Post unpublished successfully",
          type: "success",
          duration: 3000,
        });
      } else {
        await publishPost(postId);
        toaster.create({
          title: "Success",
          description: "Post published successfully",
          type: "success",
          duration: 3000,
        });
      }
      setIsStatusModalOpen(false);
      refetch();
    } catch (error: any) {
      toaster.create({
        title: "Error",
        description:
          error.response?.data?.message ||
          `Failed to ${status === "published" ? "unpublish" : "publish"} post`,
        type: "error",
        duration: 3000,
      });
    } finally {
      setIsChangingStatus(false);
    }
  };

  // console.log({ collections, postId });

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
        <MenuContent className="glass-card">
          <MenuItem
            onClick={() => {
              router.push(`/post/${postId}`);
            }}
            css={{ color: "hsl(211, 71%, 43%)" }}
            value="view"
          >
            View Post
          </MenuItem>
          <MenuItem
            onClick={() => {
              const pt =
                postType.toLowerCase() === "picture" ? "image" : postType;
              router.push(`/profile/posts/${pt}/${postId}`);
            }}
            css={{ color: "hsl(211, 71%, 43%)" }}
            value="edit"
          >
            Edit Post
          </MenuItem>
          <MenuItem
            onClick={onCollectionDialogOpen}
            css={{ color: "hsl(211, 71%, 43%)" }}
            value="add-to-collection"
          >
            Add to Collection
          </MenuItem>
          <MenuItem
            onClick={() => {
              setIsStatusModalOpen(true);
            }}
            css={{ color: "hsl(211, 71%, 43%)" }}
            value="status-change"
          >
            {status === "published" ? "Unpublish" : "Publish"}
          </MenuItem>
          <MenuItem
            onClick={() => {
              setIsDeleteModalOpen(true);
            }}
            css={{ color: "hsl(0, 84.2%, 60.2%)" }}
            value="delete"
          >
            Delete Post
          </MenuItem>
        </MenuContent>
      </MenuRoot>
      {isCollectionDialogOpen && (
        <AddToCollectionDialog
          isOpen={isCollectionDialogOpen}
          onClose={onCollectionDialogClose}
          postId={postId}
          onSuccess={refetch}
          initialCollectionIds={collections}
        />
      )}

      <DialogRoot
        open={isDeleteModalOpen}
        onOpenChange={(v) => setIsDeleteModalOpen(v.open)}
      >
        <DialogContent className="glass-dialog-content">
          <DialogHeader css={{ color: "hsl(222.2, 47.4%, 11.2%)" }}>Delete Post</DialogHeader>
          <DialogBody>
            <Text css={{ color: "hsl(215.4, 16.3%, 46.9%)" }}>
              Are you sure you want to delete this post? This action cannot be
              undone.
            </Text>
          </DialogBody>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteModalOpen(false)}
              className="glass-card"
            >
              Cancel
            </Button>
            <Button
              onClick={handleDelete}
              loading={isDeleting}
              css={{
                background: "hsl(0, 84.2%, 60.2%)",
                color: "white",
                "&:hover": { background: "hsl(0, 78%, 52%)" },
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </DialogRoot>

      <DialogRoot
        open={isStatusModalOpen}
        onOpenChange={(v) => setIsStatusModalOpen(v.open)}
      >
        <DialogContent className="glass-dialog-content">
          <DialogHeader css={{ color: "hsl(222.2, 47.4%, 11.2%)" }}>
            {status === "published" ? "Unpublish Post" : "Publish Post"}
          </DialogHeader>
          <DialogBody>
            <Text css={{ color: "hsl(215.4, 16.3%, 46.9%)" }}>
              {status === "published"
                ? "Are you sure you want to unpublish this post? It will no longer be visible to your audience."
                : "Are you sure you want to publish this post? It will be visible to your audience based on tier access."}
            </Text>
          </DialogBody>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsStatusModalOpen(false)}
              className="glass-card"
            >
              Cancel
            </Button>
            <Button
              onClick={handleStatusChange}
              loading={isChangingStatus}
              className="btn-gradient"
            >
              {status === "published" ? "Unpublish" : "Publish"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </DialogRoot>
    </>
  );
};

export default TableCellMenu;
