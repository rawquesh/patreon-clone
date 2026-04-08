import { PromotionsService } from './promotions.service';
import { CreateDiscountDto, RedeemPromotionDto, UpdateDiscountDto } from './promotions.dto';
export declare class DiscountsController {
    private readonly promotionsService;
    constructor(promotionsService: PromotionsService);
    createDiscount(req: any, createDiscountDto: CreateDiscountDto): Promise<import("./promotions.dto").DiscountResponseDto>;
    getDiscounts(req: any): Promise<{
        discounts: import("./promotions.dto").DiscountResponseDto[];
    }>;
    getDiscount(req: any, id: string): Promise<import("./promotions.dto").DiscountResponseDto>;
    updateDiscount(req: any, id: string, updateDiscountDto: UpdateDiscountDto): Promise<import("./promotions.dto").DiscountResponseDto>;
    deleteDiscount(req: any, id: string): Promise<{
        success: boolean;
    }>;
    generateCode(): Promise<{
        code: string;
    }>;
    validatePromotion(code: string): Promise<import("./promotions.dto").PromotionValidationResponseDto>;
    redeemPromotion(req: any, redeemDto: RedeemPromotionDto): Promise<any>;
}
