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
exports.WithheldUserSchema = exports.WithheldUser = exports.WithheldPostSchema = exports.WithheldPost = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
let WithheldPost = class WithheldPost extends mongoose_2.Document {
};
exports.WithheldPost = WithheldPost;
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.Mixed, required: true }),
    __metadata("design:type", Object)
], WithheldPost.prototype, "postData", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], WithheldPost.prototype, "originalPostId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.ObjectId, ref: 'User', required: true }),
    __metadata("design:type", mongoose_2.Schema.Types.ObjectId)
], WithheldPost.prototype, "withheldBy", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], WithheldPost.prototype, "reason", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], WithheldPost.prototype, "adminNotes", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: Date.now }),
    __metadata("design:type", Date)
], WithheldPost.prototype, "withheldAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.ObjectId, ref: 'PostReport' }),
    __metadata("design:type", String)
], WithheldPost.prototype, "relatedReport", void 0);
exports.WithheldPost = WithheldPost = __decorate([
    (0, mongoose_1.Schema)({
        timestamps: true,
        toJSON: {
            virtuals: true,
            transform: (doc, ret) => {
                ret.id = ret._id.toString();
                delete ret._id;
                delete ret.__v;
                return ret;
            },
        },
    })
], WithheldPost);
exports.WithheldPostSchema = mongoose_1.SchemaFactory.createForClass(WithheldPost);
exports.WithheldPostSchema.index({ originalPostId: 1 });
exports.WithheldPostSchema.index({ withheldBy: 1 });
exports.WithheldPostSchema.index({ withheldAt: -1 });
let WithheldUser = class WithheldUser extends mongoose_2.Document {
};
exports.WithheldUser = WithheldUser;
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.Mixed, required: true }),
    __metadata("design:type", Object)
], WithheldUser.prototype, "userData", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], WithheldUser.prototype, "originalUserId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.ObjectId, ref: 'User', required: true }),
    __metadata("design:type", mongoose_2.Schema.Types.ObjectId)
], WithheldUser.prototype, "withheldBy", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], WithheldUser.prototype, "reason", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], WithheldUser.prototype, "adminNotes", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: Date.now }),
    __metadata("design:type", Date)
], WithheldUser.prototype, "withheldAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.ObjectId, ref: 'UserReport' }),
    __metadata("design:type", String)
], WithheldUser.prototype, "relatedReport", void 0);
exports.WithheldUser = WithheldUser = __decorate([
    (0, mongoose_1.Schema)({
        timestamps: true,
        toJSON: {
            virtuals: true,
            transform: (doc, ret) => {
                ret.id = ret._id.toString();
                delete ret._id;
                delete ret.__v;
                return ret;
            },
        },
    })
], WithheldUser);
exports.WithheldUserSchema = mongoose_1.SchemaFactory.createForClass(WithheldUser);
exports.WithheldUserSchema.index({ originalUserId: 1 });
exports.WithheldUserSchema.index({ withheldBy: 1 });
exports.WithheldUserSchema.index({ withheldAt: -1 });
//# sourceMappingURL=withheld.schema.js.map