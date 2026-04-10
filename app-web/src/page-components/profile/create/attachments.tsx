"use client";

import { Flex, IconButton, Stack, Text } from "@chakra-ui/react";
import React, { useEffect } from "react";
import { useUpload } from "./useUpload";
import { Icon } from "@iconify/react/dist/iconify.js";

interface ExistingAttachment {
	id?: string;
	_id?: string;
	url: string;
	fileName: string;
	fileType?: string;
	fileSize?: number;
}

interface Props {
	onFilesChange?: (files: File[]) => void;
	existingAttachments?: ExistingAttachment[];
	onRemoveExistingAttachment?: (attachmentId: string) => void;
}

const Attachments: React.FC<Props> = ({
	onFilesChange = () => {},
	existingAttachments = [],
	onRemoveExistingAttachment = () => {},
}) => {
	const { files, uploadFiles, removeFile } = useUpload();

	useEffect(() => {
		onFilesChange(files.map((f) => f.file));
	}, [files, onFilesChange]);

	const handleUpload = () => {
		const input = document.createElement("input");
		input.type = "file";
		input.multiple = true;
		input.onchange = (e) => {
			const target = e.target as HTMLInputElement;
			if (target.files) {
				uploadFiles(target.files);
			}
		};
		input.click();
	};

	const getFileIcon = (fileType?: string) => {
		if (!fileType) return "mdi:file";

		if (fileType.includes("image")) return "mdi:file-image";
		if (fileType.includes("audio")) return "mdi:file-music";
		if (fileType.includes("video")) return "mdi:file-video";
		if (fileType.includes("pdf")) return "mdi:file-pdf";
		if (fileType.includes("word") || fileType.includes("document"))
			return "mdi:file-word";
		if (fileType.includes("excel") || fileType.includes("sheet"))
			return "mdi:file-excel";

		return "mdi:file";
	};

	return (
		<Stack borderRadius={"12px"} bg={"white"} p={"24px"}>
			<Flex fontSize={"sm"} justifyContent={"space-between"}>
				<Text>Attachments</Text>
				<Text
					cursor={"pointer"}
					fontWeight={600}
					css={{ color: "hsl(211, 71%, 43%)" }}
					as={"button"}
					_hover={{
						color: "hsl(211, 71%, 43%)",
						opacity: 0.8,
					}}
					onClick={() => {
						handleUpload();
					}}
				>
					Upload
				</Text>
			</Flex>

			{existingAttachments.map((attachment) => (
				<Flex
					css={{
						"& svg": {
							color: "star.600",
						},
						"& .delete-btn": {
							opacity: 0,
						},
						"&:hover": {
							"& .delete-btn": {
								opacity: 1,
							},
						},
					}}
					key={attachment.id || attachment._id}
					alignItems={"center"}
					gap={4}
				>
					<Icon
						icon={getFileIcon(attachment.fileType)}
						width={"24px"}
						fontSize={"36px"}
					/>
					<Text fontSize={"sm"} transform={"translateY(2px)"}>
						{attachment.fileName}
						{attachment.fileSize && (
							<Text as="span" ml={2} css={{ color: "hsl(215.4, 16.3%, 46.9%)" }}>
								({formatFileSize(attachment.fileSize)})
							</Text>
						)}
					</Text>
					<IconButton
						onClick={() => {
							onRemoveExistingAttachment(attachment.id || attachment._id || "");
						}}
						ml={"auto"}
						variant={"ghost"}
						className="delete-btn"
						aria-label="Delete attachment"
					>
						<Icon width={"24px"} icon={"ic:baseline-delete"} />
					</IconButton>
				</Flex>
			))}

			{files.map((file) => (
				<Flex
					css={{
						"& svg": {
							color: "star.600",
						},
						"& .delete-btn": {
							opacity: 0,
						},
						"&:hover": {
							"& .delete-btn": {
								opacity: 1,
							},
						},
					}}
					key={file.id}
					alignItems={"center"}
					gap={4}
				>
					<Icon icon={"mdi:file"} width={"24px"} fontSize={"36px"} />
					<Text fontSize={"sm"} transform={"translateY(2px)"}>
						{file.name}
						<Text as="span" ml={2} css={{ color: "hsl(215.4, 16.3%, 46.9%)" }}>
							({file.size})
						</Text>
					</Text>
					<IconButton
						onClick={() => {
							removeFile(file.id);
						}}
						ml={"auto"}
						variant={"ghost"}
						className="delete-btn"
						aria-label="Delete file"
					>
						<Icon width={"24px"} icon={"ic:baseline-delete"} />
					</IconButton>
				</Flex>
			))}

			{existingAttachments.length === 0 && files.length === 0 && (
				<Text fontSize="sm" css={{ color: "hsl(215.4, 16.3%, 46.9%)" }} mt={2}>
					{'No attachments yet. Click "Upload" to add files.'}
				</Text>
			)}
		</Stack>
	);
};

const formatFileSize = (bytes: number): string => {
	if (bytes === 0) return "0 B";
	const k = 1024;
	const sizes = ["B", "KB", "MB", "GB"];
	const i = Math.floor(Math.log(bytes) / Math.log(k));
	return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

export default Attachments;
