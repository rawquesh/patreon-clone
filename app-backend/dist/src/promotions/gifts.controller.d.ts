import { PromotionsService } from './promotions.service';
import { CreateGiftDto, UpdateGiftDto } from './promotions.dto';
export declare class GiftsController {
    private readonly promotionsService;
    constructor(promotionsService: PromotionsService);
    createGift(req: any, createGiftDto: CreateGiftDto): Promise<import("./promotions.dto").GiftResponseDto>;
    getGifts(req: any): Promise<{
        gifts: import("./promotions.dto").GiftResponseDto[];
    }>;
    getGift(req: any, id: string): Promise<import("./promotions.dto").GiftResponseDto>;
    updateGift(req: any, id: string, updateGiftDto: UpdateGiftDto): Promise<import("./promotions.dto").GiftResponseDto>;
    deleteGift(req: any, id: string): Promise<{
        success: boolean;
    }>;
    generateCode(): Promise<{
        code: string;
    }>;
}
