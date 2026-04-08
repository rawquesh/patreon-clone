import { DiscountApplicability, DiscountStatus, DiscountType, GiftType } from '@/database/schemas/promotion';
export declare class CreateDiscountDto {
    title: string;
    code: string;
    description?: string;
    percentageType: DiscountType;
    discountNumber: number;
    applicableTo: DiscountApplicability;
    applicableTiers?: string[];
    startDate: string;
    endDate: string;
    isPublic?: boolean;
}
export declare class UpdateDiscountDto {
    title?: string;
    description?: string;
    status?: DiscountStatus;
    percentageType?: DiscountType;
    discountNumber?: number;
    applicableTo?: DiscountApplicability;
    applicableTiers?: string[];
    startDate?: string;
    endDate?: string;
    isPublic?: boolean;
}
export declare class CreateGiftDto {
    title: string;
    code: string;
    description?: string;
    giftType: GiftType;
    durationDays: number;
    applicableTo: DiscountApplicability;
    applicableTiers?: string[];
    startDate: string;
    endDate: string;
    isPublic?: boolean;
}
export declare class UpdateGiftDto {
    title?: string;
    description?: string;
    status?: DiscountStatus;
    giftType?: GiftType;
    durationDays?: number;
    applicableTo?: DiscountApplicability;
    applicableTiers?: string[];
    startDate?: string;
    endDate?: string;
    isPublic?: boolean;
}
export declare class RedeemPromotionDto {
    code: string;
    membershipId: string;
}
export declare class DiscountResponseDto {
    id: string;
    title: string;
    code: string;
    description: string;
    status: DiscountStatus;
    redeemed: number;
    percentageType: DiscountType;
    discountNumber: number;
    applicableTo: DiscountApplicability;
    applicableTiers?: any[];
    startDate: string;
    endDate: string;
    isPublic: boolean;
    createdAt: string;
    updatedAt: string;
}
export declare class GiftResponseDto {
    id: string;
    title: string;
    code: string;
    description: string;
    status: DiscountStatus;
    redeemed: number;
    giftType: GiftType;
    durationDays: number;
    applicableTo: DiscountApplicability;
    applicableTiers?: any[];
    startDate: string;
    endDate: string;
    isPublic: boolean;
    createdAt: string;
    updatedAt: string;
}
export declare class PromotionValidationResponseDto {
    isValid: boolean;
    message: string;
    promotion?: DiscountResponseDto | GiftResponseDto;
}
