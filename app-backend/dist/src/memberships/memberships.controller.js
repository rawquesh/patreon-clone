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
exports.MembershipsController = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const memberships_service_1 = require("./memberships.service");
const memberships_dto_1 = require("./memberships.dto");
const platform_express_1 = require("@nestjs/platform-express");
const s3_service_1 = require("../s3/s3.service");
const promotions_service_1 = require("../promotions/promotions.service");
const mongoose_1 = require("@nestjs/mongoose");
const membership_1 = require("../database/schemas/membership");
const mongoose_2 = require("mongoose");
let MembershipsController = class MembershipsController {
    constructor(membershipsService, s3Service, promotionsService, membershipModel) {
        this.membershipsService = membershipsService;
        this.s3Service = s3Service;
        this.promotionsService = promotionsService;
        this.membershipModel = membershipModel;
    }
    async getCreatorMembershipsForSelf(req, query) {
        console.log('User');
        console.log(JSON.stringify(req.user));
        return this.membershipsService.getCreatorMemberships(req.user.userId, query);
    }
    async getMembership(id) {
        try {
            if (id === 'free') {
                return {
                    id: 'free',
                    name: 'Free Membership',
                    description: 'Access to free content from this creator',
                    monthlyRate: 0,
                    isActive: true,
                    benefits: ['Access to public posts', 'Join the community'],
                    isTrial: false,
                };
            }
            const membership = await this.membershipsService.getMembershipById(id);
            return membership;
        }
        catch (error) {
            throw new common_1.NotFoundException(`Membership not found: ${error.message}`);
        }
    }
    async getCreatorMemberships(creatorId, query = {
        page: 1,
        limit: 10,
        activeOnly: true,
    }) {
        const result = await this.membershipsService.getCreatorMemberships(creatorId, query);
        const memberships = result.memberships.map((membership) => ({
            _id: membership._id.toString(),
            name: membership.name,
            description: membership.description,
            monthlyPrice: membership.monthlyRate,
            yearlyPrice: membership.monthlyRate * 10,
            benefits: membership.benefits || [],
            isLimited: false,
            seatsLeft: 0,
            isFeatured: membership.isFeatured || false,
            isActive: membership.isActive,
            coverImage: membership.coverImage,
            subscriberCount: membership.subscriberCount || 0,
        }));
        return memberships;
    }
    async checkSubscription(req, creatorId) {
        try {
            const subscriptions = await this.membershipsService.getUserSubscriptions(req.user.userId);
            console.log(subscriptions.activeSubscriptions.map((s) => s.creator._id.toString()));
            const isSubscribed = subscriptions.activeSubscriptions.some((sub) => sub.creator._id.toString() === creatorId);
            return { isSubscribed };
        }
        catch (error) {
            console.log(error);
            return { isSubscribed: false };
        }
    }
    async createMembership(req, createMembershipDto, coverImage) {
        try {
            const coverImageUrl = await this.s3Service.uploadFile(coverImage, 'membership-covers', 'patreon-clone-assets');
            return this.membershipsService.createMembership(req.user.userId, {
                ...createMembershipDto,
                coverImage: coverImageUrl,
            });
        }
        catch (error) {
            throw new common_1.BadRequestException(`Failed to create membership: ${error.message}`);
        }
    }
    async getSubscriptions(req) {
        return this.membershipsService.getUserSubscriptions(req.user.userId);
    }
    async updateMembership(req, id, updateMembershipDto, coverImage) {
        try {
            const membership = await this.membershipsService.getMembershipById(id);
            if (membership.creator._id.toString() !== req.user.userId) {
                throw new common_1.ForbiddenException('Not authorized to update this membership');
            }
            let coverImageUrl = membership.coverImage;
            if (coverImage) {
                coverImageUrl = await this.s3Service.uploadFile(coverImage, 'membership-covers', 'patreon-clone-assets');
                if (membership.coverImage && membership.coverImage !== coverImageUrl) {
                    try {
                        await this.s3Service.deleteFile(membership.coverImage, 'patreon-clone-test-cover');
                    }
                    catch (error) {
                        console.error('Failed to delete old cover image:', error);
                    }
                }
            }
            return this.membershipsService.updateMembership(req.user.userId, id, {
                ...updateMembershipDto,
                coverImage: coverImageUrl,
            });
        }
        catch (error) {
            throw new common_1.BadRequestException(`Failed to update membership: ${error.message}`);
        }
    }
    async createCheckoutSession(req, membershipId, body) {
        try {
            const checkoutUrl = await this.membershipsService.createCheckoutSession(req.user.userId, membershipId, body.promotionCode);
            return { checkoutUrl };
        }
        catch (error) {
            console.log(error);
            throw new common_1.BadRequestException(`Failed to create checkout session: ${error.message}`);
        }
    }
    async createSubscription(req, membershipId, body) {
        try {
            console.log('Subscribe');
            let subscription;
            let checkoutUrl;
            if (body.promotionCode) {
                const redemptionResult = await this.promotionsService.redeemPromotion(req.user.userId, {
                    code: body.promotionCode,
                    membershipId,
                });
                subscription = redemptionResult.subscription;
                checkoutUrl = redemptionResult.checkoutUrl;
            }
            else {
                subscription = await this.membershipsService.createSubscription(req.user.userId, membershipId);
            }
            return {
                subscription,
                checkoutUrl,
                success: true,
            };
        }
        catch (error) {
            throw new common_1.BadRequestException(`Failed to create subscription: ${error.message}`);
        }
    }
    async cancelSubscription(req, subscriptionId) {
        return this.membershipsService.cancelSubscription(req.user.userId, subscriptionId);
    }
    async unsubscribeFromCreator(req, creatorId) {
        return this.membershipsService.unsubscribeFromCreator(req.user.userId, creatorId);
    }
    async getSubscribers(req) {
        return this.membershipsService.getCreatorSubscribers(req.user.userId);
    }
    async getEarnings(req) {
        return this.membershipsService.getCreatorEarnings(req.user.userId);
    }
    async requestPayout(req, createPayoutRequestDto) {
        return this.membershipsService.createPayoutRequest(req.user.userId, createPayoutRequestDto);
    }
    async getPayoutHistory(req) {
        return this.membershipsService.getPayoutHistory(req.user.userId);
    }
    async subscribeToFreeMembership(req, creatorId) {
        console.log({ creatorId });
        try {
            const subscription = await this.membershipsService.createFreeSubscription(req.user.userId, creatorId);
            return {
                subscription,
                success: true,
                message: 'You are now a free member',
            };
        }
        catch (error) {
            throw new common_1.BadRequestException(`Failed to subscribe: ${error.message}`);
        }
    }
    async ensureStripeProducts(req) {
        try {
            const memberships = await this.membershipModel.find({
                creator: req.user.userId,
                isActive: true,
                stripeProductId: { $exists: false },
            });
            const results = [];
            for (const membership of memberships) {
                try {
                    const updated = await this.membershipsService.ensureStripeProductForMembership(membership._id.toString());
                    results.push({
                        id: updated._id.toString(),
                        name: updated.name,
                        success: true,
                        stripeProductId: updated.stripeProductId,
                        stripePriceId: updated.stripePriceId,
                    });
                }
                catch (error) {
                    results.push({
                        id: membership._id.toString(),
                        name: membership.name,
                        success: false,
                        error: error.message,
                    });
                }
            }
            return {
                processed: results.length,
                results,
            };
        }
        catch (error) {
            throw new common_1.BadRequestException(`Failed to process memberships: ${error.message}`);
        }
    }
    async toggleFeaturedStatus(req, id, body) {
        return this.membershipsService.toggleFeaturedStatus(req.user.userId, id, body.isFeatured);
    }
};
exports.MembershipsController = MembershipsController;
__decorate([
    (0, common_1.Get)('creator'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, memberships_dto_1.GetMembershipsQueryDto]),
    __metadata("design:returntype", Promise)
], MembershipsController.prototype, "getCreatorMembershipsForSelf", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MembershipsController.prototype, "getMembership", null);
__decorate([
    (0, common_1.Get)('creator/:creatorId'),
    __param(0, (0, common_1.Param)('creatorId')),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, memberships_dto_1.GetMembershipsQueryDto]),
    __metadata("design:returntype", Promise)
], MembershipsController.prototype, "getCreatorMemberships", null);
__decorate([
    (0, common_1.Get)('check/:creatorId'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('creatorId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], MembershipsController.prototype, "checkSubscription", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('coverImage', {
        limits: {
            fileSize: 5 * 1024 * 1024,
        },
        fileFilter: (req, file, cb) => {
            if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
                return cb(new common_1.BadRequestException('Only image files are allowed!'), false);
            }
            cb(null, true);
        },
    })),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.UploadedFile)(new common_1.ParseFilePipe({
        validators: [
            new common_1.MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }),
            new common_1.FileTypeValidator({ fileType: /(jpg|jpeg|png|gif)$/ }),
        ],
    }))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, memberships_dto_1.CreateMembershipDto, Object]),
    __metadata("design:returntype", Promise)
], MembershipsController.prototype, "createMembership", null);
__decorate([
    (0, common_1.Get)('subscriber'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MembershipsController.prototype, "getSubscriptions", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('coverImage', {
        limits: {
            fileSize: 5 * 1024 * 1024,
        },
        fileFilter: (req, file, cb) => {
            if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
                return cb(new common_1.BadRequestException('Only image files are allowed!'), false);
            }
            cb(null, true);
        },
    })),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __param(3, (0, common_1.UploadedFile)(new common_1.ParseFilePipe({
        validators: [
            new common_1.MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }),
            new common_1.FileTypeValidator({ fileType: /(jpg|jpeg|png|gif)$/ }),
        ],
        fileIsRequired: false,
    }))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, memberships_dto_1.UpdateMembershipDto, Object]),
    __metadata("design:returntype", Promise)
], MembershipsController.prototype, "updateMembership", null);
__decorate([
    (0, common_1.Post)('checkout/:membershipId'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('membershipId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], MembershipsController.prototype, "createCheckoutSession", null);
__decorate([
    (0, common_1.Post)('subscribe/:membershipId'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('membershipId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], MembershipsController.prototype, "createSubscription", null);
__decorate([
    (0, common_1.Delete)('subscribe/:subscriptionId'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('subscriptionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], MembershipsController.prototype, "cancelSubscription", null);
__decorate([
    (0, common_1.Delete)('unsubscribe/:creatorId'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('creatorId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], MembershipsController.prototype, "unsubscribeFromCreator", null);
__decorate([
    (0, common_1.Get)('subscribers'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MembershipsController.prototype, "getSubscribers", null);
__decorate([
    (0, common_1.Get)('earnings'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MembershipsController.prototype, "getEarnings", null);
__decorate([
    (0, common_1.Post)('payout'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, memberships_dto_1.CreatePayoutRequestDto]),
    __metadata("design:returntype", Promise)
], MembershipsController.prototype, "requestPayout", null);
__decorate([
    (0, common_1.Get)('payouts'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MembershipsController.prototype, "getPayoutHistory", null);
__decorate([
    (0, common_1.Post)('subscribe/free/:creatorId'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('creatorId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], MembershipsController.prototype, "subscribeToFreeMembership", null);
__decorate([
    (0, common_1.Post)('ensure-stripe-products'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MembershipsController.prototype, "ensureStripeProducts", null);
__decorate([
    (0, common_1.Put)(':id/featured'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], MembershipsController.prototype, "toggleFeaturedStatus", null);
exports.MembershipsController = MembershipsController = __decorate([
    (0, common_1.Controller)('memberships'),
    __param(2, (0, common_1.Inject)((0, common_1.forwardRef)(() => promotions_service_1.PromotionsService))),
    __param(3, (0, mongoose_1.InjectModel)(membership_1.Membership.name)),
    __metadata("design:paramtypes", [memberships_service_1.MembershipsService,
        s3_service_1.S3Service,
        promotions_service_1.PromotionsService,
        mongoose_2.Model])
], MembershipsController);
//# sourceMappingURL=memberships.controller.js.map