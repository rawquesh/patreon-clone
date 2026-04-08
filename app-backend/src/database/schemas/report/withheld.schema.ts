import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

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
export class WithheldPost extends Document {
  _id: string;
  id: string;
  createdAt: Date;
  updatedAt: Date;

  @Prop({ type: MongooseSchema.Types.Mixed, required: true })
  postData: any;

  @Prop({ required: true })
  originalPostId: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  withheldBy: MongooseSchema.Types.ObjectId;

  @Prop({ required: true })
  reason: string;

  @Prop()
  adminNotes?: string;

  @Prop({ default: Date.now })
  withheldAt: Date;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'PostReport' })
  relatedReport?: string;
}

export const WithheldPostSchema = SchemaFactory.createForClass(WithheldPost);

WithheldPostSchema.index({ originalPostId: 1 });
WithheldPostSchema.index({ withheldBy: 1 });
WithheldPostSchema.index({ withheldAt: -1 });

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
export class WithheldUser extends Document {
  _id: string;
  id: string;
  createdAt: Date;
  updatedAt: Date;

  @Prop({ type: MongooseSchema.Types.Mixed, required: true })
  userData: any;

  @Prop({ required: true })
  originalUserId: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  withheldBy: MongooseSchema.Types.ObjectId;

  @Prop({ required: true })
  reason: string;

  @Prop()
  adminNotes?: string;

  @Prop({ default: Date.now })
  withheldAt: Date;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'UserReport' })
  relatedReport?: string;
}

export const WithheldUserSchema = SchemaFactory.createForClass(WithheldUser);

WithheldUserSchema.index({ originalUserId: 1 });
WithheldUserSchema.index({ withheldBy: 1 });
WithheldUserSchema.index({ withheldAt: -1 });
