import { Document, Schema as MongooseSchema } from 'mongoose';
export declare class WithheldPost extends Document {
    id: string;
    postData: any;
    originalPostId: string;
    withheldBy: MongooseSchema.Types.ObjectId;
    reason: string;
    adminNotes?: string;
    withheldAt: Date;
    relatedReport?: string;
}
export declare const WithheldPostSchema: MongooseSchema<WithheldPost, import("mongoose").Model<WithheldPost, any, any, any, Document<unknown, any, WithheldPost, any, {}> & WithheldPost & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, WithheldPost, Document<unknown, {}, import("mongoose").FlatRecord<WithheldPost>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<WithheldPost> & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
}>;
export declare class WithheldUser extends Document {
    id: string;
    userData: any;
    originalUserId: string;
    withheldBy: MongooseSchema.Types.ObjectId;
    reason: string;
    adminNotes?: string;
    withheldAt: Date;
    relatedReport?: string;
}
export declare const WithheldUserSchema: MongooseSchema<WithheldUser, import("mongoose").Model<WithheldUser, any, any, any, Document<unknown, any, WithheldUser, any, {}> & WithheldUser & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, WithheldUser, Document<unknown, {}, import("mongoose").FlatRecord<WithheldUser>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<WithheldUser> & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
}>;
