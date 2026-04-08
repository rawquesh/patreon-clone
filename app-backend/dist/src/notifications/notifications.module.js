"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationsModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const notifications_controller_1 = require("./notifications.controller");
const notifications_service_1 = require("./notifications.service");
const notification_generator_service_1 = require("./notification-generator.service");
const notification_1 = require("../database/schemas/notification");
const post_1 = require("../database/schemas/post");
const user_1 = require("../database/schemas/user");
const subscription_1 = require("../database/schemas/subscription");
const push_notifications_module_1 = require("../push-notifications/push-notifications.module");
const users_module_1 = require("../users/users.module");
let NotificationsModule = class NotificationsModule {
};
exports.NotificationsModule = NotificationsModule;
exports.NotificationsModule = NotificationsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: notification_1.Notification.name, schema: notification_1.NotificationSchema },
                { name: post_1.Post.name, schema: post_1.PostSchema },
                { name: user_1.User.name, schema: user_1.UserSchema },
                { name: subscription_1.Subscription.name, schema: subscription_1.SubscriptionSchema },
            ]),
            push_notifications_module_1.PushNotificationsModule,
            (0, common_1.forwardRef)(() => users_module_1.UsersModule),
        ],
        controllers: [notifications_controller_1.NotificationsController],
        providers: [notifications_service_1.NotificationsService, notification_generator_service_1.NotificationGeneratorService],
        exports: [notifications_service_1.NotificationsService, notification_generator_service_1.NotificationGeneratorService],
    })
], NotificationsModule);
//# sourceMappingURL=notifications.module.js.map