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
exports.CreatorController = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const creator_history_service_1 = require("./creator-history.service");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const user_1 = require("../database/schemas/user");
const posts_service_1 = require("../posts/posts.service");
const memberships_service_1 = require("../memberships/memberships.service");
const collections_service_1 = require("../collections/collections.service");
let CreatorController = class CreatorController {
    constructor(userModel, creatorHistoryService, postsService, membershipsService, collectionsService) {
        this.userModel = userModel;
        this.creatorHistoryService = creatorHistoryService;
        this.postsService = postsService;
        this.membershipsService = membershipsService;
        this.collectionsService = collectionsService;
    }
    async getCreatorByUsername(username, req) {
        const creator = await this.userModel
            .findOne({
            creatorUsername: username,
            isCreator: true,
        })
            .select('_id displayName creatorUsername profilePicture profileCover creatorHeadline creatorCategory');
        if (!creator) {
            throw new common_1.NotFoundException('Creator not found');
        }
        if (req.user?.userId) {
            try {
                await this.creatorHistoryService.recordVisit(req.user.userId, creator._id.toString());
            }
            catch (error) {
                console.error('Failed to record creator visit:', error.message);
            }
        }
        return creator;
    }
    async recordVisit(creatorId, req) {
        await this.creatorHistoryService.recordVisit(req.user.userId, creatorId);
        return { success: true };
    }
    async getCreatorStats(creatorId) {
        const creator = await this.userModel.findById(creatorId);
        if (!creator || !creator.isCreator) {
            throw new common_1.NotFoundException('Creator not found');
        }
        const postsCount = await this.postsService.getPostCount(creatorId);
        const membershipsData = await this.membershipsService.getCreatorMemberships(creatorId, {
            activeOnly: true,
            page: 1,
            limit: 100,
        });
        const totalMembers = membershipsData.totalSubscribers || 0;
        const tierBreakdown = membershipsData.memberships.map((tier) => ({
            id: tier._id.toString(),
            name: tier.name,
            count: tier.subscriberCount || 0,
            monthlyRate: tier.monthlyRate,
        }));
        return {
            totalPosts: postsCount,
            totalMembers,
            tierBreakdown,
            totalEarnings: membershipsData.totalEarnings || 0,
            introVideoUrl: creator.introVideoUrl,
            bio: creator.bio,
            socialLinks: creator.socialLinks || [],
        };
    }
    async getRecentlyVisitedCreators(req, limit) {
        const recentlyVisited = await this.creatorHistoryService.getRecentlyVisited(req.user.userId, limit ? parseInt(limit, 10) : 10);
        return recentlyVisited;
    }
    async getCreatorAnalytics(creatorId, req, period) {
        if (req.user.userId !== creatorId) {
            throw new common_1.UnauthorizedException('You can only view analytics for your own profile');
        }
        return this.creatorHistoryService.getCreatorAnalytics(creatorId, period || 'month');
    }
    async getMostEngagedVisitors(creatorId, req, limit) {
        if (req.user.userId !== creatorId) {
            throw new common_1.UnauthorizedException('You can only view visitor data for your own profile');
        }
        return this.creatorHistoryService.getMostEngagedVisitors(creatorId, limit ? parseInt(limit, 10) : 10);
    }
    async exportVisitorHistory(creatorId, req, startDate, endDate) {
        if (req.user.userId !== creatorId) {
            throw new common_1.UnauthorizedException('You can only export visitor data for your own profile');
        }
        return this.creatorHistoryService.exportVisitorHistory(creatorId, startDate ? new Date(startDate) : undefined, endDate ? new Date(endDate) : undefined);
    }
};
exports.CreatorController = CreatorController;
__decorate([
    (0, common_1.Get)(':username'),
    __param(0, (0, common_1.Param)('username')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], CreatorController.prototype, "getCreatorByUsername", null);
__decorate([
    (0, common_1.Post)(':creatorId/record-visit'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __param(0, (0, common_1.Param)('creatorId')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], CreatorController.prototype, "recordVisit", null);
__decorate([
    (0, common_1.Get)(':creatorId/stats'),
    __param(0, (0, common_1.Param)('creatorId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CreatorController.prototype, "getCreatorStats", null);
__decorate([
    (0, common_1.Get)('history/recent'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], CreatorController.prototype, "getRecentlyVisitedCreators", null);
__decorate([
    (0, common_1.Get)(':creatorId/analytics'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __param(0, (0, common_1.Param)('creatorId')),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Query)('period')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String]),
    __metadata("design:returntype", Promise)
], CreatorController.prototype, "getCreatorAnalytics", null);
__decorate([
    (0, common_1.Get)(':creatorId/engaged-visitors'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __param(0, (0, common_1.Param)('creatorId')),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String]),
    __metadata("design:returntype", Promise)
], CreatorController.prototype, "getMostEngagedVisitors", null);
__decorate([
    (0, common_1.Get)(':creatorId/export-visitors'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __param(0, (0, common_1.Param)('creatorId')),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Query)('startDate')),
    __param(3, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String, String]),
    __metadata("design:returntype", Promise)
], CreatorController.prototype, "exportVisitorHistory", null);
exports.CreatorController = CreatorController = __decorate([
    (0, common_1.Controller)('creator'),
    __param(0, (0, mongoose_1.InjectModel)(user_1.User.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        creator_history_service_1.CreatorHistoryService,
        posts_service_1.PostsService,
        memberships_service_1.MembershipsService,
        collections_service_1.CollectionsService])
], CreatorController);
//# sourceMappingURL=creator.controller.js.map