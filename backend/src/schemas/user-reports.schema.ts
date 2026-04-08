import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { User } from './users.schema';

export enum UserReportReason {
  SPAM = 'spam',
  IMPERSONATION = 'impersonation',
  HARASSMENT = 'harassment',
  HATE_SPEECH = 'hate_speech',
  INAPPROPRIATE_PROFILE = 'inappropriate_profile',
  SCAM_OR_FRAUD = 'scam_or_fraud',
  UNDERAGE_USER = 'underage_user',
  OTHER = 'other',
}

export enum UserReportStatus {
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
export class UserReport extends Document {
  _id: string;
  id: string;
  createdAt: Date;
  updatedAt: Date;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  reportedUser: User;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  reportedBy: User;

  @Prop({
    type: String,
    enum: UserReportReason,
    required: true,
  })
  reason: UserReportReason;

  @Prop({ required: true })
  description: string;

  @Prop({
    type: String,
    enum: UserReportStatus,
    default: UserReportStatus.PENDING,
  })
  status: UserReportStatus;

  @Prop()
  adminNotes?: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User' })
  reviewedBy?: User;

  @Prop()
  reviewedAt?: Date;

  @Prop()
  additionalContext?: string;
}

export const UserReportSchema = SchemaFactory.createForClass(UserReport);

// Indexes for efficient queries
UserReportSchema.index({ reportedUser: 1 });
UserReportSchema.index({ reportedBy: 1 });
UserReportSchema.index({ status: 1 });
UserReportSchema.index({ createdAt: -1 });
UserReportSchema.index({ reportedUser: 1, reportedBy: 1 }, { unique: true });
