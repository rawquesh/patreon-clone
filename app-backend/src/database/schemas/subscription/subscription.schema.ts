import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { Membership } from '@/database/schemas/membership';
import { User } from '@/database/schemas/user';

@Schema()
export class DiscountData {
  @Prop()
  discountId?: string;

  @Prop()
  discountCode?: string;

  @Prop()
  originalPrice?: number;

  @Prop()
  discountedPrice?: number;
}

export const DiscountDataSchema = SchemaFactory.createForClass(DiscountData);

@Schema()
export class GiftData {
  @Prop()
  giftId?: string;

  @Prop()
  giftCode?: string;

  @Prop()
  originalPrice?: number;

  @Prop()
  trialDurationDays?: number;
}

export const GiftDataSchema = SchemaFactory.createForClass(GiftData);

@Schema({ timestamps: true })
export class Subscription extends Document {
  createdAt: Date;
  updatedAt: Date;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  subscriber: MongooseSchema.Types.ObjectId | User;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  creator: MongooseSchema.Types.ObjectId | User;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'Membership',
    required: true,
  })
  membership: MongooseSchema.Types.ObjectId | Membership;

  @Prop({ required: true })
  monthlyRate: number;

  @Prop({ required: true })
  status: 'active' | 'cancelled' | 'expired';

  @Prop({ required: true })
  currentPeriodStart: Date;

  @Prop({ required: true })
  currentPeriodEnd: Date;

  @Prop()
  cancelledAt?: Date;

  @Prop()
  stripeSubscriptionId?: string;

  @Prop({ default: false })
  isTrial?: boolean;

  @Prop()
  trialEndDate?: Date;

  @Prop({ default: false })
  hasDiscount?: boolean;

  @Prop({ type: DiscountDataSchema })
  discountData?: DiscountData;

  @Prop({ type: GiftDataSchema })
  giftData?: GiftData;
}

export const SubscriptionSchema = SchemaFactory.createForClass(Subscription);

SubscriptionSchema.index({ subscriber: 1, membership: 1 });
SubscriptionSchema.index({ creator: 1, status: 1 });
SubscriptionSchema.index({ status: 1, trialEndDate: 1 });
