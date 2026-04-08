"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PromotionsModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const promotion_1 = require("../database/schemas/promotion");
const user_1 = require("../database/schemas/user");
const membership_1 = require("../database/schemas/membership");
const discounts_controller_1 = require("./discounts.controller");
const gifts_controller_1 = require("./gifts.controller");
const promotions_service_1 = require("./promotions.service");
const memberships_module_1 = require("../memberships/memberships.module");
const promotions_scheduler_service_1 = require("./promotions-scheduler.service");
const subscription_1 = require("../database/schemas/subscription");
const payments_module_1 = require("../payments/payments.module");
let PromotionsModule = class PromotionsModule {
};
exports.PromotionsModule = PromotionsModule;
exports.PromotionsModule = PromotionsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: promotion_1.Discount.name, schema: promotion_1.DiscountSchema },
                { name: promotion_1.Gift.name, schema: promotion_1.GiftSchema },
                { name: promotion_1.PromotionRedemption.name, schema: promotion_1.PromotionRedemptionSchema },
                { name: user_1.User.name, schema: user_1.UserSchema },
                { name: membership_1.Membership.name, schema: membership_1.MembershipSchema },
                { name: subscription_1.Subscription.name, schema: subscription_1.SubscriptionSchema },
            ]),
            (0, common_1.forwardRef)(() => memberships_module_1.MembershipsModule),
            payments_module_1.PaymentsModule,
        ],
        controllers: [discounts_controller_1.DiscountsController, gifts_controller_1.GiftsController],
        providers: [promotions_service_1.PromotionsService, promotions_scheduler_service_1.PromotionsSchedulerService],
        exports: [promotions_service_1.PromotionsService],
    })
], PromotionsModule);
//# sourceMappingURL=promotions.module.js.map