import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { PostType, PostStatus } from './enums';
import { User } from '@/database/schemas/user';

@Schema()
export class PostCommentLike {
  @Prop({ type: MongooseSchema.Types.ObjectId, auto: true })
  _id: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  user: MongooseSchema.Types.ObjectId | User;

  @Prop({ default: Date.now })
  createdAt: Date;
}

export const PostCommentLikeSchema =
  SchemaFactory.createForClass(PostCommentLike);

@Schema()
export class Attachment {
  @Prop({ required: true })
  url: string;

  @Prop()
  fileName: string;

  @Prop()
  fileType: string;

  @Prop()
  fileSize: number;

  @Prop({ default: Date.now })
  uploadedAt: Date;

  _id: string;
}

export const AttachmentSchema = SchemaFactory.createForClass(Attachment);

@Schema()
export class PostLike {
  @Prop({ type: MongooseSchema.Types.ObjectId, auto: true })
  _id: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  user: MongooseSchema.Types.ObjectId | User;

  @Prop({ default: Date.now })
  createdAt: Date;
}

export const PostLikeSchema = SchemaFactory.createForClass(PostLike);

@Schema()
export class PostComment {
  @Prop({ type: MongooseSchema.Types.ObjectId, auto: true })
  _id: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  user: MongooseSchema.Types.ObjectId | User;

  @Prop({ required: true })
  text: string;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop()
  updatedAt?: Date;

  @Prop({ type: [PostCommentLikeSchema], default: [] })
  likes: PostCommentLike[];

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'PostComment',
    default: null,
  })
  parentComment?: MongooseSchema.Types.ObjectId | PostComment;
}

export const PostCommentSchema = SchemaFactory.createForClass(PostComment);

@Schema({
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: (doc, ret) => {
      (ret as any).id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    },
  },
})
export class Post extends Document {
  _id: string;
  id: string;
  createdAt: Date;
  updatedAt: Date;

  @Prop({ type: String, enum: PostType, required: true })
  type: PostType;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  creator: MongooseSchema.Types.ObjectId | User;

  @Prop({ required: true })
  title: string;

  @Prop()
  description?: string;

  @Prop()
  textContent?: string;

  @Prop({ type: [String] })
  mediaUrls?: string[];

  @Prop()
  linkUrl?: string;

  @Prop()
  thumbnailUrl?: string;

  @Prop()
  videoId?: string;

  @Prop()
  videoProvider?: string;

  @Prop()
  videoUrl?: string;

  @Prop({ type: [String], default: [] })
  collections: string[];

  @Prop({ type: [String], default: [] })
  tags: string[];

  @Prop({ type: String, enum: PostStatus, default: PostStatus.PUBLISHED })
  status: PostStatus;

  @Prop({ default: false })
  isDeleted: boolean;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: 0 })
  viewCount: number;

  @Prop({ default: 0 })
  likeCount: number;

  @Prop({ default: 0 })
  commentCount: number;

  @Prop({ default: 0 })
  shareCount: number;

  @Prop({ type: [AttachmentSchema], default: [] })
  attachments: Attachment[];

  @Prop({ type: [String], default: [] })
  tierAccess: string[];

  @Prop({ type: [PostLikeSchema], default: [] })
  likes: PostLike[];

  @Prop({ type: [PostCommentSchema], default: [] })
  comments: PostComment[];
}

export const PostSchema = SchemaFactory.createForClass(Post);

PostSchema.index({ title: 'text', description: 'text', tags: 'text' });
PostSchema.index({ creator: 1, status: 1 });
PostSchema.index({ type: 1, status: 1 });
PostSchema.index({ collections: 1 });
PostSchema.index({ tags: 1 });
PostSchema.index({ tierAccess: 1 });
PostSchema.index({ 'likes.user': 1 });
