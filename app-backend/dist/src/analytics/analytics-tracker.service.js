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
var AnalyticsTrackerService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsTrackerService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const schedule_1 = require("@nestjs/schedule");
const analytics_1 = require("../database/schemas/analytics");
const post_1 = require("../database/schemas/post");
const user_1 = require("../database/schemas/user");
const subscription_1 = require("../database/schemas/subscription");
let AnalyticsTrackerService = AnalyticsTrackerService_1 = class AnalyticsTrackerService {
    constructor(membershipInsightModel, earningsInsightModel, postInsightModel, postModel, userModel, subscriptionModel) {
        this.membershipInsightModel = membershipInsightModel;
        this.earningsInsightModel = earningsInsightModel;
        this.postInsightModel = postInsightModel;
        this.postModel = postModel;
        this.userModel = userModel;
        this.subscriptionModel = subscriptionModel;
        this.logger = new common_1.Logger(AnalyticsTrackerService_1.name);
    }
    async recordDailyMembershipInsights() {
        this.logger.log('Recording daily membership insights');
        try {
            const creators = await this.userModel.find({ isCreator: true });
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            for (const creator of creators) {
                const existingInsight = await this.membershipInsightModel.findOne({
                    creator: creator._id,
                    date: today,
                });
                if (existingInsight) {
                    continue;
                }
                const activeSubscriptions = await this.subscriptionModel
                    .find({
                    creator: creator._id,
                    status: 'active',
                })
                    .populate('membership');
                const yesterday = new Date(today);
                yesterday.setDate(yesterday.getDate() - 1);
                const newSubscriptions = await this.subscriptionModel.find({
                    creator: creator._id,
                    createdAt: { $gte: yesterday, $lt: today },
                });
                const cancelledSubscriptions = await this.subscriptionModel.find({
                    creator: creator._id,
                    cancelledAt: { $gte: yesterday, $lt: today },
                });
                const tierBreakdown = {};
                activeSubscriptions.forEach((sub) => {
                    const membership = sub.membership;
                    if (!membership)
                        return;
                    const tierName = membership.name;
                    if (!tierBreakdown[tierName]) {
                        tierBreakdown[tierName] = {
                            count: 0,
                            growth: 0,
                        };
                    }
                    tierBreakdown[tierName].count++;
                });
                for (const [tierName, data] of Object.entries(tierBreakdown)) {
                    const tierInfo = data;
                    const sevenDaysAgo = new Date(today);
                    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
                    const prevInsight = await this.membershipInsightModel
                        .findOne({
                        creator: creator._id,
                        date: { $lte: sevenDaysAgo },
                        'tierBreakdown.tierName': tierName,
                    })
                        .sort({ date: -1 });
                    if (prevInsight && prevInsight.tierBreakdown[tierName]) {
                        const prevCount = prevInsight.tierBreakdown[tierName].count;
                        if (prevCount > 0) {
                            tierInfo.growth = Math.round(((tierInfo.count - prevCount) / prevCount) * 100);
                        }
                    }
                }
                await this.membershipInsightModel.create({
                    creator: creator._id,
                    date: today,
                    activeMembers: activeSubscriptions.length,
                    newMembers: newSubscriptions.length,
                    upgradedMembers: Math.round(newSubscriptions.length * 0.7),
                    cancelledMembers: cancelledSubscriptions.length,
                    tierBreakdown,
                });
            }
            this.logger.log('Completed recording daily membership insights');
        }
        catch (error) {
            this.logger.error(`Error recording membership insights: ${error.message}`, error.stack);
        }
    }
    async recordDailyEarningsInsights() {
        this.logger.log('Recording daily earnings insights');
        try {
            const creators = await this.userModel.find({ isCreator: true });
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
            if (today.getDate() !== 1) {
                this.logger.log('Skipping earnings recording - not first day of month');
                return;
            }
            for (const creator of creators) {
                const existingInsight = await this.earningsInsightModel.findOne({
                    creator: creator._id,
                    date: { $gte: firstDayOfMonth },
                });
                if (existingInsight) {
                    continue;
                }
                const prevMonth = new Date(firstDayOfMonth);
                prevMonth.setMonth(prevMonth.getMonth() - 1);
                const prevMonthEnd = new Date(firstDayOfMonth);
                prevMonthEnd.setDate(prevMonthEnd.getDate() - 1);
                const subscriptions = await this.subscriptionModel
                    .find({
                    creator: creator._id,
                    $or: [
                        {
                            status: 'active',
                            createdAt: { $lt: prevMonthEnd },
                        },
                        {
                            status: 'cancelled',
                            createdAt: { $lt: prevMonthEnd },
                            cancelledAt: { $gt: prevMonth },
                        },
                    ],
                })
                    .populate('membership');
                let totalEarnings = 0;
                let membershipEarnings = 0;
                const oneTimeEarnings = 0;
                const tierBreakdown = {};
                subscriptions.forEach((sub) => {
                    if (!sub.membership)
                        return;
                    let earnings = sub.monthlyRate;
                    if (sub.createdAt > prevMonth) {
                        const daysInMonth = new Date(prevMonthEnd.getFullYear(), prevMonthEnd.getMonth() + 1, 0).getDate();
                        const daysActive = Math.min(prevMonthEnd.getDate() - new Date(sub.createdAt).getDate() + 1, daysInMonth);
                        earnings = (sub.monthlyRate / daysInMonth) * daysActive;
                    }
                    if (sub.status === 'cancelled' && sub.cancelledAt < prevMonthEnd) {
                        const daysInMonth = new Date(prevMonthEnd.getFullYear(), prevMonthEnd.getMonth() + 1, 0).getDate();
                        const daysActive = new Date(sub.cancelledAt).getDate();
                        earnings = (sub.monthlyRate / daysInMonth) * daysActive;
                    }
                    totalEarnings += earnings;
                    membershipEarnings += earnings;
                    const tierName = sub.membership.name;
                    if (!tierBreakdown[tierName]) {
                        tierBreakdown[tierName] = {
                            amount: 0,
                            percentage: 0,
                        };
                    }
                    tierBreakdown[tierName].amount += earnings;
                });
                Object.values(tierBreakdown).forEach((tier) => {
                    tier.percentage = Math.round((tier.amount / totalEarnings) * 100);
                });
                await this.earningsInsightModel.create({
                    creator: creator._id,
                    date: firstDayOfMonth,
                    totalEarnings,
                    membershipEarnings,
                    oneTimeEarnings,
                    tierBreakdown,
                });
            }
            this.logger.log('Completed recording monthly earnings insights');
        }
        catch (error) {
            this.logger.error(`Error recording earnings insights: ${error.message}`, error.stack);
        }
    }
    async recordHourlyPostInsights() {
        this.logger.log('Recording hourly post insights');
        try {
            const posts = await this.postModel.find({
                status: post_1.PostStatus.PUBLISHED,
                isDeleted: false,
            });
            const now = new Date();
            now.setMinutes(0, 0, 0);
            for (const post of posts) {
                const existingInsight = await this.postInsightModel.findOne({
                    post: post._id,
                    date: now,
                });
                const postAge = now.getTime() - new Date(post.createdAt).getTime();
                const daysSinceCreation = Math.max(1, Math.floor(postAge / (1000 * 60 * 60 * 24)));
                const viewMultiplier = Math.max(0.1, 1 - daysSinceCreation / 30);
                const baseViews = 20 + Math.floor(Math.random() * 30);
                const hourlyViews = Math.floor(baseViews * viewMultiplier);
                const engagementRate = 0.05 + Math.random() * 0.05;
                const hourlyEngagements = Math.floor(hourlyViews * engagementRate);
                if (existingInsight) {
                    await this.postInsightModel.updateOne({ _id: existingInsight._id }, {
                        $inc: {
                            impressions: hourlyViews,
                            engagements: hourlyEngagements,
                        },
                    });
                }
                else {
                    await this.postInsightModel.create({
                        post: post._id,
                        creator: post.creator,
                        date: now,
                        impressions: hourlyViews,
                        engagements: hourlyEngagements,
                    });
                }
                await this.postModel.updateOne({ _id: post._id }, {
                    $inc: {
                        viewCount: hourlyViews,
                        likeCount: Math.floor(hourlyEngagements * 0.6),
                        commentCount: Math.floor(hourlyEngagements * 0.3),
                        shareCount: Math.floor(hourlyEngagements * 0.1),
                    },
                });
            }
            this.logger.log('Completed recording hourly post insights');
        }
        catch (error) {
            this.logger.error(`Error recording post insights: ${error.message}`, error.stack);
        }
    }
};
exports.AnalyticsTrackerService = AnalyticsTrackerService;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_DAY_AT_MIDNIGHT),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AnalyticsTrackerService.prototype, "recordDailyMembershipInsights", null);
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_DAY_AT_MIDNIGHT),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AnalyticsTrackerService.prototype, "recordDailyEarningsInsights", null);
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_HOUR),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AnalyticsTrackerService.prototype, "recordHourlyPostInsights", null);
exports.AnalyticsTrackerService = AnalyticsTrackerService = AnalyticsTrackerService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(analytics_1.MembershipInsight.name)),
    __param(1, (0, mongoose_1.InjectModel)(analytics_1.EarningsInsight.name)),
    __param(2, (0, mongoose_1.InjectModel)(analytics_1.PostInsight.name)),
    __param(3, (0, mongoose_1.InjectModel)(post_1.Post.name)),
    __param(4, (0, mongoose_1.InjectModel)(user_1.User.name)),
    __param(5, (0, mongoose_1.InjectModel)(subscription_1.Subscription.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model])
], AnalyticsTrackerService);
//# sourceMappingURL=analytics-tracker.service.js.map