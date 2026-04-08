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
exports.ChatListItemDto = exports.ChatDto = exports.MessageDatesResponse = exports.GetMessageDatesQueryDto = exports.MessagesResponse = exports.MessageDto = exports.AttachmentDto = exports.ChatParticipantDto = exports.MarkMessagesReadDto = exports.GetMessagesQueryDto = exports.SendMessageDto = exports.UpdateGroupChatDto = exports.CreateDirectChatDto = exports.CreateGroupChatDto = void 0;
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const chat_1 = require("../database/schemas/chat");
class CreateGroupChatDto {
}
exports.CreateGroupChatDto = CreateGroupChatDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateGroupChatDto.prototype, "title", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateGroupChatDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(chat_1.ChatAccessType),
    __metadata("design:type", String)
], CreateGroupChatDto.prototype, "accessType", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsMongoId)({ each: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], CreateGroupChatDto.prototype, "accessTiers", void 0);
class CreateDirectChatDto {
}
exports.CreateDirectChatDto = CreateDirectChatDto;
__decorate([
    (0, class_validator_1.IsMongoId)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateDirectChatDto.prototype, "participantId", void 0);
__decorate([
    (0, class_validator_1.IsMongoId)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateDirectChatDto.prototype, "creatorId", void 0);
class UpdateGroupChatDto {
}
exports.UpdateGroupChatDto = UpdateGroupChatDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateGroupChatDto.prototype, "title", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateGroupChatDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(chat_1.ChatAccessType),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateGroupChatDto.prototype, "accessType", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsMongoId)({ each: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], UpdateGroupChatDto.prototype, "accessTiers", void 0);
class SendMessageDto {
}
exports.SendMessageDto = SendMessageDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], SendMessageDto.prototype, "content", void 0);
class GetMessagesQueryDto {
    constructor() {
        this.limit = 20;
    }
}
exports.GetMessagesQueryDto = GetMessagesQueryDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], GetMessagesQueryDto.prototype, "limit", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GetMessagesQueryDto.prototype, "before", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GetMessagesQueryDto.prototype, "after", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GetMessagesQueryDto.prototype, "beforeDate", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GetMessagesQueryDto.prototype, "afterDate", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Boolean),
    __metadata("design:type", Boolean)
], GetMessagesQueryDto.prototype, "includeGrouping", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Boolean),
    __metadata("design:type", Boolean)
], GetMessagesQueryDto.prototype, "initialLoad", void 0);
class MarkMessagesReadDto {
}
exports.MarkMessagesReadDto = MarkMessagesReadDto;
__decorate([
    (0, class_validator_1.IsMongoId)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], MarkMessagesReadDto.prototype, "lastReadMessageId", void 0);
class ChatParticipantDto {
}
exports.ChatParticipantDto = ChatParticipantDto;
class AttachmentDto {
}
exports.AttachmentDto = AttachmentDto;
class MessageDto {
}
exports.MessageDto = MessageDto;
class MessagesResponse {
}
exports.MessagesResponse = MessagesResponse;
class GetMessageDatesQueryDto {
}
exports.GetMessageDatesQueryDto = GetMessageDatesQueryDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GetMessageDatesQueryDto.prototype, "startDate", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GetMessageDatesQueryDto.prototype, "endDate", void 0);
class MessageDatesResponse {
}
exports.MessageDatesResponse = MessageDatesResponse;
class ChatDto {
}
exports.ChatDto = ChatDto;
class ChatListItemDto {
}
exports.ChatListItemDto = ChatListItemDto;
//# sourceMappingURL=chat.dto.js.map