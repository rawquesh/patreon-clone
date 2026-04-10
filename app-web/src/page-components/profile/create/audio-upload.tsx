"use client";
import React, { useCallback, useState, useEffect } from "react";
import { Box, Button, Center, Progress, Text, VStack } from "@chakra-ui/react";
import { useDropzone } from "react-dropzone";
import { Icon } from "@iconify/react";
import CustomAudioPlayer from "@/components/audio-player";

interface Props {
	onUpload?: (file: File) => void;
	onAudioFileSelect: (file: File) => void;
	existingAudioUrl?: string | null;
}

const AudioUpload: React.FC<Props> = ({
	onUpload,
	onAudioFileSelect,
	existingAudioUrl = null,
}) => {
	const [uploadProgress, setUploadProgress] = useState<number | null>(null);
	const [audioUrl, setAudioUrl] = useState<string | null>(existingAudioUrl);

	useEffect(() => {
		if (existingAudioUrl) {
			setAudioUrl(existingAudioUrl);
		}
	}, [existingAudioUrl]);

	const simulateUpload = (file: File) => {
		console.log(file);
		setUploadProgress(0);
		const interval = setInterval(() => {
			setUploadProgress((prev) => {
				if (prev === null) return null;
				if (prev >= 100) {
					clearInterval(interval);
					const url = URL.createObjectURL(file);
					setAudioUrl(url);
					return null;
				}
				return prev + 2;
			});
		}, 100);
	};

	const onDrop = useCallback(
		(acceptedFiles: File[]) => {
			const file = acceptedFiles[0];
			if (file) {
				onUpload?.(file);
				simulateUpload(file);
				onAudioFileSelect(file);
			}
		},
		[onUpload, onAudioFileSelect]
	);

	const { getRootProps, getInputProps, isDragActive } = useDropzone({
		onDrop,
		accept: {
			"audio/*": [".mp3", ".wav", ".m4a", ".aac"],
		},
		multiple: false,
	});

	return (
		<VStack gap={6} w="full">
			{audioUrl ? (
				<CustomAudioPlayer src={audioUrl} />
			) : (
				<Box
					w="full"
					h="300px"
					borderWidth="1px"
					borderStyle="dashed"
					borderColor={isDragActive ? "hsl(211, 71%, 43%)" : "hsl(215.4, 16.3%, 46.9%)"}
					borderRadius="xl"
					transition="all 0.2s"
					_hover={{ borderColor: "hsl(211, 71%, 43%)" }}
					bg="transparent"
				>
					{uploadProgress !== null ? (
						<Center h="full">
							<VStack gap={4} maxW="400px" w="full" px={4}>
								<Progress.Root value={uploadProgress}>
									<Progress.Track css={{ background: "hsl(222.2, 47.4%, 11.2%)" }}>
										<Progress.Range
											css={{ background: "var(--gradient-primary)" }}
											w={`${uploadProgress}%`}
											transition="width 0.2s"
										/>
									</Progress.Track>
								</Progress.Root>
								<Text css={{ color: "hsl(215.4, 16.3%, 46.9%)" }}>Uploading {uploadProgress}%</Text>
							</VStack>
						</Center>
					) : (
						<Center h="full" {...getRootProps()} cursor="pointer">
							<input {...getInputProps()} />
							<VStack gap={4}>
								<Icon
									icon="material-symbols:mic"
									width="48"
									height="48"
									style={{ color: "hsl(215.4, 16.3%, 46.9%)" }}
								/>
								<Text fontSize={"sm"} css={{ color: "hsl(215.4, 16.3%, 46.9%)" }} textAlign="center">
									Drag and drop an audio <br /> file to upload
								</Text>
								<Button size={"xs"} variant="outline">
									Select audio file
								</Button>
							</VStack>
						</Center>
					)}
				</Box>
			)}
		</VStack>
	);
};

export default AudioUpload;
