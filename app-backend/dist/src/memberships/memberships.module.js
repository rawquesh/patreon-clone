"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MembershipsModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const memberships_service_1 = require("./memberships.service");
const memberships_controller_1 = require("./memberships.controller");
const user_1 = require("../database/schemas/user");
const membership_1 = require("../database/schemas/membership");
const payments_module_1 = require("../payments/payments.module");
const subscription_1 = require("../database/schemas/subscription");
const payout_1 = require("../database/schemas/payout");
const s3_module_1 = require("../s3/s3.module");
const notifications_module_1 = require("../notifications/notifications.module");
const promotions_module_1 = require("../promotions/promotions.module");
const config_1 = require("@nestjs/config");
let MembershipsModule = class MembershipsModule {
};
exports.MembershipsModule = MembershipsModule;
exports.MembershipsModule = MembershipsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: membership_1.Membership.name, schema: membership_1.MembershipSchema },
                { name: subscription_1.Subscription.name, schema: subscription_1.SubscriptionSchema },
                { name: payout_1.PayoutRequest.name, schema: payout_1.PayoutRequestSchema },
                { name: user_1.User.name, schema: user_1.UserSchema },
            ]),
            payments_module_1.PaymentsModule,
            s3_module_1.S3Module,
            (0, common_1.forwardRef)(() => notifications_module_1.NotificationsModule),
            (0, common_1.forwardRef)(() => promotions_module_1.PromotionsModule),
            config_1.ConfigModule,
        ],
        controllers: [memberships_controller_1.MembershipsController],
        providers: [memberships_service_1.MembershipsService],
        exports: [memberships_service_1.MembershipsService],
    })
], MembershipsModule);
//# sourceMappingURL=memberships.module.js.map