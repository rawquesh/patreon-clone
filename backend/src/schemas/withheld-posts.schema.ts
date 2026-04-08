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
export class WithheldPost extends Document {
  _id: string;
  id: string;
  createdAt: Date;
  updatedAt: Date;

  // Store the entire post document
  @Prop({ type: MongooseSchema.Types.Mixed, required: true })
  postData: any;

  // Original post ID for reference
  @Prop({ required: true })
  originalPostId: string;

  // Admin who withheld the post
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
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'PostReport' })
  relatedReport?: string;
}

export const WithheldPostSchema = SchemaFactory.createForClass(WithheldPost);

// Indexes
WithheldPostSchema.index({ originalPostId: 1 });
WithheldPostSchema.index({ withheldBy: 1 });
WithheldPostSchema.index({ withheldAt: -1 });
