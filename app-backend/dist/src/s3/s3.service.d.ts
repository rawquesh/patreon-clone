import { ConfigService } from '@nestjs/config';
export declare class S3Service {
    private configService;
    private s3Client;
    constructor(configService: ConfigService);
    uploadFile(file: Express.Multer.File, folder: string, bucket: string): Promise<string>;
    deleteFile(fileUrl: string, bucket: string): Promise<void>;
    generatePresignedUrl(key: string, bucket: string): Promise<string>;
    getPresignedReadUrl(key: string, bucket: string, expiresIn?: number): Promise<string>;
    createMultipartUploadSession(params: {
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
        presignedUrls: {
            partNumber: number;
            url: string;
        }[];
    }>;
    completeMultipartUpload(params: {
        uploadId: string;
        key: string;
        bucket: string;
        parts: {
            partNumber: number;
            eTag: string;
        }[];
    }): Promise<string>;
}
