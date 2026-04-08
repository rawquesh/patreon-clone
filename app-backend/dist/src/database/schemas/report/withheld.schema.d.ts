import { Document, Schema as MongooseSchema } from 'mongoose';
export declare class WithheldPost extends Document {
    _id: string;
    id: string;
    createdAt: Date;
    updatedAt: Date;
    postData: any;
    originalPostId: string;
    withheldBy: MongooseSchema.Types.ObjectId;
    reason: string;
    adminNotes?: string;
    withheldAt: Date;
    relatedReport?: string;
}
export declare const WithheldPostSchema: MongooseSchema<WithheldPost, import("mongoose").Model<WithheldPost, any, any, any, Document<unknown, any, WithheldPost, any, {}> & WithheldPost & Required<{
    _id: string;
}> & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, WithheldPost, Document<unknown, {}, import("mongoose").FlatRecord<WithheldPost>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<WithheldPost> & Required<{
    _id: string;
}> & {
    __v: number;
}>;
export declare class WithheldUser extends Document {
    _id: string;
    id: string;
    createdAt: Date;
    updatedAt: Date;
    userData: any;
    originalUserId: string;
    withheldBy: MongooseSchema.Types.ObjectId;
    reason: string;
    adminNotes?: string;
    withheldAt: Date;
    relatedReport?: string;
}
export declare const WithheldUserSchema: MongooseSchema<WithheldUser, import("mongoose").Model<WithheldUser, any, any, any, Document<unknown, any, WithheldUser, any, {}> & WithheldUser & Required<{
    _id: string;
}> & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, WithheldUser, Document<unknown, {}, import("mongoose").FlatRecord<WithheldUser>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<WithheldUser> & Required<{
    _id: string;
}> & {
    __v: number;
}>;
