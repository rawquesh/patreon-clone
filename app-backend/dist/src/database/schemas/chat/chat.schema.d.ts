import { Document, Schema as MongooseSchema } from 'mongoose';
import { ChatType, ChatAccessType } from './enums';
import { User } from '@/database/schemas/user';
import { Membership } from '@/database/schemas/membership';
export declare class ChatAttachment {
    url: string;
    fileName: string;
    fileType: string;
    fileSize?: number;
    uploadedAt: Date;
}
export declare const ChatAttachmentSchema: MongooseSchema<ChatAttachment, import("mongoose").Model<ChatAttachment, any, any, any, Document<unknown, any, ChatAttachment, any, {}> & ChatAttachment & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, ChatAttachment, Document<unknown, {}, import("mongoose").FlatRecord<ChatAttachment>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<ChatAttachment> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
export declare class Message extends Document {
    chat: MongooseSchema.Types.ObjectId;
    sender: MongooseSchema.Types.ObjectId | User;
    content: string;
    attachments?: ChatAttachment[];
    readBy: (MongooseSchema.Types.ObjectId | User)[];
    isDeleted: boolean;
    deletedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}
export declare const MessageSchema: MongooseSchema<Message, import("mongoose").Model<Message, any, any, any, Document<unknown, any, Message, any, {}> & Message & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Message, Document<unknown, {}, import("mongoose").FlatRecord<Message>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<Message> & Required<{
    _id: unknown;
}> & {
    __v: number;
}>;
export declare class Chat extends Document {
    type: ChatType;
    title: string;
    description?: string;
    creator: MongooseSchema.Types.ObjectId | User;
    participants: (MongooseSchema.Types.ObjectId | User)[];
    lastMessage?: MongooseSchema.Types.ObjectId;
    accessType?: ChatAccessType;
    accessTiers?: (MongooseSchema.Types.ObjectId | Membership)[];
    isDeleted: boolean;
    deletedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}
export declare const ChatSchema: MongooseSchema<Chat, import("mongoose").Model<Chat, any, any, any, Document<unknown, any, Chat, any, {}> & Chat & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Chat, Document<unknown, {}, import("mongoose").FlatRecord<Chat>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<Chat> & Required<{
    _id: unknown;
}> & {
    __v: number;
}>;
export declare class ChatParticipant extends Document {
    chat: MongooseSchema.Types.ObjectId;
    user: MongooseSchema.Types.ObjectId | User;
    hasUnreadMessages: boolean;
    unreadCount: number;
    isMuted: boolean;
    lastReadMessageId?: MongooseSchema.Types.ObjectId;
    isDeleted: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export declare const ChatParticipantSchema: MongooseSchema<ChatParticipant, import("mongoose").Model<ChatParticipant, any, any, any, Document<unknown, any, ChatParticipant, any, {}> & ChatParticipant & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, ChatParticipant, Document<unknown, {}, import("mongoose").FlatRecord<ChatParticipant>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<ChatParticipant> & Required<{
    _id: unknown;
}> & {
    __v: number;
}>;
