import { Document, Schema as MongooseSchema } from 'mongoose';
import { DiscountType, DiscountStatus, DiscountApplicability, GiftType } from './enums';
export declare class Discount extends Document {
    title: string;
    code: string;
    description: string;
    status: DiscountStatus;
    redeemed: number;
    percentageType: DiscountType;
    discountNumber: number;
    applicableTo: DiscountApplicability;
    applicableTiers?: MongooseSchema.Types.ObjectId[];
    startDate: Date;
    endDate: Date;
    isPublic: boolean;
    creator: MongooseSchema.Types.ObjectId;
    isDeleted: boolean;
    stripeCouponId?: string;
    stripePromotionCodeId?: string;
}
export declare const DiscountSchema: MongooseSchema<Discount, import("mongoose").Model<Discount, any, any, any, Document<unknown, any, Discount, any, {}> & Discount & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Discount, Document<unknown, {}, import("mongoose").FlatRecord<Discount>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<Discount> & Required<{
    _id: unknown;
}> & {
    __v: number;
}>;
export declare class Gift extends Document {
    title: string;
    code: string;
    description: string;
    status: DiscountStatus;
    redeemed: number;
    giftType: GiftType;
    durationDays: number;
    applicableTo: DiscountApplicability;
    applicableTiers?: MongooseSchema.Types.ObjectId[];
    startDate: Date;
    endDate: Date;
    isPublic: boolean;
    creator: MongooseSchema.Types.ObjectId;
    isDeleted: boolean;
}
export declare const GiftSchema: MongooseSchema<Gift, import("mongoose").Model<Gift, any, any, any, Document<unknown, any, Gift, any, {}> & Gift & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Gift, Document<unknown, {}, import("mongoose").FlatRecord<Gift>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<Gift> & Required<{
    _id: unknown;
}> & {
    __v: number;
}>;
export declare class PromotionRedemption extends Document {
    promotion: MongooseSchema.Types.ObjectId;
    promotionType: string;
    user: MongooseSchema.Types.ObjectId;
    creator: MongooseSchema.Types.ObjectId;
    membership: MongooseSchema.Types.ObjectId;
    expiryDate?: Date;
    isExpired: boolean;
}
export declare const PromotionRedemptionSchema: MongooseSchema<PromotionRedemption, import("mongoose").Model<PromotionRedemption, any, any, any, Document<unknown, any, PromotionRedemption, any, {}> & PromotionRedemption & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, PromotionRedemption, Document<unknown, {}, import("mongoose").FlatRecord<PromotionRedemption>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<PromotionRedemption> & Required<{
    _id: unknown;
}> & {
    __v: number;
}>;
