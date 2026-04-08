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
exports.PostInsightSchema = exports.PostInsight = exports.EarningsInsightSchema = exports.EarningsInsight = exports.MembershipInsightSchema = exports.MembershipInsight = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
let MembershipInsight = class MembershipInsight extends mongoose_2.Document {
};
exports.MembershipInsight = MembershipInsight;
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.ObjectId, ref: 'User', required: true }),
    __metadata("design:type", mongoose_2.Schema.Types.ObjectId)
], MembershipInsight.prototype, "creator", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Date)
], MembershipInsight.prototype, "date", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], MembershipInsight.prototype, "activeMembers", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], MembershipInsight.prototype, "newMembers", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], MembershipInsight.prototype, "upgradedMembers", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], MembershipInsight.prototype, "cancelledMembers", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Object }),
    __metadata("design:type", Object)
], MembershipInsight.prototype, "tierBreakdown", void 0);
exports.MembershipInsight = MembershipInsight = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], MembershipInsight);
exports.MembershipInsightSchema = mongoose_1.SchemaFactory.createForClass(MembershipInsight);
exports.MembershipInsightSchema.index({ creator: 1, date: 1 });
let EarningsInsight = class EarningsInsight extends mongoose_2.Document {
};
exports.EarningsInsight = EarningsInsight;
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.ObjectId, ref: 'User', required: true }),
    __metadata("design:type", mongoose_2.Schema.Types.ObjectId)
], EarningsInsight.prototype, "creator", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Date)
], EarningsInsight.prototype, "date", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], EarningsInsight.prototype, "totalEarnings", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], EarningsInsight.prototype, "membershipEarnings", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Object }),
    __metadata("design:type", Object)
], EarningsInsight.prototype, "tierBreakdown", void 0);
exports.EarningsInsight = EarningsInsight = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], EarningsInsight);
exports.EarningsInsightSchema = mongoose_1.SchemaFactory.createForClass(EarningsInsight);
exports.EarningsInsightSchema.index({ creator: 1, date: 1 });
let PostInsight = class PostInsight extends mongoose_2.Document {
};
exports.PostInsight = PostInsight;
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.ObjectId, ref: 'Post', required: true }),
    __metadata("design:type", mongoose_2.Schema.Types.ObjectId)
], PostInsight.prototype, "post", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.ObjectId, ref: 'User', required: true }),
    __metadata("design:type", mongoose_2.Schema.Types.ObjectId)
], PostInsight.prototype, "creator", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Date)
], PostInsight.prototype, "date", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, default: 0 }),
    __metadata("design:type", Number)
], PostInsight.prototype, "impressions", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, default: 0 }),
    __metadata("design:type", Number)
], PostInsight.prototype, "engagements", void 0);
exports.PostInsight = PostInsight = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], PostInsight);
exports.PostInsightSchema = mongoose_1.SchemaFactory.createForClass(PostInsight);
exports.PostInsightSchema.index({ post: 1, date: 1 });
exports.PostInsightSchema.index({ creator: 1, date: 1 });
//# sourceMappingURL=analytics.schema.js.map