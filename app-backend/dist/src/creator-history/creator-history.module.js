"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreatorHistoryModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const creator_history_service_1 = require("./creator-history.service");
const creator_controller_1 = require("./creator.controller");
const user_1 = require("../database/schemas/user");
const engagement_1 = require("../database/schemas/engagement");
const subscription_1 = require("../database/schemas/subscription");
const posts_module_1 = require("../posts/posts.module");
const memberships_module_1 = require("../memberships/memberships.module");
const collections_module_1 = require("../collections/collections.module");
let CreatorHistoryModule = class CreatorHistoryModule {
};
exports.CreatorHistoryModule = CreatorHistoryModule;
exports.CreatorHistoryModule = CreatorHistoryModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: user_1.User.name, schema: user_1.UserSchema },
                { name: engagement_1.CreatorVisit.name, schema: engagement_1.CreatorVisitSchema },
                { name: subscription_1.Subscription.name, schema: subscription_1.SubscriptionSchema },
            ]),
            posts_module_1.PostsModule,
            memberships_module_1.MembershipsModule,
            collections_module_1.CollectionsModule,
        ],
        controllers: [creator_controller_1.CreatorController],
        providers: [creator_history_service_1.CreatorHistoryService],
        exports: [creator_history_service_1.CreatorHistoryService],
    })
], CreatorHistoryModule);
//# sourceMappingURL=creator-history.module.js.map