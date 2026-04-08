"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostsModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const posts_service_1 = require("./posts.service");
const posts_controller_1 = require("./posts.controller");
const post_1 = require("../database/schemas/post");
const s3_module_1 = require("../s3/s3.module");
const memberships_module_1 = require("../memberships/memberships.module");
const notifications_module_1 = require("../notifications/notifications.module");
const subscription_1 = require("../database/schemas/subscription");
const membership_1 = require("../database/schemas/membership");
const analytics_1 = require("../database/schemas/analytics");
const user_1 = require("../database/schemas/user");
let PostsModule = class PostsModule {
};
exports.PostsModule = PostsModule;
exports.PostsModule = PostsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: post_1.Post.name, schema: post_1.PostSchema },
                { name: subscription_1.Subscription.name, schema: subscription_1.SubscriptionSchema },
                { name: membership_1.Membership.name, schema: membership_1.MembershipSchema },
                { name: analytics_1.PostInsight.name, schema: analytics_1.PostInsightSchema },
                { name: user_1.User.name, schema: user_1.UserSchema },
            ]),
            s3_module_1.S3Module,
            memberships_module_1.MembershipsModule,
            notifications_module_1.NotificationsModule,
        ],
        providers: [posts_service_1.PostsService],
        controllers: [posts_controller_1.PostsController],
        exports: [posts_service_1.PostsService],
    })
], PostsModule);
//# sourceMappingURL=posts.module.js.map