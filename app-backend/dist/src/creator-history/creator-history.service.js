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
exports.CreatorHistoryService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const user_1 = require("../database/schemas/user");
const engagement_1 = require("../database/schemas/engagement");
const subscription_1 = require("../database/schemas/subscription");
let CreatorHistoryService = class CreatorHistoryService {
    constructor(userModel, creatorVisitModel, subscriptionModel) {
        this.userModel = userModel;
        this.creatorVisitModel = creatorVisitModel;
        this.subscriptionModel = subscriptionModel;
    }
    async recordVisit(userId, creatorId, metadata) {
        const [visitor, creator] = await Promise.all([
            this.userModel.findById(userId),
            this.userModel.findById(creatorId),
        ]);
        if (!visitor) {
            throw new common_1.NotFoundException('Visitor not found');
        }
        if (!creator) {
            throw new common_1.NotFoundException('Creator not found');
        }
        if (!creator.isCreator) {
            throw new common_1.NotFoundException('User is not a creator');
        }
        const now = new Date();
        const isSubscriber = await this.subscriptionModel.exists({
            subscriber: new mongoose_2.Types.ObjectId(userId),
            creator: new mongoose_2.Types.ObjectId(creatorId),
            status: 'active',
        });
        let membership = null;
        if (isSubscriber) {
            const subscription = await this.subscriptionModel.findOne({
                subscriber: new mongoose_2.Types.ObjectId(userId),
                creator: new mongoose_2.Types.ObjectId(creatorId),
                status: 'active',
            });
            if (subscription) {
                membership = subscription.membership;
            }
        }
        const existingVisit = await this.creatorVisitModel.findOne({
            visitor: new mongoose_2.Types.ObjectId(userId),
            creator: new mongoose_2.Types.ObjectId(creatorId),
        });
        if (existingVisit) {
            existingVisit.visitCount += 1;
            existingVisit.lastVisitedAt = now;
            if (metadata) {
                if (metadata.referrer)
                    existingVisit.referrer = metadata.referrer;
                if (metadata.geoLocation)
                    existingVisit.geoLocation = metadata.geoLocation;
                if (metadata.deviceInfo)
                    existingVisit.deviceInfo = metadata.deviceInfo;
            }
            existingVisit.isSubscriber = !!isSubscriber;
            if (membership)
                existingVisit.membership = membership;
            if (!existingVisit.visitHistory)
                existingVisit.visitHistory = [];
            existingVisit.visitHistory.push(now);
            if (existingVisit.visitHistory.length > 100) {
                existingVisit.visitHistory = existingVisit.visitHistory.slice(-100);
            }
            await existingVisit.save();
        }
        else {
            await this.creatorVisitModel.create({
                visitor: new mongoose_2.Types.ObjectId(userId),
                creator: new mongoose_2.Types.ObjectId(creatorId),
                visitedAt: now,
                lastVisitedAt: now,
                visitCount: 1,
                referrer: metadata?.referrer,
                geoLocation: metadata?.geoLocation,
                deviceInfo: metadata?.deviceInfo,
                isSubscriber: !!isSubscriber,
                membership: membership,
                visitHistory: [now],
            });
        }
    }
    async getRecentlyVisited(userId, limit = 10) {
        const visitor = await this.userModel.findById(userId);
        if (!visitor) {
            throw new common_1.NotFoundException('User not found');
        }
        const recentVisits = await this.creatorVisitModel
            .find({ visitor: new mongoose_2.Types.ObjectId(userId) })
            .sort({ lastVisitedAt: -1 })
            .limit(limit)
            .populate({
            path: 'creator',
            select: 'displayName creatorUsername profilePicture creatorHeadline creatorCategory',
        })
            .populate({
            path: 'membership',
            select: 'name',
        });
        return recentVisits.map((visit) => {
            const creator = visit.creator;
            return {
                _id: creator._id,
                displayName: creator.displayName,
                creatorUsername: creator.creatorUsername,
                profilePicture: creator.profilePicture,
                creatorHeadline: creator.creatorHeadline,
                creatorCategory: creator.creatorCategory,
                lastVisitedAt: visit.lastVisitedAt.toISOString(),
                visitCount: visit.visitCount,
                isSubscriber: visit.isSubscriber,
                membershipTier: visit.membership
                    ? visit.membership.name
                    : null,
                firstVisit: visit.visitedAt.toISOString(),
            };
        });
    }
    async getPublicRecentlyVisited(limit = 10) {
        const popularCreators = await this.creatorVisitModel.aggregate([
            { $group: { _id: '$creator', totalVisits: { $sum: '$visitCount' } } },
            { $sort: { totalVisits: -1 } },
            { $limit: limit },
        ]);
        const creatorIds = popularCreators.map((item) => item._id);
        const creators = await this.userModel
            .find({ _id: { $in: creatorIds }, isCreator: true })
            .select('displayName creatorUsername profilePicture creatorHeadline creatorCategory');
        const visitCountMap = new Map();
        popularCreators.forEach((item) => {
            visitCountMap.set(item._id.toString(), item.totalVisits);
        });
        return creators.map((creator) => {
            const daysAgo = Math.floor(Math.random() * 7);
            const lastVisitedAt = new Date();
            lastVisitedAt.setDate(lastVisitedAt.getDate() - daysAgo);
            return {
                _id: creator._id,
                displayName: creator.displayName,
                creatorUsername: creator.creatorUsername,
                profilePicture: creator.profilePicture,
                creatorHeadline: creator.creatorHeadline,
                creatorCategory: creator.creatorCategory,
                lastVisitedAt: lastVisitedAt.toISOString(),
                visitCount: visitCountMap.get(creator._id.toString()) || 0,
            };
        });
    }
    async getCreatorAnalytics(creatorId, period = 'month') {
        const creator = await this.userModel.findById(creatorId);
        if (!creator || !creator.isCreator) {
            throw new common_1.NotFoundException('Creator not found');
        }
        const now = new Date();
        let startDate;
        switch (period) {
            case 'day':
                startDate = new Date(now);
                startDate.setDate(startDate.getDate() - 1);
                break;
            case 'week':
                startDate = new Date(now);
                startDate.setDate(startDate.getDate() - 7);
                break;
            case 'month':
            default:
                startDate = new Date(now);
                startDate.setMonth(startDate.getMonth() - 1);
                break;
        }
        const basicStats = await this.creatorVisitModel.aggregate([
            {
                $match: {
                    creator: new mongoose_2.Types.ObjectId(creatorId),
                    lastVisitedAt: { $gte: startDate },
                },
            },
            {
                $group: {
                    _id: null,
                    totalVisits: { $sum: '$visitCount' },
                    uniqueVisitors: { $count: {} },
                    subscriberVisits: {
                        $sum: {
                            $cond: [{ $eq: ['$isSubscriber', true] }, '$visitCount', 0],
                        },
                    },
                    nonSubscriberVisits: {
                        $sum: {
                            $cond: [{ $eq: ['$isSubscriber', false] }, '$visitCount', 0],
                        },
                    },
                    subscriberCount: {
                        $sum: { $cond: [{ $eq: ['$isSubscriber', true] }, 1, 0] },
                    },
                },
            },
        ]);
        let timeGrouping;
        switch (period) {
            case 'day':
                timeGrouping = '%Y-%m-%d %H:00';
                break;
            case 'week':
                timeGrouping = '%Y-%m-%d';
                break;
            case 'month':
            default:
                timeGrouping = '%Y-%m-%d';
                break;
        }
        const visitTrend = await this.creatorVisitModel.aggregate([
            {
                $match: {
                    creator: new mongoose_2.Types.ObjectId(creatorId),
                    lastVisitedAt: { $gte: startDate },
                },
            },
            {
                $group: {
                    _id: {
                        $dateToString: { format: timeGrouping, date: '$lastVisitedAt' },
                    },
                    visits: { $sum: '$visitCount' },
                    uniqueVisitors: { $count: {} },
                    subscriberVisits: {
                        $sum: {
                            $cond: [{ $eq: ['$isSubscriber', true] }, '$visitCount', 0],
                        },
                    },
                },
            },
            {
                $sort: { _id: 1 },
            },
        ]);
        const deviceBreakdown = await this.creatorVisitModel.aggregate([
            {
                $match: {
                    creator: new mongoose_2.Types.ObjectId(creatorId),
                    lastVisitedAt: { $gte: startDate },
                    'deviceInfo.deviceType': { $exists: true },
                },
            },
            {
                $group: {
                    _id: '$deviceInfo.deviceType',
                    count: { $sum: '$visitCount' },
                },
            },
            {
                $sort: { count: -1 },
            },
        ]);
        const geoBreakdown = await this.creatorVisitModel.aggregate([
            {
                $match: {
                    creator: new mongoose_2.Types.ObjectId(creatorId),
                    lastVisitedAt: { $gte: startDate },
                    'geoLocation.country': { $exists: true },
                },
            },
            {
                $group: {
                    _id: '$geoLocation.country',
                    count: { $sum: '$visitCount' },
                },
            },
            {
                $sort: { count: -1 },
            },
            {
                $limit: 10,
            },
        ]);
        const referrerBreakdown = await this.creatorVisitModel.aggregate([
            {
                $match: {
                    creator: new mongoose_2.Types.ObjectId(creatorId),
                    lastVisitedAt: { $gte: startDate },
                    'referrer.source': { $exists: true },
                },
            },
            {
                $group: {
                    _id: '$referrer.source',
                    count: { $sum: '$visitCount' },
                },
            },
            {
                $sort: { count: -1 },
            },
            {
                $limit: 10,
            },
        ]);
        const tierBreakdown = await this.creatorVisitModel.aggregate([
            {
                $match: {
                    creator: new mongoose_2.Types.ObjectId(creatorId),
                    lastVisitedAt: { $gte: startDate },
                    isSubscriber: true,
                    membership: { $exists: true },
                },
            },
            {
                $lookup: {
                    from: 'memberships',
                    localField: 'membership',
                    foreignField: '_id',
                    as: 'membershipInfo',
                },
            },
            {
                $unwind: { path: '$membershipInfo', preserveNullAndEmptyArrays: true },
            },
            {
                $group: {
                    _id: '$membershipInfo.name',
                    count: { $sum: '$visitCount' },
                },
            },
            {
                $sort: { count: -1 },
            },
        ]);
        const repeatVisitorsCount = await this.creatorVisitModel.countDocuments({
            creator: new mongoose_2.Types.ObjectId(creatorId),
            visitCount: { $gt: 1 },
            lastVisitedAt: { $gte: startDate },
        });
        const totalVisitorsCount = await this.creatorVisitModel.countDocuments({
            creator: new mongoose_2.Types.ObjectId(creatorId),
            lastVisitedAt: { $gte: startDate },
        });
        const repeatVisitorPercentage = totalVisitorsCount > 0
            ? (repeatVisitorsCount / totalVisitorsCount) * 100
            : 0;
        return {
            period,
            timeRange: {
                startDate: startDate.toISOString(),
                endDate: now.toISOString(),
            },
            summary: {
                totalVisits: basicStats[0]?.totalVisits || 0,
                uniqueVisitors: basicStats[0]?.uniqueVisitors || 0,
                subscriberVisits: basicStats[0]?.subscriberVisits || 0,
                nonSubscriberVisits: basicStats[0]?.nonSubscriberVisits || 0,
                subscriberCount: basicStats[0]?.subscriberCount || 0,
                subscriberPercentage: basicStats[0]?.uniqueVisitors > 0
                    ? (basicStats[0]?.subscriberCount / basicStats[0]?.uniqueVisitors) *
                        100
                    : 0,
                repeatVisitorPercentage: Math.round(repeatVisitorPercentage),
                averageVisitsPerVisitor: basicStats[0]?.uniqueVisitors > 0
                    ? basicStats[0]?.totalVisits / basicStats[0]?.uniqueVisitors
                    : 0,
            },
            trends: {
                visits: visitTrend.map((day) => ({
                    date: day._id,
                    visits: day.visits,
                    uniqueVisitors: day.uniqueVisitors,
                    subscriberVisits: day.subscriberVisits,
                })),
            },
            breakdowns: {
                devices: deviceBreakdown.map((item) => ({
                    deviceType: item._id || 'Unknown',
                    count: item.count,
                    percentage: basicStats[0]?.totalVisits > 0
                        ? (item.count / basicStats[0]?.totalVisits) * 100
                        : 0,
                })),
                geography: geoBreakdown.map((item) => ({
                    country: item._id || 'Unknown',
                    count: item.count,
                    percentage: basicStats[0]?.totalVisits > 0
                        ? (item.count / basicStats[0]?.totalVisits) * 100
                        : 0,
                })),
                referrers: referrerBreakdown.map((item) => ({
                    source: item._id || 'Direct',
                    count: item.count,
                    percentage: basicStats[0]?.totalVisits > 0
                        ? (item.count / basicStats[0]?.totalVisits) * 100
                        : 0,
                })),
                membershipTiers: tierBreakdown.map((item) => ({
                    tierName: item._id || 'Unknown',
                    count: item.count,
                    percentage: basicStats[0]?.subscriberVisits > 0
                        ? (item.count / basicStats[0]?.subscriberVisits) * 100
                        : 0,
                })),
            },
        };
    }
    async getMostEngagedVisitors(creatorId, limit = 10) {
        const creator = await this.userModel.findById(creatorId);
        if (!creator || !creator.isCreator) {
            throw new common_1.NotFoundException('Creator not found');
        }
        const engagedVisits = await this.creatorVisitModel
            .find({ creator: new mongoose_2.Types.ObjectId(creatorId) })
            .sort({ visitCount: -1 })
            .limit(limit)
            .populate({
            path: 'visitor',
            select: 'displayName profilePicture email',
        })
            .populate({
            path: 'membership',
            select: 'name',
        });
        return engagedVisits.map((visit) => {
            const visitor = visit.visitor;
            return {
                visitorId: visitor._id,
                displayName: visitor.displayName,
                profilePicture: visitor.profilePicture,
                email: visitor.email,
                visitCount: visit.visitCount,
                lastVisited: visit.lastVisitedAt,
                firstVisited: visit.visitedAt,
                isSubscriber: visit.isSubscriber,
                membershipTier: visit.membership
                    ? visit.membership.name
                    : null,
                visitorLocation: visit.geoLocation?.country
                    ? `${visit.geoLocation.city || ''} ${visit.geoLocation.country}`.trim()
                    : 'Unknown',
                deviceType: visit.deviceInfo?.deviceType || 'Unknown',
            };
        });
    }
    async exportVisitorHistory(creatorId, startDate, endDate) {
        const creator = await this.userModel.findById(creatorId);
        if (!creator || !creator.isCreator) {
            throw new common_1.NotFoundException('Creator not found');
        }
        const query = { creator: new mongoose_2.Types.ObjectId(creatorId) };
        if (startDate || endDate) {
            query.lastVisitedAt = {};
            if (startDate)
                query.lastVisitedAt.$gte = startDate;
            if (endDate)
                query.lastVisitedAt.$lte = endDate;
        }
        const visits = await this.creatorVisitModel
            .find(query)
            .sort({ lastVisitedAt: -1 })
            .populate({
            path: 'visitor',
            select: 'displayName email',
        })
            .populate({
            path: 'membership',
            select: 'name',
        });
        return visits.map((visit) => {
            const visitor = visit.visitor;
            return {
                visitorId: visitor._id.toString(),
                visitorName: visitor.displayName || 'Anonymous',
                visitorEmail: visitor.email || 'N/A',
                firstVisit: visit.visitedAt.toISOString(),
                lastVisit: visit.lastVisitedAt.toISOString(),
                visitCount: visit.visitCount,
                isSubscriber: visit.isSubscriber ? 'Yes' : 'No',
                membershipTier: visit.membership
                    ? visit.membership.name
                    : 'N/A',
                country: visit.geoLocation?.country || 'Unknown',
                city: visit.geoLocation?.city || 'Unknown',
                deviceType: visit.deviceInfo?.deviceType || 'Unknown',
                browser: visit.deviceInfo?.browser || 'Unknown',
                operatingSystem: visit.deviceInfo?.os || 'Unknown',
                referrerSource: visit.referrer?.source || 'Direct',
                referrerUrl: visit.referrer?.url || 'N/A',
            };
        });
    }
};
exports.CreatorHistoryService = CreatorHistoryService;
exports.CreatorHistoryService = CreatorHistoryService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(user_1.User.name)),
    __param(1, (0, mongoose_1.InjectModel)(engagement_1.CreatorVisit.name)),
    __param(2, (0, mongoose_1.InjectModel)(subscription_1.Subscription.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model])
], CreatorHistoryService);
//# sourceMappingURL=creator-history.service.js.map