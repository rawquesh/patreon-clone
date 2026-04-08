import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  CreateMultipartUploadCommand,
  UploadPartCommand,
  GetObjectCommand,
  CompleteMultipartUploadCommand,
  CompletedPart,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

@Injectable()
export class S3Service {
  private s3Client: S3Client;

  constructor(private configService: ConfigService) {
    const endpoint = this.configService.get<string>('AWS_ENDPOINT_URL');
    this.s3Client = new S3Client({
      region: this.configService.get<string>('AWS_DEFAULT_REGION') || 'auto',
      credentials: {
        accessKeyId: this.configService.get<string>('AWS_ACCESS_KEY'),
        secretAccessKey: this.configService.get<string>('AWS_SECRET_KEY'),
      },
      ...(endpoint && {
        endpoint,
        // For S3-compatible services (MinIO, Railway, etc.)
        forcePathStyle: true,
      }),
    });
  }

  async uploadFile(
    file: Express.Multer.File,
    folder: string = 'profile-photos',
    bucket: string,
  ): Promise<string> {
    const fileName = `${folder}/${Date.now()}-${file.originalname.replace(/\s/g, '-')}`;

    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: fileName,
      Body: file.buffer,
      ContentType: file.mimetype,
      // Explicitly set ACL to ensure proper permissions
      // Note: This requires s3:PutObjectAcl permission if bucket has ACLs enabled
    });

    try {
      await this.s3Client.send(command);
      // Generate presigned URL for reading (valid for 7 days - AWS maximum)
      const presignedUrl = await this.getPresignedReadUrl(
        fileName,
        bucket,
        604800,
      );
      return presignedUrl;
    } catch (error) {
      // Enhanced error logging for debugging
      const errorMessage = error.message || 'Unknown error';
      const errorCode = error.$metadata?.httpStatusCode || 'N/A';
      const requestId = error.$metadata?.requestId || 'N/A';

      console.error('S3 Upload Error Details:', {
        bucket,
        key: fileName,
        errorMessage,
        errorCode,
        requestId,
        region: this.configService.get<string>('AWS_DEFAULT_REGION'),
        hasAccessKey: !!this.configService.get<string>('AWS_ACCESS_KEY'),
        hasSecretKey: !!this.configService.get<string>('AWS_SECRET_KEY'),
      });

      throw new Error(
        `Failed to upload file to S3: ${errorMessage} (Code: ${errorCode}, RequestId: ${requestId})`,
      );
    }
  }

  async deleteFile(fileUrl: string, bucket: string): Promise<void> {
    // Extract key from URL (handles both direct URLs and presigned URLs)
    let key: string;
    if (fileUrl.includes('.amazonaws.com/')) {
      // Standard AWS S3 URLs
      const urlPart = fileUrl.split('.amazonaws.com/')[1];
      key = urlPart.split('?')[0];
    } else {
      // S3-compatible endpoints (MinIO, Railway, etc.) — find the last path segment
      // Try to extract key after the bucket name or the last "/"
      try {
        const url = new URL(fileUrl.split('?')[0]);
        const pathParts = url.pathname.split('/').filter(Boolean);
        // If the first path part matches the bucket name, skip it
        key = pathParts[0] === bucket ? pathParts.slice(1).join('/') : pathParts.join('/');
      } catch {
        // If URL parsing fails, assume it's already a key
        key = fileUrl.split('?')[0];
      }
    }

    const command = new DeleteObjectCommand({
      Bucket: bucket,
      Key: key,
    });

    try {
      await this.s3Client.send(command);
    } catch (error) {
      throw new Error(`Failed to delete file from S3: ${error.message}`);
    }
  }

  async generatePresignedUrl(key: string, bucket: string): Promise<string> {
    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
    });

    try {
      return await getSignedUrl(this.s3Client, command, { expiresIn: 3600 });
    } catch (error) {
      throw new Error(`Failed to generate presigned URL: ${error.message}`);
    }
  }

  /**
   * Generate a presigned URL for reading/downloading a file from S3
   * @param key - S3 object key (file path)
   * @param bucket - S3 bucket name
   * @param expiresIn - URL expiration time in seconds (default: 1 hour)
   * @returns Presigned URL that can be used to access the file
   */
  async getPresignedReadUrl(
    key: string,
    bucket: string,
    expiresIn: number = 3600,
  ): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: key,
    });

    try {
      return await getSignedUrl(this.s3Client, command, { expiresIn });
    } catch (error) {
      throw new Error(
        `Failed to generate presigned read URL: ${error.message}`,
      );
    }
  }

  async createMultipartUploadSession(params: {
    fileName: string;
    fileType: string;
    fileSize: number;
    folder?: string;
    bucket: string;
    partSize?: number;
    expiresIn?: number;
  }): Promise<{
    uploadId: string;
    key: string;
    bucket: string;
    partSize: number;
    presignedUrls: { partNumber: number; url: string }[];
  }> {
    const {
      fileName,
      fileType,
      fileSize,
      folder = 'videos',
      bucket,
      expiresIn = 3600,
    } = params;

    if (!fileName || !fileType || !fileSize) {
      throw new Error('fileName, fileType and fileSize are required');
    }

    // Minimum 5MB per S3 multipart requirements, default to 10MB chunks
    const minPartSize = 5 * 1024 * 1024;
    const defaultPartSize = 10 * 1024 * 1024;
    let partSize = params.partSize || Math.max(minPartSize, defaultPartSize);

    // Adjust part size so total parts <= 10,000 (S3 limit)
    const maxParts = 10_000;
    const estimatedParts = Math.ceil(fileSize / partSize);
    if (estimatedParts > maxParts) {
      partSize = Math.ceil(fileSize / maxParts);
      if (partSize < minPartSize) {
        partSize = minPartSize;
      }
    }

    const sanitizedFileName = fileName.replace(/\s+/g, '-');
    const key = `${folder}/${Date.now()}-${sanitizedFileName}`;

    const createCommand = new CreateMultipartUploadCommand({
      Bucket: bucket,
      Key: key,
      ContentType: fileType,
    });

    let uploadId: string;
    try {
      const response = await this.s3Client.send(createCommand);
      uploadId = response.UploadId;
      if (!uploadId) {
        throw new Error('Failed to obtain uploadId from S3');
      }
    } catch (error) {
      throw new Error(
        `Failed to create multipart upload session: ${error.message}`,
      );
    }

    const totalParts = Math.ceil(fileSize / partSize);
    const presignedUrls: { partNumber: number; url: string }[] = [];

    try {
      for (let partNumber = 1; partNumber <= totalParts; partNumber++) {
        const uploadPartCommand = new UploadPartCommand({
          Bucket: bucket,
          Key: key,
          UploadId: uploadId,
          PartNumber: partNumber,
          Body: undefined, // Body is not needed for presigning
        });

        const url = await getSignedUrl(this.s3Client, uploadPartCommand, {
          expiresIn,
        });

        presignedUrls.push({ partNumber, url });
      }
    } catch (error) {
      throw new Error(
        `Failed to generate presigned part URLs: ${error.message}`,
      );
    }

    return {
      uploadId,
      key,
      bucket,
      partSize,
      presignedUrls,
    };
  }

  /**
   * Complete a multipart upload by assembling all uploaded parts
   * @param uploadId - The multipart upload ID from createMultipartUploadSession
   * @param key - The S3 object key (file path)
   * @param bucket - The S3 bucket name
   * @param parts - Array of parts with partNumber and eTag from upload responses
   * @returns Presigned URL to access the completed file (valid for 7 days)
   */
  async completeMultipartUpload(params: {
    uploadId: string;
    key: string;
    bucket: string;
    parts: { partNumber: number; eTag: string }[];
  }): Promise<string> {
    const { uploadId, key, bucket, parts } = params;

    if (!uploadId || !key || !bucket || !parts || parts.length === 0) {
      throw new Error('uploadId, key, bucket, and parts array are required');
    }

    // Sort parts by partNumber to ensure correct order
    const sortedParts = parts.sort((a, b) => a.partNumber - b.partNumber);

    // Convert to S3 CompletedPart format
    const completedParts: CompletedPart[] = sortedParts.map((part) => ({
      PartNumber: part.partNumber,
      ETag: part.eTag.startsWith('"') ? part.eTag : `"${part.eTag}"`, // Ensure ETag is quoted
    }));

    const command = new CompleteMultipartUploadCommand({
      Bucket: bucket,
      Key: key,
      UploadId: uploadId,
      MultipartUpload: {
        Parts: completedParts,
      },
    });

    try {
      const response = await this.s3Client.send(command);

      if (!response.Location) {
        throw new Error(
          'Failed to complete multipart upload - no location returned',
        );
      }

      // Generate presigned URL for reading the completed file (valid for 7 days)
      const presignedUrl = await this.getPresignedReadUrl(key, bucket, 604800);
      return presignedUrl;
    } catch (error) {
      throw new Error(`Failed to complete multipart upload: ${error.message}`);
    }
  }
}
