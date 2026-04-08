import { Document, Schema as MongooseSchema } from 'mongoose';
export declare class MembershipInsight extends Document {
    creator: MongooseSchema.Types.ObjectId;
    date: Date;
    activeMembers: number;
    newMembers: number;
    upgradedMembers: number;
    cancelledMembers: number;
    tierBreakdown: Record<string, {
        count: number;
        growth: number;
    }>;
}
export declare const MembershipInsightSchema: MongooseSchema<MembershipInsight, import("mongoose").Model<MembershipInsight, any, any, any, Document<unknown, any, MembershipInsight, any, {}> & MembershipInsight & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, MembershipInsight, Document<unknown, {}, import("mongoose").FlatRecord<MembershipInsight>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<MembershipInsight> & Required<{
    _id: unknown;
}> & {
    __v: number;
}>;
export declare class EarningsInsight extends Document {
    creator: MongooseSchema.Types.ObjectId;
    date: Date;
    totalEarnings: number;
    membershipEarnings: number;
    tierBreakdown: Record<string, {
        amount: number;
        percentage: number;
    }>;
}
export declare const EarningsInsightSchema: MongooseSchema<EarningsInsight, import("mongoose").Model<EarningsInsight, any, any, any, Document<unknown, any, EarningsInsight, any, {}> & EarningsInsight & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, EarningsInsight, Document<unknown, {}, import("mongoose").FlatRecord<EarningsInsight>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<EarningsInsight> & Required<{
    _id: unknown;
}> & {
    __v: number;
}>;
export declare class PostInsight extends Document {
    post: MongooseSchema.Types.ObjectId;
    creator: MongooseSchema.Types.ObjectId;
    date: Date;
    impressions: number;
    engagements: number;
}
export declare const PostInsightSchema: MongooseSchema<PostInsight, import("mongoose").Model<PostInsight, any, any, any, Document<unknown, any, PostInsight, any, {}> & PostInsight & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, PostInsight, Document<unknown, {}, import("mongoose").FlatRecord<PostInsight>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<PostInsight> & Required<{
    _id: unknown;
}> & {
    __v: number;
}>;
