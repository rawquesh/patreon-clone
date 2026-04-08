import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { User } from '@/schemas/users.schema';

@Schema()
export class VisitReferrer {
  @Prop({ required: false })
  url?: string;

  @Prop({ required: false })
  source?: string;

  @Prop({ required: false })
  medium?: string;

  @Prop({ required: false })
  campaign?: string;
}

@Schema()
export class GeoLocation {
  @Prop({ required: false })
  country?: string;

  @Prop({ required: false })
  region?: string;

  @Prop({ required: false })
  city?: string;

  @Prop({ required: false })
  timezone?: string;
}

@Schema()
export class DeviceInfo {
  @Prop({ required: false })
  deviceType?: string;

  @Prop({ required: false })
  browser?: string;

  @Prop({ required: false })
  os?: string;
}

@Schema({ timestamps: true })
export class CreatorVisit extends Document {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  visitor: User;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  creator: User;

  @Prop({ default: Date.now })
  visitedAt: Date;

  @Prop({ default: 1 })
  visitCount: number;

  @Prop({ default: Date.now })
  lastVisitedAt: Date;

  @Prop({ type: VisitReferrer, required: false })
  referrer?: VisitReferrer;

  @Prop({ type: GeoLocation, required: false })
  geoLocation?: GeoLocation;

  @Prop({ type: DeviceInfo, required: false })
  deviceInfo?: DeviceInfo;

  @Prop({ type: [Date], default: [] })
  visitHistory?: Date[];

  @Prop({ default: false })
  isSubscriber: boolean;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'Membership',
    required: false,
  })
  membership?: MongooseSchema.Types.ObjectId;
}

export const CreatorVisitSchema = SchemaFactory.createForClass(CreatorVisit);

CreatorVisitSchema.index({ visitor: 1, creator: 1 }, { unique: true });

CreatorVisitSchema.index({ visitor: 1, lastVisitedAt: -1 });

CreatorVisitSchema.index({ creator: 1, lastVisitedAt: -1 });

CreatorVisitSchema.index({ creator: 1, isSubscriber: 1 });

CreatorVisitSchema.index({ 'geoLocation.country': 1, creator: 1 });

CreatorVisitSchema.index({ 'deviceInfo.deviceType': 1, creator: 1 });

CreatorVisitSchema.index({ 'referrer.source': 1, creator: 1 });
