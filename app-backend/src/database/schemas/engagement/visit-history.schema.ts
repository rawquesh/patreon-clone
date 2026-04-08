import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

@Schema()
export class VisitReferrer {
  @Prop()
  url?: string;

  @Prop()
  source?: string;

  @Prop()
  medium?: string;

  @Prop()
  campaign?: string;
}

@Schema()
export class GeoLocation {
  @Prop()
  country?: string;

  @Prop()
  region?: string;

  @Prop()
  city?: string;

  @Prop()
  timezone?: string;
}

@Schema()
export class DeviceInfo {
  @Prop()
  deviceType?: string;

  @Prop()
  browser?: string;

  @Prop()
  os?: string;
}

@Schema({ timestamps: true })
export class CreatorVisit extends Document {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  visitor: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  creator: MongooseSchema.Types.ObjectId;

  @Prop({ default: Date.now })
  visitedAt: Date;

  @Prop({ default: 1 })
  visitCount: number;

  @Prop({ default: Date.now })
  lastVisitedAt: Date;

  @Prop({ type: VisitReferrer })
  referrer?: VisitReferrer;

  @Prop({ type: GeoLocation })
  geoLocation?: GeoLocation;

  @Prop({ type: DeviceInfo })
  deviceInfo?: DeviceInfo;

  @Prop({ type: [Date], default: [] })
  visitHistory?: Date[];

  @Prop({ default: false })
  isSubscriber: boolean;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Membership' })
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
