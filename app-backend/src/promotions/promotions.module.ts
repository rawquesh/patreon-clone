import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  Discount,
  DiscountSchema,
  Gift,
  GiftSchema,
  PromotionRedemption,
  PromotionRedemptionSchema,
} from '@/schemas/promotions.schema';
import { User, UserSchema } from '@/schemas/users.schema';
import { Membership, MembershipSchema } from '@/schemas/membersip.schema';
import { DiscountsController } from './discounts.controller';
import { GiftsController } from './gifts.controller';
import { PromotionsService } from './promotions.service';
import { MembershipsModule } from '@/memberships/memberships.module';
import { PromotionsSchedulerService } from './promotions-scheduler.service';
import { Subscription, SubscriptionSchema } from '@/schemas/subscribers.schema';
import { PaymentsModule } from '@/payments/payments.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Discount.name, schema: DiscountSchema },
      { name: Gift.name, schema: GiftSchema },
      { name: PromotionRedemption.name, schema: PromotionRedemptionSchema },
      { name: User.name, schema: UserSchema },
      { name: Membership.name, schema: MembershipSchema },
      { name: Subscription.name, schema: SubscriptionSchema },
    ]),
    forwardRef(() => MembershipsModule),
    PaymentsModule,
  ],
  controllers: [DiscountsController, GiftsController],
  providers: [PromotionsService, PromotionsSchedulerService],
  exports: [PromotionsService],
})
export class PromotionsModule {}
