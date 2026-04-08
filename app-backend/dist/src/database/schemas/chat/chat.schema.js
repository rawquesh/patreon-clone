"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatParticipantSchema = exports.ChatParticipant = exports.ChatSchema = exports.Chat = exports.MessageSchema = exports.Message = exports.ChatAttachmentSchema = exports.ChatAttachment = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const enums_1 = require("./enums");
let ChatAttachment = class ChatAttachment {
};
exports.ChatAttachment = ChatAttachment;
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], ChatAttachment.prototype, "url", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], ChatAttachment.prototype, "fileName", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], ChatAttachment.prototype, "fileType", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Number)
], ChatAttachment.prototype, "fileSize", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: Date.now }),
    __metadata("design:type", Date)
], ChatAttachment.prototype, "uploadedAt", void 0);
exports.ChatAttachment = ChatAttachment = __decorate([
    (0, mongoose_1.Schema)()
], ChatAttachment);
exports.ChatAttachmentSchema = mongoose_1.SchemaFactory.createForClass(ChatAttachment);
let Message = class Message extends mongoose_2.Document {
};
exports.Message = Message;
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.ObjectId, ref: 'Chat', required: true }),
    __metadata("design:type", mongoose_2.Schema.Types.ObjectId)
], Message.prototype, "chat", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.ObjectId, ref: 'User', required: true }),
    __metadata("design:type", Object)
], Message.prototype, "sender", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Message.prototype, "content", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [exports.ChatAttachmentSchema] }),
    __metadata("design:type", Array)
], Message.prototype, "attachments", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: [] }),
    __metadata("design:type", Array)
], Message.prototype, "readBy", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: false }),
    __metadata("design:type", Boolean)
], Message.prototype, "isDeleted", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: null }),
    __metadata("design:type", Date)
], Message.prototype, "deletedAt", void 0);
exports.Message = Message = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], Message);
exports.MessageSchema = mongoose_1.SchemaFactory.createForClass(Message);
let Chat = class Chat extends mongoose_2.Document {
};
exports.Chat = Chat;
__decorate([
    (0, mongoose_1.Prop)({ type: String, enum: enums_1.ChatType, required: true }),
    __metadata("design:type", String)
], Chat.prototype, "type", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Chat.prototype, "title", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Chat.prototype, "description", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.ObjectId, ref: 'User', required: true }),
    __metadata("design:type", Object)
], Chat.prototype, "creator", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [{ type: mongoose_2.Schema.Types.ObjectId, ref: 'User' }] }),
    __metadata("design:type", Array)
], Chat.prototype, "participants", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.ObjectId, ref: 'Message' }),
    __metadata("design:type", mongoose_2.Schema.Types.ObjectId)
], Chat.prototype, "lastMessage", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: String,
        enum: enums_1.ChatAccessType,
        default: enums_1.ChatAccessType.ALL,
    }),
    __metadata("design:type", String)
], Chat.prototype, "accessType", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [{ type: mongoose_2.Schema.Types.ObjectId, ref: 'Membership' }] }),
    __metadata("design:type", Array)
], Chat.prototype, "accessTiers", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: false }),
    __metadata("design:type", Boolean)
], Chat.prototype, "isDeleted", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: null }),
    __metadata("design:type", Date)
], Chat.prototype, "deletedAt", void 0);
exports.Chat = Chat = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], Chat);
exports.ChatSchema = mongoose_1.SchemaFactory.createForClass(Chat);
let ChatParticipant = class ChatParticipant extends mongoose_2.Document {
};
exports.ChatParticipant = ChatParticipant;
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.ObjectId, ref: 'Chat', required: true }),
    __metadata("design:type", mongoose_2.Schema.Types.ObjectId)
], ChatParticipant.prototype, "chat", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.ObjectId, ref: 'User', required: true }),
    __metadata("design:type", Object)
], ChatParticipant.prototype, "user", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: false }),
    __metadata("design:type", Boolean)
], ChatParticipant.prototype, "hasUnreadMessages", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], ChatParticipant.prototype, "unreadCount", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: false }),
    __metadata("design:type", Boolean)
], ChatParticipant.prototype, "isMuted", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: null }),
    __metadata("design:type", mongoose_2.Schema.Types.ObjectId)
], ChatParticipant.prototype, "lastReadMessageId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: false }),
    __metadata("design:type", Boolean)
], ChatParticipant.prototype, "isDeleted", void 0);
exports.ChatParticipant = ChatParticipant = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], ChatParticipant);
exports.ChatParticipantSchema = mongoose_1.SchemaFactory.createForClass(ChatParticipant);
exports.ChatSchema.index({ creator: 1 });
exports.ChatSchema.index({ participants: 1 });
exports.ChatSchema.index({ type: 1 });
exports.ChatSchema.index({ accessType: 1 });
exports.ChatSchema.index({ accessTiers: 1 });
exports.ChatSchema.index({ isDeleted: 1 });
exports.MessageSchema.index({ chat: 1, createdAt: -1 });
exports.MessageSchema.index({ sender: 1 });
exports.MessageSchema.index({ readBy: 1 });
exports.MessageSchema.index({ isDeleted: 1 });
exports.ChatParticipantSchema.index({ chat: 1, user: 1 }, { unique: true });
exports.ChatParticipantSchema.index({ user: 1, hasUnreadMessages: 1 });
//# sourceMappingURL=chat.schema.js.map