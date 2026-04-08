import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { User } from './users.schema';
import { Post } from './posts.schema';

@Schema({ timestamps: true })
export class MembershipInsight extends Document {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  creator: User;

  @Prop({ required: true })
  date: Date;

  @Prop({ required: true })
  activeMembers: number;

  @Prop({ required: true })
  newMembers: number;

  @Prop({ required: true })
  upgradedMembers: number;

  @Prop({ required: true })
  cancelledMembers: number;

  @Prop({ type: Object })
  tierBreakdown: Record<string, { count: number; growth: number }>;
}

export const MembershipInsightSchema =
  SchemaFactory.createForClass(MembershipInsight);
MembershipInsightSchema.index({ creator: 1, date: 1 });

@Schema({ timestamps: true })
export class EarningsInsight extends Document {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  creator: User;

  @Prop({ required: true })
  date: Date;

  @Prop({ required: true })
  totalEarnings: number;

  @Prop({ required: true })
  membershipEarnings: number;

  @Prop({ type: Object })
  tierBreakdown: Record<string, { amount: number; percentage: number }>;
}

export const EarningsInsightSchema =
  SchemaFactory.createForClass(EarningsInsight);
EarningsInsightSchema.index({ creator: 1, date: 1 });

@Schema({ timestamps: true })
export class PostInsight extends Document {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Post', required: true })
  post: Post;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  creator: User;

  @Prop({ required: true })
  date: Date;

  @Prop({ required: true, default: 0 })
  impressions: number;

  @Prop({ required: true, default: 0 })
  engagements: number;
}

export const PostInsightSchema = SchemaFactory.createForClass(PostInsight);
PostInsightSchema.index({ post: 1, date: 1 });
PostInsightSchema.index({ creator: 1, date: 1 });
