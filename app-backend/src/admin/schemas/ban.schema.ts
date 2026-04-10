import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export enum BanType {
  ACCOUNT = 'account',
  IP = 'ip',
  EMAIL = 'email',
}

export enum BanStatus {
  ACTIVE = 'active',
  EXPIRED = 'expired',
  LIFTED = 'lifted',
}

@Schema({ timestamps: true })
export class Ban extends Document {
  @Prop()
  userId?: string;

  @Prop({ type: String, enum: BanType, required: true })
  type: BanType;

  @Prop({ required: true })
  reason: string;

  @Prop()
  adminNotes?: string;

  @Prop({ required: true })
  bannedBy: string;

  @Prop()
  expiresAt?: Date;

  @Prop({ type: String, enum: BanStatus, default: BanStatus.ACTIVE })
  status: BanStatus;

  @Prop()
  liftedBy?: string;

  @Prop()
  liftedAt?: Date;
}

export const BanSchema = SchemaFactory.createForClass(Ban);
BanSchema.index({ userId: 1 });
BanSchema.index({ type: 1 });
BanSchema.index({ status: 1, expiresAt: 1 });
BanSchema.index({ bannedBy: 1 });
BanSchema.index({ createdAt: -1 });
