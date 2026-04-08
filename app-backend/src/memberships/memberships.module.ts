import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MembershipsService } from './memberships.service';
import { MembershipsController } from './memberships.controller';
import { User, UserSchema } from '@/database/schemas/user';
import { Membership, MembershipSchema } from '@/database/schemas/membership';
import { PaymentsModule } from '@/payments/payments.module';
import {
  Subscription,
  SubscriptionSchema,
} from '@/database/schemas/subscription';
import { PayoutRequest, PayoutRequestSchema } from '@/database/schemas/payout';
import { S3Module } from '@/s3/s3.module';
import { NotificationsModule } from '@/notifications/notifications.module';
import { PromotionsModule } from '@/promotions/promotions.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Membership.name, schema: MembershipSchema },
      { name: Subscription.name, schema: SubscriptionSchema },
      { name: PayoutRequest.name, schema: PayoutRequestSchema },
      { name: User.name, schema: UserSchema },
    ]),
    PaymentsModule,
    S3Module,
    forwardRef(() => NotificationsModule),
    forwardRef(() => PromotionsModule),
    ConfigModule,
  ],
  controllers: [MembershipsController],
  providers: [MembershipsService],
  exports: [MembershipsService],
})
export class MembershipsModule {}
