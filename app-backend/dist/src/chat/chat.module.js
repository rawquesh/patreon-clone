"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const chat_1 = require("../database/schemas/chat");
const chat_controller_1 = require("./chat.controller");
const chat_service_1 = require("./chat.service");
const chat_gateway_1 = require("./chat.gateway");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const user_1 = require("../database/schemas/user");
const membership_1 = require("../database/schemas/membership");
const subscription_1 = require("../database/schemas/subscription");
const s3_module_1 = require("../s3/s3.module");
const chat_uploads_controller_1 = require("./chat-uploads.controller");
const notifications_module_1 = require("../notifications/notifications.module");
let ChatModule = class ChatModule {
};
exports.ChatModule = ChatModule;
exports.ChatModule = ChatModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: chat_1.Chat.name, schema: chat_1.ChatSchema },
                { name: chat_1.ChatParticipant.name, schema: chat_1.ChatParticipantSchema },
                { name: chat_1.Message.name, schema: chat_1.MessageSchema },
                { name: user_1.User.name, schema: user_1.UserSchema },
                { name: membership_1.Membership.name, schema: membership_1.MembershipSchema },
                { name: subscription_1.Subscription.name, schema: subscription_1.SubscriptionSchema },
            ]),
            jwt_1.JwtModule.registerAsync({
                imports: [config_1.ConfigModule],
                useFactory: async (configService) => ({
                    secret: configService.get('JWT_SECRET'),
                    signOptions: { expiresIn: '1d' },
                }),
                inject: [config_1.ConfigService],
            }),
            s3_module_1.S3Module,
            notifications_module_1.NotificationsModule,
        ],
        controllers: [chat_controller_1.ChatController, chat_uploads_controller_1.ChatUploadsController],
        providers: [chat_service_1.ChatService, chat_gateway_1.ChatGateway],
        exports: [chat_service_1.ChatService],
    })
], ChatModule);
//# sourceMappingURL=chat.module.js.map