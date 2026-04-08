import { Document, Schema as MongooseSchema } from 'mongoose';
import { PostType, PostStatus } from './enums';
import { User } from '@/database/schemas/user';
export declare class PostCommentLike {
    _id: MongooseSchema.Types.ObjectId;
    user: MongooseSchema.Types.ObjectId | User;
    createdAt: Date;
}
export declare const PostCommentLikeSchema: MongooseSchema<PostCommentLike, import("mongoose").Model<PostCommentLike, any, any, any, Document<unknown, any, PostCommentLike, any, {}> & PostCommentLike & Required<{
    _id: MongooseSchema.Types.ObjectId;
}> & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, PostCommentLike, Document<unknown, {}, import("mongoose").FlatRecord<PostCommentLike>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<PostCommentLike> & Required<{
    _id: MongooseSchema.Types.ObjectId;
}> & {
    __v: number;
}>;
export declare class Attachment {
    url: string;
    fileName: string;
    fileType: string;
    fileSize: number;
    uploadedAt: Date;
    _id: string;
}
export declare const AttachmentSchema: MongooseSchema<Attachment, import("mongoose").Model<Attachment, any, any, any, Document<unknown, any, Attachment, any, {}> & Attachment & Required<{
    _id: string;
}> & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Attachment, Document<unknown, {}, import("mongoose").FlatRecord<Attachment>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<Attachment> & Required<{
    _id: string;
}> & {
    __v: number;
}>;
export declare class PostLike {
    _id: MongooseSchema.Types.ObjectId;
    user: MongooseSchema.Types.ObjectId | User;
    createdAt: Date;
}
export declare const PostLikeSchema: MongooseSchema<PostLike, import("mongoose").Model<PostLike, any, any, any, Document<unknown, any, PostLike, any, {}> & PostLike & Required<{
    _id: MongooseSchema.Types.ObjectId;
}> & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, PostLike, Document<unknown, {}, import("mongoose").FlatRecord<PostLike>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<PostLike> & Required<{
    _id: MongooseSchema.Types.ObjectId;
}> & {
    __v: number;
}>;
export declare class PostComment {
    _id: MongooseSchema.Types.ObjectId;
    user: MongooseSchema.Types.ObjectId | User;
    text: string;
    createdAt: Date;
    updatedAt?: Date;
    likes: PostCommentLike[];
    parentComment?: MongooseSchema.Types.ObjectId | PostComment;
}
export declare const PostCommentSchema: MongooseSchema<PostComment, import("mongoose").Model<PostComment, any, any, any, Document<unknown, any, PostComment, any, {}> & PostComment & Required<{
    _id: MongooseSchema.Types.ObjectId;
}> & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, PostComment, Document<unknown, {}, import("mongoose").FlatRecord<PostComment>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<PostComment> & Required<{
    _id: MongooseSchema.Types.ObjectId;
}> & {
    __v: number;
}>;
export declare class Post extends Document {
    _id: string;
    id: string;
    createdAt: Date;
    updatedAt: Date;
    type: PostType;
    creator: MongooseSchema.Types.ObjectId | User;
    title: string;
    description?: string;
    textContent?: string;
    mediaUrls?: string[];
    linkUrl?: string;
    thumbnailUrl?: string;
    videoId?: string;
    videoProvider?: string;
    videoUrl?: string;
    collections: string[];
    tags: string[];
    status: PostStatus;
    isDeleted: boolean;
    isActive: boolean;
    viewCount: number;
    likeCount: number;
    commentCount: number;
    shareCount: number;
    attachments: Attachment[];
    tierAccess: string[];
    likes: PostLike[];
    comments: PostComment[];
}
export declare const PostSchema: MongooseSchema<Post, import("mongoose").Model<Post, any, any, any, Document<unknown, any, Post, any, {}> & Post & Required<{
    _id: string;
}> & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Post, Document<unknown, {}, import("mongoose").FlatRecord<Post>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<Post> & Required<{
    _id: string;
}> & {
    __v: number;
}>;
