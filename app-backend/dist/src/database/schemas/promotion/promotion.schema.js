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
exports.PromotionRedemptionSchema = exports.PromotionRedemption = exports.GiftSchema = exports.Gift = exports.DiscountSchema = exports.Discount = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const enums_1 = require("./enums");
let Discount = class Discount extends mongoose_2.Document {
};
exports.Discount = Discount;
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Discount.prototype, "title", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, unique: true }),
    __metadata("design:type", String)
], Discount.prototype, "code", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Discount.prototype, "description", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: String,
        enum: enums_1.DiscountStatus,
        default: enums_1.DiscountStatus.ACTIVE,
    }),
    __metadata("design:type", String)
], Discount.prototype, "status", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], Discount.prototype, "redeemed", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: String,
        enum: enums_1.DiscountType,
        default: enums_1.DiscountType.PERCENTAGE,
    }),
    __metadata("design:type", String)
], Discount.prototype, "percentageType", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], Discount.prototype, "discountNumber", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: String,
        enum: enums_1.DiscountApplicability,
        default: enums_1.DiscountApplicability.ALL,
    }),
    __metadata("design:type", String)
], Discount.prototype, "applicableTo", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [{ type: mongoose_2.Schema.Types.ObjectId, ref: 'Membership' }] }),
    __metadata("design:type", Array)
], Discount.prototype, "applicableTiers", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Date)
], Discount.prototype, "startDate", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Date)
], Discount.prototype, "endDate", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: false }),
    __metadata("design:type", Boolean)
], Discount.prototype, "isPublic", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.ObjectId, ref: 'User', required: true }),
    __metadata("design:type", mongoose_2.Schema.Types.ObjectId)
], Discount.prototype, "creator", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: false }),
    __metadata("design:type", Boolean)
], Discount.prototype, "isDeleted", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, nullable: true }),
    __metadata("design:type", String)
], Discount.prototype, "stripeCouponId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, nullable: true }),
    __metadata("design:type", String)
], Discount.prototype, "stripePromotionCodeId", void 0);
exports.Discount = Discount = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], Discount);
exports.DiscountSchema = mongoose_1.SchemaFactory.createForClass(Discount);
let Gift = class Gift extends mongoose_2.Document {
};
exports.Gift = Gift;
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Gift.prototype, "title", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, unique: true }),
    __metadata("design:type", String)
], Gift.prototype, "code", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Gift.prototype, "description", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: String,
        enum: enums_1.DiscountStatus,
        default: enums_1.DiscountStatus.ACTIVE,
    }),
    __metadata("design:type", String)
], Gift.prototype, "status", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], Gift.prototype, "redeemed", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: String,
        enum: enums_1.GiftType,
        default: enums_1.GiftType.FREE_TRIAL,
    }),
    __metadata("design:type", String)
], Gift.prototype, "giftType", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], Gift.prototype, "durationDays", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: String,
        enum: enums_1.DiscountApplicability,
        default: enums_1.DiscountApplicability.ALL,
    }),
    __metadata("design:type", String)
], Gift.prototype, "applicableTo", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [{ type: mongoose_2.Schema.Types.ObjectId, ref: 'Membership' }] }),
    __metadata("design:type", Array)
], Gift.prototype, "applicableTiers", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Date)
], Gift.prototype, "startDate", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Date)
], Gift.prototype, "endDate", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: false }),
    __metadata("design:type", Boolean)
], Gift.prototype, "isPublic", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.ObjectId, ref: 'User', required: true }),
    __metadata("design:type", mongoose_2.Schema.Types.ObjectId)
], Gift.prototype, "creator", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: false }),
    __metadata("design:type", Boolean)
], Gift.prototype, "isDeleted", void 0);
exports.Gift = Gift = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], Gift);
exports.GiftSchema = mongoose_1.SchemaFactory.createForClass(Gift);
let PromotionRedemption = class PromotionRedemption extends mongoose_2.Document {
};
exports.PromotionRedemption = PromotionRedemption;
__decorate([
    (0, mongoose_1.Prop)({
        type: mongoose_2.Schema.Types.ObjectId,
        refPath: 'promotionType',
        required: true,
    }),
    __metadata("design:type", mongoose_2.Schema.Types.ObjectId)
], PromotionRedemption.prototype, "promotion", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, required: true, enum: ['Discount', 'Gift'] }),
    __metadata("design:type", String)
], PromotionRedemption.prototype, "promotionType", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.ObjectId, ref: 'User', required: true }),
    __metadata("design:type", mongoose_2.Schema.Types.ObjectId)
], PromotionRedemption.prototype, "user", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.ObjectId, ref: 'User', required: true }),
    __metadata("design:type", mongoose_2.Schema.Types.ObjectId)
], PromotionRedemption.prototype, "creator", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: mongoose_2.Schema.Types.ObjectId,
        ref: 'Membership',
        required: true,
    }),
    __metadata("design:type", mongoose_2.Schema.Types.ObjectId)
], PromotionRedemption.prototype, "membership", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: null }),
    __metadata("design:type", Date)
], PromotionRedemption.prototype, "expiryDate", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: false }),
    __metadata("design:type", Boolean)
], PromotionRedemption.prototype, "isExpired", void 0);
exports.PromotionRedemption = PromotionRedemption = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], PromotionRedemption);
exports.PromotionRedemptionSchema = mongoose_1.SchemaFactory.createForClass(PromotionRedemption);
exports.DiscountSchema.index({ code: 1 }, { unique: true });
exports.DiscountSchema.index({ creator: 1, status: 1 });
exports.DiscountSchema.index({ startDate: 1, endDate: 1 });
exports.DiscountSchema.index({ isDeleted: 1 });
exports.GiftSchema.index({ code: 1 }, { unique: true });
exports.GiftSchema.index({ creator: 1, status: 1 });
exports.GiftSchema.index({ startDate: 1, endDate: 1 });
exports.GiftSchema.index({ isDeleted: 1 });
exports.PromotionRedemptionSchema.index({ promotion: 1, user: 1 }, { unique: true });
exports.PromotionRedemptionSchema.index({ creator: 1 });
exports.PromotionRedemptionSchema.index({ expiryDate: 1 });
//# sourceMappingURL=promotion.schema.js.map