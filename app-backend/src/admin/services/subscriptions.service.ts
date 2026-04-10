import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Subscription } from '@/database/schemas/subscription/subscription.schema';
import { User } from '@/database/schemas/user';
import { Membership } from '@/database/schemas/membership/membership.schema';
import { AuditLogService } from './audit-log.service';
import {
  AuditAction,
  AuditTargetType,
} from '../schemas/audit-log.schema';
import { GetSubscriptionsQueryDto } from '../dto/subscriptions.dto';

@Injectable()
export class SubscriptionsService {
  constructor(
    @InjectModel(Subscription.name)
    private subscriptionModel: Model<Subscription>,
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Membership.name) private membershipModel: Model<Membership>,
    private readonly auditLogService: AuditLogService,
  ) {}

  async getSubscriptions(
    query: GetSubscriptionsQueryDto,
  ): Promise<{ subscriptions: any[]; total: number }> {
    const {
      page = 1,
      limit = 20,
      search,
      creatorId,
      memberId,
      status,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = query;

    const filter: any = {};
    if (creatorId) filter.creator = creatorId;
    if (memberId) filter.subscriber = memberId;
    if (status) filter.status = status;
    if (search) {
      const users = await this.userModel
        .find({
          $or: [
            { displayName: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } },
            { firstName: { $regex: search, $options: 'i' } },
            { lastName: { $regex: search, $options: 'i' } },
          ],
        })
        .select('_id')
        .lean()
        .exec();
      const userIds = users.map((u: any) => u._id);
      filter.$or = [
        { subscriber: { $in: userIds } },
        { creator: { $in: userIds } },
      ];
    }

    const sortObj: any = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };
    const skip = (page - 1) * limit;

    const [subscriptions, total] = await Promise.all([
      this.subscriptionModel
        .find(filter)
        .populate('subscriber', 'displayName email profilePicture firstName lastName')
        .populate('creator', 'displayName creatorUsername profilePicture firstName lastName')
        .populate('membership', 'name monthlyRate description')
        .sort(sortObj)
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      this.subscriptionModel.countDocuments(filter),
    ]);

    return {
      subscriptions: subscriptions.map((s: any) => ({
        id: s._id.toString(),
        status: s.status,
        monthlyRate: s.monthlyRate,
        currentPeriodStart: s.currentPeriodStart,
        currentPeriodEnd: s.currentPeriodEnd,
        cancelledAt: s.cancelledAt,
        stripeSubscriptionId: s.stripeSubscriptionId,
        isTrial: s.isTrial,
        hasDiscount: s.hasDiscount,
        discountData: s.discountData,
        giftData: s.giftData,
        createdAt: s.createdAt,
        subscriber: s.subscriber
          ? {
              id: s.subscriber._id?.toString(),
              name:
                s.subscriber.displayName ||
                `${s.subscriber.firstName || ''} ${s.subscriber.lastName || ''}`.trim() ||
                'Unknown',
              email: s.subscriber.email,
              avatar: s.subscriber.profilePicture,
            }
          : null,
        creator: s.creator
          ? {
              id: s.creator._id?.toString(),
              name:
                s.creator.displayName ||
                s.creator.creatorUsername ||
                `${s.creator.firstName || ''} ${s.creator.lastName || ''}`.trim(),
              username: s.creator.creatorUsername,
            }
          : null,
        membership: s.membership
          ? {
              id: s.membership._id?.toString(),
              name: s.membership.name,
              monthlyRate: s.membership.monthlyRate,
            }
          : null,
      })),
      total,
    };
  }

  async getSubscriptionById(id: string): Promise<any> {
    const subscription = await this.subscriptionModel
      .findById(id)
      .populate('subscriber', 'displayName email profilePicture firstName lastName countryOfResidence')
      .populate('creator', 'displayName creatorUsername profilePicture firstName lastName email')
      .populate('membership', 'name description monthlyRate coverImage benefits subscriberCount')
      .lean()
      .exec();

    if (!subscription) throw new NotFoundException('Subscription not found');

    return {
      ...subscription,
      id: subscription._id.toString(),
      subscriber: subscription.subscriber
        ? {
            ...subscription.subscriber,
            id: (subscription.subscriber as any)._id?.toString(),
          }
        : null,
      creator: subscription.creator
        ? {
            ...subscription.creator,
            id: (subscription.creator as any)._id?.toString(),
          }
        : null,
      membership: subscription.membership
        ? {
            ...subscription.membership,
            id: (subscription.membership as any)._id?.toString(),
          }
        : null,
    };
  }

  async cancelSubscription(id: string, adminId: string): Promise<any> {
    const subscription = await this.subscriptionModel.findById(id);
    if (!subscription) throw new NotFoundException('Subscription not found');
    if (subscription.status === 'cancelled') {
      throw new BadRequestException('Subscription is already cancelled');
    }

    subscription.status = 'cancelled';
    subscription.cancelledAt = new Date();
    await subscription.save();

    // Decrement subscriber count on membership
    if (subscription.membership) {
      await this.membershipModel.findByIdAndUpdate(subscription.membership, {
        $inc: { subscriberCount: -1 },
      });
    }

    await this.auditLogService.log({
      action: AuditAction.SUBSCRIPTION_CANCELLED,
      targetType: AuditTargetType.SUBSCRIPTION,
      targetId: id,
      performedBy: adminId,
    });

    return {
      message: 'Subscription cancelled successfully',
      subscriptionId: id,
    };
  }

  async getSubscriptionStats(): Promise<any> {
    const [
      totalActive,
      totalCancelled,
      totalExpired,
      totalTrial,
      totalSubscriptions,
    ] = await Promise.all([
      this.subscriptionModel.countDocuments({ status: 'active' }).exec(),
      this.subscriptionModel.countDocuments({ status: 'cancelled' }).exec(),
      this.subscriptionModel.countDocuments({ status: 'expired' }).exec(),
      this.subscriptionModel.countDocuments({ status: 'active', isTrial: true }).exec(),
      this.subscriptionModel.countDocuments().exec(),
    ]);

    const activeSubscriptions = await this.subscriptionModel
      .find({ status: 'active' })
      .select('monthlyRate')
      .lean()
      .exec();

    const mrr = activeSubscriptions.reduce(
      (sum, s) => sum + (s.monthlyRate || 0),
      0,
    );

    const arpu =
      totalActive > 0
        ? Math.round((mrr / totalActive) * 100) / 100
        : 0;

    const churnRate =
      totalSubscriptions > 0
        ? Math.round(((totalCancelled + totalExpired) / totalSubscriptions) * 10000) / 100
        : 0;

    return {
      totalActive,
      totalCancelled,
      totalExpired,
      totalTrial,
      totalSubscriptions,
      mrr: Math.round(mrr * 100) / 100,
      arpu,
      churnRate,
    };
  }
}
