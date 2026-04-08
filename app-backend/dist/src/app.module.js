"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const users_module_1 = require("./users/users.module");
const auth_module_1 = require("./auth/auth.module");
const config_1 = require("@nestjs/config");
const mongoose_1 = require("@nestjs/mongoose");
const s3_module_1 = require("./s3/s3.module");
const posts_module_1 = require("./posts/posts.module");
const collections_module_1 = require("./collections/collections.module");
const platform_express_1 = require("@nestjs/platform-express");
const memberships_module_1 = require("./memberships/memberships.module");
const payments_module_1 = require("./payments/payments.module");
const members_module_1 = require("./members/members.module");
const analytics_module_1 = require("./analytics/analytics.module");
const notifications_module_1 = require("./notifications/notifications.module");
const promotions_module_1 = require("./promotions/promotions.module");
const chat_module_1 = require("./chat/chat.module");
const search_module_1 = require("./search/search.module");
const home_module_1 = require("./home/home.module");
const creator_history_module_1 = require("./creator-history/creator-history.module");
const webhooks_module_1 = require("./webhooks/webhooks.module");
const push_notifications_module_1 = require("./push-notifications/push-notifications.module");
const reports_module_1 = require("./reports/reports.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot(),
            mongoose_1.MongooseModule.forRoot(process.env.MONGODB_URI),
            users_module_1.UsersModule,
            auth_module_1.AuthModule,
            s3_module_1.S3Module,
            posts_module_1.PostsModule,
            collections_module_1.CollectionsModule,
            platform_express_1.MulterModule.register({
                limits: {
                    fileSize: 1000 * 1024 * 1024,
                },
            }),
            memberships_module_1.MembershipsModule,
            payments_module_1.PaymentsModule,
            members_module_1.MembersModule,
            analytics_module_1.AnalyticsModule,
            notifications_module_1.NotificationsModule,
            promotions_module_1.PromotionsModule,
            chat_module_1.ChatModule,
            search_module_1.SearchModule,
            home_module_1.HomeModule,
            creator_history_module_1.CreatorHistoryModule,
            webhooks_module_1.WebhooksModule,
            push_notifications_module_1.PushNotificationsModule,
            reports_module_1.ReportsModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [app_service_1.AppService],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map