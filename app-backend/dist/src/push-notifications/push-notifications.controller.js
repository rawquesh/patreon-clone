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
exports.PushNotificationsController = void 0;
const common_1 = require("@nestjs/common");
const push_notifications_service_1 = require("./push-notifications.service");
let PushNotificationsController = class PushNotificationsController {
    constructor(pushNotificationsService) {
        this.pushNotificationsService = pushNotificationsService;
    }
    storeToken(body) {
        return this.pushNotificationsService.storeDeviceToken(body.userId, body.token);
    }
    sendNotification(body) {
        return this.pushNotificationsService.sendPushNotification({
            userId: body.userId,
            title: body.title,
            body: body.body,
            data: {},
        });
    }
};
exports.PushNotificationsController = PushNotificationsController;
__decorate([
    (0, common_1.Post)('store-token'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PushNotificationsController.prototype, "storeToken", null);
__decorate([
    (0, common_1.Post)('send'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PushNotificationsController.prototype, "sendNotification", null);
exports.PushNotificationsController = PushNotificationsController = __decorate([
    (0, common_1.Controller)('push-notifications'),
    __metadata("design:paramtypes", [push_notifications_service_1.PushNotificationsService])
], PushNotificationsController);
//# sourceMappingURL=push-notifications.controller.js.map