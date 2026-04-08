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
exports.ChatController = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const chat_service_1 = require("./chat.service");
const chat_dto_1 = require("./chat.dto");
const platform_express_1 = require("@nestjs/platform-express");
const chat_gateway_1 = require("./chat.gateway");
let ChatController = class ChatController {
    constructor(chatService, chatGateway) {
        this.chatService = chatService;
        this.chatGateway = chatGateway;
    }
    async createGroupChat(req, createChatDto) {
        return this.chatService.createGroupChat(req.user.userId, createChatDto);
    }
    async createDirectChat(req, createChatDto) {
        return this.chatService.createDirectChat(req.user.userId, createChatDto);
    }
    async getUserChats(req) {
        return this.chatService.getUserChats(req.user.userId);
    }
    async getChat(req, id) {
        return this.chatService.getChat(req.user.userId, id);
    }
    async updateGroupChat(req, id, updateChatDto) {
        return this.chatService.updateGroupChat(req.user.userId, id, updateChatDto);
    }
    async deleteChat(req, id) {
        return this.chatService.deleteChat(req.user.userId, id);
    }
    async sendMessage(req, chatId, sendMessageDtoBody, attachment) {
        if (!sendMessageDtoBody?.content && !attachment) {
            throw new common_1.BadRequestException('Message content or attachment is required');
        }
        const messageDto = await this.chatService.sendMessage(req.user.userId, chatId, sendMessageDtoBody, attachment);
        if (messageDto) {
            this.chatGateway.broadcastNewMessage(chatId, messageDto);
        }
        return messageDto;
    }
    async getMessages(req, id, query) {
        return this.chatService.getMessages(req.user.userId, id, query);
    }
    async getMessageDates(req, id, query) {
        return this.chatService.getMessageDates(req.user.userId, id, query);
    }
    async markMessagesAsRead(req, id, markReadDto) {
        return this.chatService.markMessagesAsRead(req.user.userId, id, markReadDto);
    }
    async joinChat(req, id) {
        return this.chatService.joinChat(req.user.userId, id);
    }
    async leaveChat(req, id) {
        return this.chatService.leaveChat(req.user.userId, id);
    }
    async getTotalUnreadCount(req) {
        const count = await this.chatService.getTotalUnreadCount(req.user.userId);
        return { count };
    }
};
exports.ChatController = ChatController;
__decorate([
    (0, common_1.Post)('group'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)(new common_1.ValidationPipe())),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, chat_dto_1.CreateGroupChatDto]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "createGroupChat", null);
__decorate([
    (0, common_1.Post)('direct'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)(new common_1.ValidationPipe())),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, chat_dto_1.CreateDirectChatDto]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "createDirectChat", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "getUserChats", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "getChat", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)(new common_1.ValidationPipe())),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, chat_dto_1.UpdateGroupChatDto]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "updateGroupChat", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "deleteChat", null);
__decorate([
    (0, common_1.Post)(':id/messages'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('attachment', {
        limits: { fileSize: 10 * 1024 * 1024 },
    })),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)(new common_1.ValidationPipe())),
    __param(3, (0, common_1.UploadedFile)(new common_1.ParseFilePipe({
        validators: [
            new common_1.MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 }),
            new common_1.FileTypeValidator({
                fileType: /(jpg|jpeg|png|gif|pdf|doc|docx|txt|mp3|m4a|aac|mp4|mov|avi|webp)$/i,
            }),
        ],
        fileIsRequired: false,
        exceptionFactory: (error) => {
            if (error.includes('Expected a file')) {
                return new common_1.BadRequestException('File upload failed: Unexpected error during file processing.');
            }
            return new common_1.BadRequestException(`File validation failed: ${error}`);
        },
    }))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, chat_dto_1.SendMessageDto, Object]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "sendMessage", null);
__decorate([
    (0, common_1.Get)(':id/messages'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Query)(new common_1.ValidationPipe({ transform: true }))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, chat_dto_1.GetMessagesQueryDto]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "getMessages", null);
__decorate([
    (0, common_1.Get)(':id/message-dates'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Query)(new common_1.ValidationPipe({ transform: true }))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, chat_dto_1.GetMessageDatesQueryDto]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "getMessageDates", null);
__decorate([
    (0, common_1.Post)(':id/read'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)(new common_1.ValidationPipe())),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, chat_dto_1.MarkMessagesReadDto]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "markMessagesAsRead", null);
__decorate([
    (0, common_1.Post)(':id/join'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "joinChat", null);
__decorate([
    (0, common_1.Post)(':id/leave'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "leaveChat", null);
__decorate([
    (0, common_1.Get)('unread/count'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "getTotalUnreadCount", null);
exports.ChatController = ChatController = __decorate([
    (0, common_1.Controller)('chat'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __param(1, (0, common_1.Inject)((0, common_1.forwardRef)(() => chat_gateway_1.ChatGateway))),
    __metadata("design:paramtypes", [chat_service_1.ChatService,
        chat_gateway_1.ChatGateway])
], ChatController);
//# sourceMappingURL=chat.controller.js.map