import { Model } from 'mongoose';
import { Subscription } from '@/database/schemas/subscription';
import { PromotionRedemption } from '@/database/schemas/promotion';
export declare class PromotionsSchedulerService {
    private subscriptionModel;
    private redemptionModel;
    private readonly logger;
    constructor(subscriptionModel: Model<Subscription>, redemptionModel: Model<PromotionRedemption>);
    handleExpiredPromotions(): Promise<void>;
}
