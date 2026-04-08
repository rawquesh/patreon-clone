"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PushNotificationsModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const device_1 = require("../database/schemas/device");
const push_notifications_controller_1 = require("./push-notifications.controller");
const push_notifications_service_1 = require("./push-notifications.service");
const config_1 = require("@nestjs/config");
let PushNotificationsModule = class PushNotificationsModule {
};
exports.PushNotificationsModule = PushNotificationsModule;
exports.PushNotificationsModule = PushNotificationsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([{ name: device_1.Device.name, schema: device_1.DeviceSchema }]),
            config_1.ConfigModule,
        ],
        controllers: [push_notifications_controller_1.PushNotificationsController],
        providers: [push_notifications_service_1.PushNotificationsService],
        exports: [push_notifications_service_1.PushNotificationsService],
    })
], PushNotificationsModule);
//# sourceMappingURL=push-notifications.module.js.map