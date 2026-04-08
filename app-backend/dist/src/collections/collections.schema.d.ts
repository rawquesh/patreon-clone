import { User } from '@/database/schemas/user';
import { Post } from '@/database/schemas/post';
import { Document, Schema as MongooseSchema } from 'mongoose';
export declare class Collection extends Document {
    createdAt: Date;
    title: string;
    description?: string;
    coverImage?: string;
    creator: User;
    postCount: number;
    isActive: boolean;
    isDeleted: boolean;
    posts: Post[];
}
export declare const CollectionSchema: MongooseSchema<Collection, import("mongoose").Model<Collection, any, any, any, Document<unknown, any, Collection, any, {}> & Collection & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Collection, Document<unknown, {}, import("mongoose").FlatRecord<Collection>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<Collection> & Required<{
    _id: unknown;
}> & {
    __v: number;
}>;
