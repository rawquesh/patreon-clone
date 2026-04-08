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
exports.AnalyticsController = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const analytics_service_1 = require("./analytics.service");
const analytics_dto_1 = require("./analytics.dto");
let AnalyticsController = class AnalyticsController {
    constructor(analyticsService) {
        this.analyticsService = analyticsService;
    }
    async getMembershipInsights(req, queryParams) {
        try {
            const userId = req.user.userId;
            if (!userId) {
                throw new common_1.BadRequestException('User not authenticated');
            }
            return await this.analyticsService.getMembershipInsights(userId, queryParams.timeRange);
        }
        catch (error) {
            throw new common_1.BadRequestException(`Failed to fetch membership insights: ${error.message}`);
        }
    }
    async getEarningsInsights(req, queryParams) {
        try {
            const userId = req.user.userId;
            if (!userId) {
                throw new common_1.BadRequestException('User not authenticated');
            }
            return await this.analyticsService.getEarningsInsights(userId, queryParams.timeRange);
        }
        catch (error) {
            throw new common_1.BadRequestException(`Failed to fetch earnings insights: ${error.message}`);
        }
    }
    async getTransactionDetails(req, queryParams) {
        try {
            const userId = req.user.userId;
            if (!userId) {
                throw new common_1.BadRequestException('User not authenticated');
            }
            return await this.analyticsService.getTransactionDetails(userId, queryParams.timeRange);
        }
        catch (error) {
            throw new common_1.BadRequestException(`Failed to fetch transaction details: ${error.message}`);
        }
    }
    async getPostsInsights(req, queryParams) {
        try {
            const userId = req.user.userId;
            if (!userId) {
                throw new common_1.BadRequestException('User not authenticated');
            }
            return await this.analyticsService.getPostsInsights(userId, queryParams.timeRange);
        }
        catch (error) {
            throw new common_1.BadRequestException(`Failed to fetch posts insights: ${error.message}`);
        }
    }
};
exports.AnalyticsController = AnalyticsController;
__decorate([
    (0, common_1.Get)('memberships'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)(new common_1.ValidationPipe({ transform: true }))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, analytics_dto_1.MembershipInsightsDto]),
    __metadata("design:returntype", Promise)
], AnalyticsController.prototype, "getMembershipInsights", null);
__decorate([
    (0, common_1.Get)('earnings'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)(new common_1.ValidationPipe({ transform: true }))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, analytics_dto_1.EarningsInsightsDto]),
    __metadata("design:returntype", Promise)
], AnalyticsController.prototype, "getEarningsInsights", null);
__decorate([
    (0, common_1.Get)('transactions'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)(new common_1.ValidationPipe({ transform: true }))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, analytics_dto_1.TransactionDetailsDto]),
    __metadata("design:returntype", Promise)
], AnalyticsController.prototype, "getTransactionDetails", null);
__decorate([
    (0, common_1.Get)('posts'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)(new common_1.ValidationPipe({ transform: true }))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, analytics_dto_1.PostsInsightsDto]),
    __metadata("design:returntype", Promise)
], AnalyticsController.prototype, "getPostsInsights", null);
exports.AnalyticsController = AnalyticsController = __decorate([
    (0, common_1.Controller)('analytics'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __metadata("design:paramtypes", [analytics_service_1.AnalyticsService])
], AnalyticsController);
//# sourceMappingURL=analytics.controller.js.map