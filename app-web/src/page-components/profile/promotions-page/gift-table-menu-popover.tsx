"use client";

import React from "react";
import {
	PopoverBody,
	PopoverContent,
	PopoverRoot,
	PopoverTrigger,
} from "@/components/ui/popover";
import { Icon } from "@iconify/react/dist/iconify.js";
import { Flex, Text, useDisclosure } from "@chakra-ui/react";
import GiftModal from "./gift-modal";
import { IGift } from "@/typings/IDiscount";
import { deleteGift } from "@/lib/backend-services/promotions-service";
import {
	DialogBody,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogRoot,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toaster } from "@/components/ui/toaster";

interface Props {
	gift: IGift;
	onGiftChange: () => void;
}

const GiftTableMenuPopover: React.FC<Props> = ({ gift, onGiftChange }) => {
	const { open, onOpen, onClose } = useDisclosure();
	const [isDeleting, setIsDeleting] = React.useState(false);
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);

	const handleDelete = async () => {
		setIsDeleting(true);
		try {
			await deleteGift(gift.id);
			toaster.create({
				title: "Gift deleted successfully",
				type: "success",
				duration: 3000,
			});
			onGiftChange();
			onClose();
		} catch (error: any) {
			console.error("Error deleting gift:", error);
			toaster.create({
				title: "Error deleting gift",
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
			<PopoverRoot open={open}>
				<PopoverTrigger onClick={onOpen}>
					<Flex
						_hover={{
							bg: "gray.100",
						}}
						w={"40px"}
						h={"40px"}
						borderRadius={"999px"}
						justifyContent={"center"}
						alignItems={"center"}
						cursor={"pointer"}
					>
						<Icon icon={"ix:more-menu"} />
					</Flex>
				</PopoverTrigger>
				<PopoverContent w={"150px"}>
					<PopoverBody overflow={"hidden"} p={0}>
						<Flex direction={"column"}>
							<GiftModal
								mode="edit"
								gift={gift}
								onOpenCallback={() => {
									onClose();
								}}
								onSaveCallback={onGiftChange}
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
									onClose();
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

export default GiftTableMenuPopover;
