import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MembershipsService } from './memberships.service';
import { MembershipsController } from './memberships.controller';
import { User, UserSchema } from '@/schemas/users.schema';
import { Membership, MembershipSchema } from '@/schemas/membersip.schema';
import { PaymentsModule } from '@/payments/payments.module';
import { Subscription, SubscriptionSchema } from '@/schemas/subscribers.schema';
import { PayoutRequest, PayoutRequestSchema } from '@/schemas/payouts.schema';
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
