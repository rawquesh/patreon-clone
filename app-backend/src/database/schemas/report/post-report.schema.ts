import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { ReportReason, ReportStatus } from './enums';

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
export class PostReport extends Document {
  id: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Post', required: true })
  post: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  reportedBy: MongooseSchema.Types.ObjectId;

  @Prop({ type: String, enum: ReportReason, required: true })
  reason: ReportReason;

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

export const PostReportSchema = SchemaFactory.createForClass(PostReport);

PostReportSchema.index({ post: 1 });
PostReportSchema.index({ reportedBy: 1 });
PostReportSchema.index({ status: 1 });
PostReportSchema.index({ createdAt: -1 });
PostReportSchema.index({ post: 1, reportedBy: 1 }, { unique: true });
