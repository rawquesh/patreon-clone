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
exports.UsersController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const passport_1 = require("@nestjs/passport");
const users_service_1 = require("./users.service");
const s3_service_1 = require("../s3/s3.service");
const UpdateProfileDto_1 = require("./UpdateProfileDto");
const users_dto_1 = require("./users.dto");
const memberships_service_1 = require("../memberships/memberships.service");
let UsersController = class UsersController {
    constructor(usersService, s3Service, membershipsService) {
        this.usersService = usersService;
        this.s3Service = s3Service;
        this.membershipsService = membershipsService;
    }
    async updateProfile(req, updateProfileDto) {
        return this.usersService.updateProfile(req.user.userId, updateProfileDto);
    }
    async updateAboutInfo(req, updateAboutDto) {
        return this.usersService.updateAboutInfo(req.user.userId, updateAboutDto);
    }
    async updateProfilePhoto(req, file) {
        try {
            const user = await this.usersService.findById(req.user.userId);
            if (!user) {
                throw new Error('User not found');
            }
            const photoUrl = await this.s3Service.uploadFile(file, req.user.userId, 'patreon-clone-assets');
            if (user.profilePicture) {
                try {
                    await this.s3Service.deleteFile(user.profilePicture, 'patreon-clone-assets');
                }
                catch (error) {
                    console.error('Failed to delete old profile photo:', error);
                }
            }
            return this.usersService.updateProfilePhoto(req.user.userId, photoUrl);
        }
        catch (error) {
            throw new common_1.BadRequestException(`Failed to update profile photo: ${error.message}`);
        }
    }
    async resetPassword(req, resetPasswordDto) {
        try {
            const userId = req.user.userId;
            if (!userId) {
                throw new common_1.UnauthorizedException('User not authenticated');
            }
            return await this.usersService.resetPassword(userId, resetPasswordDto);
        }
        catch (error) {
            if (error instanceof common_1.UnauthorizedException) {
                throw error;
            }
            throw new common_1.BadRequestException(`Failed to reset password: ${error.message}`);
        }
    }
    async onboardCreator(req, creatorData) {
        if (!req.user?.userId) {
            throw new common_1.UnauthorizedException('User not authenticated');
        }
        return this.usersService.onboardCreator(req.user.userId, creatorData);
    }
    async publishCreator(req, publishData) {
        console.log({ publishData });
        if (!req.user?.userId) {
            throw new common_1.UnauthorizedException('User not authenticated');
        }
        if (publishData.acceptTerms === false) {
            throw new common_1.BadRequestException('You must accept the terms to continue');
        }
        return this.usersService.publishCreator(req.user.userId, publishData);
    }
    async updateProfileCover(req, file) {
        try {
            const user = await this.usersService.findById(req.user.userId);
            const bucket = 'patreon-clone-assets';
            if (user.profileCover) {
                try {
                    await this.s3Service.deleteFile(user.profileCover, bucket);
                }
                catch (error) {
                    console.error('Failed to delete old profile cover:', error);
                }
            }
            const coverUrl = await this.s3Service.uploadFile(file, req.user.userId, bucket);
            return this.usersService.updateProfileCover(req.user.userId, coverUrl);
        }
        catch (error) {
            throw new common_1.BadRequestException(`Failed to update profile cover: ${error.message}`);
        }
    }
    async updateContentVisibility(req, updateVisibilityDto) {
        if (!req.user?.userId) {
            throw new common_1.UnauthorizedException('User not authenticated');
        }
        const user = await this.usersService.findById(req.user.userId);
        if (!user || !user.isCreator) {
            throw new common_1.BadRequestException('Only creators can update content visibility');
        }
        return this.usersService.updateContentVisibility(req.user.userId, updateVisibilityDto);
    }
    async updateCreatorHeadline(req, updateHeadlineDto) {
        return this.usersService.updateCreatorHeadline(req.user.userId, updateHeadlineDto);
    }
    async getPublishedCreators() {
        return this.usersService.getPublishedCreators();
    }
    async updateCreatorCategory(req, updateCategoryDto) {
        return this.usersService.updateCreatorCategory(req.user.userId, updateCategoryDto);
    }
    async getCurrentUserSubscriptions(req, query) {
        try {
            const userId = req.user.userId;
            if (!userId) {
                throw new common_1.BadRequestException('User not authenticated');
            }
            const subscriptions = await this.membershipsService.getUserSubscriptions(userId);
            if (query.status !== users_dto_1.SubscriptionStatus.ALL) {
                const { activeSubscriptions, cancelledSubscriptions } = subscriptions;
                if (query.status === users_dto_1.SubscriptionStatus.ACTIVE) {
                    return {
                        subscriptions: activeSubscriptions,
                        total: activeSubscriptions.length,
                    };
                }
                else if (query.status === users_dto_1.SubscriptionStatus.CANCELLED) {
                    return {
                        subscriptions: cancelledSubscriptions,
                        total: cancelledSubscriptions.length,
                    };
                }
            }
            return {
                activeSubscriptions: subscriptions.activeSubscriptions,
                cancelledSubscriptions: subscriptions.cancelledSubscriptions,
                total: {
                    active: subscriptions.activeSubscriptions.length,
                    cancelled: subscriptions.cancelledSubscriptions.length,
                    all: subscriptions.activeSubscriptions.length +
                        subscriptions.cancelledSubscriptions.length,
                },
            };
        }
        catch (error) {
            throw new common_1.BadRequestException(`Failed to fetch user subscriptions: ${error.message}`);
        }
    }
    async getUserSubscriptionsById(req, targetUserId, query) {
        try {
            const currentUserId = req.user.userId;
            const isAdmin = req.user.isAdmin === true;
            const isOwnAccount = currentUserId === targetUserId;
            if (!isOwnAccount && !isAdmin) {
                throw new common_1.UnauthorizedException('Not authorized to access other user subscriptions');
            }
            const subscriptions = await this.membershipsService.getUserSubscriptions(targetUserId);
            if (query.status !== users_dto_1.SubscriptionStatus.ALL) {
                const { activeSubscriptions, cancelledSubscriptions } = subscriptions;
                if (query.status === users_dto_1.SubscriptionStatus.ACTIVE) {
                    return {
                        subscriptions: activeSubscriptions,
                        total: activeSubscriptions.length,
                    };
                }
                else if (query.status === users_dto_1.SubscriptionStatus.CANCELLED) {
                    return {
                        subscriptions: cancelledSubscriptions,
                        total: cancelledSubscriptions.length,
                    };
                }
            }
            return {
                activeSubscriptions: subscriptions.activeSubscriptions,
                cancelledSubscriptions: subscriptions.cancelledSubscriptions,
                total: {
                    active: subscriptions.activeSubscriptions.length,
                    cancelled: subscriptions.cancelledSubscriptions.length,
                    all: subscriptions.activeSubscriptions.length +
                        subscriptions.cancelledSubscriptions.length,
                },
            };
        }
        catch (error) {
            throw new common_1.BadRequestException(`Failed to fetch user subscriptions: ${error.message}`);
        }
    }
    async getMyAboutInfo(req) {
        return this.usersService.getAboutInfo(req.user.userId);
    }
    async getUserAboutInfo(userId) {
        return this.usersService.getAboutInfo(userId);
    }
    async getCreatorAboutInfo(username) {
        return this.usersService.getAboutInfoByUsername(username);
    }
    async migrate() {
        await this.usersService.createFreeMembershipsForAllCreators();
        return {
            success: true,
        };
    }
    async updateMySocialLinks(req, updateSocialLinksDto) {
        const updatedUser = await this.usersService.updateSocialLinks(req.user.userId, updateSocialLinksDto);
        return { socialLinks: updatedUser.socialLinks };
    }
    async searchMySubscribers(req, searchDto) {
        if (!req.user?.userId) {
            throw new common_1.UnauthorizedException('User not authenticated');
        }
        return this.usersService.searchSubscribers(req.user.userId, searchDto.query);
    }
    async checkCreatorUsername(username) {
        return this.usersService.isCreatorUsernameAvailable(username);
    }
    async checkCreatorUsernamePublic(username) {
        return this.usersService.isCreatorUsernameAvailable(username);
    }
    async deleteAccount(req, deleteDto) {
        try {
            if (!req.user?.userId) {
                throw new common_1.UnauthorizedException('User not authenticated');
            }
            const result = await this.usersService.deleteUserAccount(req.user.userId, deleteDto);
            return {
                success: result.success,
                message: result.message,
                details: {
                    subscriberSubscriptionsCancelled: result.cancelledSubscriptions.asSubscriber,
                    creatorSubscriptionsCancelled: result.cancelledSubscriptions.asCreator,
                    totalCancelled: result.cancelledSubscriptions.asSubscriber +
                        result.cancelledSubscriptions.asCreator,
                },
            };
        }
        catch (error) {
            if (error instanceof common_1.UnauthorizedException ||
                error instanceof common_1.BadRequestException) {
                throw error;
            }
            throw new common_1.BadRequestException(`Failed to delete account: ${error.message}`);
        }
    }
};
exports.UsersController = UsersController;
__decorate([
    (0, common_1.Put)('profile'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, UpdateProfileDto_1.UpdateProfileDto]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "updateProfile", null);
__decorate([
    (0, common_1.Put)('about'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, users_dto_1.UpdateAboutDto]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "updateAboutInfo", null);
__decorate([
    (0, common_1.Put)('profile/photo'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('photo', {
        limits: { fileSize: 5 * 1024 * 1024 },
    })),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.UploadedFile)(new common_1.ParseFilePipe({
        validators: [
            new common_1.MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }),
            new common_1.FileTypeValidator({ fileType: /(jpg|jpeg|png)$/ }),
        ],
    }))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "updateProfilePhoto", null);
__decorate([
    (0, common_1.Post)('reset-password'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, users_dto_1.ResetPasswordDto]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "resetPassword", null);
__decorate([
    (0, common_1.Post)('onboard-creator'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, users_dto_1.CreatorOnboardingDto]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "onboardCreator", null);
__decorate([
    (0, common_1.Post)('publish-creator'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, users_dto_1.PublishCreatorDto]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "publishCreator", null);
__decorate([
    (0, common_1.Put)('profile/cover'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('cover', {
        limits: { fileSize: 5 * 1024 * 1024 },
    })),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.UploadedFile)(new common_1.ParseFilePipe({
        validators: [
            new common_1.MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }),
            new common_1.FileTypeValidator({ fileType: /(jpg|jpeg|png)$/ }),
        ],
    }))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "updateProfileCover", null);
__decorate([
    (0, common_1.Put)('creator/content-visibility'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, users_dto_1.UpdateContentVisibilityDto]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "updateContentVisibility", null);
__decorate([
    (0, common_1.Put)('creator/headline'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, users_dto_1.UpdateHeadlineDto]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "updateCreatorHeadline", null);
__decorate([
    (0, common_1.Get)('creators/published'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getPublishedCreators", null);
__decorate([
    (0, common_1.Put)('creator/category'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, users_dto_1.UpdateCreatorCategoryDto]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "updateCreatorCategory", null);
__decorate([
    (0, common_1.Get)('subscriptions'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)(new common_1.ValidationPipe({ transform: true }))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, users_dto_1.GetSubscriptionsDto]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getCurrentUserSubscriptions", null);
__decorate([
    (0, common_1.Get)(':userId/subscriptions'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('userId')),
    __param(2, (0, common_1.Query)(new common_1.ValidationPipe({ transform: true }))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, users_dto_1.GetSubscriptionsDto]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getUserSubscriptionsById", null);
__decorate([
    (0, common_1.Get)('about'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getMyAboutInfo", null);
__decorate([
    (0, common_1.Get)(':userId/about'),
    __param(0, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getUserAboutInfo", null);
__decorate([
    (0, common_1.Get)('creator/:username/about'),
    __param(0, (0, common_1.Param)('username')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getCreatorAboutInfo", null);
__decorate([
    (0, common_1.Get)('migrate'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "migrate", null);
__decorate([
    (0, common_1.Put)('social-links'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, users_dto_1.UpdateSocialLinksDto]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "updateMySocialLinks", null);
__decorate([
    (0, common_1.Get)('creator/subscribers/search'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)(new common_1.ValidationPipe())),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, users_dto_1.SearchSubscribersDto]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "searchMySubscribers", null);
__decorate([
    (0, common_1.Get)('check-username/:username'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __param(0, (0, common_1.Param)('username')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "checkCreatorUsername", null);
__decorate([
    (0, common_1.Get)('public/check-username/:username'),
    __param(0, (0, common_1.Param)('username')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "checkCreatorUsernamePublic", null);
__decorate([
    (0, common_1.Delete)('account'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, users_dto_1.DeleteUserDto]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "deleteAccount", null);
exports.UsersController = UsersController = __decorate([
    (0, common_1.Controller)('users'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        s3_service_1.S3Service,
        memberships_service_1.MembershipsService])
], UsersController);
//# sourceMappingURL=users.controller.js.map