import { useState, useCallback } from "react";

interface UploadFile {
	id: string;
	name: string;
	size: string;
	file: File; // Add the actual File object
}

interface UseUploadResult {
	files: UploadFile[];
	uploadFiles: (fileList: FileList) => void;
	removeFile: (id: string) => void;
}

export const useUpload = (): UseUploadResult => {
	const [files, setFiles] = useState<UploadFile[]>([]);

	const formatFileSize = (bytes: number): string => {
		if (bytes === 0) return "0 B";
		const k = 1024;
		const sizes = ["B", "KB", "MB", "GB"];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
	};

	const uploadFiles = useCallback((fileList: FileList) => {
		const newFiles = Array.from(fileList).map(
			(file): UploadFile => ({
				id: `${file.name}-${Date.now()}`,
				name: file.name,
				size: formatFileSize(file.size),
				file: file,
			})
		);

		setFiles((prev) => [...prev, ...newFiles]);
	}, []);

	const removeFile = useCallback((id: string) => {
		setFiles((prev) => prev.filter((file) => file.id !== id));
	}, []);

	return {
		files,
		uploadFiles,
		removeFile,
	};
};
