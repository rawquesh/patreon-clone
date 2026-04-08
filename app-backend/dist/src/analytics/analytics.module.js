"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const analytics_controller_1 = require("./analytics.controller");
const analytics_service_1 = require("./analytics.service");
const analytics_tracker_service_1 = require("./analytics-tracker.service");
const analytics_1 = require("../database/schemas/analytics");
const user_1 = require("../database/schemas/user");
const post_1 = require("../database/schemas/post");
const membership_1 = require("../database/schemas/membership");
const subscription_1 = require("../database/schemas/subscription");
const payout_1 = require("../database/schemas/payout");
const payments_module_1 = require("../payments/payments.module");
let AnalyticsModule = class AnalyticsModule {
};
exports.AnalyticsModule = AnalyticsModule;
exports.AnalyticsModule = AnalyticsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: analytics_1.MembershipInsight.name, schema: analytics_1.MembershipInsightSchema },
                { name: analytics_1.EarningsInsight.name, schema: analytics_1.EarningsInsightSchema },
                { name: analytics_1.PostInsight.name, schema: analytics_1.PostInsightSchema },
                { name: user_1.User.name, schema: user_1.UserSchema },
                { name: post_1.Post.name, schema: post_1.PostSchema },
                { name: membership_1.Membership.name, schema: membership_1.MembershipSchema },
                { name: subscription_1.Subscription.name, schema: subscription_1.SubscriptionSchema },
                { name: payout_1.PayoutRequest.name, schema: payout_1.PayoutRequestSchema },
            ]),
            payments_module_1.PaymentsModule,
        ],
        controllers: [analytics_controller_1.AnalyticsController],
        providers: [analytics_service_1.AnalyticsService, analytics_tracker_service_1.AnalyticsTrackerService],
        exports: [analytics_service_1.AnalyticsService],
    })
], AnalyticsModule);
//# sourceMappingURL=analytics.module.js.map