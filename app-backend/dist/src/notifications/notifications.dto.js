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
exports.UpdateMemberNotificationSettingsDto = exports.UpdateCreatorNotificationSettingsDto = exports.NotificationResponseDto = exports.CommentDto = exports.NotificationPostDto = exports.NotificationActorDto = exports.MarkReadDto = exports.NotificationFilterDto = exports.CreateNotificationDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const notification_1 = require("../database/schemas/notification");
class CreateNotificationDto {
}
exports.CreateNotificationDto = CreateNotificationDto;
__decorate([
    (0, class_validator_1.IsMongoId)(),
    __metadata("design:type", String)
], CreateNotificationDto.prototype, "recipient", void 0);
__decorate([
    (0, class_validator_1.IsMongoId)(),
    __metadata("design:type", String)
], CreateNotificationDto.prototype, "actor", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(notification_1.NotificationType),
    __metadata("design:type", String)
], CreateNotificationDto.prototype, "type", void 0);
__decorate([
    (0, class_validator_1.IsMongoId)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateNotificationDto.prototype, "post", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateNotificationDto.prototype, "comment", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateNotificationDto.prototype, "link", void 0);
__decorate([
    (0, class_validator_1.IsObject)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], CreateNotificationDto.prototype, "metadata", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsEnum)(['creator', 'member']),
    __metadata("design:type", String)
], CreateNotificationDto.prototype, "userMode", void 0);
class NotificationFilterDto {
    constructor() {
        this.page = 1;
        this.limit = 10;
    }
}
exports.NotificationFilterDto = NotificationFilterDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    (0, class_transformer_1.Type)(() => Boolean),
    __metadata("design:type", Boolean)
], NotificationFilterDto.prototype, "unreadOnly", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsEnum)(notification_1.NotificationType, { each: true }),
    __metadata("design:type", Array)
], NotificationFilterDto.prototype, "type", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], NotificationFilterDto.prototype, "page", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], NotificationFilterDto.prototype, "limit", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsEnum)(['creator', 'member']),
    __metadata("design:type", String)
], NotificationFilterDto.prototype, "userMode", void 0);
class MarkReadDto {
}
exports.MarkReadDto = MarkReadDto;
__decorate([
    (0, class_validator_1.IsMongoId)({ each: true }),
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], MarkReadDto.prototype, "ids", void 0);
class NotificationActorDto {
}
exports.NotificationActorDto = NotificationActorDto;
class NotificationPostDto {
}
exports.NotificationPostDto = NotificationPostDto;
class CommentDto {
}
exports.CommentDto = CommentDto;
class NotificationResponseDto {
}
exports.NotificationResponseDto = NotificationResponseDto;
class UpdateCreatorNotificationSettingsDto {
}
exports.UpdateCreatorNotificationSettingsDto = UpdateCreatorNotificationSettingsDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateCreatorNotificationSettingsDto.prototype, "creatorNotifyOnNewMember", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateCreatorNotificationSettingsDto.prototype, "creatorNotifyOnComments", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateCreatorNotificationSettingsDto.prototype, "creatorNotifyOnDirectMessages", void 0);
class UpdateMemberNotificationSettingsDto {
}
exports.UpdateMemberNotificationSettingsDto = UpdateMemberNotificationSettingsDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateMemberNotificationSettingsDto.prototype, "memberNotifyOnNewPost", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateMemberNotificationSettingsDto.prototype, "memberNotifyOnDirectMessages", void 0);
//# sourceMappingURL=notifications.dto.js.map