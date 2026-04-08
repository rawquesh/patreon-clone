import { Model } from 'mongoose';
import { Discount, Gift, PromotionRedemption } from '@/database/schemas/promotion';
import { User } from '@/database/schemas/user';
import { Membership } from '@/database/schemas/membership';
import { CreateDiscountDto, CreateGiftDto, DiscountResponseDto, GiftResponseDto, PromotionValidationResponseDto, RedeemPromotionDto, UpdateDiscountDto, UpdateGiftDto } from './promotions.dto';
import { MembershipsService } from '@/memberships/memberships.service';
import { PaymentsService } from '@/payments/payments.service';
export declare class PromotionsService {
    private discountModel;
    private giftModel;
    private redemptionModel;
    private userModel;
    private membershipModel;
    private membershipsService;
    private paymentsService;
    private readonly logger;
    constructor(discountModel: Model<Discount>, giftModel: Model<Gift>, redemptionModel: Model<PromotionRedemption>, userModel: Model<User>, membershipModel: Model<Membership>, membershipsService: MembershipsService, paymentsService: PaymentsService);
    createDiscount(creatorId: string, createDiscountDto: CreateDiscountDto): Promise<DiscountResponseDto>;
    getDiscounts(creatorId: string): Promise<DiscountResponseDto[]>;
    getDiscount(creatorId: string, discountId: string): Promise<DiscountResponseDto>;
    updateDiscount(creatorId: string, discountId: string, updateDiscountDto: UpdateDiscountDto): Promise<DiscountResponseDto>;
    deleteDiscount(creatorId: string, discountId: string): Promise<{
        success: boolean;
    }>;
    createGift(creatorId: string, createGiftDto: CreateGiftDto): Promise<GiftResponseDto>;
    getGifts(creatorId: string): Promise<GiftResponseDto[]>;
    getGift(creatorId: string, giftId: string): Promise<GiftResponseDto>;
    updateGift(creatorId: string, giftId: string, updateGiftDto: UpdateGiftDto): Promise<GiftResponseDto>;
    deleteGift(creatorId: string, giftId: string): Promise<{
        success: boolean;
    }>;
    validatePromotion(code: string): Promise<PromotionValidationResponseDto>;
    redeemPromotion(userId: string, redeemDto: RedeemPromotionDto): Promise<any>;
    generateRandomCode(length?: number): string;
    private transformDiscountToResponse;
    private transformGiftToResponse;
}
