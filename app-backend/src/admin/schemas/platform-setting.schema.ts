import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export enum SettingCategory {
  FINANCIAL = 'financial',
  FEATURES = 'features',
  CONTENT = 'content',
  PAYOUTS = 'payouts',
  SECURITY = 'security',
}

@Schema({ timestamps: true })
export class PlatformSetting extends Document {
  @Prop({ required: true, unique: true })
  key: string;

  @Prop({ type: 'Mixed', required: true })
  value: any;

  @Prop()
  description: string;

  @Prop({ type: String, enum: SettingCategory, default: SettingCategory.FEATURES })
  category: SettingCategory;

  @Prop()
  updatedBy?: string;

  @Prop({ default: true })
  isPublic: boolean;
}

export const PlatformSettingSchema = SchemaFactory.createForClass(PlatformSetting);

PlatformSettingSchema.index({ category: 1 });
