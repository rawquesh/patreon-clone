import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { PaymentsService } from '@/payments/payments.service';
import { User } from '@/database/schemas/user';

import {
  UpdateMembershipDto,
  CreatePayoutRequestDto,
  GetMembershipsQueryDto,
  CreateMembershipWithFileDto,
} from './memberships.dto';
import { Membership } from '@/database/schemas/membership';
import { Subscription } from '@/database/schemas/subscription';
import { PayoutRequest } from '@/database/schemas/payout';
import { NotificationGeneratorService } from '@/notifications/notification-generator.service';
import { ConfigService } from '@nestjs/config';
import { branding } from '@/config';
import { SettingsService } from '@/admin/services/settings.service';

@Injectable()
export class MembershipsService {
  constructor(
    @InjectModel(Membership.name) private membershipModel: Model<Membership>,
    @InjectModel(Subscription.name)
    private subscriptionModel: Model<Subscription>,
    @InjectModel(PayoutRequest.name)
    private payoutRequestModel: Model<PayoutRequest>,
    @InjectModel(User.name) private userModel: Model<User>,
    private paymentsService: PaymentsService,
    private notificationGenerator: NotificationGeneratorService,
    private readonly settingsService: SettingsService,
  ) {}

  private async getPlatformCommissionRate(): Promise<number> {
    try {
      const rate = await this.settingsService.get<number>(
        'platformCommissionRate',
        0.15,
      );
      return rate;
    } catch {
      return 0.15;
    }
  }

  async createMembership(
    userId: string,
    createMembershipDto: CreateMembershipWithFileDto,
  ): Promise<Membership> {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.stripeConnectAccountId) {
      throw new BadRequestException(
        'Creator must complete payment setup first',
      );
    }

    const existingMembership = await this.membershipModel.findOne({
      creator: userId,
      name: createMembershipDto.name,
      isActive: true,
    });

    if (existingMembership) {
      throw new ConflictException('A membership with this name already exists');
    }

    const product = await this.paymentsService.stripe.products.create({
      name: `${user.displayName || user.creatorUsername} - ${createMembershipDto.name}`,
      description: createMembershipDto.description,
      metadata: {
        creatorId: userId,
        membershipName: createMembershipDto.name,
      },
      images: createMembershipDto.coverImage
        ? [createMembershipDto.coverImage]
        : undefined,
    });

    const price = await this.paymentsService.stripe.prices.create({
      product: product.id,
      unit_amount: Math.round(createMembershipDto.monthlyRate * 100),
      currency: 'usd',
      recurring: { interval: 'month' },
      metadata: {
        creatorId: userId,
        membershipName: createMembershipDto.name,
      },
    });

    const membership = new this.membershipModel({
      ...createMembershipDto,
      creator: userId,
      stripeProductId: product.id,
      stripePriceId: price.id,
    });

    return membership.save();
  }

  async updateMembership(
    userId: string,
    membershipId: string,
    updateMembershipDto: UpdateMembershipDto,
  ): Promise<Membership> {
    const membership = await this.membershipModel.findOne({
      _id: membershipId,
      creator: userId,
    });

    if (!membership) {
      throw new NotFoundException('Membership not found');
    }
    console.log('updateMembershipDto', updateMembershipDto);

    // Convert to numbers for accurate comparison
    const newRate =
      updateMembershipDto.monthlyRate !== undefined
        ? Number(updateMembershipDto.monthlyRate)
        : undefined;
    const currentRate = Number(membership.monthlyRate);

    if (newRate !== undefined && newRate !== currentRate) {
      console.log('Price is changing from', currentRate, 'to', newRate);

      const activeSubscribers = await this.subscriptionModel.countDocuments({
        membership: membershipId,
        status: 'active',
      });

      if (activeSubscribers > 0) {
        throw new BadRequestException(
          'Cannot update price while there are active subscribers',
        );
      }

      if (membership.stripeProductId) {
        try {
          if (membership.stripePriceId) {
            await this.paymentsService.stripe.prices.update(
              membership.stripePriceId,
              {
                active: false,
              },
            );
          }

          const newPrice = await this.paymentsService.stripe.prices.create({
            product: membership.stripeProductId,
            unit_amount: Math.round(newRate * 100),
            currency: 'usd',
            recurring: { interval: 'month' },
            metadata: {
              membershipId: membershipId,
              membershipName: membership.name,
              creatorId: userId,
            },
          });

          membership.stripePriceId = newPrice.id;
        } catch (error) {
          console.error('Error updating Stripe price:', error);
          throw new BadRequestException(
            'Failed to update price in payment processor',
          );
        }
      }
    }

    if (
      membership.stripeProductId &&
      (updateMembershipDto.name || updateMembershipDto.description)
    ) {
      try {
        await this.paymentsService.stripe.products.update(
          membership.stripeProductId,
          {
            name: updateMembershipDto.name
              ? `${(membership.creator as any).displayName || 'Creator'} - ${updateMembershipDto.name}`
              : undefined,
            description: updateMembershipDto.description,
          },
        );
      } catch (error) {
        console.error('Error updating Stripe product:', error);
      }
    }

    Object.assign(membership, updateMembershipDto);
    return membership.save();
  }

  async createSubscription(
    userId: string,
    membershipId: string,
    discountInfo?: {
      discountId?: string;
      discountCode?: string;
      originalPrice?: number;
      discountedPrice?: number;
    },
  ): Promise<Subscription> {
    const membership = await this.membershipModel
      .findById(membershipId)
      .populate('creator');

    if (!membership) {
      throw new NotFoundException('Membership not found');
    }

    if (!membership.isActive) {
      throw new BadRequestException('This membership is no longer available');
    }

    const subscriber = await this.userModel.findById(userId);
    if (!subscriber) {
      throw new NotFoundException('Subscriber not found');
    }

    const existingSubscription = await this.subscriptionModel.findOne({
      subscriber: userId,
      membership: membershipId,
      status: 'active',
    });

    if (existingSubscription) {
      throw new ConflictException('Already subscribed to this membership');
    }

    const creator = membership.creator as User;
    if (!creator.stripeConnectAccountId) {
      throw new BadRequestException('Creator payment setup incomplete');
    }

    let customerId = subscriber.stripeCustomerId;
    if (!customerId) {
      customerId = await this.paymentsService.createCustomerForSubscriber(
        userId,
        subscriber.email,
      );
    }

    const hasDiscount =
      discountInfo && discountInfo.discountedPrice !== undefined;
    const effectivePrice = hasDiscount
      ? discountInfo.discountedPrice
      : membership.monthlyRate;

    let priceId = null;
    if (hasDiscount) {
      const newPrice = await this.paymentsService.stripe.prices.create({
        product: membership.stripeProductId,
        unit_amount: Math.round(effectivePrice * 100),
        currency: 'usd',
        recurring: { interval: 'month' },
        metadata: {
          membershipId: membershipId,
          membershipName: membership.name,
          creatorId: creator._id.toString(),
          discountApplied: 'true',
          discountId: discountInfo.discountId,
          discountCode: discountInfo.discountCode,
        },
      });
      priceId = newPrice.id;
    } else {
      priceId = membership.stripePriceId;
    }

    const stripeSubscription =
      await this.paymentsService.stripe.subscriptions.create({
        customer: customerId,
        items: [
          {
            price: priceId,
          },
        ],
        application_fee_percent: await this.getPlatformCommissionRate(),
        transfer_data: {
          destination: creator.stripeConnectAccountId,
        },
        metadata: {
          membershipId: membershipId,
          subscriberId: userId,
          creatorId: creator._id.toString(),
          ...(hasDiscount
            ? {
                discountApplied: 'true',
                discountId: discountInfo.discountId,
                discountCode: discountInfo.discountCode,
                originalPrice: discountInfo.originalPrice?.toString(),
                discountedPrice: discountInfo.discountedPrice?.toString(),
              }
            : {}),
        },
      });

    const subscription = new this.subscriptionModel({
      subscriber: userId,
      creator: creator._id,
      membership: membershipId,
      monthlyRate: effectivePrice,
      status: 'active',
      currentPeriodStart: new Date(
        stripeSubscription.current_period_start * 1000,
      ),
      currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
      stripeSubscriptionId: stripeSubscription.id,
      ...(hasDiscount
        ? {
            hasDiscount: true,
            discountData: {
              discountId: discountInfo.discountId,
              discountCode: discountInfo.discountCode,
              originalPrice: discountInfo.originalPrice,
              discountedPrice: discountInfo.discountedPrice,
            },
          }
        : {}),
    });

    await this.membershipModel.findByIdAndUpdate(membershipId, {
      $inc: { subscriberCount: 1 },
    });

    const creatorShare = await this.calculateCreatorShare(effectivePrice);
    await this.userModel.findByIdAndUpdate(creator._id, {
      $inc: {
        availableBalance: creatorShare,
        lifetimeEarnings: creatorShare,
      },
    });

    return subscription.save();
  }

  async createTrialSubscription(
    userId: string,
    membershipId: string,
    expiryDate: Date,
    giftInfo?: {
      giftId?: string;
      giftCode?: string;
      originalPrice?: number;
      trialDurationDays?: number;
    },
  ): Promise<Subscription> {
    const membership = await this.membershipModel
      .findById(membershipId)
      .populate('creator');

    if (!membership) {
      throw new NotFoundException('Membership not found');
    }

    if (!membership.isActive) {
      throw new BadRequestException('This membership is no longer available');
    }

    const subscriber = await this.userModel.findById(userId);
    if (!subscriber) {
      throw new NotFoundException('Subscriber not found');
    }

    const existingSubscription = await this.subscriptionModel.findOne({
      subscriber: userId,
      membership: membershipId,
      status: 'active',
    });

    if (existingSubscription) {
      throw new ConflictException('Already subscribed to this membership');
    }

    const creator = membership.creator as User;

    let stripeSubscriptionId = null;

    if (membership.monthlyRate > 0 && creator.stripeConnectAccountId) {
      let customerId = subscriber.stripeCustomerId;
      if (!customerId) {
        customerId = await this.paymentsService.createCustomerForSubscriber(
          userId,
          subscriber.email,
        );
      }

      const trialEnd = Math.floor(expiryDate.getTime() / 1000);

      const stripeSubscription =
        await this.paymentsService.stripe.subscriptions.create({
          customer: customerId,
          items: [{ price: membership.stripePriceId }],
          trial_end: trialEnd,
          application_fee_percent: await this.getPlatformCommissionRate(),
          transfer_data: {
            destination: creator.stripeConnectAccountId,
          },
          metadata: {
            membershipId,
            subscriberId: userId,
            creatorId: creator._id.toString(),
            isTrial: 'true',
            giftId: giftInfo?.giftId || '',
            giftCode: giftInfo?.giftCode || '',
          },
        });

      stripeSubscriptionId = stripeSubscription.id;
    }

    const subscription = new this.subscriptionModel({
      subscriber: userId,
      creator: creator._id,
      membership: membershipId,
      monthlyRate: 0,
      status: 'active',
      currentPeriodStart: new Date(),
      currentPeriodEnd: expiryDate,
      isTrial: true,
      trialEndDate: expiryDate,
      stripeSubscriptionId,
      giftData: giftInfo
        ? {
            giftId: giftInfo.giftId,
            giftCode: giftInfo.giftCode,
            originalPrice: giftInfo.originalPrice,
            trialDurationDays: giftInfo.trialDurationDays,
          }
        : undefined,
    });

    await this.membershipModel.findByIdAndUpdate(membershipId, {
      $inc: { subscriberCount: 1 },
    });

    return subscription.save();
  }

  async cancelSubscription(
    userId: string,
    subscriptionId: string,
  ): Promise<Subscription> {
    const subscription = await this.subscriptionModel
      .findOne({
        _id: subscriptionId,
        subscriber: userId,
        status: 'active',
      })
      .populate('membership');

    if (!subscription) {
      throw new NotFoundException('Active subscription not found');
    }

    await this.paymentsService.stripe.subscriptions.update(
      subscription.stripeSubscriptionId,
      {
        cancel_at_period_end: true,
      },
    );

    subscription.status = 'cancelled';
    subscription.cancelledAt = new Date();
    await subscription.save();

    await this.membershipModel.findByIdAndUpdate(
      (subscription.membership as Membership)._id,
      {
        $inc: { subscriberCount: -1 },
      },
    );

    await this.notificationGenerator.generateCancellationNotification(
      userId,
      subscription.creator.toString(),
      (subscription.membership as Membership).name,
    );

    return subscription;
  }

  async unsubscribeFromCreator(
    userId: string,
    creatorId: string,
  ): Promise<{ success: boolean; message: string }> {
    const activeSubscriptions = await this.subscriptionModel
      .find({
        subscriber: new Types.ObjectId(userId),
        creator: new Types.ObjectId(creatorId),
        status: 'active',
      })
      .populate('membership');

    if (activeSubscriptions.length === 0) {
      throw new NotFoundException(
        'No active subscription found for this creator.',
      );
    }

    for (const subscription of activeSubscriptions) {
      if (subscription.stripeSubscriptionId) {
        try {
          await this.paymentsService.stripe.subscriptions.cancel(
            subscription.stripeSubscriptionId,
          );
        } catch (error) {
          console.error(
            `Failed to cancel Stripe subscription ${subscription.stripeSubscriptionId}:`,
            error,
          );
          throw new BadRequestException(
            `Could not cancel subscription with payment provider: ${error.message}`,
          );
        }
      }

      subscription.status = 'cancelled';
      subscription.cancelledAt = new Date();
      await subscription.save();

      await this.membershipModel.findByIdAndUpdate(
        (subscription.membership as Membership)._id,
        {
          $inc: { subscriberCount: -1 },
        },
      );

      await this.notificationGenerator.generateCancellationNotification(
        userId,
        subscription.creator.toString(),
        (subscription.membership as Membership).name,
      );
    }

    return {
      success: true,
      message: 'Successfully unsubscribed from the creator.',
    };
  }

  async calculateCreatorShare(amount: number): Promise<number> {
    const rate = await this.getPlatformCommissionRate();
    return amount * (1 - rate);
  }

  async createPayoutRequest(
    userId: string,
    createPayoutRequestDto: CreatePayoutRequestDto,
  ): Promise<PayoutRequest> {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.stripeConnectAccountId) {
      throw new BadRequestException('Creator Stripe account not found');
    }

    if (user.availableBalance < createPayoutRequestDto.amount) {
      throw new BadRequestException('Insufficient available balance');
    }

    const minPayout = await this.settingsService.get<number>('minimumPayoutAmount', 10);
    if (createPayoutRequestDto.amount < minPayout) {
      throw new BadRequestException(
        `Minimum payout amount is $${minPayout.toFixed(2)}. Requested: $${createPayoutRequestDto.amount.toFixed(2)}.`,
      );
    }

    try {
      const { payoutId } = await this.paymentsService.initiatePayoutToBank(
        userId,
        createPayoutRequestDto.amount,
      );

      const payoutRequest = new this.payoutRequestModel({
        creator: userId,
        amount: createPayoutRequestDto.amount,
        status: 'completed',
        completedAt: new Date(),
        stripeTransferId: payoutId,
      });

      await this.userModel.findByIdAndUpdate(userId, {
        $inc: {
          availableBalance: -createPayoutRequestDto.amount,
        },
      });

      return payoutRequest.save();
    } catch (error) {
      const payoutRequest = new this.payoutRequestModel({
        creator: userId,
        amount: createPayoutRequestDto.amount,
        status: 'failed',
        failureReason: error.message,
      });

      return payoutRequest.save();
    }
  }

  async getCreatorEarnings(userId: string): Promise<{
    availableBalance: number;
    pendingBalance: number;
    lifetimeEarnings: number;
    recentPayouts: PayoutRequest[];
    monthlyEarnings: {
      month: string;
      earnings: number;
      subscriptions: number;
    }[];
  }> {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const stripeBalance = await this.paymentsService.getPayoutBalance(userId);

    const recentPayouts = await this.payoutRequestModel
      .find({ creator: userId })
      .sort({ createdAt: -1 })
      .limit(5);

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const subscriptions = await this.subscriptionModel
      .find({
        creator: userId,
        createdAt: { $gte: sixMonthsAgo },
      })
      .populate('membership');

    const monthlyData = new Map();

    for (const sub of subscriptions) {
      const monthKey = sub.createdAt.toISOString().slice(0, 7);
      const earnings = await this.calculateCreatorShare(sub.monthlyRate);

      if (!monthlyData.has(monthKey)) {
        monthlyData.set(monthKey, { earnings: 0, subscriptions: 0 });
      }

      const data = monthlyData.get(monthKey);
      data.earnings += earnings;
      data.subscriptions += 1;
      monthlyData.set(monthKey, data);
    }

    const monthlyEarnings = Array.from(monthlyData, ([month, data]) => ({
      month,
      earnings: data.earnings,
      subscriptions: data.subscriptions,
    })).sort((a, b) => b.month.localeCompare(a.month));

    return {
      availableBalance: stripeBalance.available,
      pendingBalance: stripeBalance.pending,
      lifetimeEarnings: user.lifetimeEarnings,
      recentPayouts,
      monthlyEarnings,
    };
  }

  async getPayoutHistory(userId: string): Promise<{
    payouts: PayoutRequest[];
    total: number;
  }> {
    const payouts = await this.payoutRequestModel
      .find({ creator: userId })
      .sort({ createdAt: -1 });

    const total = payouts.reduce((sum, payout) => {
      return payout.status === 'completed' ? sum + payout.amount : sum;
    }, 0);

    return {
      payouts,
      total,
    };
  }

  async getCreatorMemberships(
    userId: string,
    query: GetMembershipsQueryDto,
  ): Promise<{
    creatorId: string;
    memberships: Membership[];
    total: number;
    totalSubscribers: number;
    totalEarnings: number;
  }> {
    const filter: any = {
      creator: userId,
    };

    if (query.activeOnly) {
      filter.isActive = true;
    }

    const [memberships, total] = await Promise.all([
      this.membershipModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip((query.page - 1) * query.limit)
        .limit(query.limit),
      this.membershipModel.countDocuments(filter),
    ]);

    const totalSubscribers = await this.subscriptionModel.countDocuments({
      creator: userId,
      status: 'active',
    });

    const user = await this.userModel.findById(userId);
    const totalEarnings = user ? user.lifetimeEarnings : 0;

    return {
      creatorId: userId,
      memberships,
      total,
      totalSubscribers,
      totalEarnings,
    };
  }

  async getUserSubscriptions(userId: string): Promise<{
    activeSubscriptions: Array<
      Subscription & { daysUntilRenewal: number; nextBillingAmount: number }
    >;
    cancelledSubscriptions: Subscription[];
  }> {
    const allSubscriptions = await this.subscriptionModel
      .find({ subscriber: userId })
      .populate('membership')
      .populate('creator', 'displayName creatorUsername profilePicture')
      .sort({ createdAt: -1 });

    const now = new Date();
    const activeSubscriptions = allSubscriptions
      .filter((sub) => sub.status === 'active')
      .map((sub) => {
        const daysUntilRenewal = Math.ceil(
          (sub.currentPeriodEnd.getTime() - now.getTime()) /
            (1000 * 60 * 60 * 24),
        );

        const subscriptionObj = sub.toObject();
        return Object.assign(subscriptionObj, {
          daysUntilRenewal,
          nextBillingAmount: sub.monthlyRate,
        }) as Subscription & {
          daysUntilRenewal: number;
          nextBillingAmount: number;
        };
      });

    const cancelledSubscriptions = allSubscriptions.filter(
      (sub) => sub.status === 'cancelled',
    );

    return {
      activeSubscriptions,
      cancelledSubscriptions,
    };
  }

  async getCreatorSubscribers(userId: string): Promise<{
    subscribers: {
      subscription: Subscription;
      totalPaid: number;
      subscriber: Partial<User>;
    }[];
    total: number;
    totalRevenue: number;
  }> {
    const subscriptions = await this.subscriptionModel
      .find({ creator: userId, status: 'active' })
      .populate('subscriber', 'displayName email profilePicture')
      .populate('membership', 'name')
      .sort({ createdAt: -1 });

    const subscribers = await Promise.all(
      subscriptions.map(async (sub) => {
        const totalPaid = await this.subscriptionModel.aggregate([
          {
            $match: {
              creator: new Types.ObjectId(userId),
              subscriber: (sub.subscriber as User)._id,
            },
          },
          {
            $group: {
              _id: null,
              total: {
                $sum: {
                  $multiply: [
                    '$monthlyRate',
                    {
                      $subtract: [
                        { $month: '$currentPeriodEnd' },
                        { $month: '$createdAt' },
                      ],
                    },
                  ],
                },
              },
            },
          },
        ]);

        return {
          subscription: sub,
          totalPaid: totalPaid[0]?.total || 0,
          subscriber: sub.subscriber as User,
        };
      }),
    );

    const totalRevenue = subscribers.reduce(
      (sum, { totalPaid }) => sum + totalPaid,
      0,
    );

    return {
      subscribers,
      total: subscribers.length,
      totalRevenue,
    };
  }

  async getMembershipById(membershipId: string): Promise<Membership> {
    const membership = await this.membershipModel
      .findById(membershipId)
      .populate('creator', 'displayName creatorUsername profilePicture');

    if (!membership) {
      throw new NotFoundException('Membership not found');
    }

    return membership;
  }

  async isSubscribed(userId: string, membershipId: string): Promise<boolean> {
    const subscription = await this.subscriptionModel.findOne({
      subscriber: userId,
      membership: membershipId,
      status: 'active',
    });

    return !!subscription;
  }

  async createFreeSubscription(
    userId: string,
    creatorId: string,
  ): Promise<Subscription> {
    const creator = await this.userModel.findById(creatorId);
    if (!creator) {
      throw new NotFoundException('Creator not found');
    }

    const subscriber = await this.userModel.findById(userId);
    if (!subscriber) {
      throw new NotFoundException('Subscriber not found');
    }

    const freeMembership = await this.membershipModel.findOne({
      creator: new Types.ObjectId(creatorId),
      monthlyRate: 0,
      isActive: true,
    });

    if (!freeMembership) {
      throw new NotFoundException(
        'Free membership tier not found for this creator',
      );
    }

    const existingSubscription = await this.subscriptionModel.findOne({
      subscriber: userId,
      creator: creatorId,
      status: 'active',
    });

    if (existingSubscription) {
      throw new ConflictException('You are already subscribed to this creator');
    }

    const farFutureDate = new Date();
    farFutureDate.setFullYear(farFutureDate.getFullYear() + 10);

    const subscription = new this.subscriptionModel({
      subscriber: new Types.ObjectId(userId),
      creator: new Types.ObjectId(creatorId),
      membership: freeMembership._id,
      monthlyRate: 0,
      status: 'active',
      currentPeriodStart: new Date(),
      currentPeriodEnd: farFutureDate,
      isTrial: false,
    });

    await subscription.save();

    await this.notificationGenerator.generateNewMemberNotification(
      userId,
      creatorId,
      'Free Tier',
    );

    return subscription;
  }

  async ensureStripeProductForMembership(
    membershipId: string,
  ): Promise<Membership> {
    const membership = await this.membershipModel
      .findById(membershipId)
      .populate('creator');

    if (!membership) {
      throw new NotFoundException('Membership not found');
    }

    if (membership.stripeProductId && membership.stripePriceId) {
      return membership;
    }

    const creator = membership.creator as User;
    if (!creator.stripeConnectAccountId) {
      throw new BadRequestException(
        'Creator must complete payment setup first',
      );
    }

    const product = await this.paymentsService.stripe.products.create({
      name: `${creator.displayName || creator.creatorUsername} - ${membership.name}`,
      description: membership.description,
      metadata: {
        creatorId: creator._id.toString(),
        membershipName: membership.name,
        membershipId: membership._id.toString(),
      },
      images: membership.coverImage ? [membership.coverImage] : undefined,
    });

    const price = await this.paymentsService.stripe.prices.create({
      product: product.id,
      unit_amount: Math.round(membership.monthlyRate * 100),
      currency: 'usd',
      recurring: { interval: 'month' },
      metadata: {
        creatorId: creator._id.toString(),
        membershipName: membership.name,
        membershipId: membership._id.toString(),
      },
    });

    membership.stripeProductId = product.id;
    membership.stripePriceId = price.id;
    await membership.save();

    return membership;
  }

  async extendSubscriptionPeriod(
    userId: string,
    membershipId: string,
    newEndTimestamp: number,
  ): Promise<Subscription> {
    const subscription = await this.subscriptionModel.findOne({
      subscriber: userId,
      membership: membershipId,
      status: 'active',
    });

    if (!subscription) {
      throw new NotFoundException('Active subscription not found');
    }

    subscription.currentPeriodEnd = new Date(newEndTimestamp);
    return subscription.save();
  }

  async createCheckoutSession(
    userId: string,
    membershipId: string,
    promotionCode?: string,
  ): Promise<string> {
    const membership = await this.membershipModel
      .findById(membershipId)
      .populate('creator');

    if (!membership) {
      throw new NotFoundException('Membership not found');
    }

    if (!membership.isActive) {
      throw new BadRequestException('This membership is no longer available');
    }

    const creator = membership.creator as User;
    if (!creator.stripeConnectAccountId) {
      throw new BadRequestException('Creator payment setup incomplete');
    }

    if (membership.monthlyRate === 0) {
      await this.createFreeSubscription(userId, creator._id.toString());
      return `${branding.frontendUrl}/creator/${creator._id.toString()}`;
    }

    const subscriber = await this.userModel.findById(userId);
    if (!subscriber) {
      throw new NotFoundException('Subscriber not found');
    }

    let customerId = subscriber.stripeCustomerId;
    if (!customerId) {
      customerId = await this.paymentsService.createCustomerForSubscriber(
        userId,
        subscriber.email,
      );
    }

    if (!membership.stripePriceId) {
      await this.ensureStripeProductForMembership(membershipId);
      const updatedMembership =
        await this.membershipModel.findById(membershipId);
      if (!updatedMembership || !updatedMembership.stripePriceId) {
        throw new BadRequestException(
          'Failed to create Stripe product for membership',
        );
      }
      membership.stripePriceId = updatedMembership.stripePriceId;
    }

    const session = await this.paymentsService.stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: membership.stripePriceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      allow_promotion_codes: !promotionCode, // If we have a specific code, don't allow others
      discounts: promotionCode
        ? [
            {
              promotion_code: promotionCode,
            },
          ]
        : undefined,
      success_url: `${branding.frontendUrl}/creator/${creator.creatorUsername.toString()}?subscription_success=true`,
      cancel_url: `${branding.frontendUrl}/cancel`,
      metadata: {
        membershipId: membershipId,
        subscriberId: userId,
        creatorId: creator._id.toString(),
      },
      subscription_data: {
        metadata: {
          membershipId: membershipId,
          subscriberId: userId,
          creatorId: creator._id.toString(),
        },
        transfer_data: {
          destination: creator.stripeConnectAccountId,
        },
        application_fee_percent: await this.getPlatformCommissionRate(),
      },
    });

    return session.url;
  }

  async createSubscriptionFromStripe(
    userId: string,
    membershipId: string,
    stripeSubscriptionId: string,
    data: {
      currentPeriodStart: number;
      currentPeriodEnd: number;
      monthlyRate: number;
      status: string;
    },
  ): Promise<Subscription> {
    // Idempotency Check: If we've already processed this Stripe subscription, just update and return.
    const existingSubscriptionByStripeId = await this.subscriptionModel.findOne(
      {
        stripeSubscriptionId,
      },
    );

    if (existingSubscriptionByStripeId) {
      existingSubscriptionByStripeId.status = this.mapStripeStatusToAppStatus(
        data.status,
      ) as 'active' | 'cancelled' | 'expired';
      existingSubscriptionByStripeId.currentPeriodStart = new Date(
        data.currentPeriodStart * 1000,
      );
      existingSubscriptionByStripeId.currentPeriodEnd = new Date(
        data.currentPeriodEnd * 1000,
      );
      return existingSubscriptionByStripeId.save();
    }

    const membership = await this.membershipModel.findById(membershipId);
    if (!membership) {
      throw new NotFoundException('Membership not found');
    }

    const creatorId = membership.creator;

    // Find and cancel all other active subscriptions for this user with the same creator
    const otherActiveSubscriptions = await this.subscriptionModel.find({
      subscriber: userId,
      creator: creatorId,
      status: 'active',
    });

    for (const sub of otherActiveSubscriptions) {
      try {
        if (sub.stripeSubscriptionId) {
          await this.paymentsService.stripe.subscriptions.cancel(
            sub.stripeSubscriptionId,
          );
        }
      } catch (error) {
        console.error(
          `Failed to cancel old Stripe subscription ${sub.stripeSubscriptionId}:`,
          error,
        );
      }

      sub.status = 'cancelled';
      sub.cancelledAt = new Date();
      await sub.save();

      await this.membershipModel.findByIdAndUpdate(sub.membership, {
        $inc: { subscriberCount: -1 },
      });
    }

    const newSubscription = new this.subscriptionModel({
      subscriber: userId,
      creator: creatorId,
      membership: membershipId,
      monthlyRate: data.monthlyRate || membership.monthlyRate,
      status: this.mapStripeStatusToAppStatus(data.status),
      currentPeriodStart: new Date(data.currentPeriodStart * 1000),
      currentPeriodEnd: new Date(data.currentPeriodEnd * 1000),
      stripeSubscriptionId,
    });

    await this.membershipModel.findByIdAndUpdate(membershipId, {
      $inc: { subscriberCount: 1 },
    });

    await this.notificationGenerator.generateNewMemberNotification(
      userId,
      creatorId.toString(),
      membership.name,
    );
    console.log('Saving subscription', newSubscription._id);
    return newSubscription.save();
  }
  async updateSubscriptionFromStripe(
    userId: string,
    membershipId: string,
    stripeSubscriptionId: string,
    data: {
      status: string;
      currentPeriodEnd: number;
      cancelledAt?: number;
    },
  ): Promise<Subscription | null> {
    const subscription = await this.subscriptionModel.findOne({
      stripeSubscriptionId,
    });

    if (!subscription) {
      return null;
    }

    subscription.status = this.mapStripeStatusToAppStatus(data.status) as
      | 'active'
      | 'cancelled'
      | 'expired';
    subscription.currentPeriodEnd = new Date(data.currentPeriodEnd * 1000);

    if (data.cancelledAt) {
      subscription.cancelledAt = new Date(data.cancelledAt * 1000);
    }

    if (subscription.status !== 'active') {
      await this.membershipModel.findByIdAndUpdate(membershipId, {
        $inc: { subscriberCount: -1 },
      });
    }

    return subscription.save();
  }

  async findSubscriptionByStripeId(
    stripeSubscriptionId: string,
  ): Promise<Subscription | null> {
    return this.subscriptionModel.findOne({ stripeSubscriptionId });
  }

  async markSubscriptionAsExpired(
    subscriptionId: string,
  ): Promise<Subscription | null> {
    const subscription = await this.subscriptionModel.findById(subscriptionId);

    if (!subscription) {
      return null;
    }

    subscription.status = 'expired';

    await this.membershipModel.findByIdAndUpdate(subscription.membership, {
      $inc: { subscriberCount: -1 },
    });

    return subscription.save();
  }

  async updateSubscriptionPeriod(
    userId: string,
    membershipId: string,
    periodEndTimestamp: number,
  ): Promise<Subscription | null> {
    const subscription = await this.subscriptionModel.findOne({
      subscriber: userId,
      membership: membershipId,
      status: 'active',
    });

    if (!subscription) {
      return null;
    }

    subscription.currentPeriodEnd = new Date(periodEndTimestamp * 1000);
    return subscription.save();
  }

  async creditCreatorForPayment(
    creatorId: string,
    amount: number,
  ): Promise<void> {
    await this.userModel.findByIdAndUpdate(creatorId, {
      $inc: {
        availableBalance: amount,
        lifetimeEarnings: amount,
      },
    });
  }

  private mapStripeStatusToAppStatus(stripeStatus: string): string {
    switch (stripeStatus) {
      case 'active':
        return 'active';
      case 'canceled':
        return 'cancelled';
      case 'incomplete':
      case 'incomplete_expired':
      case 'past_due':
      case 'unpaid':
        return 'expired';
      default:
        return 'active';
    }
  }

  async toggleFeaturedStatus(
    creatorId: string,
    membershipId: string,
    isFeatured: boolean,
  ): Promise<Membership> {
    const membership = await this.membershipModel.findOne({
      _id: membershipId,
      creator: new Types.ObjectId(creatorId),
    });

    if (!membership) {
      throw new NotFoundException('Membership not found');
    }

    if (isFeatured) {
      await this.membershipModel.updateMany(
        {
          creator: new Types.ObjectId(creatorId),
          isFeatured: true,
        },
        {
          $set: { isFeatured: false },
        },
      );
    }

    const updatedMembership = await this.membershipModel.findByIdAndUpdate(
      membershipId,
      { $set: { isFeatured } },
      { new: true },
    );

    return updatedMembership;
  }
}
