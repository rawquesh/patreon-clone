import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';
import { AnalyticsTrackerService } from './analytics-tracker.service';
import {
  MembershipInsight,
  MembershipInsightSchema,
  EarningsInsight,
  EarningsInsightSchema,
  PostInsight,
  PostInsightSchema,
} from '@/database/schemas/analytics';
import { User, UserSchema } from '@/database/schemas/user';
import { Post, PostSchema } from '@/database/schemas/post';
import { Membership, MembershipSchema } from '@/database/schemas/membership';
import {
  Subscription,
  SubscriptionSchema,
} from '@/database/schemas/subscription';
import { PayoutRequest, PayoutRequestSchema } from '@/database/schemas/payout';
import { PaymentsModule } from '@/payments/payments.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: MembershipInsight.name, schema: MembershipInsightSchema },
      { name: EarningsInsight.name, schema: EarningsInsightSchema },
      { name: PostInsight.name, schema: PostInsightSchema },
      { name: User.name, schema: UserSchema },
      { name: Post.name, schema: PostSchema },
      { name: Membership.name, schema: MembershipSchema },
      { name: Subscription.name, schema: SubscriptionSchema },
      { name: PayoutRequest.name, schema: PayoutRequestSchema },
    ]),
    PaymentsModule,
  ],
  controllers: [AnalyticsController],
  providers: [AnalyticsService, AnalyticsTrackerService],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}
