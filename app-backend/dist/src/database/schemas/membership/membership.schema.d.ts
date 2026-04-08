import { Document, Schema as MongooseSchema } from 'mongoose';
import { User } from '@/database/schemas/user';
export declare class Membership extends Document {
    creator: MongooseSchema.Types.ObjectId | User;
    name: string;
    description: string;
    monthlyRate: number;
    coverImage: string;
    isActive: boolean;
    benefits: string[];
    subscriberCount: number;
    totalEarnings: number;
    stripeProductId?: string;
    stripePriceId?: string;
    isFeatured: boolean;
}
export declare const MembershipSchema: MongooseSchema<Membership, import("mongoose").Model<Membership, any, any, any, Document<unknown, any, Membership, any, {}> & Membership & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Membership, Document<unknown, {}, import("mongoose").FlatRecord<Membership>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<Membership> & Required<{
    _id: unknown;
}> & {
    __v: number;
}>;
