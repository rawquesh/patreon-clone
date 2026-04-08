import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { User } from '@/schemas/users.schema';
import { Post } from '@/schemas/posts.schema';

export enum NotificationType {
  LIKE = 'liked',
  COMMENT = 'commented',
  NEW_MEMBER = 'new_member',
  UPGRADE = 'upgrade',
  DOWNGRADE = 'downgrade',
  CANCELLATION = 'cancellation',
  NEW_POST = 'new_post',
  COMMENT_REPLY = 'comment_reply',
  CHAT_MESSAGE = 'chat_message',
  GROUP_CHAT_CREATED = 'group_chat_created',
  DIRECT_MESSAGE = 'direct_message',
  DIRECT_CHAT_CREATED = 'direct_chat_created',
}

@Schema()
export class Comment {
  @Prop({ required: true })
  content: string;
}

export const CommentSchema = SchemaFactory.createForClass(Comment);

@Schema({ timestamps: true })
export class Notification extends Document {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'User',
    required: true,
  })
  recipient: User;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'User',
    required: true,
  })
  actor: User;

  @Prop({
    type: String,
    enum: NotificationType,
    required: true,
  })
  type: NotificationType;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'Post',
  })
  post?: Post;

  @Prop({ type: CommentSchema })
  comment?: Comment;

  @Prop({ type: Object })
  metadata?: Record<string, any>;

  @Prop({ default: false })
  isRead: boolean;

  @Prop({ default: null })
  readAt?: Date;

  @Prop()
  link?: string;

  @Prop({
    type: String,
    enum: ['creator', 'member'],
    required: true,
  })
  userMode: 'creator' | 'member';
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);

NotificationSchema.index({ recipient: 1, createdAt: -1 });
NotificationSchema.index({ recipient: 1, isRead: 1 });
NotificationSchema.index({ recipient: 1, type: 1 });
NotificationSchema.index({ post: 1 });
