import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import {
  AuthProvider,
  CreatorCategory,
  ContentVisibility,
  GenderPreference,
  CreatorStatus,
} from './enums';

@Schema()
export class User extends Document {
  @Prop({ required: true })
  email: string;

  @Prop()
  password?: string;

  @Prop({ required: true })
  provider: AuthProvider;

  @Prop()
  providerId?: string;

  @Prop()
  firstName?: string;

  @Prop()
  lastName?: string;

  @Prop()
  profilePicture?: string;

  @Prop()
  countryOfResidence?: string;

  @Prop()
  displayName?: string;

  @Prop()
  updatedAy?: string;

  @Prop()
  isCreator?: boolean;

  @Prop()
  creatorUsername?: string;

  @Prop({
    type: String,
    enum: ContentVisibility,
    default: ContentVisibility.BOTH,
  })
  contentVisibleTo?: ContentVisibility;

  @Prop({
    type: String,
    enum: GenderPreference,
    default: GenderPreference.BOTH,
  })
  genderPreference?: GenderPreference;

  @Prop()
  profileCover?: string;

  @Prop()
  creatorHeadline?: string;

  @Prop()
  gender?: string;

  @Prop()
  stripeCustomerId?: string;

  @Prop()
  stripeConnectAccountId?: string;

  @Prop({ default: false })
  hasCompletedStripeOnboarding: boolean;

  @Prop()
  stripeOnboardingUrl?: string;

  @Prop({ default: 0 })
  availableBalance: number;

  @Prop({ default: 0 })
  pendingBalance: number;

  @Prop({ default: 0 })
  lifetimeEarnings: number;

  @Prop({ default: false })
  isAdmin?: boolean;

  @Prop({ default: true })
  creatorNotifyOnNewMember: boolean;

  @Prop({ default: true })
  creatorNotifyOnComments: boolean;

  @Prop({ default: true })
  creatorNotifyOnDirectMessages: boolean;

  @Prop({ default: true })
  memberNotifyOnNewPost: boolean;

  @Prop({ default: true })
  memberNotifyOnDirectMessages: boolean;

  @Prop({ type: String, enum: CreatorStatus, default: CreatorStatus.DRAFT })
  creatorStatus: CreatorStatus;

  @Prop({
    type: String,
    enum: CreatorCategory,
  })
  creatorCategory?: CreatorCategory;

  @Prop()
  introVideoUrl?: string;

  @Prop()
  bio?: string;

  @Prop({ type: Array, default: [] })
  socialLinks?: Array<{
    platform: string;
    url: string;
  }>;
}

export const UserSchema = SchemaFactory.createForClass(User);
