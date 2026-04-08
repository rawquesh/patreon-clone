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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.S3Controller = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const s3_service_1 = require("./s3.service");
class CreateVideoUploadSessionDto {
}
class CompleteVideoUploadDto {
}
let S3Controller = class S3Controller {
    constructor(s3Service) {
        this.s3Service = s3Service;
    }
    async createVideoUploadSession(body) {
        console.log(body);
        const { fileName, fileType, fileSize } = body;
        if (!fileName || !fileType || !fileSize) {
            throw new common_1.BadRequestException('fileName, fileType and fileSize are required');
        }
        try {
            const result = await this.s3Service.createMultipartUploadSession({
                fileName,
                fileType,
                fileSize,
                bucket: 'patreon-clone-assets',
                folder: 'videos',
            });
            console.log(result);
            return result;
        }
        catch (error) {
            throw new common_1.BadRequestException(`Failed to create upload session: ${error.message}`);
        }
    }
    async completeVideoUpload(body) {
        console.log({ body });
        const { uploadId, key, parts } = body;
        if (!uploadId || !key || !parts || parts.length === 0) {
            throw new common_1.BadRequestException('uploadId, key, bucket, and parts array are required');
        }
        const bucket = 'patreon-clone-assets';
        try {
            const videoUrl = await this.s3Service.completeMultipartUpload({
                uploadId,
                key,
                bucket,
                parts,
            });
            return {
                videoUrl,
                message: 'Video upload completed successfully',
            };
        }
        catch (error) {
            console.log(error);
            throw new common_1.BadRequestException(`Failed to complete upload: ${error.message}`);
        }
    }
};
exports.S3Controller = S3Controller;
__decorate([
    (0, common_1.Post)('videos/upload-session'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [CreateVideoUploadSessionDto]),
    __metadata("design:returntype", Promise)
], S3Controller.prototype, "createVideoUploadSession", null);
__decorate([
    (0, common_1.Post)('videos/complete-upload'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [CompleteVideoUploadDto]),
    __metadata("design:returntype", Promise)
], S3Controller.prototype, "completeVideoUpload", null);
exports.S3Controller = S3Controller = __decorate([
    (0, common_1.Controller)('s3'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __metadata("design:paramtypes", [s3_service_1.S3Service])
], S3Controller);
//# sourceMappingURL=s3.controller.js.map