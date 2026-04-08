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
exports.MembersService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const subscription_1 = require("../database/schemas/subscription");
const user_1 = require("../database/schemas/user");
const membership_1 = require("../database/schemas/membership");
let MembersService = class MembersService {
    constructor(subscriptionModel, userModel, membershipModel) {
        this.subscriptionModel = subscriptionModel;
        this.userModel = userModel;
        this.membershipModel = membershipModel;
    }
    async getMembers(creatorId, filters) {
        const creator = await this.userModel.findById(creatorId);
        if (!creator) {
            throw new common_1.NotFoundException('Creator not found');
        }
        const filter = {
            creator: new mongoose_2.Types.ObjectId(creatorId),
        };
        if (filters.status) {
            filter.status = filters.status;
        }
        if (filters.tier) {
            filter.membership = new mongoose_2.Types.ObjectId(filters.tier);
        }
        if (filters.joinDate) {
            const date = new Date(filters.joinDate);
            if (!isNaN(date.getTime())) {
                const startDate = new Date(date);
                startDate.setHours(0, 0, 0, 0);
                const endDate = new Date(date);
                endDate.setHours(23, 59, 59, 999);
                filter.createdAt = {
                    $gte: startDate,
                    $lte: endDate,
                };
            }
        }
        const sort = {};
        const sortFieldMap = {
            name: 'subscriberInfo.displayName',
            email: 'subscriberInfo.email',
            joinDate: 'createdAt',
            totalPaid: 'totalPaid',
            tier: 'membershipInfo.name',
            status: 'status',
        };
        const sortField = sortFieldMap[filters.sortBy] || 'createdAt';
        sort[sortField] = filters.sortOrder === 'asc' ? 1 : -1;
        const pipeline = [];
        pipeline.push({ $match: filter });
        pipeline.push({
            $lookup: {
                from: 'users',
                localField: 'subscriber',
                foreignField: '_id',
                as: 'subscriberInfo',
            },
        });
        pipeline.push({
            $unwind: { path: '$subscriberInfo', preserveNullAndEmptyArrays: true },
        });
        pipeline.push({
            $lookup: {
                from: 'memberships',
                localField: 'membership',
                foreignField: '_id',
                as: 'membershipInfo',
            },
        });
        pipeline.push({
            $unwind: { path: '$membershipInfo', preserveNullAndEmptyArrays: true },
        });
        if (filters.search) {
            pipeline.push({
                $match: {
                    $or: [
                        {
                            'subscriberInfo.displayName': {
                                $regex: filters.search,
                                $options: 'i',
                            },
                        },
                        {
                            'subscriberInfo.email': { $regex: filters.search, $options: 'i' },
                        },
                        {
                            'membershipInfo.name': { $regex: filters.search, $options: 'i' },
                        },
                    ],
                },
            });
        }
        const countPipeline = [...pipeline];
        countPipeline.push({ $count: 'total' });
        const countResult = await this.subscriptionModel.aggregate(countPipeline);
        const total = countResult.length > 0 ? countResult[0].total : 0;
        pipeline.push({ $sort: sort });
        const skip = (filters.page - 1) * filters.limit;
        pipeline.push({ $skip: skip });
        pipeline.push({ $limit: filters.limit });
        pipeline.push({
            $project: {
                _id: 0,
                id: { $toString: '$_id' },
                name: '$subscriberInfo.displayName',
                email: '$subscriberInfo.email',
                profilePicture: '$subscriberInfo.profilePicture',
                tier: {
                    id: { $toString: '$membershipInfo._id' },
                    name: '$membershipInfo.name',
                    monthlyRate: '$membershipInfo.monthlyRate',
                },
                joinDate: '$createdAt',
                status: 1,
                currentPeriodEnd: 1,
                totalPaid: {
                    $multiply: [
                        { $ifNull: ['$monthlyRate', 0] },
                        {
                            $divide: [
                                {
                                    $subtract: [new Date(), '$createdAt'],
                                },
                                2592000000,
                            ],
                        },
                    ],
                },
            },
        });
        const members = await this.subscriptionModel.aggregate(pipeline);
        const totalPages = Math.ceil(total / filters.limit);
        return {
            members,
            pagination: {
                total,
                page: filters.page,
                limit: filters.limit,
                totalPages,
            },
        };
    }
};
exports.MembersService = MembersService;
exports.MembersService = MembersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(subscription_1.Subscription.name)),
    __param(1, (0, mongoose_1.InjectModel)(user_1.User.name)),
    __param(2, (0, mongoose_1.InjectModel)(membership_1.Membership.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model])
], MembersService);
//# sourceMappingURL=members.service.js.map