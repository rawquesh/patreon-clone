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
var PushNotificationsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PushNotificationsService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const admin = require("firebase-admin");
const messaging_1 = require("firebase-admin/messaging");
const device_1 = require("../database/schemas/device");
let PushNotificationsService = PushNotificationsService_1 = class PushNotificationsService {
    constructor(deviceModel, configService) {
        this.deviceModel = deviceModel;
        this.configService = configService;
        this.logger = new common_1.Logger(PushNotificationsService_1.name);
        const firebaseServiceAccount = this.configService.get('FIREBASE_SERVICE_ACCOUNT_KEY_JSON');
        if (!firebaseServiceAccount) {
            this.logger.error('FIREBASE_SERVICE_ACCOUNT_KEY_JSON environment variable not set.');
            return;
        }
        try {
            const serviceAccount = JSON.parse(firebaseServiceAccount);
            if (admin.apps.length === 0) {
                admin.initializeApp({
                    credential: admin.credential.cert(serviceAccount),
                });
                this.logger.log('Firebase Admin SDK initialized successfully.');
            }
        }
        catch (error) {
            this.logger.error('Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY_JSON or initialize Firebase Admin SDK.', error.stack);
        }
    }
    async storeDeviceToken(userId, token) {
        console.log('storeDeviceToken', { userId });
        return this.deviceModel.findOneAndUpdate({ userId }, { token }, { upsert: true, new: true, setDefaultsOnInsert: true });
    }
    async sendPushNotification({ userId, title, body, data, }) {
        console.log({ userId, title, body, data });
        const devices = await this.deviceModel.find({ userId }).exec();
        const tokens = devices.map((device) => device.token);
        if (tokens.length === 0) {
            console.log('No devices found for this user.');
            return;
        }
        try {
            const response = await (0, messaging_1.getMessaging)().sendEachForMulticast({
                data,
                tokens,
                notification: {
                    title,
                    body,
                },
            });
            console.log('Successfully sent message:', response);
        }
        catch (error) {
            console.log('Error sending message:', error);
        }
    }
};
exports.PushNotificationsService = PushNotificationsService;
exports.PushNotificationsService = PushNotificationsService = PushNotificationsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(device_1.Device.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        config_1.ConfigService])
], PushNotificationsService);
//# sourceMappingURL=push-notifications.service.js.map