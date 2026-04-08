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
exports.ReportsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const post_report_schema_1 = require("../database/schemas/report/post-report.schema");
const user_report_schema_1 = require("../database/schemas/report/user-report.schema");
const post_1 = require("../database/schemas/post");
const user_1 = require("../database/schemas/user");
const withheld_schema_1 = require("../database/schemas/report/withheld.schema");
const withheld_schema_2 = require("../database/schemas/report/withheld.schema");
let ReportsService = class ReportsService {
    constructor(postReportModel, userReportModel, postModel, userModel, withheldPostModel, withheldUserModel) {
        this.postReportModel = postReportModel;
        this.userReportModel = userReportModel;
        this.postModel = postModel;
        this.userModel = userModel;
        this.withheldPostModel = withheldPostModel;
        this.withheldUserModel = withheldUserModel;
    }
    async createPostReport(reportedBy, createPostReportDto) {
        const { postId, reason, description, additionalContext } = createPostReportDto;
        const post = await this.postModel.findById(postId);
        if (!post) {
            throw new common_1.NotFoundException('Post not found');
        }
        const reporter = await this.userModel.findById(reportedBy);
        if (!reporter) {
            throw new common_1.NotFoundException('Reporter user not found');
        }
        const existingReport = await this.postReportModel.findOne({
            post: postId,
            reportedBy,
        });
        if (existingReport) {
            throw new common_1.ConflictException('You have already reported this post');
        }
        const report = new this.postReportModel({
            post: postId,
            reportedBy,
            reason,
            description,
            additionalContext,
        });
        const savedReport = await report.save();
        await savedReport.populate([
            {
                path: 'post',
                select: 'title type creator',
                populate: {
                    path: 'creator',
                    select: 'displayName email profilePicture',
                },
            },
            {
                path: 'reportedBy',
                select: 'displayName email profilePicture',
            },
        ]);
        return savedReport;
    }
    async getPostReports(query) {
        const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc', status, reportedBy, postId, } = query;
        const filter = {};
        if (status)
            filter.status = status;
        if (reportedBy)
            filter.reportedBy = reportedBy;
        if (postId)
            filter.post = postId;
        const skip = (page - 1) * limit;
        const sortObj = {};
        sortObj[sortBy] = sortOrder === 'asc' ? 1 : -1;
        const [reports, total] = await Promise.all([
            this.postReportModel
                .find(filter)
                .populate([
                {
                    path: 'post',
                    select: 'title type creator status',
                    populate: {
                        path: 'creator',
                        select: 'displayName email profilePicture creatorUsername',
                    },
                },
                {
                    path: 'reportedBy',
                    select: 'displayName email profilePicture',
                },
                {
                    path: 'reviewedBy',
                    select: 'displayName email',
                },
            ])
                .sort(sortObj)
                .skip(skip)
                .limit(limit)
                .exec(),
            this.postReportModel.countDocuments(filter),
        ]);
        return { reports, total };
    }
    async getPostReportById(reportId) {
        const report = await this.postReportModel
            .findById(reportId)
            .populate([
            {
                path: 'post',
                select: 'title type creator status description',
                populate: {
                    path: 'creator',
                    select: 'displayName email profilePicture creatorUsername',
                },
            },
            {
                path: 'reportedBy',
                select: 'displayName email profilePicture',
            },
            {
                path: 'reviewedBy',
                select: 'displayName email',
            },
        ])
            .exec();
        if (!report) {
            throw new common_1.NotFoundException('Report not found');
        }
        return report;
    }
    async updatePostReportStatus(reportId, reviewerId, updateStatusDto) {
        const { status, adminNotes } = updateStatusDto;
        const report = await this.postReportModel.findById(reportId);
        if (!report) {
            throw new common_1.NotFoundException('Report not found');
        }
        report.status = status;
        if (adminNotes) {
            report.adminNotes = adminNotes;
        }
        report.reviewedBy = reviewerId;
        report.reviewedAt = new Date();
        await report.save();
        await report.populate([
            {
                path: 'post',
                select: 'title type creator status',
                populate: {
                    path: 'creator',
                    select: 'displayName email profilePicture creatorUsername',
                },
            },
            {
                path: 'reportedBy',
                select: 'displayName email profilePicture',
            },
            {
                path: 'reviewedBy',
                select: 'displayName email',
            },
        ]);
        return report;
    }
    async deletePostReport(reportId) {
        const result = await this.postReportModel.findByIdAndDelete(reportId);
        if (!result) {
            throw new common_1.NotFoundException('Report not found');
        }
    }
    async getPostReportsByPostId(postId) {
        const reports = await this.postReportModel
            .find({ post: postId })
            .populate([
            {
                path: 'reportedBy',
                select: 'displayName email profilePicture',
            },
            {
                path: 'reviewedBy',
                select: 'displayName email',
            },
        ])
            .sort({ createdAt: -1 })
            .exec();
        return reports;
    }
    async getPostReportsCount(postId) {
        return await this.postReportModel.countDocuments({ post: postId });
    }
    async createUserReport(reportedBy, createUserReportDto) {
        const { userId, reason, description, additionalContext } = createUserReportDto;
        const reportedUser = await this.userModel.findById(userId);
        if (!reportedUser) {
            throw new common_1.NotFoundException('Reported user not found');
        }
        const reporter = await this.userModel.findById(reportedBy);
        if (!reporter) {
            throw new common_1.NotFoundException('Reporter user not found');
        }
        if (userId === reportedBy) {
            throw new common_1.BadRequestException('You cannot report yourself');
        }
        const existingReport = await this.userReportModel.findOne({
            reportedUser: userId,
            reportedBy,
        });
        if (existingReport) {
            throw new common_1.ConflictException('You have already reported this user');
        }
        const report = new this.userReportModel({
            reportedUser: userId,
            reportedBy,
            reason,
            description,
            additionalContext,
        });
        const savedReport = await report.save();
        await savedReport.populate([
            {
                path: 'reportedUser',
                select: 'displayName email profilePicture isCreator creatorUsername creatorCategory',
            },
            {
                path: 'reportedBy',
                select: 'displayName email profilePicture',
            },
        ]);
        return savedReport;
    }
    async getUserReports(query) {
        const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc', status, reportedBy, userId, } = query;
        const filter = {};
        if (status)
            filter.status = status;
        if (reportedBy)
            filter.reportedBy = reportedBy;
        if (userId)
            filter.reportedUser = userId;
        const skip = (page - 1) * limit;
        const sortObj = {};
        sortObj[sortBy] = sortOrder === 'asc' ? 1 : -1;
        const [reports, total] = await Promise.all([
            this.userReportModel
                .find(filter)
                .populate([
                {
                    path: 'reportedUser',
                    select: 'displayName email profilePicture isCreator creatorUsername creatorCategory',
                },
                {
                    path: 'reportedBy',
                    select: 'displayName email profilePicture',
                },
                {
                    path: 'reviewedBy',
                    select: 'displayName email',
                },
            ])
                .sort(sortObj)
                .skip(skip)
                .limit(limit)
                .exec(),
            this.userReportModel.countDocuments(filter),
        ]);
        return { reports, total };
    }
    async getUserReportById(reportId) {
        const report = await this.userReportModel
            .findById(reportId)
            .populate([
            {
                path: 'reportedUser',
                select: 'displayName email profilePicture isCreator creatorUsername creatorCategory bio',
            },
            {
                path: 'reportedBy',
                select: 'displayName email profilePicture',
            },
            {
                path: 'reviewedBy',
                select: 'displayName email',
            },
        ])
            .exec();
        if (!report) {
            throw new common_1.NotFoundException('Report not found');
        }
        return report;
    }
    async updateUserReportStatus(reportId, reviewerId, updateStatusDto) {
        const { status, adminNotes } = updateStatusDto;
        const report = await this.userReportModel.findById(reportId);
        if (!report) {
            throw new common_1.NotFoundException('Report not found');
        }
        report.status = status;
        if (adminNotes) {
            report.adminNotes = adminNotes;
        }
        report.reviewedBy = reviewerId;
        report.reviewedAt = new Date();
        await report.save();
        await report.populate([
            {
                path: 'reportedUser',
                select: 'displayName email profilePicture isCreator creatorUsername creatorCategory',
            },
            {
                path: 'reportedBy',
                select: 'displayName email profilePicture',
            },
            {
                path: 'reviewedBy',
                select: 'displayName email',
            },
        ]);
        return report;
    }
    async deleteUserReport(reportId) {
        const result = await this.userReportModel.findByIdAndDelete(reportId);
        if (!result) {
            throw new common_1.NotFoundException('Report not found');
        }
    }
    async getUserReportsByUserId(userId) {
        const reports = await this.userReportModel
            .find({ reportedUser: userId })
            .populate([
            {
                path: 'reportedBy',
                select: 'displayName email profilePicture',
            },
            {
                path: 'reviewedBy',
                select: 'displayName email',
            },
        ])
            .sort({ createdAt: -1 })
            .exec();
        return reports;
    }
    async getUserReportsCount(userId) {
        return await this.userReportModel.countDocuments({ reportedUser: userId });
    }
    async getReportStatistics() {
        const [totalPostReports, pendingPostReports, totalUserReports, pendingUserReports, totalWithheldPosts, totalWithheldUsers,] = await Promise.all([
            this.postReportModel.countDocuments(),
            this.postReportModel.countDocuments({ status: 'pending' }),
            this.userReportModel.countDocuments(),
            this.userReportModel.countDocuments({ status: 'pending' }),
            this.withheldPostModel.countDocuments(),
            this.withheldUserModel.countDocuments(),
        ]);
        return {
            postReports: {
                total: totalPostReports,
                pending: pendingPostReports,
            },
            userReports: {
                total: totalUserReports,
                pending: pendingUserReports,
            },
            withheld: {
                posts: totalWithheldPosts,
                users: totalWithheldUsers,
            },
        };
    }
    async withholdPost(postId, adminId, withholdDto) {
        const post = await this.postModel.findById(postId).lean();
        if (!post) {
            throw new common_1.NotFoundException('Post not found');
        }
        const existingWithheld = await this.withheldPostModel.findOne({
            originalPostId: postId,
        });
        if (existingWithheld) {
            throw new common_1.ConflictException('Post is already withheld');
        }
        const withheldPost = new this.withheldPostModel({
            postData: post,
            originalPostId: postId,
            withheldBy: adminId,
            reason: withholdDto.reason,
            adminNotes: withholdDto.adminNotes,
            relatedReport: withholdDto.relatedReportId,
        });
        await withheldPost.save();
        await this.postModel.findByIdAndDelete(postId);
        await withheldPost.populate({
            path: 'withheldBy',
            select: 'displayName email',
        });
        return withheldPost;
    }
    async restorePost(withheldPostId, adminId, restoreDto) {
        const withheldPost = await this.withheldPostModel.findById(withheldPostId);
        if (!withheldPost) {
            throw new common_1.NotFoundException('Withheld post not found');
        }
        const existingPost = await this.postModel.findById(withheldPost.originalPostId);
        if (existingPost) {
            throw new common_1.ConflictException('Post has already been restored');
        }
        const postData = withheldPost.postData;
        const restoredPost = new this.postModel({
            ...postData,
            _id: withheldPost.originalPostId,
        });
        await restoredPost.save();
        await this.withheldPostModel.findByIdAndDelete(withheldPostId);
        return restoredPost;
    }
    async getWithheldPosts(page = 1, limit = 10) {
        const skip = (page - 1) * limit;
        const [posts, total] = await Promise.all([
            this.withheldPostModel
                .find()
                .populate({
                path: 'withheldBy',
                select: 'displayName email',
            })
                .sort({ withheldAt: -1 })
                .skip(skip)
                .limit(limit)
                .exec(),
            this.withheldPostModel.countDocuments(),
        ]);
        return { posts, total };
    }
    async getWithheldPostById(withheldPostId) {
        const withheldPost = await this.withheldPostModel
            .findById(withheldPostId)
            .populate({
            path: 'withheldBy',
            select: 'displayName email',
        })
            .exec();
        if (!withheldPost) {
            throw new common_1.NotFoundException('Withheld post not found');
        }
        return withheldPost;
    }
    async withholdUser(userId, adminId, withholdDto) {
        if (userId === adminId) {
            throw new common_1.BadRequestException('Cannot withhold yourself');
        }
        const user = await this.userModel.findById(userId).lean();
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        if (user.isAdmin) {
            throw new common_1.BadRequestException('Cannot withhold admin users');
        }
        const existingWithheld = await this.withheldUserModel.findOne({
            originalUserId: userId,
        });
        if (existingWithheld) {
            throw new common_1.ConflictException('User is already withheld');
        }
        const withheldUser = new this.withheldUserModel({
            userData: user,
            originalUserId: userId,
            withheldBy: adminId,
            reason: withholdDto.reason,
            adminNotes: withholdDto.adminNotes,
            relatedReport: withholdDto.relatedReportId,
        });
        await withheldUser.save();
        await this.userModel.findByIdAndDelete(userId);
        await withheldUser.populate({
            path: 'withheldBy',
            select: 'displayName email',
        });
        return withheldUser;
    }
    async restoreUser(withheldUserId, adminId, restoreDto) {
        const withheldUser = await this.withheldUserModel.findById(withheldUserId);
        if (!withheldUser) {
            throw new common_1.NotFoundException('Withheld user not found');
        }
        const existingUser = await this.userModel.findById(withheldUser.originalUserId);
        if (existingUser) {
            throw new common_1.ConflictException('User has already been restored');
        }
        const userData = withheldUser.userData;
        const restoredUser = new this.userModel({
            ...userData,
            _id: withheldUser.originalUserId,
        });
        await restoredUser.save();
        await this.withheldUserModel.findByIdAndDelete(withheldUserId);
        return restoredUser;
    }
    async getWithheldUsers(page = 1, limit = 10) {
        const skip = (page - 1) * limit;
        const [users, total] = await Promise.all([
            this.withheldUserModel
                .find()
                .populate({
                path: 'withheldBy',
                select: 'displayName email',
            })
                .sort({ withheldAt: -1 })
                .skip(skip)
                .limit(limit)
                .exec(),
            this.withheldUserModel.countDocuments(),
        ]);
        return { users, total };
    }
    async getWithheldUserById(withheldUserId) {
        const withheldUser = await this.withheldUserModel
            .findById(withheldUserId)
            .populate({
            path: 'withheldBy',
            select: 'displayName email',
        })
            .exec();
        if (!withheldUser) {
            throw new common_1.NotFoundException('Withheld user not found');
        }
        return withheldUser;
    }
};
exports.ReportsService = ReportsService;
exports.ReportsService = ReportsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(post_report_schema_1.PostReport.name)),
    __param(1, (0, mongoose_1.InjectModel)(user_report_schema_1.UserReport.name)),
    __param(2, (0, mongoose_1.InjectModel)(post_1.Post.name)),
    __param(3, (0, mongoose_1.InjectModel)(user_1.User.name)),
    __param(4, (0, mongoose_1.InjectModel)(withheld_schema_1.WithheldPost.name)),
    __param(5, (0, mongoose_1.InjectModel)(withheld_schema_2.WithheldUser.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model])
], ReportsService);
//# sourceMappingURL=reports.service.js.map