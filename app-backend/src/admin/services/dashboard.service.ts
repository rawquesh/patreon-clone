import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '@/database/schemas/user';
import { Subscription } from '@/database/schemas/subscription/subscription.schema';
import { PayoutRequest } from '@/database/schemas/payout/payout.schema';

export interface DashboardStats {
  totalCreators: number;
  activeCreators: number;
  totalMembers: number;
  totalSubscriptions: number;
  mrr: number;
  churnRate: number;
  totalRevenue: number;
  pendingPayoutsCount: number;
  pendingPayoutsAmount: number;
  newCreatorsThisMonth: number;
  newMembersThisMonth: number;
  membershipGrowth: Array<{ month: string; count: number }>;
  earningsData: Array<{ month: string; amount: number }>;
  recentTransactions: Array<{
    id: string;
    memberName: string;
    creatorName: string;
    amount: number;
    type: string;
    status: string;
    date: string;
  }>;
}

@Injectable()
export class DashboardService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Subscription.name)
    private subscriptionModel: Model<Subscription>,
    @InjectModel(PayoutRequest.name)
    private payoutRequestModel: Model<PayoutRequest>,
  ) {}

  async getDashboardStats(months = 6): Promise<DashboardStats> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    const monthsAgo = new Date(now.getFullYear(), now.getMonth() - months, 1);

    const [
      totalCreators,
      totalMembers,
      activeSubscriptions,
      pendingPayouts,
      newCreatorsThisMonth,
      newMembersThisMonth,
      lastMonthActiveCount,
      lastMonthCancelledCount,
      recentSubscriptions,
      recentPayouts,
      creatorEarnings,
    ] = await Promise.all([
      // Total creators (isCreator = true)
      this.userModel.countDocuments({ isCreator: true }).exec(),
      // Total members (isCreator = false or undefined)
      this.userModel.countDocuments({ isCreator: { $ne: true } }).exec(),
      // Active subscriptions
      this.subscriptionModel.find({ status: 'active' }).exec(),
      // Pending payouts
      this.payoutRequestModel
        .find({ status: 'pending' })
        .populate('creator', 'displayName creatorUsername')
        .exec(),
      // New creators this month
      this.userModel
        .countDocuments({
          isCreator: true,
          createdAt: { $gte: startOfMonth },
        })
        .exec(),
      // New members this month
      this.userModel
        .countDocuments({
          isCreator: { $ne: true },
          createdAt: { $gte: startOfMonth },
        })
        .exec(),
      // Last month active subscriptions (for churn calc)
      this.subscriptionModel
        .countDocuments({
          status: 'active',
          currentPeriodStart: { $lte: endOfLastMonth },
        })
        .exec(),
      // Cancelled this month
      this.subscriptionModel
        .countDocuments({
          status: 'cancelled',
          cancelledAt: { $gte: startOfMonth },
        })
        .exec(),
      // Recent subscriptions for transactions
      this.subscriptionModel
        .find({ status: { $in: ['active', 'cancelled'] } })
        .populate('subscriber', 'displayName email firstName lastName')
        .populate('creator', 'displayName creatorUsername firstName lastName')
        .sort({ createdAt: -1 })
        .limit(20)
        .lean()
        .exec(),
      // Recent payouts for transactions
      this.payoutRequestModel
        .find({ status: { $in: ['completed', 'pending', 'failed'] } })
        .populate('creator', 'displayName creatorUsername firstName lastName')
        .sort({ createdAt: -1 })
        .limit(10)
        .lean()
        .exec(),
      // Total lifetime earnings from creators
      this.userModel
        .aggregate([
          { $match: { isCreator: true } },
          { $group: { _id: null, total: { $sum: '$lifetimeEarnings' } } },
        ])
        .exec(),
    ]);

    // MRR = sum of monthlyRate on active subscriptions
    const mrr = activeSubscriptions.reduce(
      (sum, s) => sum + (s.monthlyRate || 0),
      0,
    );

    // Churn rate = cancelled this month / active at start of month
    const churnRate =
      lastMonthActiveCount > 0
        ? (lastMonthCancelledCount / lastMonthActiveCount) * 100
        : 0;

    // Total revenue from lifetime earnings
    const totalRevenue = creatorEarnings[0]?.total || 0;

    // Pending payouts
    const pendingPayoutsCount = pendingPayouts.length;
    const pendingPayoutsAmount = pendingPayouts.reduce(
      (sum, p) => sum + (p.amount || 0),
      0,
    );

    // Active creators (PUBLISHED status)
    const activeCreators = await this.userModel
      .countDocuments({
        isCreator: true,
        creatorStatus: 'PUBLISHED',
      })
      .exec();

    // Recent transactions (merge subscriptions and payouts)
    const subTransactions = recentSubscriptions.map((s: any) => ({
      id: (s._id as any).toString(),
      memberName:
        s.subscriber?.displayName ||
        `${s.subscriber?.firstName || ''} ${s.subscriber?.lastName || ''}`.trim() ||
        'Unknown',
      creatorName:
        s.creator?.displayName ||
        `${s.creator?.firstName || ''} ${s.creator?.lastName || ''}`.trim() ||
        'Unknown',
      amount: s.monthlyRate || 0,
      type: 'subscription',
      status: s.status,
      date: s.createdAt?.toISOString() || new Date().toISOString(),
    }));

    const payoutTransactions = recentPayouts.map((p: any) => ({
      id: (p._id as any).toString(),
      memberName: 'Payout',
      creatorName:
        p.creator?.displayName ||
        `${p.creator?.firstName || ''} ${p.creator?.lastName || ''}`.trim() ||
        'Unknown',
      amount: p.amount || 0,
      type: 'payout',
      status: p.status,
      date: p.createdAt?.toISOString() || new Date().toISOString(),
    }));

    const recentTransactions = [...subTransactions, ...payoutTransactions]
      .sort(
        (a, b) =>
          new Date(b.date).getTime() - new Date(a.date).getTime(),
      )
      .slice(0, 10);

    // Membership growth per month
    const membershipGrowth: Array<{ month: string; count: number }> = [];
    for (let i = months - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const monthEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0);
      const count = await this.subscriptionModel
        .countDocuments({
          status: 'active',
          createdAt: { $lte: monthEnd },
        })
        .exec();
      membershipGrowth.push({ month: monthStr, count });
    }

    // Earnings data per month (from lifetimeEarnings trending - use totalRevenue as placeholder)
    const earningsData: Array<{ month: string; amount: number }> = [];
    for (let i = months - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      // Estimate monthly earnings proportionally from lifetime
      const estimatedMonthly =
        totalRevenue > 0 ? totalRevenue / Math.max(1, months) : 0;
      earningsData.push({
        month: monthStr,
        amount: Math.round(estimatedMonthly * 100) / 100,
      });
    }

    return {
      totalCreators,
      activeCreators,
      totalMembers,
      totalSubscriptions: activeSubscriptions.length,
      mrr: Math.round(mrr * 100) / 100,
      churnRate: Math.round(churnRate * 100) / 100,
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      pendingPayoutsCount,
      pendingPayoutsAmount: Math.round(pendingPayoutsAmount * 100) / 100,
      newCreatorsThisMonth,
      newMembersThisMonth,
      membershipGrowth,
      earningsData,
      recentTransactions,
    };
  }
}
