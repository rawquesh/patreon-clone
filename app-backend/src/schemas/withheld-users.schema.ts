import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { User } from './users.schema';

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
export class WithheldUser extends Document {
  _id: string;
  id: string;
  createdAt: Date;
  updatedAt: Date;

  // Store the entire user document
  @Prop({ type: MongooseSchema.Types.Mixed, required: true })
  userData: any;

  // Original user ID for reference
  @Prop({ required: true })
  originalUserId: string;

  // Admin who withheld the user
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  withheldBy: User;

  // Reason for withholding
  @Prop({ required: true })
  reason: string;

  // Admin notes
  @Prop()
  adminNotes?: string;

  // When it was withheld
  @Prop({ default: Date.now })
  withheldAt: Date;

  // Optional: Link to the report that triggered this action
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'UserReport' })
  relatedReport?: string;
}

export const WithheldUserSchema = SchemaFactory.createForClass(WithheldUser);

// Indexes
WithheldUserSchema.index({ originalUserId: 1 });
WithheldUserSchema.index({ withheldBy: 1 });
WithheldUserSchema.index({ withheldAt: -1 });
