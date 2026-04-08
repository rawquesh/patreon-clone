import { S3Service } from './s3.service';
declare class CreateVideoUploadSessionDto {
    fileName: string;
    fileType: string;
    fileSize: number;
    parts?: number;
}
declare class CompleteVideoUploadDto {
    uploadId: string;
    key: string;
    bucket: string;
    parts: {
        partNumber: number;
        eTag: string;
    }[];
}
export declare class S3Controller {
    private readonly s3Service;
    constructor(s3Service: S3Service);
    createVideoUploadSession(body: CreateVideoUploadSessionDto): Promise<{
        uploadId: string;
        key: string;
        bucket: string;
        partSize: number;
        presignedUrls: {
            partNumber: number;
            url: string;
        }[];
    }>;
    completeVideoUpload(body: CompleteVideoUploadDto): Promise<{
        videoUrl: string;
        message: string;
    }>;
}
export {};
