"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.S3Service = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const client_s3_1 = require("@aws-sdk/client-s3");
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
let S3Service = class S3Service {
    constructor(configService) {
        this.configService = configService;
        const endpoint = this.configService.get('AWS_ENDPOINT_URL');
        this.s3Client = new client_s3_1.S3Client({
            region: this.configService.get('AWS_DEFAULT_REGION') || 'auto',
            credentials: {
                accessKeyId: this.configService.get('AWS_ACCESS_KEY'),
                secretAccessKey: this.configService.get('AWS_SECRET_KEY'),
            },
            ...(endpoint && {
                endpoint,
                forcePathStyle: true,
            }),
        });
    }
    async uploadFile(file, folder = 'profile-photos', bucket) {
        const fileName = `${folder}/${Date.now()}-${file.originalname.replace(/\s/g, '-')}`;
        const command = new client_s3_1.PutObjectCommand({
            Bucket: bucket,
            Key: fileName,
            Body: file.buffer,
            ContentType: file.mimetype,
        });
        try {
            await this.s3Client.send(command);
            const presignedUrl = await this.getPresignedReadUrl(fileName, bucket, 604800);
            return presignedUrl;
        }
        catch (error) {
            const errorMessage = error.message || 'Unknown error';
            const errorCode = error.$metadata?.httpStatusCode || 'N/A';
            const requestId = error.$metadata?.requestId || 'N/A';
            console.error('S3 Upload Error Details:', {
                bucket,
                key: fileName,
                errorMessage,
                errorCode,
                requestId,
                region: this.configService.get('AWS_DEFAULT_REGION'),
                hasAccessKey: !!this.configService.get('AWS_ACCESS_KEY'),
                hasSecretKey: !!this.configService.get('AWS_SECRET_KEY'),
            });
            throw new Error(`Failed to upload file to S3: ${errorMessage} (Code: ${errorCode}, RequestId: ${requestId})`);
        }
    }
    async deleteFile(fileUrl, bucket) {
        let key;
        if (fileUrl.includes('.amazonaws.com/')) {
            const urlPart = fileUrl.split('.amazonaws.com/')[1];
            key = urlPart.split('?')[0];
        }
        else {
            try {
                const url = new URL(fileUrl.split('?')[0]);
                const pathParts = url.pathname.split('/').filter(Boolean);
                key = pathParts[0] === bucket ? pathParts.slice(1).join('/') : pathParts.join('/');
            }
            catch {
                key = fileUrl.split('?')[0];
            }
        }
        const command = new client_s3_1.DeleteObjectCommand({
            Bucket: bucket,
            Key: key,
        });
        try {
            await this.s3Client.send(command);
        }
        catch (error) {
            throw new Error(`Failed to delete file from S3: ${error.message}`);
        }
    }
    async generatePresignedUrl(key, bucket) {
        const command = new client_s3_1.PutObjectCommand({
            Bucket: bucket,
            Key: key,
        });
        try {
            return await (0, s3_request_presigner_1.getSignedUrl)(this.s3Client, command, { expiresIn: 3600 });
        }
        catch (error) {
            throw new Error(`Failed to generate presigned URL: ${error.message}`);
        }
    }
    async getPresignedReadUrl(key, bucket, expiresIn = 3600) {
        const command = new client_s3_1.GetObjectCommand({
            Bucket: bucket,
            Key: key,
        });
        try {
            return await (0, s3_request_presigner_1.getSignedUrl)(this.s3Client, command, { expiresIn });
        }
        catch (error) {
            throw new Error(`Failed to generate presigned read URL: ${error.message}`);
        }
    }
    async createMultipartUploadSession(params) {
        const { fileName, fileType, fileSize, folder = 'videos', bucket, expiresIn = 3600, } = params;
        if (!fileName || !fileType || !fileSize) {
            throw new Error('fileName, fileType and fileSize are required');
        }
        const minPartSize = 5 * 1024 * 1024;
        const defaultPartSize = 10 * 1024 * 1024;
        let partSize = params.partSize || Math.max(minPartSize, defaultPartSize);
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
        const createCommand = new client_s3_1.CreateMultipartUploadCommand({
            Bucket: bucket,
            Key: key,
            ContentType: fileType,
        });
        let uploadId;
        try {
            const response = await this.s3Client.send(createCommand);
            uploadId = response.UploadId;
            if (!uploadId) {
                throw new Error('Failed to obtain uploadId from S3');
            }
        }
        catch (error) {
            throw new Error(`Failed to create multipart upload session: ${error.message}`);
        }
        const totalParts = Math.ceil(fileSize / partSize);
        const presignedUrls = [];
        try {
            for (let partNumber = 1; partNumber <= totalParts; partNumber++) {
                const uploadPartCommand = new client_s3_1.UploadPartCommand({
                    Bucket: bucket,
                    Key: key,
                    UploadId: uploadId,
                    PartNumber: partNumber,
                    Body: undefined,
                });
                const url = await (0, s3_request_presigner_1.getSignedUrl)(this.s3Client, uploadPartCommand, {
                    expiresIn,
                });
                presignedUrls.push({ partNumber, url });
            }
        }
        catch (error) {
            throw new Error(`Failed to generate presigned part URLs: ${error.message}`);
        }
        return {
            uploadId,
            key,
            bucket,
            partSize,
            presignedUrls,
        };
    }
    async completeMultipartUpload(params) {
        const { uploadId, key, bucket, parts } = params;
        if (!uploadId || !key || !bucket || !parts || parts.length === 0) {
            throw new Error('uploadId, key, bucket, and parts array are required');
        }
        const sortedParts = parts.sort((a, b) => a.partNumber - b.partNumber);
        const completedParts = sortedParts.map((part) => ({
            PartNumber: part.partNumber,
            ETag: part.eTag.startsWith('"') ? part.eTag : `"${part.eTag}"`,
        }));
        const command = new client_s3_1.CompleteMultipartUploadCommand({
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
                throw new Error('Failed to complete multipart upload - no location returned');
            }
            const presignedUrl = await this.getPresignedReadUrl(key, bucket, 604800);
            return presignedUrl;
        }
        catch (error) {
            throw new Error(`Failed to complete multipart upload: ${error.message}`);
        }
    }
};
exports.S3Service = S3Service;
exports.S3Service = S3Service = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], S3Service);
//# sourceMappingURL=s3.service.js.map