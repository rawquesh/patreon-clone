import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { UserReportReason, ReportStatus } from './enums';

@Schema({
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: (doc, ret) => {
      (ret as any).id = ret._id.toString();
      delete ret._id;
      delete ret.__v;
      return ret;
    },
  },
})
export class UserReport extends Document {
  _id: string;
  id: string;
  createdAt: Date;
  updatedAt: Date;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  reportedUser: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  reportedBy: MongooseSchema.Types.ObjectId;

  @Prop({ type: String, enum: UserReportReason, required: true })
  reason: UserReportReason;

  @Prop({ required: true })
  description: string;

  @Prop({ type: String, enum: ReportStatus, default: ReportStatus.PENDING })
  status: ReportStatus;

  @Prop()
  adminNotes?: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User' })
  reviewedBy?: MongooseSchema.Types.ObjectId;

  @Prop()
  reviewedAt?: Date;

  @Prop()
  additionalContext?: string;
}

export const UserReportSchema = SchemaFactory.createForClass(UserReport);

UserReportSchema.index({ reportedUser: 1 });
UserReportSchema.index({ reportedBy: 1 });
UserReportSchema.index({ status: 1 });
UserReportSchema.index({ createdAt: -1 });
UserReportSchema.index({ reportedUser: 1, reportedBy: 1 }, { unique: true });
