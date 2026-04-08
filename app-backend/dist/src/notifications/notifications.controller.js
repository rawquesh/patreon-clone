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
exports.NotificationsController = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const notifications_service_1 = require("./notifications.service");
const notifications_dto_1 = require("./notifications.dto");
const users_service_1 = require("../users/users.service");
let NotificationsController = class NotificationsController {
    constructor(notificationsService, usersService) {
        this.notificationsService = notificationsService;
        this.usersService = usersService;
    }
    async getNotifications(req, filterDto) {
        const userId = req.user.userId;
        return this.notificationsService.findAllForUser(userId, filterDto);
    }
    async getUnreadCount(req) {
        const count = await this.notificationsService.getUnreadCount(req.user.userId);
        return { count };
    }
    async markAsRead(req, markReadDto) {
        const success = await this.notificationsService.markAsRead(req.user.userId, markReadDto.ids);
        return { success };
    }
    async markAllAsRead(req) {
        const success = await this.notificationsService.markAllAsRead(req.user.userId);
        return { success };
    }
    async deleteNotification(req, id) {
        const success = await this.notificationsService.deleteNotification(req.user.userId, id);
        return { success };
    }
    async getNotificationSettings(req) {
        const user = await this.usersService.findById(req.user.userId);
        return {
            creatorSettings: {
                creatorNotifyOnNewMember: user.creatorNotifyOnNewMember,
                creatorNotifyOnComments: user.creatorNotifyOnComments,
                creatorNotifyOnDirectMessages: user.creatorNotifyOnDirectMessages,
            },
            memberSettings: {
                memberNotifyOnNewPost: user.memberNotifyOnNewPost,
                memberNotifyOnDirectMessages: user.memberNotifyOnDirectMessages,
            },
        };
    }
    async updateCreatorNotificationSettings(req, settingsDto) {
        const updatedUser = await this.usersService.updateNotificationSettings(req.user.userId, settingsDto);
        return {
            creatorNotifyOnNewMember: updatedUser.creatorNotifyOnNewMember,
            creatorNotifyOnComments: updatedUser.creatorNotifyOnComments,
            creatorNotifyOnDirectMessages: updatedUser.creatorNotifyOnDirectMessages,
        };
    }
    async updateMemberNotificationSettings(req, settingsDto) {
        const updatedUser = await this.usersService.updateNotificationSettings(req.user.userId, settingsDto);
        return {
            memberNotifyOnNewPost: updatedUser.memberNotifyOnNewPost,
            memberNotifyOnDirectMessages: updatedUser.memberNotifyOnDirectMessages,
        };
    }
};
exports.NotificationsController = NotificationsController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)(new common_1.ValidationPipe({ transform: true }))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, notifications_dto_1.NotificationFilterDto]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "getNotifications", null);
__decorate([
    (0, common_1.Get)('count'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "getUnreadCount", null);
__decorate([
    (0, common_1.Post)('mark-read'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, notifications_dto_1.MarkReadDto]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "markAsRead", null);
__decorate([
    (0, common_1.Post)('mark-all-read'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "markAllAsRead", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "deleteNotification", null);
__decorate([
    (0, common_1.Get)('settings'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "getNotificationSettings", null);
__decorate([
    (0, common_1.Put)('settings/creator'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, notifications_dto_1.UpdateCreatorNotificationSettingsDto]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "updateCreatorNotificationSettings", null);
__decorate([
    (0, common_1.Put)('settings/member'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, notifications_dto_1.UpdateMemberNotificationSettingsDto]),
    __metadata("design:returntype", Promise)
], NotificationsController.prototype, "updateMemberNotificationSettings", null);
exports.NotificationsController = NotificationsController = __decorate([
    (0, common_1.Controller)('notifications'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __metadata("design:paramtypes", [notifications_service_1.NotificationsService,
        users_service_1.UsersService])
], NotificationsController);
//# sourceMappingURL=notifications.controller.js.map