"use client";

import React from "react";
import {
  PopoverBody,
  PopoverContent,
  PopoverRoot,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Icon } from "@iconify/react/dist/iconify.js";
import { Flex, IconButton, Text } from "@chakra-ui/react";
import {
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogRoot,
} from "@/components/ui/dialog";
import DiscountModal from "./discount-modal";
import { IDiscount } from "@/typings/IDiscount";
import { deleteDiscount } from "@/lib/backend-services/promotions-service";

import { Button } from "@/components/ui/button";
import { toaster } from "@/components/ui/toaster";

interface Props {
  discount: IDiscount;
  onDiscountChange: () => void;
}

const DiscountTableMenuPopover: React.FC<Props> = ({
  discount,
  onDiscountChange,
}) => {
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  // const { open, onOpen, onClose } = useDisclosure();

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteDiscount(discount.id);
      toaster.create({
        title: "Discount deleted successfully",
        type: "success",
        duration: 3000,
      });
      onDiscountChange();
      // onClose();
    } catch (error: any) {
      console.error("Error deleting discount:", error);
      toaster.create({
        title: "Error deleting discount",
        description:
          error.response?.data?.message || "An unexpected error occurred",
        type: "error",
        duration: 5000,
      });
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
    }
  };

  return (
    <>
      <PopoverRoot closeOnInteractOutside closeOnEscape>
        <PopoverTrigger>
          <IconButton
            variant={"ghost"}
            size={"sm"}
            // icon={"ix:more-menu"}
            aria-label="More"
          >
            <Icon icon={"ix:more-menu"} />
          </IconButton>
        </PopoverTrigger>
        <PopoverContent zIndex={10} w={"150px"}>
          <PopoverBody overflow={"hidden"} p={0}>
            <Flex direction={"column"}>
              <DiscountModal
                mode="edit"
                discount={discount}
                onSaveCallback={onDiscountChange}
              />
              <Flex
                _hover={{
                  bg: "red.100",
                }}
                gap={4}
                px={4}
                py={2}
                cursor={"pointer"}
                color={"red.700"}
                borderBottomRadius={"8px"}
                onClick={() => {
                  setIsDeleteDialogOpen(true);
                }}
              >
                <Icon icon={"carbon:delete"} />
                <Text transform={"translateY(-2px)"}>Delete</Text>
              </Flex>
            </Flex>
          </PopoverBody>
        </PopoverContent>
      </PopoverRoot>

      <DialogRoot
        open={isDeleteDialogOpen}
        onOpenChange={(v) => setIsDeleteDialogOpen(v.open)}
      >
        <DialogContent>
          <DialogHeader>Delete Post</DialogHeader>
          <DialogBody>
            <Text>
              Are you sure you want to delete this discount? This action cannot
              be undone.
            </Text>
          </DialogBody>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
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
    </>
  );
};

export default DiscountTableMenuPopover;
