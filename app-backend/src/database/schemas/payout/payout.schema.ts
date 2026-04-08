import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

@Schema({ timestamps: true })
export class PayoutRequest extends Document {
  createdAt: Date;
  updatedAt: Date;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  creator: MongooseSchema.Types.ObjectId;

  @Prop({ required: true })
  amount: number;

  @Prop({ required: true })
  status: 'pending' | 'processing' | 'completed' | 'failed';

  @Prop()
  stripeTransferId?: string;

  @Prop()
  completedAt?: Date;

  @Prop()
  failureReason?: string;
}

export const PayoutRequestSchema = SchemaFactory.createForClass(PayoutRequest);
