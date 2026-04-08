"use client";
import React, { useState, useEffect } from "react";
import { Box, Input, VStack, IconButton, Flex, Text } from "@chakra-ui/react";
import { Icon } from "@iconify/react";
import { InputGroup } from "@/components/ui/input-group";

interface Props {
	onUrlChange: (url: string) => void;
	initialUrl?: string;
}

interface LinkPreview {
	title: string;
	url: string;
}

const LinkInput: React.FC<Props> = ({ onUrlChange, initialUrl = "" }) => {
	const [url, setUrl] = useState(initialUrl);
	const [preview, setPreview] = useState<LinkPreview | null>(null);

	useEffect(() => {
		if (initialUrl && isValidUrl(initialUrl)) {
			setUrl(initialUrl);
			setPreview({
				title: getTitleFromUrl(initialUrl),
				url: initialUrl,
			});
		}
	}, [initialUrl]);

	const handleUrlSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (isValidUrl(url)) {
			const newPreview = {
				title: getTitleFromUrl(url),
				url: url,
			};
			setPreview(newPreview);
			onUrlChange(url);
		}
	};

	const handleUrlInput = (value: string) => {
		setUrl(value);
		if (isValidUrl(value)) {
			const newPreview = {
				title: getTitleFromUrl(value),
				url: value,
			};
			setPreview(newPreview);
			onUrlChange(value);
		}
	};

	const handleRemovePreview = () => {
		setPreview(null);
		setUrl("");
		onUrlChange("");
	};

	const isValidUrl = (str: string) => {
		try {
			new URL(str);
			return true;
		} catch {
			return false;
		}
	};

	const getTitleFromUrl = (url: string) => {
		try {
			const domain = new URL(url).hostname;
			return domain.replace("www.", "");
		} catch {
			return url;
		}
	};

	return (
		<VStack w="full" align="stretch" gap={4}>
			<form onSubmit={handleUrlSubmit}>
				<InputGroup
					w={"full"}
					startElement={<Icon icon="material-symbols:link" />}
				>
					<Input
						placeholder="Type or paste URL"
						value={url}
						onChange={(e) => handleUrlInput(e.target.value)}
						border="none"
						onPaste={(e) => {
							e.preventDefault();
							const pastedText = e.clipboardData.getData("text");
							handleUrlInput(pastedText);
						}}
					/>
				</InputGroup>
			</form>

			{preview && (
				<Box bg={"white"} borderRadius="xl" p={4} position="relative">
					<Flex justify="space-between" align="center">
						<Box>
							<Text fontWeight="semibold">{preview.title}</Text>
							<Text color="gray.400" fontSize="sm">
								{preview.url}
							</Text>
						</Box>
						<IconButton
							aria-label="Remove link"
							size="sm"
							variant="ghost"
							onClick={handleRemovePreview}
						>
							<Icon icon="material-symbols:close" />
						</IconButton>
					</Flex>
				</Box>
			)}
		</VStack>
	);
};

export default LinkInput;
