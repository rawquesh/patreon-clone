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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const analytics_1 = require("../database/schemas/analytics");
const membership_1 = require("../database/schemas/membership");
const user_1 = require("../database/schemas/user");
const post_1 = require("../database/schemas/post");
const subscription_1 = require("../database/schemas/subscription");
const payout_1 = require("../database/schemas/payout");
const payments_service_1 = require("../payments/payments.service");
let AnalyticsService = class AnalyticsService {
    constructor(membershipInsightModel, earningsInsightModel, postInsightModel, userModel, postModel, membershipModel, subscriptionModel, payoutRequestModel, paymentsService) {
        this.membershipInsightModel = membershipInsightModel;
        this.earningsInsightModel = earningsInsightModel;
        this.postInsightModel = postInsightModel;
        this.userModel = userModel;
        this.postModel = postModel;
        this.membershipModel = membershipModel;
        this.subscriptionModel = subscriptionModel;
        this.payoutRequestModel = payoutRequestModel;
        this.paymentsService = paymentsService;
    }
    async getMembershipInsights(userId, timeRange) {
        const creatorExists = await this.userModel.findById(userId).lean();
        if (!creatorExists) {
            throw new common_1.NotFoundException('Creator not found');
        }
        const { startDate, endDate, interval } = this.getDateRangeAndInterval(timeRange);
        const newSubscriptions = await this.subscriptionModel
            .find({
            creator: new mongoose_2.Types.ObjectId(userId),
            createdAt: { $gte: startDate, $lte: endDate },
        })
            .populate({
            path: 'membership',
            select: 'name',
        })
            .lean();
        const membershipData = this.initializeMembershipData(startDate, endDate, interval);
        const tierCounts = new Map();
        for (const sub of newSubscriptions) {
            if (!sub.createdAt)
                continue;
            let key = '';
            const subDate = new Date(sub.createdAt);
            switch (interval) {
                case 'day':
                    const year = subDate.getFullYear();
                    const month = String(subDate.getMonth() + 1).padStart(2, '0');
                    const day = String(subDate.getDate()).padStart(2, '0');
                    key = `${year}-${month}-${day}`;
                    break;
                case 'week':
                    const monthName = subDate.toLocaleString('default', {
                        month: 'long',
                    });
                    const weekOfMonth = Math.ceil(subDate.getDate() / 7);
                    key = `${monthName} Week ${weekOfMonth}`;
                    break;
                case 'month':
                    key = subDate.toLocaleString('default', { month: 'long' });
                    break;
            }
            if (key in membershipData) {
                membershipData[key]++;
            }
            const tierName = sub.membership?.name || 'Unknown Tier';
            tierCounts.set(tierName, (tierCounts.get(tierName) || 0) + 1);
        }
        const tiers = Array.from(tierCounts, ([name, count]) => ({ name, count }));
        return {
            membershipData,
            tiers,
        };
    }
    getDateRangeAndInterval(timeRange) {
        const endDate = new Date();
        let startDate = new Date();
        let interval = 'day';
        endDate.setHours(23, 59, 59, 999);
        let daysToSubtract = 30;
        switch (timeRange) {
            case '7d':
                daysToSubtract = 7;
                interval = 'day';
                break;
            case '30d':
                daysToSubtract = 30;
                interval = 'day';
                break;
            case '90d':
                daysToSubtract = 90;
                interval = 'week';
                break;
            case '180d':
                daysToSubtract = 180;
                interval = 'month';
                break;
            case '365d':
            case '1y':
                daysToSubtract = 365;
                interval = 'month';
                break;
            case 'all':
                daysToSubtract = 365;
                interval = 'month';
                break;
            default:
                daysToSubtract = 30;
                interval = 'day';
                break;
        }
        startDate.setDate(endDate.getDate() - (daysToSubtract - 1));
        startDate.setHours(0, 0, 0, 0);
        return { startDate, endDate, interval };
    }
    initializeMembershipData(startDate, endDate, interval) {
        const data = {};
        let currentDate = new Date(startDate);
        while (currentDate <= endDate) {
            let key = '';
            switch (interval) {
                case 'day':
                    const year = currentDate.getFullYear();
                    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
                    const day = String(currentDate.getDate()).padStart(2, '0');
                    key = `${year}-${month}-${day}`;
                    data[key] = 0;
                    break;
                case 'week':
                    const monthName = currentDate.toLocaleString('default', {
                        month: 'long',
                    });
                    const weekOfMonth = Math.ceil(currentDate.getDate() / 7);
                    key = `${monthName} Week ${weekOfMonth}`;
                    data[key] = 0;
                    break;
                case 'month':
                    key = currentDate.toLocaleString('default', { month: 'long' });
                    data[key] = 0;
                    break;
            }
            currentDate.setDate(currentDate.getDate() + 1);
        }
        return data;
    }
    async generateAccurateMembershipData(userId, labels, startDate) {
        const daysInPeriod = labels.length;
        const data = new Array(daysInPeriod).fill(0);
        console.log(`DEBUG: Generating accurate membership data with ${daysInPeriod} days`);
        const allSubscriptions = await this.subscriptionModel.find({
            creator: new mongoose_2.Types.ObjectId(userId),
            createdAt: { $gte: startDate },
        });
        console.log(`DEBUG: Found ${allSubscriptions.length} total subscriptions to analyze in period`);
        for (let i = 0; i < daysInPeriod; i++) {
            const currentDate = new Date(startDate);
            currentDate.setDate(startDate.getDate() + i);
            currentDate.setHours(0, 0, 0, 0);
            const endOfDay = new Date(currentDate);
            endOfDay.setHours(23, 59, 59, 999);
            const createdOnThisDay = allSubscriptions.filter((subscription) => {
                const createdAt = new Date(subscription.createdAt);
                return createdAt >= currentDate && createdAt <= endOfDay;
            }).length;
            data[i] = createdOnThisDay;
        }
        console.log(`DEBUG: Daily new subscription data: ${JSON.stringify(data)}`);
        return data;
    }
    initializeDataMap(startDate, endDate, interval) {
        const data = {};
        let currentDate = new Date(startDate);
        while (currentDate <= endDate) {
            let key = '';
            switch (interval) {
                case 'day':
                    const year = currentDate.getFullYear();
                    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
                    const day = String(currentDate.getDate()).padStart(2, '0');
                    key = `${year}-${month}-${day}`;
                    data[key] = 0;
                    break;
                case 'week':
                    const monthName = currentDate.toLocaleString('default', {
                        month: 'long',
                    });
                    const weekOfMonth = Math.ceil(currentDate.getDate() / 7);
                    key = `${monthName} Week ${weekOfMonth}`;
                    data[key] = 0;
                    break;
                case 'month':
                    key = currentDate.toLocaleString('default', { month: 'long' });
                    data[key] = 0;
                    break;
            }
            currentDate.setDate(currentDate.getDate() + 1);
        }
        return data;
    }
    async getEarningsInsights(userId, timeRange) {
        const creator = await this.userModel.findById(userId).lean();
        if (!creator) {
            throw new common_1.NotFoundException('Creator not found');
        }
        if (!creator.stripeConnectAccountId) {
            throw new common_1.NotFoundException('Creator has not connected to Stripe yet');
        }
        const { startDate, endDate, interval } = this.getDateRangeAndInterval(timeRange);
        const allCharges = [];
        let hasMore = true;
        let startingAfter = undefined;
        while (hasMore) {
            const charges = await this.paymentsService.stripe.charges.list({
                limit: 100,
                created: {
                    gte: Math.floor(startDate.getTime() / 1000),
                    lte: Math.floor(endDate.getTime() / 1000),
                },
                starting_after: startingAfter,
            }, {
                stripeAccount: creator.stripeConnectAccountId,
            });
            allCharges.push(...charges.data);
            hasMore = charges.has_more;
            if (hasMore) {
                startingAfter = charges.data[charges.data.length - 1].id;
            }
        }
        const successfulCharges = allCharges.filter((charge) => charge.paid && !charge.refunded);
        const earningsData = this.initializeDataMap(startDate, endDate, interval);
        for (const charge of successfulCharges) {
            const transactionDate = new Date(charge.created * 1000);
            let key = '';
            switch (interval) {
                case 'day':
                    const year = transactionDate.getFullYear();
                    const month = String(transactionDate.getMonth() + 1).padStart(2, '0');
                    const day = String(transactionDate.getDate()).padStart(2, '0');
                    key = `${year}-${month}-${day}`;
                    break;
                case 'week':
                    const monthName = transactionDate.toLocaleString('default', {
                        month: 'long',
                    });
                    const weekOfMonth = Math.ceil(transactionDate.getDate() / 7);
                    key = `${monthName} Week ${weekOfMonth}`;
                    break;
                case 'month':
                    key = transactionDate.toLocaleString('default', { month: 'long' });
                    break;
            }
            if (key in earningsData) {
                earningsData[key] += charge.amount / 100;
            }
        }
        const totalEarnings = Object.values(earningsData).reduce((sum, amount) => sum + amount, 0);
        const activeSubscriptions = await this.subscriptionModel
            .find({
            creator: new mongoose_2.Types.ObjectId(userId),
            status: 'active',
        })
            .populate('membership');
        const tierBreakdown = activeSubscriptions.reduce((acc, sub) => {
            const tierName = sub.membership?.name || 'Unknown Tier';
            const tierAmount = sub.membership?.monthlyRate || 0;
            const existingTier = acc.find((t) => t.name === tierName);
            if (existingTier) {
                existingTier.amount += tierAmount;
            }
            else {
                acc.push({ name: tierName, amount: tierAmount });
            }
            return acc;
        }, []);
        const { available: availablePayout, pending: pendingBalance } = await this.paymentsService.getPayoutBalance(userId);
        return {
            totalEarnings,
            earningsData,
            tierBreakdown,
            availablePayout,
            pendingBalance,
        };
    }
    initializePostDataMap(startDate, endDate, interval) {
        const data = {};
        let currentDate = new Date(startDate);
        while (currentDate <= endDate) {
            let key = '';
            switch (interval) {
                case 'day':
                    const year = currentDate.getFullYear();
                    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
                    const day = String(currentDate.getDate()).padStart(2, '0');
                    key = `${year}-${month}-${day}`;
                    data[key] = 0;
                    break;
                case 'week':
                    const monthName = currentDate.toLocaleString('default', {
                        month: 'long',
                    });
                    const weekOfMonth = Math.ceil(currentDate.getDate() / 7);
                    key = `${monthName} Week ${weekOfMonth}`;
                    data[key] = 0;
                    break;
                case 'month':
                    key = currentDate.toLocaleString('default', { month: 'long' });
                    data[key] = 0;
                    break;
            }
            currentDate.setDate(currentDate.getDate() + 1);
        }
        return data;
    }
    async getPostsInsights(userId, timeRange) {
        const creator = await this.userModel.findById(userId).lean();
        if (!creator) {
            throw new common_1.NotFoundException('Creator not found');
        }
        const { startDate, endDate, interval } = this.getDateRangeAndInterval(timeRange);
        const allPosts = await this.postModel
            .find({ creator: new mongoose_2.Types.ObjectId(userId) })
            .lean();
        const impressionData = this.initializePostDataMap(startDate, endDate, interval);
        const engagementData = this.initializePostDataMap(startDate, endDate, interval);
        const postPerformance = {};
        for (const post of allPosts) {
            const postId = post._id.toString();
            postPerformance[postId] = {
                id: postId,
                title: post.title || 'Untitled Post',
                impressions: post.viewCount || 0,
                engagements: 0,
            };
        }
        for (const post of allPosts) {
            const postId = post._id.toString();
            const postCreationDate = new Date(post.createdAt);
            if (postCreationDate >= startDate && postCreationDate <= endDate) {
                const impressionKey = this.getDateKey(postCreationDate, interval);
                if (impressionKey in impressionData) {
                    impressionData[impressionKey] += post.viewCount || 0;
                }
            }
            const engagements = [...(post.likes || []), ...(post.comments || [])];
            for (const engagement of engagements) {
                const engagementDate = new Date(engagement.createdAt);
                if (engagementDate >= startDate && engagementDate <= endDate) {
                    const engagementKey = this.getDateKey(engagementDate, interval);
                    if (engagementKey in engagementData) {
                        engagementData[engagementKey]++;
                    }
                    if (postPerformance[postId]) {
                        postPerformance[postId].engagements++;
                    }
                }
            }
        }
        const totalImpressions = Object.values(impressionData).reduce((sum, count) => sum + count, 0);
        const totalEngagements = Object.values(engagementData).reduce((sum, count) => sum + count, 0);
        const topPerformingPosts = Object.values(postPerformance)
            .sort((a, b) => b.impressions - a.impressions)
            .slice(0, 5);
        return {
            totalImpressions,
            totalEngagements,
            topPerformingPosts,
            impressionData,
            engagementData,
        };
    }
    getDateKey(date, interval) {
        let key = '';
        switch (interval) {
            case 'day':
                key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
                break;
            case 'week':
                const monthName = date.toLocaleString('default', { month: 'long' });
                const weekOfMonth = Math.ceil(date.getDate() / 7);
                key = `${monthName} Week ${weekOfMonth}`;
                break;
            case 'month':
                key = date.toLocaleString('default', { month: 'long' });
                break;
        }
        return key;
    }
    getDateRangeFromTimeRange(timeRange) {
        const now = new Date();
        const endDate = new Date(now);
        let startDate = new Date(now);
        let previousStartDate, previousEndDate;
        let labels = [];
        let periods = [];
        switch (timeRange) {
            case '7d':
                startDate.setDate(startDate.getDate() - 7);
                previousStartDate = new Date(startDate);
                previousStartDate.setDate(previousStartDate.getDate() - 7);
                previousEndDate = new Date(startDate);
                previousEndDate.setDate(previousEndDate.getDate() - 1);
                labels = this.getTimeLabels('7d');
                break;
            case '14d':
                startDate.setDate(startDate.getDate() - 14);
                previousStartDate = new Date(startDate);
                previousStartDate.setDate(previousStartDate.getDate() - 14);
                previousEndDate = new Date(startDate);
                previousEndDate.setDate(previousEndDate.getDate() - 1);
                labels = this.getTimeLabels('14d');
                break;
            case '30d':
                startDate.setDate(startDate.getDate() - 30);
                previousStartDate = new Date(startDate);
                previousStartDate.setDate(previousStartDate.getDate() - 30);
                previousEndDate = new Date(startDate);
                previousEndDate.setDate(previousEndDate.getDate() - 1);
                labels = this.getTimeLabels('30d');
                const oneMonthAgo = new Date(now);
                oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
                const currentMonth = `${this.getMonthName(now.getMonth())} ${now.getFullYear()}`;
                const previousMonth = `${this.getMonthName(oneMonthAgo.getMonth())} ${oneMonthAgo.getFullYear()}`;
                periods = [previousMonth, currentMonth];
                break;
            case '90d':
                startDate.setMonth(startDate.getMonth() - 3);
                previousStartDate = new Date(startDate);
                previousStartDate.setMonth(previousStartDate.getMonth() - 3);
                previousEndDate = new Date(startDate);
                previousEndDate.setDate(previousEndDate.getDate() - 1);
                periods = this.getMonthPeriods('3m');
                break;
            case '180d':
                startDate.setMonth(startDate.getMonth() - 6);
                previousStartDate = new Date(startDate);
                previousStartDate.setMonth(previousStartDate.getMonth() - 6);
                previousEndDate = new Date(startDate);
                previousEndDate.setDate(previousEndDate.getDate() - 1);
                periods = this.getMonthPeriods('6m');
                break;
            case '365d':
            case '1y':
                startDate.setFullYear(startDate.getFullYear() - 1);
                previousStartDate = new Date(startDate);
                previousStartDate.setFullYear(previousStartDate.getFullYear() - 1);
                previousEndDate = new Date(startDate);
                previousEndDate.setDate(previousEndDate.getDate() - 1);
                periods = this.getMonthPeriods('1y');
                break;
            case 'all':
                startDate = new Date(0);
                previousStartDate = new Date(0);
                previousEndDate = new Date(0);
                periods = this.getMonthPeriods('all');
                break;
            default:
                startDate.setDate(startDate.getDate() - 30);
                previousStartDate = new Date(startDate);
                previousStartDate.setDate(previousStartDate.getDate() - 30);
                previousEndDate = new Date(startDate);
                previousEndDate.setDate(previousEndDate.getDate() - 1);
                labels = this.getTimeLabels('30d');
                const defaultOneMonthAgo = new Date(now);
                defaultOneMonthAgo.setMonth(defaultOneMonthAgo.getMonth() - 1);
                const defaultCurrentMonth = `${this.getMonthName(now.getMonth())} ${now.getFullYear()}`;
                const defaultPreviousMonth = `${this.getMonthName(defaultOneMonthAgo.getMonth())} ${defaultOneMonthAgo.getFullYear()}`;
                periods = [defaultPreviousMonth, defaultCurrentMonth];
                break;
        }
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);
        if (previousStartDate) {
            previousStartDate.setHours(0, 0, 0, 0);
        }
        if (previousEndDate) {
            previousEndDate.setHours(23, 59, 59, 999);
        }
        return {
            startDate,
            endDate,
            previousStartDate,
            previousEndDate,
            labels,
            periods,
        };
    }
    getTimeLabels(timeRange) {
        const now = new Date();
        const labels = [];
        let daysToShow = 30;
        switch (timeRange) {
            case '7d':
                daysToShow = 7;
                break;
            case '14d':
                daysToShow = 14;
                break;
            case '30d':
                daysToShow = 30;
                break;
            case '90d':
                daysToShow = 90;
                break;
        }
        for (let i = daysToShow - 1; i >= 0; i--) {
            const date = new Date(now);
            date.setDate(date.getDate() - i);
            labels.push(`${date.getMonth() + 1}/${date.getDate()}`);
        }
        return labels;
    }
    getMonthPeriods(timeRange) {
        const now = new Date();
        const periods = [];
        let monthsToShow = 6;
        switch (timeRange) {
            case '3m':
                monthsToShow = 3;
                break;
            case '6m':
                monthsToShow = 6;
                break;
            case '1y':
                monthsToShow = 12;
                break;
            case 'all':
                monthsToShow = 24;
                break;
        }
        const monthNames = [
            'Jan',
            'Feb',
            'Mar',
            'Apr',
            'May',
            'Jun',
            'Jul',
            'Aug',
            'Sep',
            'Oct',
            'Nov',
            'Dec',
        ];
        for (let i = monthsToShow - 1; i >= 0; i--) {
            const date = new Date(now);
            date.setMonth(date.getMonth() - i);
            periods.push(`${monthNames[date.getMonth()]} ${date.getFullYear()}`);
        }
        return periods;
    }
    calculatePreviousPeriodEarnings(subscriptionsByMonth, previousStartDate, previousEndDate) {
        const monthNames = [
            'Jan',
            'Feb',
            'Mar',
            'Apr',
            'May',
            'Jun',
            'Jul',
            'Aug',
            'Sep',
            'Oct',
            'Nov',
            'Dec',
        ];
        let totalEarnings = 0;
        const currentStart = new Date(previousStartDate);
        const currentEnd = new Date(previousEndDate);
        while (currentStart <= currentEnd) {
            const month = monthNames[currentStart.getMonth()];
            const year = currentStart.getFullYear();
            const key = `${month} ${year}`;
            if (subscriptionsByMonth[key]) {
                totalEarnings += subscriptionsByMonth[key].earnings;
            }
            currentStart.setMonth(currentStart.getMonth() + 1);
        }
        return totalEarnings;
    }
    calculateYearlyProjection(monthlyEarnings) {
        if (monthlyEarnings.length === 0)
            return 0;
        const avgMonthlyEarnings = monthlyEarnings.reduce((sum, earnings) => sum + earnings, 0) /
            monthlyEarnings.length;
        return Math.round(avgMonthlyEarnings * 12);
    }
    calculateTierBreakdown(subscriptions) {
        const tierMap = {};
        subscriptions.forEach((sub) => {
            if (!sub.membership)
                return;
            const tierName = sub.membership.name || 'Unknown Tier';
            if (!tierMap[tierName]) {
                tierMap[tierName] = {
                    name: tierName,
                    amount: 0,
                    percentage: 0,
                };
            }
            if (sub.status === 'active') {
                tierMap[tierName].amount += sub.monthlyRate;
            }
        });
        return Object.values(tierMap);
    }
    async calculateAvailableBalance(userId) {
        const user = await this.userModel.findById(userId);
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        return {
            availablePayout: user.availableBalance || 0,
            pendingBalance: user.pendingBalance || 0,
        };
    }
    async fetchStripeMonthlyEarnings(stripeAccountId, periods) {
        const monthlyEarnings = [];
        const stripe = this.paymentsService.stripe;
        console.log('STRIPE MONTHLY EARNINGS - Periods:', periods);
        for (const period of periods) {
            const [month, year] = period.split(' ');
            console.log(`Processing period: ${period}, parsed as month=${month}, year=${year}`);
            const monthNames = [
                'Jan',
                'Feb',
                'Mar',
                'Apr',
                'May',
                'Jun',
                'Jul',
                'Aug',
                'Sep',
                'Oct',
                'Nov',
                'Dec',
            ];
            const monthIndex = monthNames.indexOf(month);
            if (monthIndex === -1) {
                console.error(`Invalid month name: ${month}`);
                monthlyEarnings.push(0);
                continue;
            }
            const yearNum = parseInt(year, 10);
            if (isNaN(yearNum)) {
                console.error(`Invalid year: ${year}`);
                monthlyEarnings.push(0);
                continue;
            }
            const startDate = new Date(yearNum, monthIndex, 1);
            const endDate = new Date(yearNum, monthIndex + 1, 0, 23, 59, 59, 999);
            const startTimestamp = Math.floor(startDate.getTime() / 1000);
            const endTimestamp = Math.floor(endDate.getTime() / 1000);
            try {
                const balanceTransactions = await stripe.balanceTransactions.list({
                    limit: 100,
                    created: {
                        gte: startTimestamp,
                        lte: endTimestamp,
                    },
                    expand: ['data.source'],
                }, {
                    stripeAccount: stripeAccountId,
                });
                console.log(JSON.stringify({
                    bal: balanceTransactions.data,
                    gte: startTimestamp,
                    lte: endTimestamp,
                    startDate: startDate,
                    endDate: endDate,
                }));
                if (balanceTransactions.data.length > 0) {
                    const typesCounts = {};
                    balanceTransactions.data.forEach((transaction) => {
                        if (!typesCounts[transaction.type]) {
                            typesCounts[transaction.type] = 0;
                        }
                        typesCounts[transaction.type]++;
                    });
                    console.log(`Transaction types in this period:`, typesCounts);
                }
                const periodEarnings = balanceTransactions.data
                    .filter((transaction) => ['charge', 'payment'].includes(transaction.type))
                    .reduce((sum, transaction) => sum + transaction.net / 100, 0);
                monthlyEarnings.push(parseFloat(periodEarnings.toFixed(2)));
                console.log(`Period ${period} earnings: ${periodEarnings.toFixed(2)}`);
            }
            catch (error) {
                console.error(`Error fetching earnings for ${period}:`, error);
                if (monthlyEarnings.length > 0) {
                    const avgEarnings = monthlyEarnings.reduce((sum, earnings) => sum + earnings, 0) /
                        monthlyEarnings.length;
                    monthlyEarnings.push(parseFloat(avgEarnings.toFixed(2)));
                }
                else {
                    monthlyEarnings.push(0);
                }
            }
        }
        return monthlyEarnings;
    }
    async fetchStripePreviousPeriodEarnings(stripeAccountId, previousStartDate, previousEndDate) {
        const stripe = this.paymentsService.stripe;
        const startDate = new Date(previousStartDate);
        const endDate = new Date(previousEndDate);
        console.log(`Previous period date range: ${startDate.toISOString()} to ${endDate.toISOString()}`);
        const startTimestamp = Math.floor(startDate.getTime() / 1000);
        const endTimestamp = Math.floor(endDate.getTime() / 1000);
        try {
            const balanceTransactions = await stripe.balanceTransactions.list({
                limit: 100,
                created: {
                    gte: startTimestamp,
                    lte: endTimestamp,
                },
            }, {
                stripeAccount: stripeAccountId,
            });
            console.log(`Found ${balanceTransactions.data.length} transactions for previous period`);
            if (balanceTransactions.data.length > 0) {
                const typesCounts = {};
                balanceTransactions.data.forEach((transaction) => {
                    if (!typesCounts[transaction.type]) {
                        typesCounts[transaction.type] = 0;
                    }
                    typesCounts[transaction.type]++;
                });
                console.log(`Transaction types in previous period:`, typesCounts);
            }
            const totalEarnings = balanceTransactions.data
                .filter((transaction) => ['charge', 'payment'].includes(transaction.type))
                .reduce((sum, transaction) => sum + transaction.net / 100, 0);
            return parseFloat(totalEarnings.toFixed(2));
        }
        catch (error) {
            console.error('Error fetching previous period earnings:', error);
            return 0;
        }
    }
    async generateDailyEarningsData(stripeAccountId, startDate, endDate, labels) {
        const daysInPeriod = labels.length;
        const data = new Array(daysInPeriod).fill(0);
        const stripe = this.paymentsService.stripe;
        const start = new Date(startDate);
        const end = new Date(endDate);
        console.log(`Generating daily earnings data with ${daysInPeriod} days, from ${start.toISOString()} to ${end.toISOString()}`);
        try {
            const startTimestamp = Math.floor(start.getTime() / 1000);
            const endTimestamp = Math.floor(end.getTime() / 1000);
            const balanceTransactions = await stripe.balanceTransactions.list({
                limit: 100,
                created: {
                    gte: startTimestamp,
                    lte: endTimestamp,
                },
            }, {
                stripeAccount: stripeAccountId,
            });
            console.log(`Found ${balanceTransactions.data.length} transactions for daily earnings`);
            if (balanceTransactions.data.length > 0) {
                const typesCounts = {};
                balanceTransactions.data.forEach((transaction) => {
                    if (!typesCounts[transaction.type]) {
                        typesCounts[transaction.type] = 0;
                    }
                    typesCounts[transaction.type]++;
                });
                console.log(`Transaction types in daily period:`, typesCounts);
            }
            const transactionsWithDate = [];
            balanceTransactions.data
                .filter((transaction) => ['charge', 'payment'].includes(transaction.type))
                .forEach((transaction) => {
                const transactionDate = new Date(transaction.created * 1000);
                console.log(`Transaction: ${transaction.id}, type: ${transaction.type}, date: ${transactionDate.toISOString()}, amount: ${transaction.net / 100}`);
                transactionsWithDate.push({
                    date: transactionDate,
                    amount: transaction.net / 100,
                });
            });
            for (let i = 0; i < daysInPeriod; i++) {
                const currentDate = new Date(start);
                currentDate.setDate(start.getDate() + i);
                currentDate.setHours(0, 0, 0, 0);
                const endOfDay = new Date(currentDate);
                endOfDay.setHours(23, 59, 59, 999);
                const earningsOnThisDay = transactionsWithDate
                    .filter((item) => item.date >= currentDate && item.date <= endOfDay)
                    .reduce((sum, item) => sum + item.amount, 0);
                data[i] = parseFloat(earningsOnThisDay.toFixed(2));
            }
            console.log(`Final daily earnings data: ${JSON.stringify(data)}`);
            return data;
        }
        catch (error) {
            console.error('Error generating daily earnings data:', error);
            return new Array(daysInPeriod).fill(0);
        }
    }
    async getTransactionDetails(userId, timeRange) {
        const creator = await this.userModel.findById(userId);
        if (!creator) {
            throw new common_1.NotFoundException('Creator not found');
        }
        if (!creator.stripeConnectAccountId) {
            throw new common_1.NotFoundException('Creator has not connected to Stripe yet');
        }
        const { startDate, endDate } = this.getDateRangeFromTimeRange(timeRange);
        const transactions = await this.fetchStripeTransactions(creator.stripeConnectAccountId, startDate, endDate);
        const dailyTransactions = this.groupTransactionsByDay(transactions);
        const totalEarnings = dailyTransactions.reduce((sum, day) => sum + day.total, 0);
        return {
            timeRange,
            totalEarnings,
            dailyTransactions,
        };
    }
    groupTransactionsByDay(transactions) {
        const transactionsByDay = {};
        transactions.forEach((transaction) => {
            const date = new Date(transaction.date);
            const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
            if (!transactionsByDay[dateKey]) {
                transactionsByDay[dateKey] = {
                    date: dateKey,
                    total: 0,
                    transactions: [],
                };
            }
            transactionsByDay[dateKey].transactions.push(transaction);
            transactionsByDay[dateKey].total += transaction.net;
        });
        return Object.values(transactionsByDay).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }
    async fetchStripeTransactions(stripeAccountId, startDate, endDate) {
        const stripe = this.paymentsService.stripe;
        const startTimestamp = Math.floor(startDate.getTime() / 1000);
        const endTimestamp = Math.floor(endDate.getTime() / 1000);
        try {
            const balanceTransactions = await stripe.balanceTransactions.list({
                limit: 100,
                created: {
                    gte: startTimestamp,
                    lte: endTimestamp,
                },
                expand: ['data.source'],
            }, {
                stripeAccount: stripeAccountId,
            });
            const transactions = [];
            for (const transaction of balanceTransactions.data) {
                let customerName = 'Unknown Customer';
                let membershipTier = 'Unknown Tier';
                if (transaction.source &&
                    typeof transaction.source === 'object' &&
                    'object' in transaction.source) {
                    const charge = transaction.source;
                    if (charge.metadata && charge.metadata.subscriberId) {
                        try {
                            const subscriber = await this.userModel.findById(charge.metadata.subscriberId);
                            if (subscriber) {
                                customerName =
                                    subscriber['fullName'] || subscriber['username'] || 'Unknown';
                            }
                        }
                        catch (error) {
                            console.error('Error fetching subscriber info:', error);
                        }
                        if (charge.metadata.membershipId) {
                            try {
                                const membership = await this.membershipModel.findById(charge.metadata.membershipId);
                                if (membership) {
                                    membershipTier = membership['name'] || 'Unknown Tier';
                                }
                            }
                            catch (error) {
                                console.error('Error fetching membership info:', error);
                            }
                        }
                    }
                }
                transactions.push({
                    id: transaction.id,
                    amount: transaction.amount / 100,
                    net: transaction.net / 100,
                    fee: transaction.fee / 100,
                    date: new Date(transaction.created * 1000).toISOString(),
                    description: transaction.description || 'Stripe transaction',
                    customerName,
                    membershipTier,
                    status: transaction.status,
                    type: transaction.type,
                });
            }
            return transactions;
        }
        catch (error) {
            console.error('Error fetching transactions from Stripe:', error);
            return [];
        }
    }
    generateTimeSeriesData(insights, labels, metricName) {
        const data = [];
        const metricsByDate = {};
        console.log('Labels:', labels);
        insights.forEach((insight) => {
            const date = new Date(insight.date);
            const simpleFormat = `${date.getMonth() + 1}/${date.getDate()}`;
            const monthNames = [
                'Jan',
                'Feb',
                'Mar',
                'Apr',
                'May',
                'Jun',
                'Jul',
                'Aug',
                'Sep',
                'Oct',
                'Nov',
                'Dec',
            ];
            const fancyFormat = `${monthNames[date.getMonth()]} ${date.getDate()}`;
            if (!metricsByDate[simpleFormat]) {
                metricsByDate[simpleFormat] = 0;
            }
            metricsByDate[simpleFormat] += insight[metricName] || 0;
            if (!metricsByDate[fancyFormat]) {
                metricsByDate[fancyFormat] = 0;
            }
            metricsByDate[fancyFormat] += insight[metricName] || 0;
            console.log('Insight date:', insight.date, 'DateKey (simple):', simpleFormat, 'DateKey (fancy):', fancyFormat, 'Value:', insight[metricName]);
        });
        console.log('MetricsByDate:', metricsByDate);
        for (const label of labels) {
            if (label && metricsByDate[label]) {
                data.push(metricsByDate[label]);
            }
            else {
                data.push(0);
            }
        }
        return data;
    }
    groupSubscriptionsByMonth(subscriptions) {
        const monthNames = [
            'Jan',
            'Feb',
            'Mar',
            'Apr',
            'May',
            'Jun',
            'Jul',
            'Aug',
            'Sep',
            'Oct',
            'Nov',
            'Dec',
        ];
        const result = {};
        subscriptions.forEach((sub) => {
            const date = new Date(sub.createdAt);
            const month = monthNames[date.getMonth()];
            const year = date.getFullYear();
            const key = `${month} ${year}`;
            if (!result[key]) {
                result[key] = {
                    subscriptions: 0,
                    earnings: 0,
                };
            }
            if (sub.status === 'active') {
                const monthlyRate = sub.monthlyRate;
                result[key].subscriptions += 1;
                result[key].earnings += monthlyRate;
            }
        });
        return result;
    }
    getMonthName(monthIndex) {
        const monthNames = [
            'Jan',
            'Feb',
            'Mar',
            'Apr',
            'May',
            'Jun',
            'Jul',
            'Aug',
            'Sep',
            'Oct',
            'Nov',
            'Dec',
        ];
        return monthNames[monthIndex];
    }
};
exports.AnalyticsService = AnalyticsService;
exports.AnalyticsService = AnalyticsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(analytics_1.MembershipInsight.name)),
    __param(1, (0, mongoose_1.InjectModel)(analytics_1.EarningsInsight.name)),
    __param(2, (0, mongoose_1.InjectModel)(analytics_1.PostInsight.name)),
    __param(3, (0, mongoose_1.InjectModel)(user_1.User.name)),
    __param(4, (0, mongoose_1.InjectModel)(post_1.Post.name)),
    __param(5, (0, mongoose_1.InjectModel)(membership_1.Membership.name)),
    __param(6, (0, mongoose_1.InjectModel)(subscription_1.Subscription.name)),
    __param(7, (0, mongoose_1.InjectModel)(payout_1.PayoutRequest.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        payments_service_1.PaymentsService])
], AnalyticsService);
//# sourceMappingURL=analytics.service.js.map