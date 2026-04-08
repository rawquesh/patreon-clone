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
exports.AdminController = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const admin_service_1 = require("./admin.service");
const admin_guard_1 = require("./admin.guard");
const admin_dto_1 = require("./admin.dto");
let AdminController = class AdminController {
    constructor(adminService) {
        this.adminService = adminService;
    }
    async createPostReport(req, createPostReportDto) {
        const report = await this.adminService.createPostReport(req.user.userId, createPostReportDto);
        return { message: 'Post reported successfully', report };
    }
    async createUserReport(req, createUserReportDto) {
        const report = await this.adminService.createUserReport(req.user.userId, createUserReportDto);
        return { message: 'User reported successfully', report };
    }
    async getPostReports(query) {
        const { reports, total } = await this.adminService.getPostReports(query);
        const page = query.page ?? 1;
        const limit = query.limit ?? 10;
        return {
            reports,
            pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
        };
    }
    async getReportsByPostId(postId) {
        const reports = await this.adminService.getPostReportsByPostId(postId);
        return { reports, count: reports.length };
    }
    async getPostReportById(id) {
        const report = await this.adminService.getPostReportById(id);
        return { report };
    }
    async updatePostReportStatus(req, id, updateStatusDto) {
        const report = await this.adminService.updatePostReportStatus(id, req.user.userId, updateStatusDto);
        return { message: 'Report status updated successfully', report };
    }
    async deletePostReport(id) {
        await this.adminService.deletePostReport(id);
        return { message: 'Report deleted successfully' };
    }
    async getUserReports(query) {
        const { reports, total } = await this.adminService.getUserReports(query);
        const page = query.page ?? 1;
        const limit = query.limit ?? 10;
        return {
            reports,
            pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
        };
    }
    async getReportsByUserId(userId) {
        const reports = await this.adminService.getUserReportsByUserId(userId);
        return { reports, count: reports.length };
    }
    async getUserReportById(id) {
        const report = await this.adminService.getUserReportById(id);
        return { report };
    }
    async updateUserReportStatus(req, id, updateStatusDto) {
        const report = await this.adminService.updateUserReportStatus(id, req.user.userId, updateStatusDto);
        return { message: 'Report status updated successfully', report };
    }
    async deleteUserReport(id) {
        await this.adminService.deleteUserReport(id);
        return { message: 'Report deleted successfully' };
    }
    async getReportStatistics() {
        const statistics = await this.adminService.getReportStatistics();
        return { statistics };
    }
    async withholdPost(req, postId, withholdDto) {
        const withheldPost = await this.adminService.withholdPost(postId, req.user.userId, withholdDto);
        return { message: 'Post withheld successfully', withheldPost };
    }
    async restorePost(withheldPostId) {
        const post = await this.adminService.restorePost(withheldPostId);
        return { message: 'Post restored successfully', post };
    }
    async getWithheldPosts(page = 1, limit = 10) {
        const { posts, total } = await this.adminService.getWithheldPosts(page, limit);
        return {
            posts,
            pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
        };
    }
    async getWithheldPostById(id) {
        const post = await this.adminService.getWithheldPostById(id);
        return { post };
    }
    async withholdUser(req, userId, withholdDto) {
        const withheldUser = await this.adminService.withholdUser(userId, req.user.userId, withholdDto);
        return { message: 'User withheld successfully', withheldUser };
    }
    async restoreUser(withheldUserId) {
        const user = await this.adminService.restoreUser(withheldUserId);
        return { message: 'User restored successfully', user };
    }
    async getWithheldUsers(page = 1, limit = 10) {
        const { users, total } = await this.adminService.getWithheldUsers(page, limit);
        return {
            users,
            pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
        };
    }
    async getWithheldUserById(id) {
        const user = await this.adminService.getWithheldUserById(id);
        return { user };
    }
};
exports.AdminController = AdminController;
__decorate([
    (0, common_1.Post)('reports/posts'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, admin_dto_1.CreatePostReportDto]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "createPostReport", null);
__decorate([
    (0, common_1.Post)('reports/users'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, admin_dto_1.CreateUserReportDto]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "createUserReport", null);
__decorate([
    (0, common_1.Get)('reports/posts'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [admin_dto_1.GetReportsQueryDto]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getPostReports", null);
__decorate([
    (0, common_1.Get)('reports/posts/by-post/:postId'),
    __param(0, (0, common_1.Param)('postId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getReportsByPostId", null);
__decorate([
    (0, common_1.Get)('reports/posts/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getPostReportById", null);
__decorate([
    (0, common_1.Put)('reports/posts/:id/status'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, admin_dto_1.UpdateReportStatusDto]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "updatePostReportStatus", null);
__decorate([
    (0, common_1.Delete)('reports/posts/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "deletePostReport", null);
__decorate([
    (0, common_1.Get)('reports/users'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [admin_dto_1.GetUserReportsQueryDto]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getUserReports", null);
__decorate([
    (0, common_1.Get)('reports/users/by-user/:userId'),
    __param(0, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getReportsByUserId", null);
__decorate([
    (0, common_1.Get)('reports/users/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getUserReportById", null);
__decorate([
    (0, common_1.Put)('reports/users/:id/status'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, admin_dto_1.UpdateUserReportStatusDto]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "updateUserReportStatus", null);
__decorate([
    (0, common_1.Delete)('reports/users/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "deleteUserReport", null);
__decorate([
    (0, common_1.Get)('reports/statistics'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getReportStatistics", null);
__decorate([
    (0, common_1.Post)('reports/withhold/post/:postId'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('postId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, admin_dto_1.WithholdPostDto]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "withholdPost", null);
__decorate([
    (0, common_1.Post)('reports/restore/post/:withheldPostId'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)('withheldPostId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "restorePost", null);
__decorate([
    (0, common_1.Get)('reports/withheld/posts'),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getWithheldPosts", null);
__decorate([
    (0, common_1.Get)('reports/withheld/posts/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getWithheldPostById", null);
__decorate([
    (0, common_1.Post)('reports/withhold/user/:userId'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('userId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, admin_dto_1.WithholdUserDto]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "withholdUser", null);
__decorate([
    (0, common_1.Post)('reports/restore/user/:withheldUserId'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)('withheldUserId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "restoreUser", null);
__decorate([
    (0, common_1.Get)('reports/withheld/users'),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getWithheldUsers", null);
__decorate([
    (0, common_1.Get)('reports/withheld/users/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getWithheldUserById", null);
exports.AdminController = AdminController = __decorate([
    (0, common_1.Controller)('admin'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt'), admin_guard_1.AdminGuard),
    __metadata("design:paramtypes", [admin_service_1.AdminService])
], AdminController);
//# sourceMappingURL=admin.controller.js.map