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
exports.SubscriptionSchema = exports.Subscription = exports.GiftDataSchema = exports.GiftData = exports.DiscountDataSchema = exports.DiscountData = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
let DiscountData = class DiscountData {
};
exports.DiscountData = DiscountData;
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], DiscountData.prototype, "discountId", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], DiscountData.prototype, "discountCode", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Number)
], DiscountData.prototype, "originalPrice", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Number)
], DiscountData.prototype, "discountedPrice", void 0);
exports.DiscountData = DiscountData = __decorate([
    (0, mongoose_1.Schema)()
], DiscountData);
exports.DiscountDataSchema = mongoose_1.SchemaFactory.createForClass(DiscountData);
let GiftData = class GiftData {
};
exports.GiftData = GiftData;
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], GiftData.prototype, "giftId", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], GiftData.prototype, "giftCode", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Number)
], GiftData.prototype, "originalPrice", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Number)
], GiftData.prototype, "trialDurationDays", void 0);
exports.GiftData = GiftData = __decorate([
    (0, mongoose_1.Schema)()
], GiftData);
exports.GiftDataSchema = mongoose_1.SchemaFactory.createForClass(GiftData);
let Subscription = class Subscription extends mongoose_2.Document {
};
exports.Subscription = Subscription;
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.ObjectId, ref: 'User', required: true }),
    __metadata("design:type", Object)
], Subscription.prototype, "subscriber", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Schema.Types.ObjectId, ref: 'User', required: true }),
    __metadata("design:type", Object)
], Subscription.prototype, "creator", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: mongoose_2.Schema.Types.ObjectId,
        ref: 'Membership',
        required: true,
    }),
    __metadata("design:type", Object)
], Subscription.prototype, "membership", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], Subscription.prototype, "monthlyRate", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Subscription.prototype, "status", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Date)
], Subscription.prototype, "currentPeriodStart", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Date)
], Subscription.prototype, "currentPeriodEnd", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Date)
], Subscription.prototype, "cancelledAt", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Subscription.prototype, "stripeSubscriptionId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: false }),
    __metadata("design:type", Boolean)
], Subscription.prototype, "isTrial", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Date)
], Subscription.prototype, "trialEndDate", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: false }),
    __metadata("design:type", Boolean)
], Subscription.prototype, "hasDiscount", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: exports.DiscountDataSchema }),
    __metadata("design:type", DiscountData)
], Subscription.prototype, "discountData", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: exports.GiftDataSchema }),
    __metadata("design:type", GiftData)
], Subscription.prototype, "giftData", void 0);
exports.Subscription = Subscription = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], Subscription);
exports.SubscriptionSchema = mongoose_1.SchemaFactory.createForClass(Subscription);
exports.SubscriptionSchema.index({ subscriber: 1, membership: 1 });
exports.SubscriptionSchema.index({ creator: 1, status: 1 });
exports.SubscriptionSchema.index({ status: 1, trialEndDate: 1 });
//# sourceMappingURL=subscription.schema.js.map