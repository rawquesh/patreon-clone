// src/schemas/promotions.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { User } from '@/schemas/users.schema';
import { Membership } from '@/schemas/membersip.schema';

export enum DiscountType {
  PERCENTAGE = 'percentage',
  FLAT = 'flat',
}

export enum DiscountStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

export enum DiscountApplicability {
  ALL = 'all',
  SELECTED = 'selected',
}

@Schema({ timestamps: true })
export class Discount extends Document {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true, unique: true })
  code: string;

  @Prop()
  description: string;

  @Prop({
    type: String,
    enum: DiscountStatus,
    default: DiscountStatus.ACTIVE,
  })
  status: DiscountStatus;

  @Prop({ default: 0 })
  redeemed: number;

  @Prop({
    type: String,
    enum: DiscountType,
    default: DiscountType.PERCENTAGE,
  })
  percentageType: DiscountType;

  @Prop({ required: true })
  discountNumber: number;

  @Prop({
    type: String,
    enum: DiscountApplicability,
    default: DiscountApplicability.ALL,
  })
  applicableTo: DiscountApplicability;

  @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: 'Membership' }] })
  applicableTiers?: Membership[];

  @Prop({ required: true })
  startDate: Date;

  @Prop({ required: true })
  endDate: Date;

  @Prop({ default: false })
  isPublic: boolean;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  creator: User;

  @Prop({ default: false })
  isDeleted: boolean;

  @Prop({ type: String, nullable: true })
  stripeCouponId?: string;

  @Prop({ type: String, nullable: true })
  stripePromotionCodeId?: string;
}

export const DiscountSchema = SchemaFactory.createForClass(Discount);

export enum GiftType {
  FREE_TRIAL = 'free_trial',
  FREE_CONTENT = 'free_content',
}

@Schema({ timestamps: true })
export class Gift extends Document {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true, unique: true })
  code: string;

  @Prop()
  description: string;

  @Prop({
    type: String,
    enum: DiscountStatus,
    default: DiscountStatus.ACTIVE,
  })
  status: DiscountStatus;

  @Prop({ default: 0 })
  redeemed: number;

  @Prop({
    type: String,
    enum: GiftType,
    default: GiftType.FREE_TRIAL,
  })
  giftType: GiftType;

  @Prop({ required: true })
  durationDays: number;

  @Prop({
    type: String,
    enum: DiscountApplicability,
    default: DiscountApplicability.ALL,
  })
  applicableTo: DiscountApplicability;

  @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: 'Membership' }] })
  applicableTiers?: Membership[];

  @Prop({ required: true })
  startDate: Date;

  @Prop({ required: true })
  endDate: Date;

  @Prop({ default: false })
  isPublic: boolean;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  creator: User;

  @Prop({ default: false })
  isDeleted: boolean;
}

export const GiftSchema = SchemaFactory.createForClass(Gift);

@Schema({ timestamps: true })
export class PromotionRedemption extends Document {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    refPath: 'promotionType',
    required: true,
  })
  promotion: Discount | Gift;

  @Prop({
    type: String,
    required: true,
    enum: ['Discount', 'Gift'],
  })
  promotionType: string;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'User',
    required: true,
  })
  user: User;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'User',
    required: true,
  })
  creator: User;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'Membership',
    required: true,
  })
  membership: Membership;

  @Prop({ default: null })
  expiryDate?: Date;

  @Prop({ default: false })
  isExpired: boolean;
}

export const PromotionRedemptionSchema =
  SchemaFactory.createForClass(PromotionRedemption);

DiscountSchema.index({ code: 1 }, { unique: true });
DiscountSchema.index({ creator: 1, status: 1 });
DiscountSchema.index({ startDate: 1, endDate: 1 });
DiscountSchema.index({ isDeleted: 1 });

GiftSchema.index({ code: 1 }, { unique: true });
GiftSchema.index({ creator: 1, status: 1 });
GiftSchema.index({ startDate: 1, endDate: 1 });
GiftSchema.index({ isDeleted: 1 });

PromotionRedemptionSchema.index({ promotion: 1, user: 1 }, { unique: true });
PromotionRedemptionSchema.index({ creator: 1 });
PromotionRedemptionSchema.index({ expiryDate: 1 });
