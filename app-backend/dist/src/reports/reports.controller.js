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
exports.ReportsController = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const reports_service_1 = require("./reports.service");
const reports_dto_1 = require("./reports.dto");
const admin_guard_1 = require("../modules/admin/admin.guard");
let ReportsController = class ReportsController {
    constructor(reportsService) {
        this.reportsService = reportsService;
    }
    async createPostReport(req, createPostReportDto) {
        const report = await this.reportsService.createPostReport(req.user.userId, createPostReportDto);
        return {
            message: 'Post reported successfully',
            report,
        };
    }
    async getPostReports(query) {
        const { reports, total } = await this.reportsService.getPostReports(query);
        return {
            reports,
            pagination: {
                total,
                page: query.page || 1,
                limit: query.limit || 10,
                totalPages: Math.ceil(total / (query.limit || 10)),
            },
        };
    }
    async getReportsByPostId(postId) {
        const reports = await this.reportsService.getPostReportsByPostId(postId);
        const count = await this.reportsService.getPostReportsCount(postId);
        return {
            reports,
            count,
        };
    }
    async getPostReportById(id) {
        const report = await this.reportsService.getPostReportById(id);
        return { report };
    }
    async updatePostReportStatus(req, id, updateStatusDto) {
        const report = await this.reportsService.updatePostReportStatus(id, req.user.userId, updateStatusDto);
        return {
            message: 'Report status updated successfully',
            report,
        };
    }
    async deletePostReport(id) {
        await this.reportsService.deletePostReport(id);
        return {
            message: 'Report deleted successfully',
        };
    }
    async createUserReport(req, createUserReportDto) {
        const report = await this.reportsService.createUserReport(req.user.userId, createUserReportDto);
        return {
            message: 'User reported successfully',
            report,
        };
    }
    async getUserReports(query) {
        const { reports, total } = await this.reportsService.getUserReports(query);
        return {
            reports,
            pagination: {
                total,
                page: query.page || 1,
                limit: query.limit || 10,
                totalPages: Math.ceil(total / (query.limit || 10)),
            },
        };
    }
    async getReportsByUserId(userId) {
        const reports = await this.reportsService.getUserReportsByUserId(userId);
        const count = await this.reportsService.getUserReportsCount(userId);
        return {
            reports,
            count,
        };
    }
    async getUserReportById(id) {
        const report = await this.reportsService.getUserReportById(id);
        return { report };
    }
    async updateUserReportStatus(req, id, updateStatusDto) {
        const report = await this.reportsService.updateUserReportStatus(id, req.user.userId, updateStatusDto);
        return {
            message: 'Report status updated successfully',
            report,
        };
    }
    async deleteUserReport(id) {
        await this.reportsService.deleteUserReport(id);
        return {
            message: 'Report deleted successfully',
        };
    }
    async getReportStatistics() {
        const statistics = await this.reportsService.getReportStatistics();
        return { statistics };
    }
    async withholdPost(req, postId, withholdDto) {
        const withheldPost = await this.reportsService.withholdPost(postId, req.user.userId, withholdDto);
        return {
            message: 'Post withheld successfully',
            withheldPost,
        };
    }
    async restorePost(req, withheldPostId, restoreDto) {
        const restoredPost = await this.reportsService.restorePost(withheldPostId, req.user.userId, restoreDto);
        return {
            message: 'Post restored successfully',
            post: restoredPost,
        };
    }
    async getWithheldPosts(page = 1, limit = 10) {
        const { posts, total } = await this.reportsService.getWithheldPosts(page, limit);
        return {
            posts,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async getWithheldPostById(id) {
        const post = await this.reportsService.getWithheldPostById(id);
        return { post };
    }
    async withholdUser(req, userId, withholdDto) {
        const withheldUser = await this.reportsService.withholdUser(userId, req.user.userId, withholdDto);
        return {
            message: 'User withheld successfully',
            withheldUser,
        };
    }
    async restoreUser(req, withheldUserId, restoreDto) {
        const restoredUser = await this.reportsService.restoreUser(withheldUserId, req.user.userId, restoreDto);
        return {
            message: 'User restored successfully',
            user: restoredUser,
        };
    }
    async getWithheldUsers(page = 1, limit = 10) {
        const { users, total } = await this.reportsService.getWithheldUsers(page, limit);
        return {
            users,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async getWithheldUserById(id) {
        const user = await this.reportsService.getWithheldUserById(id);
        return { user };
    }
};
exports.ReportsController = ReportsController;
__decorate([
    (0, common_1.Post)('posts'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, reports_dto_1.CreatePostReportDto]),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "createPostReport", null);
__decorate([
    (0, common_1.Get)('posts'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt'), admin_guard_1.AdminGuard),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [reports_dto_1.GetReportsQueryDto]),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "getPostReports", null);
__decorate([
    (0, common_1.Get)('posts/by-post/:postId'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt'), admin_guard_1.AdminGuard),
    __param(0, (0, common_1.Param)('postId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "getReportsByPostId", null);
__decorate([
    (0, common_1.Get)('posts/:id'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt'), admin_guard_1.AdminGuard),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "getPostReportById", null);
__decorate([
    (0, common_1.Put)('posts/:id/status'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt'), admin_guard_1.AdminGuard),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, reports_dto_1.UpdateReportStatusDto]),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "updatePostReportStatus", null);
__decorate([
    (0, common_1.Delete)('posts/:id'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt'), admin_guard_1.AdminGuard),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "deletePostReport", null);
__decorate([
    (0, common_1.Post)('users'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, reports_dto_1.CreateUserReportDto]),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "createUserReport", null);
__decorate([
    (0, common_1.Get)('users'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt'), admin_guard_1.AdminGuard),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [reports_dto_1.GetUserReportsQueryDto]),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "getUserReports", null);
__decorate([
    (0, common_1.Get)('users/by-user/:userId'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt'), admin_guard_1.AdminGuard),
    __param(0, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "getReportsByUserId", null);
__decorate([
    (0, common_1.Get)('users/:id'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt'), admin_guard_1.AdminGuard),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "getUserReportById", null);
__decorate([
    (0, common_1.Put)('users/:id/status'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt'), admin_guard_1.AdminGuard),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, reports_dto_1.UpdateUserReportStatusDto]),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "updateUserReportStatus", null);
__decorate([
    (0, common_1.Delete)('users/:id'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt'), admin_guard_1.AdminGuard),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "deleteUserReport", null);
__decorate([
    (0, common_1.Get)('statistics'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt'), admin_guard_1.AdminGuard),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "getReportStatistics", null);
__decorate([
    (0, common_1.Post)('withhold/post/:postId'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt'), admin_guard_1.AdminGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('postId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, reports_dto_1.WithholdPostDto]),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "withholdPost", null);
__decorate([
    (0, common_1.Post)('restore/post/:withheldPostId'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt'), admin_guard_1.AdminGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('withheldPostId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, reports_dto_1.RestorePostDto]),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "restorePost", null);
__decorate([
    (0, common_1.Get)('withheld/posts'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt'), admin_guard_1.AdminGuard),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "getWithheldPosts", null);
__decorate([
    (0, common_1.Get)('withheld/posts/:id'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt'), admin_guard_1.AdminGuard),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "getWithheldPostById", null);
__decorate([
    (0, common_1.Post)('withhold/user/:userId'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt'), admin_guard_1.AdminGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('userId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, reports_dto_1.WithholdUserDto]),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "withholdUser", null);
__decorate([
    (0, common_1.Post)('restore/user/:withheldUserId'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt'), admin_guard_1.AdminGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('withheldUserId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, reports_dto_1.RestoreUserDto]),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "restoreUser", null);
__decorate([
    (0, common_1.Get)('withheld/users'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt'), admin_guard_1.AdminGuard),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "getWithheldUsers", null);
__decorate([
    (0, common_1.Get)('withheld/users/:id'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt'), admin_guard_1.AdminGuard),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "getWithheldUserById", null);
exports.ReportsController = ReportsController = __decorate([
    (0, common_1.Controller)('reports'),
    __metadata("design:paramtypes", [reports_service_1.ReportsService])
], ReportsController);
//# sourceMappingURL=reports.controller.js.map