import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { User } from './users.schema';

@Schema({ timestamps: true })
export class Membership extends Document {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  creator: User;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true, min: 0 })
  monthlyRate: number;

  @Prop({ required: true })
  coverImage: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: [] })
  benefits: string[];

  @Prop({ default: 0 })
  subscriberCount: number;

  @Prop({ default: 0 })
  totalEarnings: number;

  @Prop()
  stripeProductId?: string;

  @Prop()
  stripePriceId?: string;

  @Prop({ default: false })
  isFeatured: boolean;
}

export const MembershipSchema = SchemaFactory.createForClass(Membership);

MembershipSchema.index({ creator: 1, name: 1 }, { unique: true });
