import api from "./api";

interface UploadSessionResponse {
  uploadId: string;
  key: string;
  bucket: string;
  partSize: number;
  presignedUrls: Array<{
    partNumber: number;
    url: string;
  }>;
}

interface PartResult {
  partNumber: number;
  eTag: string;
}

interface UploadProgress {
  uploadedBytes: number;
  totalBytes: number;
  percentage: number;
}

/**
 * Request an upload session from the backend
 */
export async function requestUploadSession(
  fileName: string,
  fileType: string,
  fileSize: number
): Promise<UploadSessionResponse> {
  const { data } = await api.post<UploadSessionResponse>(
    "/s3/videos/upload-session",
    {
      fileName,
      fileType,
      fileSize,
    }
  );
  return data;
}

/**
 * Upload a single part to S3
 */
async function uploadPart(
  chunk: Blob,
  url: string,
  partNumber: number
): Promise<string> {
  try {
    // For S3 presigned URLs, we need to use the exact method and headers specified in the URL
    // S3 presigned URLs are signed with specific headers, so we shouldn't add extra headers
    // The URL itself contains all the necessary authentication and parameters

    // Try with minimal configuration first (S3 presigned URLs should work with just method and body)
    const response = await fetch(url, {
      method: "PUT",
      body: chunk,
      // Don't set credentials - S3 presigned URLs don't need cookies/auth headers
      // Don't set mode explicitly - let browser handle it (defaults to "cors" for cross-origin)
      // Don't set headers - the presigned URL already includes all necessary headers in the signature
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => response.statusText);
      console.error(`S3 Upload Error for part ${partNumber}:`, {
        status: response.status,
        statusText: response.statusText,
        errorText,
        url: url.substring(0, 100) + "...", // Log first 100 chars of URL for debugging
      });

      // Provide more specific error messages based on status code
      if (response.status === 403) {
        throw new Error(
          `Part ${partNumber}: Access denied. The presigned URL may be expired or invalid.`
        );
      } else if (response.status === 404) {
        throw new Error(
          `Part ${partNumber}: The upload URL was not found. Please try again.`
        );
      } else if (response.status === 0) {
        // Status 0 usually means CORS error
        throw new Error(
          `Part ${partNumber}: CORS error. The S3 bucket CORS configuration needs to allow PUT requests from your origin.`
        );
      }

      throw new Error(
        `Part ${partNumber} failed with status ${response.status}: ${
          errorText || response.statusText
        }`
      );
    }

    const eTag = response.headers.get("ETag");
    if (!eTag) {
      throw new Error(`Missing ETag for part ${partNumber}`);
    }

    // Remove quotes from ETag
    return eTag.replace(/"/g, "");
  } catch (error: any) {
    // Provide more context about the error
    if (error instanceof TypeError && error.message === "Failed to fetch") {
      // This is likely a CORS error - provide detailed guidance
      console.error("Fetch error details:", {
        message: error.message,
        stack: error.stack,
        url: url.substring(0, 100) + "...",
      });

      const origin =
        typeof window !== "undefined"
          ? window.location.origin
          : "your-frontend-domain";
      throw new Error(
        `Network error uploading part ${partNumber}. This is likely a CORS configuration issue.\n\n` +
          `To fix this, the S3 bucket needs CORS configuration that allows:\n` +
          `- Origin: ${origin}\n` +
          `- Method: PUT\n` +
          `- Headers: Content-Type, Content-Length, x-amz-* (if used)\n` +
          `- ExposedHeaders: ETag\n\n` +
          `See S3-CORS-CONFIGURATION.md for detailed instructions on configuring S3 CORS settings.`
      );
    }
    throw error;
  }
}

/**
 * Upload all parts to S3
 */
async function uploadParts(
  file: File,
  session: UploadSessionResponse,
  onProgress?: (progress: UploadProgress) => void
): Promise<PartResult[]> {
  const parts: PartResult[] = [];
  const totalParts = session.presignedUrls.length;
  console.log("totalParts", totalParts);

  // Upload parts sequentially (can be parallelized for better performance)
  for (let i = 0; i < session.presignedUrls.length; i++) {
    const { partNumber, url } = session.presignedUrls[i];
    const start = (partNumber - 1) * session.partSize;
    const end = Math.min(start + session.partSize, file.size);
    const chunk = file.slice(start, end);

    try {
      const eTag = await uploadPart(chunk, url, partNumber);
      parts.push({ partNumber, eTag });

      // Report progress
      if (onProgress) {
        const uploadedBytes = Math.min(end, file.size);
        onProgress({
          uploadedBytes,
          totalBytes: file.size,
          percentage: Math.round((uploadedBytes / file.size) * 100),
        });
      }
    } catch (error) {
      console.error(`Error uploading part ${partNumber}:`, error);
      throw error;
    }
  }

  // Sort parts by partNumber to ensure correct order
  parts.sort((a, b) => a.partNumber - b.partNumber);

  return parts;
}

/**
 * Complete the multipart upload
 */
export async function completeUpload(
  uploadId: string,
  key: string,
  parts: PartResult[]
): Promise<string> {
  try {
    const { data } = await api.post<{ videoUrl?: string; url?: string }>(
      "/s3/videos/complete-upload",
      {
        uploadId,
        key,
        parts,
      }
    );
    // Backend returns videoUrl (camelCase) or url (lowercase)
    // Check both to support different response formats
    if (data.videoUrl) {
      return data.videoUrl;
    }
    if (data.url) {
      return data.url;
    }
    // Fallback: construct URL from key (if backend only returns key)
    // This assumes the bucket name and region are known
    throw new Error("Backend did not return video URL");
  } catch (error: any) {
    console.error("Error completing upload:", error);
    throw new Error(
      error.response?.data?.message ||
        "Failed to complete video upload. Please try again."
    );
  }
}

/**
 * Abort the multipart upload (cleanup on error/cancel)
 */
export async function abortUpload(
  uploadId: string,
  key: string
): Promise<void> {
  try {
    await api.post("/s3/videos/abort-upload", {
      uploadId,
      key,
    });
  } catch (error: any) {
    // Don't throw - cleanup is best effort
    // Log error but don't fail the whole operation
    if (error.response?.status !== 404) {
      // Only log non-404 errors (404 means the upload might not exist, which is fine)
      console.warn(
        "Error aborting upload (non-fatal):",
        error.response?.status || error.message
      );
    }
  }
}

/**
 * Main function to upload a video file to S3 using multipart upload
 */
export async function uploadVideoToS3(
  file: File,
  onProgress?: (progress: UploadProgress) => void
): Promise<string> {
  let uploadId: string | null = null;
  let key: string | null = null;

  try {
    // Step 1: Request upload session
    const session = await requestUploadSession(file.name, file.type, file.size);
    uploadId = session.uploadId;
    key = session.key;

    // Step 2: Upload all parts
    const parts = await uploadParts(file, session, onProgress);

    // Step 3: Complete the upload
    const videoUrl = await completeUpload(uploadId, key, parts);

    return videoUrl;
  } catch (error) {
    // Cleanup: abort the upload if it was started
    if (uploadId && key) {
      await abortUpload(uploadId, key);
    }
    throw error;
  }
}
