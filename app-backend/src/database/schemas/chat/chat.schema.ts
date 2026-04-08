import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { ChatType, ChatAccessType } from './enums';
import { User } from '@/database/schemas/user';
import { Membership } from '@/database/schemas/membership';

@Schema()
export class ChatAttachment {
  @Prop({ required: true })
  url: string;

  @Prop({ required: true })
  fileName: string;

  @Prop({ required: true })
  fileType: string;

  @Prop()
  fileSize?: number;

  @Prop({ default: Date.now })
  uploadedAt: Date;
}

export const ChatAttachmentSchema =
  SchemaFactory.createForClass(ChatAttachment);

@Schema({ timestamps: true })
export class Message extends Document {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Chat', required: true })
  chat: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  sender: MongooseSchema.Types.ObjectId | User;

  @Prop({ required: true })
  content: string;

  @Prop({ type: [ChatAttachmentSchema] })
  attachments?: ChatAttachment[];

  @Prop({ default: [] })
  readBy: (MongooseSchema.Types.ObjectId | User)[];

  @Prop({ default: false })
  isDeleted: boolean;

  @Prop({ default: null })
  deletedAt?: Date;

  createdAt: Date;
  updatedAt: Date;
}

export const MessageSchema = SchemaFactory.createForClass(Message);

@Schema({ timestamps: true })
export class Chat extends Document {
  @Prop({ type: String, enum: ChatType, required: true })
  type: ChatType;

  @Prop({ required: true })
  title: string;

  @Prop()
  description?: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  creator: MongooseSchema.Types.ObjectId | User;

  @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: 'User' }] })
  participants: (MongooseSchema.Types.ObjectId | User)[];

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Message' })
  lastMessage?: MongooseSchema.Types.ObjectId;

  @Prop({
    type: String,
    enum: ChatAccessType,
    default: ChatAccessType.ALL,
  })
  accessType?: ChatAccessType;

  @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: 'Membership' }] })
  accessTiers?: (MongooseSchema.Types.ObjectId | Membership)[];

  @Prop({ default: false })
  isDeleted: boolean;

  @Prop({ default: null })
  deletedAt?: Date;

  createdAt: Date;
  updatedAt: Date;
}

export const ChatSchema = SchemaFactory.createForClass(Chat);

@Schema({ timestamps: true })
export class ChatParticipant extends Document {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Chat', required: true })
  chat: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  user: MongooseSchema.Types.ObjectId | User;

  @Prop({ default: false })
  hasUnreadMessages: boolean;

  @Prop({ default: 0 })
  unreadCount: number;

  @Prop({ default: false })
  isMuted: boolean;

  @Prop({ default: null })
  lastReadMessageId?: MongooseSchema.Types.ObjectId;

  @Prop({ default: false })
  isDeleted: boolean;

  createdAt: Date;
  updatedAt: Date;
}

export const ChatParticipantSchema =
  SchemaFactory.createForClass(ChatParticipant);

ChatSchema.index({ creator: 1 });
ChatSchema.index({ participants: 1 });
ChatSchema.index({ type: 1 });
ChatSchema.index({ accessType: 1 });
ChatSchema.index({ accessTiers: 1 });
ChatSchema.index({ isDeleted: 1 });

MessageSchema.index({ chat: 1, createdAt: -1 });
MessageSchema.index({ sender: 1 });
MessageSchema.index({ readBy: 1 });
MessageSchema.index({ isDeleted: 1 });

ChatParticipantSchema.index({ chat: 1, user: 1 }, { unique: true });
ChatParticipantSchema.index({ user: 1, hasUnreadMessages: 1 });
