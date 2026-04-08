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
var PromotionsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PromotionsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const promotion_1 = require("../database/schemas/promotion");
const user_1 = require("../database/schemas/user");
const membership_1 = require("../database/schemas/membership");
const memberships_service_1 = require("../memberships/memberships.service");
const payments_service_1 = require("../payments/payments.service");
let PromotionsService = PromotionsService_1 = class PromotionsService {
    constructor(discountModel, giftModel, redemptionModel, userModel, membershipModel, membershipsService, paymentsService) {
        this.discountModel = discountModel;
        this.giftModel = giftModel;
        this.redemptionModel = redemptionModel;
        this.userModel = userModel;
        this.membershipModel = membershipModel;
        this.membershipsService = membershipsService;
        this.paymentsService = paymentsService;
        this.logger = new common_1.Logger(PromotionsService_1.name);
    }
    async createDiscount(creatorId, createDiscountDto) {
        const creator = await this.userModel.findById(creatorId);
        if (!creator)
            throw new common_1.NotFoundException('Creator not found');
        if (!creator.stripeConnectAccountId)
            throw new common_1.BadRequestException('Creator must complete Stripe onboarding first');
        const existingDiscount = await this.discountModel.findOne({
            code: createDiscountDto.code,
            isDeleted: false,
        });
        if (existingDiscount) {
            throw new common_1.ConflictException('Discount code already exists');
        }
        let applicableTierStripeProductIds = [];
        if (createDiscountDto.applicableTo === promotion_1.DiscountApplicability.SELECTED) {
            if (!createDiscountDto.applicableTiers ||
                createDiscountDto.applicableTiers.length === 0) {
                throw new common_1.BadRequestException('Applicable tiers must be provided when applicableTo is set to "selected"');
            }
            const tiers = await this.membershipModel.find({
                _id: { $in: createDiscountDto.applicableTiers },
                creator: new mongoose_2.Types.ObjectId(creatorId),
            });
            if (tiers.length !== createDiscountDto.applicableTiers.length) {
                throw new common_1.BadRequestException('One or more tiers are invalid or do not belong to you');
            }
            applicableTierStripeProductIds = tiers
                .map((tier) => tier.stripeProductId)
                .filter((id) => !!id);
            if (applicableTierStripeProductIds.length !== tiers.length &&
                tiers.some((t) => t.monthlyRate > 0)) {
                this.logger.warn(`Some selected paid tiers for discount ${createDiscountDto.code} are missing Stripe Product IDs.`);
            }
        }
        let stripeCoupon;
        let stripePromotionCode;
        try {
            const couponParams = {
                name: createDiscountDto.title,
                duration: 'forever',
                currency: 'usd',
                metadata: {
                    creatorId: creatorId,
                    discountTitle: createDiscountDto.title,
                },
            };
            if (createDiscountDto.percentageType === promotion_1.DiscountType.PERCENTAGE) {
                couponParams.percent_off = createDiscountDto.discountNumber;
            }
            else {
                couponParams.amount_off = Math.round(createDiscountDto.discountNumber * 100);
            }
            if (createDiscountDto.applicableTo === promotion_1.DiscountApplicability.SELECTED &&
                applicableTierStripeProductIds.length > 0) {
                couponParams.applies_to = {
                    products: applicableTierStripeProductIds,
                };
            }
            console.log(creator.stripeConnectAccountId);
            stripeCoupon = await this.paymentsService.stripe.coupons.create(couponParams);
            const promotionCodeParams = {
                coupon: stripeCoupon.id,
                code: createDiscountDto.code,
                active: true,
                expires_at: Math.floor(new Date(createDiscountDto.endDate).getTime() / 1000),
                metadata: {
                    creatorId: creatorId,
                    discountTitle: createDiscountDto.title,
                },
            };
            stripePromotionCode =
                await this.paymentsService.stripe.promotionCodes.create(promotionCodeParams);
            console.log(stripePromotionCode);
        }
        catch (stripeError) {
            this.logger.error(`Stripe error creating coupon/promo code for ${createDiscountDto.code}: ${stripeError.message}`, stripeError.stack);
            throw new common_1.InternalServerErrorException(`Failed to create discount in payment system: ${stripeError.message}`);
        }
        const discount = new this.discountModel({
            ...createDiscountDto,
            creator: new mongoose_2.Types.ObjectId(creatorId),
            startDate: new Date(createDiscountDto.startDate),
            endDate: new Date(createDiscountDto.endDate),
            applicableTiers: createDiscountDto.applicableTiers?.map((id) => new mongoose_2.Types.ObjectId(id)),
            stripeCouponId: stripeCoupon.id,
            stripePromotionCodeId: stripePromotionCode.id,
        });
        const savedDiscount = await discount.save();
        return this.transformDiscountToResponse(savedDiscount);
    }
    async getDiscounts(creatorId) {
        const discounts = await this.discountModel
            .find({
            creator: new mongoose_2.Types.ObjectId(creatorId),
            isDeleted: false,
        })
            .populate('applicableTiers', 'name')
            .sort({ createdAt: -1 });
        return discounts.map((discount) => this.transformDiscountToResponse(discount));
    }
    async getDiscount(creatorId, discountId) {
        const discount = await this.discountModel
            .findOne({
            _id: new mongoose_2.Types.ObjectId(discountId),
            creator: new mongoose_2.Types.ObjectId(creatorId),
            isDeleted: false,
        })
            .populate('applicableTiers', 'name');
        if (!discount) {
            throw new common_1.NotFoundException('Discount not found');
        }
        return this.transformDiscountToResponse(discount);
    }
    async updateDiscount(creatorId, discountId, updateDiscountDto) {
        const discount = await this.discountModel.findOne({
            _id: new mongoose_2.Types.ObjectId(discountId),
            creator: new mongoose_2.Types.ObjectId(creatorId),
            isDeleted: false,
        });
        if (!discount) {
            throw new common_1.NotFoundException('Discount not found');
        }
        const creator = await this.userModel.findById(creatorId);
        if (!creator || !creator.stripeConnectAccountId) {
            throw new common_1.BadRequestException('Creator Stripe account not found or not onboarded.');
        }
        const couponPropsChanged = updateDiscountDto.percentageType !== undefined ||
            updateDiscountDto.discountNumber !== undefined ||
            updateDiscountDto.applicableTo !== undefined ||
            updateDiscountDto.applicableTiers !== undefined;
        if (couponPropsChanged) {
            throw new common_1.BadRequestException('Discount value, type, and tier applicability cannot be changed. Please create a new discount instead.');
        }
        try {
            if (discount.stripePromotionCodeId) {
                const promoCodeUpdateParams = {
                    active: updateDiscountDto.status !== undefined
                        ? updateDiscountDto.status === promotion_1.DiscountStatus.ACTIVE
                        : discount.status === promotion_1.DiscountStatus.ACTIVE,
                    metadata: {
                        creatorId: creatorId,
                        discountTitle: updateDiscountDto.title !== undefined
                            ? updateDiscountDto.title
                            : discount.title,
                    },
                };
                await this.paymentsService.stripe.promotionCodes.update(discount.stripePromotionCodeId, promoCodeUpdateParams, { stripeAccount: creator.stripeConnectAccountId });
            }
            else {
                this.logger.warn(`Discount ${discountId} is missing Stripe Promotion Code ID during update.`);
            }
        }
        catch (stripeError) {
            this.logger.error(`Stripe error updating promotion code for ${discount.code}: ${stripeError.message}`, stripeError.stack);
            throw new common_1.InternalServerErrorException(`Failed to update discount in payment system: ${stripeError.message}`);
        }
        const updateData = { ...updateDiscountDto };
        if (updateDiscountDto.startDate) {
            updateData.startDate = new Date(updateDiscountDto.startDate);
        }
        if (updateDiscountDto.endDate) {
            updateData.endDate = new Date(updateDiscountDto.endDate);
        }
        if (updateDiscountDto.applicableTiers) {
            updateData.applicableTiers = updateDiscountDto.applicableTiers.map((id) => new mongoose_2.Types.ObjectId(id));
        }
        const updatedDiscount = await this.discountModel
            .findByIdAndUpdate(discountId, { $set: updateData }, { new: true })
            .populate('applicableTiers', 'name');
        return this.transformDiscountToResponse(updatedDiscount);
    }
    async deleteDiscount(creatorId, discountId) {
        const discount = await this.discountModel.findOne({
            _id: new mongoose_2.Types.ObjectId(discountId),
            creator: new mongoose_2.Types.ObjectId(creatorId),
            isDeleted: false,
        });
        if (!discount) {
            throw new common_1.NotFoundException('Discount not found');
        }
        const creator = await this.userModel.findById(creatorId);
        if (!creator || !creator.stripeConnectAccountId) {
            this.logger.warn(`Cannot deactivate Stripe promo code for discount ${discountId} as creator ${creatorId} has no Stripe account ID.`);
        }
        else {
            try {
                if (discount.stripePromotionCodeId) {
                    await this.paymentsService.stripe.promotionCodes.update(discount.stripePromotionCodeId, { active: false }, { stripeAccount: creator.stripeConnectAccountId });
                }
                if (discount.stripeCouponId) {
                    await this.paymentsService.stripe.coupons.del(discount.stripeCouponId, { stripeAccount: creator.stripeConnectAccountId });
                }
            }
            catch (stripeError) {
                this.logger.error(`Stripe error deleting promotion/coupon for discount ${discount.code}: ${stripeError.message}`, stripeError.stack);
            }
        }
        await this.discountModel.findByIdAndUpdate(discountId, {
            $set: { isDeleted: true, status: promotion_1.DiscountStatus.INACTIVE },
        });
        return { success: true };
    }
    async createGift(creatorId, createGiftDto) {
        const existingGift = await this.giftModel.findOne({
            code: createGiftDto.code,
            isDeleted: false,
        });
        if (existingGift) {
            throw new common_1.ConflictException('Gift code already exists');
        }
        if (createGiftDto.applicableTo === promotion_1.DiscountApplicability.SELECTED) {
            if (!createGiftDto.applicableTiers ||
                createGiftDto.applicableTiers.length === 0) {
                throw new common_1.BadRequestException('Applicable tiers must be provided when applicableTo is set to "selected"');
            }
            const tiers = await this.membershipModel.find({
                _id: { $in: createGiftDto.applicableTiers },
                creator: new mongoose_2.Types.ObjectId(creatorId),
            });
            if (tiers.length !== createGiftDto.applicableTiers.length) {
                throw new common_1.BadRequestException('One or more tiers are invalid or do not belong to you');
            }
        }
        const gift = new this.giftModel({
            ...createGiftDto,
            creator: new mongoose_2.Types.ObjectId(creatorId),
            startDate: new Date(createGiftDto.startDate),
            endDate: new Date(createGiftDto.endDate),
            applicableTiers: createGiftDto.applicableTiers?.map((id) => new mongoose_2.Types.ObjectId(id)),
        });
        const savedGift = await gift.save();
        return this.transformGiftToResponse(savedGift);
    }
    async getGifts(creatorId) {
        const gifts = await this.giftModel
            .find({
            creator: new mongoose_2.Types.ObjectId(creatorId),
            isDeleted: false,
        })
            .populate('applicableTiers', 'name')
            .sort({ createdAt: -1 });
        return gifts.map((gift) => this.transformGiftToResponse(gift));
    }
    async getGift(creatorId, giftId) {
        const gift = await this.giftModel
            .findOne({
            _id: new mongoose_2.Types.ObjectId(giftId),
            creator: new mongoose_2.Types.ObjectId(creatorId),
            isDeleted: false,
        })
            .populate('applicableTiers', 'name');
        if (!gift) {
            throw new common_1.NotFoundException('Gift not found');
        }
        return this.transformGiftToResponse(gift);
    }
    async updateGift(creatorId, giftId, updateGiftDto) {
        const gift = await this.giftModel.findOne({
            _id: new mongoose_2.Types.ObjectId(giftId),
            creator: new mongoose_2.Types.ObjectId(creatorId),
            isDeleted: false,
        });
        if (!gift) {
            throw new common_1.NotFoundException('Gift not found');
        }
        if (updateGiftDto.applicableTo === promotion_1.DiscountApplicability.SELECTED) {
            if (!updateGiftDto.applicableTiers ||
                updateGiftDto.applicableTiers.length === 0) {
                throw new common_1.BadRequestException('Applicable tiers must be provided when applicableTo is set to "selected"');
            }
            const tiers = await this.membershipModel.find({
                _id: { $in: updateGiftDto.applicableTiers },
                creator: new mongoose_2.Types.ObjectId(creatorId),
            });
            if (tiers.length !== updateGiftDto.applicableTiers.length) {
                throw new common_1.BadRequestException('One or more tiers are invalid or do not belong to you');
            }
        }
        const updateData = { ...updateGiftDto };
        if (updateGiftDto.startDate) {
            updateData.startDate = new Date(updateGiftDto.startDate);
        }
        if (updateGiftDto.endDate) {
            updateData.endDate = new Date(updateGiftDto.endDate);
        }
        if (updateGiftDto.applicableTiers) {
            updateData.applicableTiers = updateGiftDto.applicableTiers.map((id) => new mongoose_2.Types.ObjectId(id));
        }
        const updatedGift = await this.giftModel
            .findByIdAndUpdate(giftId, { $set: updateData }, { new: true })
            .populate('applicableTiers', 'name');
        return this.transformGiftToResponse(updatedGift);
    }
    async deleteGift(creatorId, giftId) {
        const gift = await this.giftModel.findOne({
            _id: new mongoose_2.Types.ObjectId(giftId),
            creator: new mongoose_2.Types.ObjectId(creatorId),
            isDeleted: false,
        });
        if (!gift) {
            throw new common_1.NotFoundException('Gift not found');
        }
        await this.giftModel.findByIdAndUpdate(giftId, {
            $set: { isDeleted: true, status: promotion_1.DiscountStatus.INACTIVE },
        });
        return { success: true };
    }
    async validatePromotion(code) {
        const now = new Date();
        const discount = await this.discountModel
            .findOne({
            code,
            status: promotion_1.DiscountStatus.ACTIVE,
            startDate: { $lte: now },
            endDate: { $gte: now },
            isDeleted: false,
        })
            .populate('creator', 'displayName');
        if (discount) {
            return {
                isValid: true,
                message: `Valid discount from ${discount.creator.displayName}`,
                promotion: this.transformDiscountToResponse(discount),
            };
        }
        const gift = await this.giftModel
            .findOne({
            code,
            status: promotion_1.DiscountStatus.ACTIVE,
            startDate: { $lte: now },
            endDate: { $gte: now },
            isDeleted: false,
        })
            .populate('creator', 'displayName');
        if (gift) {
            return {
                isValid: true,
                message: `Valid gift from ${gift.creator.displayName}`,
                promotion: this.transformGiftToResponse(gift),
            };
        }
        const expiredDiscount = await this.discountModel.findOne({
            code,
            isDeleted: false,
        });
        if (expiredDiscount) {
            if (expiredDiscount.status === promotion_1.DiscountStatus.INACTIVE) {
                return {
                    isValid: false,
                    message: 'This discount code is no longer active',
                };
            }
            if (expiredDiscount.startDate > now) {
                return {
                    isValid: false,
                    message: 'This discount code is not yet active',
                };
            }
            if (expiredDiscount.endDate < now) {
                return { isValid: false, message: 'This discount code has expired' };
            }
        }
        const expiredGift = await this.giftModel.findOne({
            code,
            isDeleted: false,
        });
        if (expiredGift) {
            if (expiredGift.status === promotion_1.DiscountStatus.INACTIVE) {
                return {
                    isValid: false,
                    message: 'This gift code is no longer active',
                };
            }
            if (expiredGift.startDate > now) {
                return { isValid: false, message: 'This gift code is not yet active' };
            }
            if (expiredGift.endDate < now) {
                return { isValid: false, message: 'This gift code has expired' };
            }
        }
        return { isValid: false, message: 'Invalid promotion code' };
    }
    async redeemPromotion(userId, redeemDto) {
        const { code, membershipId } = redeemDto;
        const now = new Date();
        let membership = await this.membershipModel.findById(membershipId);
        if (!membership) {
            throw new common_1.NotFoundException('Membership tier not found');
        }
        if (!membership.stripeProductId || !membership.stripePriceId) {
            await this.membershipsService.ensureStripeProductForMembership(membershipId);
            membership = await this.membershipModel.findById(membershipId);
            if (!membership ||
                !membership.stripeProductId ||
                !membership.stripePriceId) {
                throw new common_1.BadRequestException('Membership tier is not properly configured for payments.');
            }
        }
        const creatorId = membership.creator.toString();
        const existingRedemption = await this.redemptionModel.findOne({
            user: new mongoose_2.Types.ObjectId(userId),
            $or: [
                {
                    promotion: {
                        $in: await this.discountModel.find({ code }).distinct('_id'),
                    },
                },
                {
                    promotion: {
                        $in: await this.giftModel.find({ code }).distinct('_id'),
                    },
                },
            ],
        });
        if (existingRedemption) {
            throw new common_1.BadRequestException('You have already redeemed this promotion code');
        }
        const discount = await this.discountModel.findOne({
            code,
            status: promotion_1.DiscountStatus.ACTIVE,
            startDate: { $lte: now },
            endDate: { $gte: now },
            isDeleted: false,
        });
        const gift = await this.giftModel.findOne({
            code,
            status: promotion_1.DiscountStatus.ACTIVE,
            startDate: { $lte: now },
            endDate: { $gte: now },
            isDeleted: false,
        });
        if (!discount && !gift) {
            throw new common_1.BadRequestException('Invalid or expired promotion code');
        }
        if (discount) {
            if (discount.applicableTo === promotion_1.DiscountApplicability.SELECTED) {
                const applicableTierIds = discount.applicableTiers.map((id) => id.toString());
                if (!applicableTierIds.includes(membershipId)) {
                    throw new common_1.BadRequestException('This discount does not apply to the selected membership tier');
                }
            }
            const checkoutUrl = await this.membershipsService.createCheckoutSession(userId, membershipId, discount.stripePromotionCodeId);
            const redemption = new this.redemptionModel({
                promotion: discount._id,
                promotionType: 'Discount',
                user: new mongoose_2.Types.ObjectId(userId),
                creator: new mongoose_2.Types.ObjectId(creatorId),
                membership: new mongoose_2.Types.ObjectId(membershipId),
            });
            await redemption.save();
            await this.discountModel.findByIdAndUpdate(discount._id, {
                $inc: { redeemed: 1 },
            });
            return {
                success: true,
                message: 'Discount applied, proceed to checkout',
                checkoutUrl: checkoutUrl,
                promotionType: 'discount',
            };
        }
        if (gift) {
            if (gift.applicableTo === promotion_1.DiscountApplicability.SELECTED) {
                const applicableTierIds = gift.applicableTiers.map((id) => id.toString());
                if (!applicableTierIds.includes(membershipId)) {
                    throw new common_1.BadRequestException('This gift does not apply to the selected membership tier');
                }
            }
            if (gift.giftType === promotion_1.GiftType.FREE_TRIAL) {
                const expiryDate = new Date();
                expiryDate.setDate(expiryDate.getDate() + gift.durationDays);
                const subscriptionResult = await this.membershipsService.createTrialSubscription(userId, membershipId, expiryDate, {
                    giftId: gift._id.toString(),
                    giftCode: gift.code,
                    originalPrice: membership.monthlyRate,
                    trialDurationDays: gift.durationDays,
                });
                const redemption = new this.redemptionModel({
                    promotion: gift._id,
                    promotionType: 'Gift',
                    user: new mongoose_2.Types.ObjectId(userId),
                    creator: new mongoose_2.Types.ObjectId(creatorId),
                    membership: new mongoose_2.Types.ObjectId(membershipId),
                    expiryDate,
                    isExpired: false,
                });
                await redemption.save();
                await this.giftModel.findByIdAndUpdate(gift._id, {
                    $inc: { redeemed: 1 },
                });
                return {
                    success: true,
                    message: `Free trial activated for ${gift.durationDays} days`,
                    subscription: subscriptionResult,
                    promotionType: 'gift',
                };
            }
            else {
                throw new common_1.BadRequestException('Free content gifts are not yet supported');
            }
        }
    }
    generateRandomCode(length = 8) {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let result = '';
        for (let i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        return result;
    }
    transformDiscountToResponse(discount) {
        return {
            id: discount._id.toString(),
            title: discount.title,
            code: discount.code,
            description: discount.description || '',
            status: discount.status,
            redeemed: discount.redeemed,
            percentageType: discount.percentageType,
            discountNumber: discount.discountNumber,
            applicableTo: discount.applicableTo,
            applicableTiers: discount.applicableTiers?.map((tier) => ({
                id: tier._id?.toString() || tier.toString(),
                name: tier.name || 'Unknown Tier',
            })),
            startDate: discount.startDate.toISOString(),
            endDate: discount.endDate.toISOString(),
            isPublic: discount.isPublic,
            createdAt: discount.createdAt?.toISOString() || new Date().toISOString(),
            updatedAt: discount.updatedAt?.toISOString() || new Date().toISOString(),
        };
    }
    transformGiftToResponse(gift) {
        return {
            id: gift._id.toString(),
            title: gift.title,
            code: gift.code,
            description: gift.description || '',
            status: gift.status,
            redeemed: gift.redeemed,
            giftType: gift.giftType,
            durationDays: gift.durationDays,
            applicableTo: gift.applicableTo,
            applicableTiers: gift.applicableTiers?.map((tier) => ({
                id: tier._id?.toString() || tier.toString(),
                name: tier.name || 'Unknown Tier',
            })),
            startDate: gift.startDate.toISOString(),
            endDate: gift.endDate.toISOString(),
            isPublic: gift.isPublic,
            createdAt: gift.createdAt?.toISOString() || new Date().toISOString(),
            updatedAt: gift.updatedAt?.toISOString() || new Date().toISOString(),
        };
    }
};
exports.PromotionsService = PromotionsService;
exports.PromotionsService = PromotionsService = PromotionsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(promotion_1.Discount.name)),
    __param(1, (0, mongoose_1.InjectModel)(promotion_1.Gift.name)),
    __param(2, (0, mongoose_1.InjectModel)(promotion_1.PromotionRedemption.name)),
    __param(3, (0, mongoose_1.InjectModel)(user_1.User.name)),
    __param(4, (0, mongoose_1.InjectModel)(membership_1.Membership.name)),
    __param(5, (0, common_1.Inject)((0, common_1.forwardRef)(() => memberships_service_1.MembershipsService))),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        memberships_service_1.MembershipsService,
        payments_service_1.PaymentsService])
], PromotionsService);
//# sourceMappingURL=promotions.service.js.map