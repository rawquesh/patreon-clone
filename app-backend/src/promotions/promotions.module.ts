import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  Discount,
  DiscountSchema,
  Gift,
  GiftSchema,
  PromotionRedemption,
  PromotionRedemptionSchema,
} from '@/database/schemas/promotion';
import { User, UserSchema } from '@/database/schemas/user';
import { Membership, MembershipSchema } from '@/database/schemas/membership';
import { DiscountsController } from './discounts.controller';
import { GiftsController } from './gifts.controller';
import { PromotionsService } from './promotions.service';
import { MembershipsModule } from '@/memberships/memberships.module';
import { PromotionsSchedulerService } from './promotions-scheduler.service';
import {
  Subscription,
  SubscriptionSchema,
} from '@/database/schemas/subscription';
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
