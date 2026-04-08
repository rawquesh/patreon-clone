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
var PromotionsSchedulerService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PromotionsSchedulerService = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const subscription_1 = require("../database/schemas/subscription");
const promotion_1 = require("../database/schemas/promotion");
let PromotionsSchedulerService = PromotionsSchedulerService_1 = class PromotionsSchedulerService {
    constructor(subscriptionModel, redemptionModel) {
        this.subscriptionModel = subscriptionModel;
        this.redemptionModel = redemptionModel;
        this.logger = new common_1.Logger(PromotionsSchedulerService_1.name);
    }
    async handleExpiredPromotions() {
        this.logger.log('Checking for expired promotional subscriptions...');
        const now = new Date();
        try {
            const expiredTrials = await this.subscriptionModel.find({
                isTrial: true,
                status: 'active',
                trialEndDate: { $lt: now },
            });
            for (const trial of expiredTrials) {
                this.logger.log(`Expiring trial subscription ${trial._id} for user ${trial.subscriber}`);
                await this.subscriptionModel.findByIdAndUpdate(trial._id, {
                    $set: {
                        status: 'expired',
                        expiryDate: now,
                    },
                });
                if (trial.membership) {
                    await this.subscriptionModel.findByIdAndUpdate(trial.membership, {
                        $inc: { subscriberCount: -1 },
                    });
                }
            }
            await this.redemptionModel.updateMany({
                expiryDate: { $lt: now },
                isExpired: false,
            }, {
                $set: { isExpired: true },
            });
            this.logger.log(`Processed ${expiredTrials.length} expired trial subscriptions`);
        }
        catch (error) {
            this.logger.error('Error processing expired promotions:', error.stack);
        }
    }
};
exports.PromotionsSchedulerService = PromotionsSchedulerService;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_DAY_AT_MIDNIGHT),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PromotionsSchedulerService.prototype, "handleExpiredPromotions", null);
exports.PromotionsSchedulerService = PromotionsSchedulerService = PromotionsSchedulerService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(subscription_1.Subscription.name)),
    __param(1, (0, mongoose_1.InjectModel)(promotion_1.PromotionRedemption.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model])
], PromotionsSchedulerService);
//# sourceMappingURL=promotions-scheduler.service.js.map