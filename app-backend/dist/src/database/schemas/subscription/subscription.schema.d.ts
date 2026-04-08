import { Document, Schema as MongooseSchema } from 'mongoose';
import { Membership } from '@/database/schemas/membership';
import { User } from '@/database/schemas/user';
export declare class DiscountData {
    discountId?: string;
    discountCode?: string;
    originalPrice?: number;
    discountedPrice?: number;
}
export declare const DiscountDataSchema: MongooseSchema<DiscountData, import("mongoose").Model<DiscountData, any, any, any, Document<unknown, any, DiscountData, any, {}> & DiscountData & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, DiscountData, Document<unknown, {}, import("mongoose").FlatRecord<DiscountData>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<DiscountData> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
export declare class GiftData {
    giftId?: string;
    giftCode?: string;
    originalPrice?: number;
    trialDurationDays?: number;
}
export declare const GiftDataSchema: MongooseSchema<GiftData, import("mongoose").Model<GiftData, any, any, any, Document<unknown, any, GiftData, any, {}> & GiftData & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, GiftData, Document<unknown, {}, import("mongoose").FlatRecord<GiftData>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<GiftData> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
export declare class Subscription extends Document {
    createdAt: Date;
    updatedAt: Date;
    subscriber: MongooseSchema.Types.ObjectId | User;
    creator: MongooseSchema.Types.ObjectId | User;
    membership: MongooseSchema.Types.ObjectId | Membership;
    monthlyRate: number;
    status: 'active' | 'cancelled' | 'expired';
    currentPeriodStart: Date;
    currentPeriodEnd: Date;
    cancelledAt?: Date;
    stripeSubscriptionId?: string;
    isTrial?: boolean;
    trialEndDate?: Date;
    hasDiscount?: boolean;
    discountData?: DiscountData;
    giftData?: GiftData;
}
export declare const SubscriptionSchema: MongooseSchema<Subscription, import("mongoose").Model<Subscription, any, any, any, Document<unknown, any, Subscription, any, {}> & Subscription & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Subscription, Document<unknown, {}, import("mongoose").FlatRecord<Subscription>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<Subscription> & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
}>;
