import {
  BadRequestException,
  ConflictException,
  forwardRef,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  Discount,
  DiscountApplicability,
  DiscountStatus,
  DiscountType,
  Gift,
  GiftType,
  PromotionRedemption,
} from '@/schemas/promotions.schema';
import { User } from '@/schemas/users.schema';
import { Membership } from '@/schemas/membersip.schema';
import {
  CreateDiscountDto,
  CreateGiftDto,
  DiscountResponseDto,
  GiftResponseDto,
  PromotionValidationResponseDto,
  RedeemPromotionDto,
  UpdateDiscountDto,
  UpdateGiftDto,
} from './promotions.dto';
import { MembershipsService } from '@/memberships/memberships.service';
import { PaymentsService } from '@/payments/payments.service';
import Stripe from 'stripe';

@Injectable()
export class PromotionsService {
  private readonly logger = new Logger(PromotionsService.name);

  constructor(
    @InjectModel(Discount.name) private discountModel: Model<Discount>,
    @InjectModel(Gift.name) private giftModel: Model<Gift>,
    @InjectModel(PromotionRedemption.name)
    private redemptionModel: Model<PromotionRedemption>,
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Membership.name) private membershipModel: Model<Membership>,
    @Inject(forwardRef(() => MembershipsService))
    private membershipsService: MembershipsService,
    private paymentsService: PaymentsService,
  ) {}

  async createDiscount(
    creatorId: string,
    createDiscountDto: CreateDiscountDto,
  ): Promise<DiscountResponseDto> {
    const creator = await this.userModel.findById(creatorId);
    if (!creator) throw new NotFoundException('Creator not found');
    if (!creator.stripeConnectAccountId)
      throw new BadRequestException(
        'Creator must complete Stripe onboarding first',
      );

    const existingDiscount = await this.discountModel.findOne({
      code: createDiscountDto.code,
      isDeleted: false,
    });

    if (existingDiscount) {
      throw new ConflictException('Discount code already exists');
    }

    let applicableTierStripeProductIds: string[] = [];
    if (createDiscountDto.applicableTo === DiscountApplicability.SELECTED) {
      if (
        !createDiscountDto.applicableTiers ||
        createDiscountDto.applicableTiers.length === 0
      ) {
        throw new BadRequestException(
          'Applicable tiers must be provided when applicableTo is set to "selected"',
        );
      }

      const tiers = await this.membershipModel.find({
        _id: { $in: createDiscountDto.applicableTiers },
        creator: new Types.ObjectId(creatorId),
      });

      if (tiers.length !== createDiscountDto.applicableTiers.length) {
        throw new BadRequestException(
          'One or more tiers are invalid or do not belong to you',
        );
      }
      applicableTierStripeProductIds = tiers
        .map((tier) => tier.stripeProductId)
        .filter((id): id is string => !!id);
      if (
        applicableTierStripeProductIds.length !== tiers.length &&
        tiers.some((t) => t.monthlyRate > 0)
      ) {
        this.logger.warn(
          `Some selected paid tiers for discount ${createDiscountDto.code} are missing Stripe Product IDs.`,
        );
      }
    }

    let stripeCoupon: Stripe.Coupon;
    let stripePromotionCode: Stripe.PromotionCode;

    try {
      const couponParams: Stripe.CouponCreateParams = {
        name: createDiscountDto.title,
        duration: 'forever',
        currency: 'usd',
        metadata: {
          creatorId: creatorId,
          discountTitle: createDiscountDto.title,
        },
      };

      if (createDiscountDto.percentageType === DiscountType.PERCENTAGE) {
        couponParams.percent_off = createDiscountDto.discountNumber;
      } else {
        couponParams.amount_off = Math.round(
          createDiscountDto.discountNumber * 100,
        );
      }

      if (
        createDiscountDto.applicableTo === DiscountApplicability.SELECTED &&
        applicableTierStripeProductIds.length > 0
      ) {
        couponParams.applies_to = {
          products: applicableTierStripeProductIds,
        };
      }

      console.log(creator.stripeConnectAccountId);
      stripeCoupon = await this.paymentsService.stripe.coupons.create(
        couponParams,
        // { stripeAccount: creator.stripeConnectAccountId },
      );

      const promotionCodeParams: Stripe.PromotionCodeCreateParams = {
        coupon: stripeCoupon.id,
        code: createDiscountDto.code,
        active: true,
        expires_at: Math.floor(
          new Date(createDiscountDto.endDate).getTime() / 1000,
        ),
        metadata: {
          creatorId: creatorId,
          discountTitle: createDiscountDto.title,
        },
      };
      stripePromotionCode =
        await this.paymentsService.stripe.promotionCodes.create(
          promotionCodeParams,
          // { stripeAccount: creator.stripeConnectAccountId },
        );
      console.log(stripePromotionCode);
    } catch (stripeError) {
      this.logger.error(
        `Stripe error creating coupon/promo code for ${createDiscountDto.code}: ${stripeError.message}`,
        stripeError.stack,
      );
      throw new InternalServerErrorException(
        `Failed to create discount in payment system: ${stripeError.message}`,
      );
    }

    const discount = new this.discountModel({
      ...createDiscountDto,
      creator: new Types.ObjectId(creatorId),
      startDate: new Date(createDiscountDto.startDate),
      endDate: new Date(createDiscountDto.endDate),
      applicableTiers: createDiscountDto.applicableTiers?.map(
        (id) => new Types.ObjectId(id),
      ),
      stripeCouponId: stripeCoupon.id,
      stripePromotionCodeId: stripePromotionCode.id,
    });

    const savedDiscount = await discount.save();
    return this.transformDiscountToResponse(savedDiscount);
  }

  async getDiscounts(creatorId: string): Promise<DiscountResponseDto[]> {
    const discounts = await this.discountModel
      .find({
        creator: new Types.ObjectId(creatorId),
        isDeleted: false,
      })
      .populate('applicableTiers', 'name')
      .sort({ createdAt: -1 });

    return discounts.map((discount) =>
      this.transformDiscountToResponse(discount),
    );
  }

  async getDiscount(
    creatorId: string,
    discountId: string,
  ): Promise<DiscountResponseDto> {
    const discount = await this.discountModel
      .findOne({
        _id: new Types.ObjectId(discountId),
        creator: new Types.ObjectId(creatorId),
        isDeleted: false,
      })
      .populate('applicableTiers', 'name');

    if (!discount) {
      throw new NotFoundException('Discount not found');
    }

    return this.transformDiscountToResponse(discount);
  }

  async updateDiscount(
    creatorId: string,
    discountId: string,
    updateDiscountDto: UpdateDiscountDto,
  ): Promise<DiscountResponseDto> {
    const discount = await this.discountModel.findOne({
      _id: new Types.ObjectId(discountId),
      creator: new Types.ObjectId(creatorId),
      isDeleted: false,
    });

    if (!discount) {
      throw new NotFoundException('Discount not found');
    }

    const creator = await this.userModel.findById(creatorId);
    if (!creator || !creator.stripeConnectAccountId) {
      throw new BadRequestException(
        'Creator Stripe account not found or not onboarded.',
      );
    }

    const couponPropsChanged =
      updateDiscountDto.percentageType !== undefined ||
      updateDiscountDto.discountNumber !== undefined ||
      updateDiscountDto.applicableTo !== undefined ||
      updateDiscountDto.applicableTiers !== undefined;

    if (couponPropsChanged) {
      throw new BadRequestException(
        'Discount value, type, and tier applicability cannot be changed. Please create a new discount instead.',
      );
    }

    try {
      if (discount.stripePromotionCodeId) {
        const promoCodeUpdateParams: Stripe.PromotionCodeUpdateParams = {
          active:
            updateDiscountDto.status !== undefined
              ? updateDiscountDto.status === DiscountStatus.ACTIVE
              : discount.status === DiscountStatus.ACTIVE,
          metadata: {
            creatorId: creatorId,
            discountTitle:
              updateDiscountDto.title !== undefined
                ? updateDiscountDto.title
                : discount.title,
          },
        };

        await this.paymentsService.stripe.promotionCodes.update(
          discount.stripePromotionCodeId,
          promoCodeUpdateParams,
          { stripeAccount: creator.stripeConnectAccountId },
        );
      } else {
        this.logger.warn(
          `Discount ${discountId} is missing Stripe Promotion Code ID during update.`,
        );
      }
    } catch (stripeError) {
      this.logger.error(
        `Stripe error updating promotion code for ${discount.code}: ${stripeError.message}`,
        stripeError.stack,
      );
      throw new InternalServerErrorException(
        `Failed to update discount in payment system: ${stripeError.message}`,
      );
    }

    const updateData: any = { ...updateDiscountDto };
    if (updateDiscountDto.startDate) {
      updateData.startDate = new Date(updateDiscountDto.startDate);
    }
    if (updateDiscountDto.endDate) {
      updateData.endDate = new Date(updateDiscountDto.endDate);
    }
    if (updateDiscountDto.applicableTiers) {
      updateData.applicableTiers = updateDiscountDto.applicableTiers.map(
        (id) => new Types.ObjectId(id),
      );
    }

    const updatedDiscount = await this.discountModel
      .findByIdAndUpdate(discountId, { $set: updateData }, { new: true })
      .populate('applicableTiers', 'name');

    return this.transformDiscountToResponse(updatedDiscount);
  }

  async deleteDiscount(
    creatorId: string,
    discountId: string,
  ): Promise<{ success: boolean }> {
    const discount = await this.discountModel.findOne({
      _id: new Types.ObjectId(discountId),
      creator: new Types.ObjectId(creatorId),
      isDeleted: false,
    });

    if (!discount) {
      throw new NotFoundException('Discount not found');
    }

    const creator = await this.userModel.findById(creatorId);
    if (!creator || !creator.stripeConnectAccountId) {
      this.logger.warn(
        `Cannot deactivate Stripe promo code for discount ${discountId} as creator ${creatorId} has no Stripe account ID.`,
      );
    } else {
      try {
        if (discount.stripePromotionCodeId) {
          await this.paymentsService.stripe.promotionCodes.update(
            discount.stripePromotionCodeId,
            { active: false },
            { stripeAccount: creator.stripeConnectAccountId },
          );
        }
        if (discount.stripeCouponId) {
          await this.paymentsService.stripe.coupons.del(
            discount.stripeCouponId,
            { stripeAccount: creator.stripeConnectAccountId },
          );
        }
      } catch (stripeError) {
        this.logger.error(
          `Stripe error deleting promotion/coupon for discount ${discount.code}: ${stripeError.message}`,
          stripeError.stack,
        );
      }
    }

    await this.discountModel.findByIdAndUpdate(discountId, {
      $set: { isDeleted: true, status: DiscountStatus.INACTIVE },
    });

    return { success: true };
  }

  async createGift(
    creatorId: string,
    createGiftDto: CreateGiftDto,
  ): Promise<GiftResponseDto> {
    const existingGift = await this.giftModel.findOne({
      code: createGiftDto.code,
      isDeleted: false,
    });

    if (existingGift) {
      throw new ConflictException('Gift code already exists');
    }

    if (createGiftDto.applicableTo === DiscountApplicability.SELECTED) {
      if (
        !createGiftDto.applicableTiers ||
        createGiftDto.applicableTiers.length === 0
      ) {
        throw new BadRequestException(
          'Applicable tiers must be provided when applicableTo is set to "selected"',
        );
      }

      const tiers = await this.membershipModel.find({
        _id: { $in: createGiftDto.applicableTiers },
        creator: new Types.ObjectId(creatorId),
      });

      if (tiers.length !== createGiftDto.applicableTiers.length) {
        throw new BadRequestException(
          'One or more tiers are invalid or do not belong to you',
        );
      }
    }

    const gift = new this.giftModel({
      ...createGiftDto,
      creator: new Types.ObjectId(creatorId),
      startDate: new Date(createGiftDto.startDate),
      endDate: new Date(createGiftDto.endDate),
      applicableTiers: createGiftDto.applicableTiers?.map(
        (id) => new Types.ObjectId(id),
      ),
    });

    const savedGift = await gift.save();
    return this.transformGiftToResponse(savedGift);
  }

  async getGifts(creatorId: string): Promise<GiftResponseDto[]> {
    const gifts = await this.giftModel
      .find({
        creator: new Types.ObjectId(creatorId),
        isDeleted: false,
      })
      .populate('applicableTiers', 'name')
      .sort({ createdAt: -1 });

    return gifts.map((gift) => this.transformGiftToResponse(gift));
  }

  async getGift(creatorId: string, giftId: string): Promise<GiftResponseDto> {
    const gift = await this.giftModel
      .findOne({
        _id: new Types.ObjectId(giftId),
        creator: new Types.ObjectId(creatorId),
        isDeleted: false,
      })
      .populate('applicableTiers', 'name');

    if (!gift) {
      throw new NotFoundException('Gift not found');
    }

    return this.transformGiftToResponse(gift);
  }

  async updateGift(
    creatorId: string,
    giftId: string,
    updateGiftDto: UpdateGiftDto,
  ): Promise<GiftResponseDto> {
    const gift = await this.giftModel.findOne({
      _id: new Types.ObjectId(giftId),
      creator: new Types.ObjectId(creatorId),
      isDeleted: false,
    });

    if (!gift) {
      throw new NotFoundException('Gift not found');
    }

    if (updateGiftDto.applicableTo === DiscountApplicability.SELECTED) {
      if (
        !updateGiftDto.applicableTiers ||
        updateGiftDto.applicableTiers.length === 0
      ) {
        throw new BadRequestException(
          'Applicable tiers must be provided when applicableTo is set to "selected"',
        );
      }

      const tiers = await this.membershipModel.find({
        _id: { $in: updateGiftDto.applicableTiers },
        creator: new Types.ObjectId(creatorId),
      });

      if (tiers.length !== updateGiftDto.applicableTiers.length) {
        throw new BadRequestException(
          'One or more tiers are invalid or do not belong to you',
        );
      }
    }

    const updateData: any = { ...updateGiftDto };

    if (updateGiftDto.startDate) {
      updateData.startDate = new Date(updateGiftDto.startDate);
    }

    if (updateGiftDto.endDate) {
      updateData.endDate = new Date(updateGiftDto.endDate);
    }

    if (updateGiftDto.applicableTiers) {
      updateData.applicableTiers = updateGiftDto.applicableTiers.map(
        (id) => new Types.ObjectId(id),
      );
    }

    const updatedGift = await this.giftModel
      .findByIdAndUpdate(giftId, { $set: updateData }, { new: true })
      .populate('applicableTiers', 'name');

    return this.transformGiftToResponse(updatedGift);
  }

  async deleteGift(
    creatorId: string,
    giftId: string,
  ): Promise<{ success: boolean }> {
    const gift = await this.giftModel.findOne({
      _id: new Types.ObjectId(giftId),
      creator: new Types.ObjectId(creatorId),
      isDeleted: false,
    });

    if (!gift) {
      throw new NotFoundException('Gift not found');
    }

    await this.giftModel.findByIdAndUpdate(giftId, {
      $set: { isDeleted: true, status: DiscountStatus.INACTIVE },
    });

    return { success: true };
  }

  async validatePromotion(
    code: string,
  ): Promise<PromotionValidationResponseDto> {
    const now = new Date();

    const discount = await this.discountModel
      .findOne({
        code,
        status: DiscountStatus.ACTIVE,
        startDate: { $lte: now },
        endDate: { $gte: now },
        isDeleted: false,
      })
      .populate('creator', 'displayName');

    if (discount) {
      return {
        isValid: true,
        message: `Valid discount from ${(discount.creator as any).displayName}`,
        promotion: this.transformDiscountToResponse(discount),
      };
    }

    const gift = await this.giftModel
      .findOne({
        code,
        status: DiscountStatus.ACTIVE,
        startDate: { $lte: now },
        endDate: { $gte: now },
        isDeleted: false,
      })
      .populate('creator', 'displayName');

    if (gift) {
      return {
        isValid: true,
        message: `Valid gift from ${(gift.creator as any).displayName}`,
        promotion: this.transformGiftToResponse(gift),
      };
    }

    const expiredDiscount = await this.discountModel.findOne({
      code,
      isDeleted: false,
    });

    if (expiredDiscount) {
      if (expiredDiscount.status === DiscountStatus.INACTIVE) {
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
      if (expiredGift.status === DiscountStatus.INACTIVE) {
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

  async redeemPromotion(
    userId: string,
    redeemDto: RedeemPromotionDto,
  ): Promise<any> {
    const { code, membershipId } = redeemDto;
    const now = new Date();

    let membership = await this.membershipModel.findById(membershipId);
    if (!membership) {
      throw new NotFoundException('Membership tier not found');
    }
    if (!membership.stripeProductId || !membership.stripePriceId) {
      await this.membershipsService.ensureStripeProductForMembership(
        membershipId,
      );
      membership = await this.membershipModel.findById(membershipId);
      if (
        !membership ||
        !membership.stripeProductId ||
        !membership.stripePriceId
      ) {
        throw new BadRequestException(
          'Membership tier is not properly configured for payments.',
        );
      }
    }

    const creatorId = membership.creator.toString();

    const existingRedemption = await this.redemptionModel.findOne({
      user: new Types.ObjectId(userId),
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
      throw new BadRequestException(
        'You have already redeemed this promotion code',
      );
    }

    const discount = await this.discountModel.findOne({
      code,
      status: DiscountStatus.ACTIVE,
      startDate: { $lte: now },
      endDate: { $gte: now },
      isDeleted: false,
    });

    const gift = await this.giftModel.findOne({
      code,
      status: DiscountStatus.ACTIVE,
      startDate: { $lte: now },
      endDate: { $gte: now },
      isDeleted: false,
    });

    if (!discount && !gift) {
      throw new BadRequestException('Invalid or expired promotion code');
    }

    if (discount) {
      if (discount.applicableTo === DiscountApplicability.SELECTED) {
        const applicableTierIds = discount.applicableTiers.map((id) =>
          id.toString(),
        );
        if (!applicableTierIds.includes(membershipId)) {
          throw new BadRequestException(
            'This discount does not apply to the selected membership tier',
          );
        }
      }

      const checkoutUrl = await this.membershipsService.createCheckoutSession(
        userId,
        membershipId,
        discount.stripePromotionCodeId,
      );

      const redemption = new this.redemptionModel({
        promotion: discount._id,
        promotionType: 'Discount',
        user: new Types.ObjectId(userId),
        creator: new Types.ObjectId(creatorId),
        membership: new Types.ObjectId(membershipId),
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
      if (gift.applicableTo === DiscountApplicability.SELECTED) {
        const applicableTierIds = gift.applicableTiers.map((id) =>
          id.toString(),
        );
        if (!applicableTierIds.includes(membershipId)) {
          throw new BadRequestException(
            'This gift does not apply to the selected membership tier',
          );
        }
      }

      if (gift.giftType === GiftType.FREE_TRIAL) {
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + gift.durationDays);

        const subscriptionResult =
          await this.membershipsService.createTrialSubscription(
            userId,
            membershipId,
            expiryDate,
            {
              giftId: gift._id.toString(),
              giftCode: gift.code,
              originalPrice: membership.monthlyRate,
              trialDurationDays: gift.durationDays,
            },
          );

        const redemption = new this.redemptionModel({
          promotion: gift._id,
          promotionType: 'Gift',
          user: new Types.ObjectId(userId),
          creator: new Types.ObjectId(creatorId),
          membership: new Types.ObjectId(membershipId),
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
      } else {
        throw new BadRequestException(
          'Free content gifts are not yet supported',
        );
      }
    }
  }

  generateRandomCode(length: number = 8): string {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += characters.charAt(
        Math.floor(Math.random() * characters.length),
      );
    }
    return result;
  }

  private transformDiscountToResponse(discount: any): DiscountResponseDto {
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

  private transformGiftToResponse(gift: any): GiftResponseDto {
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
}
