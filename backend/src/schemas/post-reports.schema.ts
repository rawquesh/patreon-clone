import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { User } from './users.schema';
import { Post } from './posts.schema';

export enum ReportReason {
  SPAM = 'spam',
  INAPPROPRIATE_CONTENT = 'inappropriate_content',
  HARASSMENT = 'harassment',
  HATE_SPEECH = 'hate_speech',
  VIOLENCE = 'violence',
  MISINFORMATION = 'misinformation',
  COPYRIGHT_VIOLATION = 'copyright_violation',
  OTHER = 'other',
}

export enum ReportStatus {
  PENDING = 'pending',
  UNDER_REVIEW = 'under_review',
  RESOLVED = 'resolved',
  DISMISSED = 'dismissed',
}

@Schema({
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: (doc, ret) => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //@ts-ignore
      ret.id = ret._id.toString();
      delete ret._id;
      delete ret.__v;
      return ret;
    },
  },
})
export class PostReport extends Document {
  _id: string;
  id: string;
  createdAt: Date;
  updatedAt: Date;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Post', required: true })
  post: Post;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  reportedBy: User;

  @Prop({
    type: String,
    enum: ReportReason,
    required: true,
  })
  reason: ReportReason;

  @Prop({ required: true })
  description: string;

  @Prop({
    type: String,
    enum: ReportStatus,
    default: ReportStatus.PENDING,
  })
  status: ReportStatus;

  @Prop()
  adminNotes?: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User' })
  reviewedBy?: User;

  @Prop()
  reviewedAt?: Date;

  @Prop()
  additionalContext?: string;
}

export const PostReportSchema = SchemaFactory.createForClass(PostReport);

// Indexes for efficient queries
PostReportSchema.index({ post: 1 });
PostReportSchema.index({ reportedBy: 1 });
PostReportSchema.index({ status: 1 });
PostReportSchema.index({ createdAt: -1 });
PostReportSchema.index({ post: 1, reportedBy: 1 }, { unique: true });
