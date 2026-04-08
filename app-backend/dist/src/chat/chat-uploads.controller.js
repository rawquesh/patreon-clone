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
exports.ChatUploadsController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const s3_service_1 = require("../s3/s3.service");
const passport_1 = require("@nestjs/passport");
const chat_service_1 = require("./chat.service");
let ChatUploadsController = class ChatUploadsController {
    constructor(s3Service, chatService) {
        this.s3Service = s3Service;
        this.chatService = chatService;
    }
    async uploadAttachment(req, chatId, file) {
        if (!file) {
            throw new common_1.BadRequestException('No file uploaded');
        }
        try {
            const hasAccess = await this.chatService.checkChatAccess(req.user.userId, chatId);
            if (!hasAccess) {
                throw new common_1.BadRequestException('You do not have access to this chat');
            }
            const fileUrl = await this.s3Service.uploadFile(file, `chats/${chatId}/${new Date().toISOString()}-${file.originalname}`, 'patreon-clone-assets');
            return {
                success: true,
                fileUrl,
                fileName: file.originalname,
                fileType: file.mimetype,
                fileSize: file.size,
            };
        }
        catch (error) {
            throw new common_1.BadRequestException(`Failed to upload attachment: ${error.message}`);
        }
    }
};
exports.ChatUploadsController = ChatUploadsController;
__decorate([
    (0, common_1.Post)(':chatId'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', {
        limits: { fileSize: 10 * 1024 * 1024 },
    })),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('chatId')),
    __param(2, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], ChatUploadsController.prototype, "uploadAttachment", null);
exports.ChatUploadsController = ChatUploadsController = __decorate([
    (0, common_1.Controller)('chat-uploads'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __metadata("design:paramtypes", [s3_service_1.S3Service,
        chat_service_1.ChatService])
], ChatUploadsController);
//# sourceMappingURL=chat-uploads.controller.js.map