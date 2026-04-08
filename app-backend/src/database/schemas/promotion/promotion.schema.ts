import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import {
  DiscountType,
  DiscountStatus,
  DiscountApplicability,
  GiftType,
} from './enums';

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
  applicableTiers?: MongooseSchema.Types.ObjectId[];

  @Prop({ required: true })
  startDate: Date;

  @Prop({ required: true })
  endDate: Date;

  @Prop({ default: false })
  isPublic: boolean;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  creator: MongooseSchema.Types.ObjectId;

  @Prop({ default: false })
  isDeleted: boolean;

  @Prop({ type: String, nullable: true })
  stripeCouponId?: string;

  @Prop({ type: String, nullable: true })
  stripePromotionCodeId?: string;
}

export const DiscountSchema = SchemaFactory.createForClass(Discount);

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
  applicableTiers?: MongooseSchema.Types.ObjectId[];

  @Prop({ required: true })
  startDate: Date;

  @Prop({ required: true })
  endDate: Date;

  @Prop({ default: false })
  isPublic: boolean;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  creator: MongooseSchema.Types.ObjectId;

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
  promotion: MongooseSchema.Types.ObjectId;

  @Prop({ type: String, required: true, enum: ['Discount', 'Gift'] })
  promotionType: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  user: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  creator: MongooseSchema.Types.ObjectId;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'Membership',
    required: true,
  })
  membership: MongooseSchema.Types.ObjectId;

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
