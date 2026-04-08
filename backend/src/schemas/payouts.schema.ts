import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { User } from './users.schema';

@Schema({ timestamps: true })
export class PayoutRequest extends Document {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  creator: User;

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
