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
} from '@/schemas/analytics.schema';
import { User, UserSchema } from '@/schemas/users.schema';
import { Post, PostSchema } from '@/schemas/posts.schema';
import { Membership, MembershipSchema } from '@/schemas/membersip.schema';
import { Subscription, SubscriptionSchema } from '@/schemas/subscribers.schema';
import { PayoutRequest, PayoutRequestSchema } from '@/schemas/payouts.schema';
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
