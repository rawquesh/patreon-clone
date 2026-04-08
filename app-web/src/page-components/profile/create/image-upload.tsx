"use client";
import React, { useCallback, useState, useEffect } from "react";
import {
	Box,
	Button,
	Center,
	Flex,
	Grid,
	Image,
	Text,
	VStack,
	IconButton,
} from "@chakra-ui/react";
import { useDropzone } from "react-dropzone";
import { Icon } from "@iconify/react";

interface UploadedImage {
	id: string;
	url: string;
	file: File;
	caption?: string;
}

interface Props {
	onUpload?: (files: File[]) => void;
	onImagesChange: (images: File[]) => void;
	existingImages?: string[];
	onRemoveExistingImage?: (url: string) => void;
}

const ImageUpload: React.FC<Props> = ({
	onImagesChange,
	existingImages = [],
	onRemoveExistingImage = () => {},
}) => {
	const [images, setImages] = useState<UploadedImage[]>([]);
	const [files, setFiles] = useState<File[]>([]);

	const onDrop = useCallback(
		(acceptedFiles: File[]) => {
			const newImages = acceptedFiles.map((file) => ({
				id: `${file.name}-${Date.now()}`,
				url: URL.createObjectURL(file),
				file,
			}));

			setImages((prev) => [...prev, ...newImages]);
			setFiles((prev) => [...prev, ...acceptedFiles]);
			onImagesChange([...files, ...acceptedFiles]);
		},
		[files, onImagesChange]
	);

	const { getRootProps, getInputProps, isDragActive } = useDropzone({
		onDrop,
		accept: {
			"image/*": [".png", ".jpg", ".jpeg", ".gif"],
		},
		multiple: true,
	});

	const removeImage = (id: string) => {
		setImages((prev) => {
			const filtered = prev.filter((img) => img.id !== id);
			const removedImage = prev.find((img) => img.id === id);

			if (removedImage) {
				URL.revokeObjectURL(removedImage.url);
				setFiles((prevFiles) =>
					prevFiles.filter(() => !prevFiles.includes(removedImage.file))
				);
			}

			onImagesChange(filtered.map((img) => img.file));
			return filtered;
		});
	};

	const removeAll = () => {
		images.forEach((img) => URL.revokeObjectURL(img.url));
		setImages([]);
		setFiles([]);
		onImagesChange([]);
	};

	useEffect(() => {
		return () => {
			images.forEach((img) => URL.revokeObjectURL(img.url));
		};
	}, [images]);

	return (
		<VStack w="full" align="stretch" gap={4}>
			<Flex justify="space-between" align="center">
				<Text display="flex" alignItems="center" gap={2}>
					<Icon icon="material-symbols:image" />
					{images.length + existingImages.length} images
				</Text>
				<Flex gap={4}>
					{(images.length > 0 || existingImages.length > 0) && (
						<>
							<Button
								size="sm"
								variant="ghost"
								color="blue.400"
								onClick={() => {
									console.log("Add captions");
								}}
							>
								Add captions
							</Button>
							<Button
								size="sm"
								variant="ghost"
								color="red.400"
								onClick={removeAll}
							>
								Remove all
							</Button>
						</>
					)}
				</Flex>
			</Flex>
			<Grid
				templateColumns={
					images.length > 0 || existingImages.length > 0
						? "repeat(auto-fill, minmax(200px, 1fr))"
						: "1fr"
				}
				gap={4}
			>
				{existingImages.map((imageUrl, index) => (
					<Box
						key={`existing-${index}`}
						position="relative"
						borderRadius="md"
						overflow="hidden"
					>
						<Image
							src={imageUrl}
							alt="Existing upload"
							w="full"
							h="200px"
							objectFit="cover"
						/>
						<IconButton
							aria-label="Remove image"
							position="absolute"
							top={2}
							right={2}
							size="sm"
							borderRadius="full"
							colorScheme="blackAlpha"
							onClick={() => onRemoveExistingImage(imageUrl)}
						>
							<Icon icon="material-symbols:delete" />
						</IconButton>
					</Box>
				))}

				{images.map((image) => (
					<Box
						key={image.id}
						position="relative"
						borderRadius="md"
						overflow="hidden"
					>
						<Image
							src={image.url}
							alt="Uploaded"
							w="full"
							h="200px"
							objectFit="cover"
						/>
						<IconButton
							aria-label="Remove image"
							position="absolute"
							top={2}
							right={2}
							size="sm"
							borderRadius="full"
							colorScheme="blackAlpha"
							onClick={() => removeImage(image.id)}
						>
							<Icon icon="material-symbols:delete" />
						</IconButton>
					</Box>
				))}

				<Box
					{...getRootProps()}
					borderWidth="1px"
					borderStyle="dashed"
					borderColor={isDragActive ? "blue.400" : "gray.600"}
					borderRadius="xl"
					h={images.length > 0 || existingImages.length > 0 ? "200px" : "300px"}
					transition="all 0.2s"
					_hover={{ borderColor: "blue.400" }}
					cursor="pointer"
				>
					<input {...getInputProps()} />
					<Center h="full">
						<VStack gap={4}>
							<Icon
								icon="material-symbols:add-photo-alternate"
								width="48"
								height="48"
								color="#666"
							/>
							<Text fontSize="sm" color="gray.400" textAlign="center">
								Add Images
							</Text>
						</VStack>
					</Center>
				</Box>
			</Grid>
		</VStack>
	);
};

export default ImageUpload;
