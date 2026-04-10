import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '@/database/schemas/user';
import { Subscription } from '@/database/schemas/subscription/subscription.schema';
import { PayoutRequest } from '@/database/schemas/payout/payout.schema';
import { Post } from '@/database/schemas/post';
import { PostReport } from '@/database/schemas/report/post-report.schema';
import { UserReport } from '@/database/schemas/report/user-report.schema';
import { GetAnalyticsQueryDto } from '../dto/analytics.dto';

@Injectable()
export class AdminAnalyticsService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Subscription.name) private subscriptionModel: Model<Subscription>,
    @InjectModel(PayoutRequest.name) private payoutRequestModel: Model<PayoutRequest>,
    @InjectModel(Post.name) private postModel: Model<Post>,
    @InjectModel(PostReport.name) private postReportModel: Model<PostReport>,
    @InjectModel(UserReport.name) private userReportModel: Model<UserReport>,
  ) {}

  async getOverviewMetrics(query: GetAnalyticsQueryDto): Promise<any> {
    const months = query.months ?? 6;
    const now = new Date();

    // MRR breakdown by tier
    const activeSubscriptions = await this.subscriptionModel
      .find({ status: 'active' })
      .populate('membership', 'name monthlyRate')
      .lean()
      .exec();

    const tierBuckets = { '1-5': 0, '5-10': 0, '10-25': 0, '25+': 0 };
    let totalMrr = 0;
    activeSubscriptions.forEach((s: any) => {
      const rate = s.membership?.monthlyRate || s.monthlyRate || 0;
      totalMrr += rate;
      if (rate <= 5) tierBuckets['1-5'] += rate;
      else if (rate <= 10) tierBuckets['5-10'] += rate;
      else if (rate <= 25) tierBuckets['10-25'] += rate;
      else tierBuckets['25+'] += rate;
    });

    const mrrBreakdown = Object.entries(tierBuckets).map(([tier, revenue]) => ({
      tier,
      revenue: Math.round(revenue * 100) / 100,
      count: activeSubscriptions.filter((s: any) => {
        const rate = s.membership?.monthlyRate || s.monthlyRate || 0;
        if (tier === '1-5') return rate <= 5;
        if (tier === '5-10') return rate > 5 && rate <= 10;
        if (tier === '10-25') return rate > 10 && rate <= 25;
        return rate > 25;
      }).length,
    }));

    // Churn trends
    const churnTrends: Array<{ month: string; rate: number }> = [];
    for (let i = months - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const startOfMonth = new Date(d.getFullYear(), d.getMonth(), 1);
      const endOfMonth = new Date(d.getFullYear(), d.getMonth() + 1, 0);

      const activeAtStart = await this.subscriptionModel
        .countDocuments({ status: 'active', currentPeriodStart: { $lte: startOfMonth } })
        .lean()
        .exec();
      const cancelled = await this.subscriptionModel
        .countDocuments({
          status: 'cancelled',
          cancelledAt: { $gte: startOfMonth, $lte: endOfMonth },
        })
        .lean()
        .exec();

      const rate = activeAtStart > 0 ? (cancelled / activeAtStart) * 100 : 0;
      churnTrends.push({ month: monthStr, rate: Math.round(rate * 100) / 100 });
    }

    // Retention cohorts
    const retentionCohorts: Array<{ cohort: string; month1: number; month3: number; month6: number }> = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const cohortStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;

      const cohortStart = new Date(d.getFullYear(), d.getMonth(), 1);
      const cohortEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0);
      const totalStarted = await this.subscriptionModel
        .countDocuments({ createdAt: { $gte: cohortStart, $lte: cohortEnd } })
        .lean()
        .exec();

      if (totalStarted === 0) continue;

      const after1m = new Date(d.getFullYear(), d.getMonth() + 1, 0);
      const after3m = new Date(d.getFullYear(), d.getMonth() + 3, 0);
      const after6m = new Date(d.getFullYear(), d.getMonth() + 6, 0);

      const retained1m = await this.subscriptionModel
        .countDocuments({ createdAt: { $gte: cohortStart }, currentPeriodEnd: { $gte: after1m } })
        .lean()
        .exec();
      const retained3m = await this.subscriptionModel
        .countDocuments({ createdAt: { $gte: cohortStart }, currentPeriodEnd: { $gte: after3m } })
        .lean()
        .exec();
      const retained6m = await this.subscriptionModel
        .countDocuments({ createdAt: { $gte: cohortStart }, currentPeriodEnd: { $gte: after6m } })
        .lean()
        .exec();

      retentionCohorts.push({
        cohort: cohortStr,
        month1: totalStarted > 0 ? Math.round((retained1m / totalStarted) * 100) : 0,
        month3: totalStarted > 0 ? Math.round((retained3m / totalStarted) * 100) : 0,
        month6: totalStarted > 0 ? Math.round((retained6m / totalStarted) * 100) : 0,
      });
    }

    return {
      mrr: Math.round(totalMrr * 100) / 100,
      mrrBreakdown,
      churnTrends,
      retentionCohorts,
      totalCreators: await this.userModel.countDocuments({ isCreator: true }).lean().exec(),
      totalMembers: await this.userModel.countDocuments({ isCreator: { $ne: true } }).lean().exec(),
      totalSubscriptions: activeSubscriptions.length,
    };
  }

  async getRevenueAnalytics(query: GetAnalyticsQueryDto): Promise<any> {
    const months = query.months ?? 6;
    const now = new Date();

    const daily: Array<{ date: string; amount: number }> = [];
    const weekly: Array<{ week: string; amount: number }> = [];
    const monthly: Array<{ month: string; amount: number }> = [];

    // Daily revenue (from completed payouts)
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayEnd = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1);

      const result = await this.payoutRequestModel
        .aggregate([
          {
            $match: {
              status: 'completed',
              completedAt: { $gte: d, $lt: dayEnd },
            },
          },
          { $group: { _id: null, total: { $sum: '$amount' } } },
        ])
        .exec();

      daily.push({ date: dateStr, amount: Math.round((result[0]?.total || 0) * 100) / 100 });
    }

    // Monthly revenue
    for (let i = months - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const monthEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0);

      const result = await this.payoutRequestModel
        .aggregate([
          {
            $match: {
              status: 'completed',
              completedAt: { $gte: d, $lte: monthEnd },
            },
          },
          { $group: { _id: null, total: { $sum: '$amount' } } },
        ])
        .exec();

      monthly.push({ month: monthStr, amount: Math.round((result[0]?.total || 0) * 100) / 100 });
    }

    // Growth rate
    let growthRate = 0;
    if (monthly.length >= 2) {
      const current = monthly[monthly.length - 1].amount;
      const previous = monthly[monthly.length - 2].amount;
      growthRate = previous > 0 ? Math.round(((current - previous) / previous) * 10000) / 100 : 0;
    }

    // 3-month projection using simple linear regression on last 6 months
    const projection: Array<{ month: string; projected: number }> = [];
    const recent = monthly.slice(-6);
    if (recent.length >= 3) {
      const n = recent.length;
      let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
      recent.forEach((m, i) => {
        sumX += i;
        sumY += m.amount;
        sumXY += i * m.amount;
        sumXX += i * i;
      });
      const slope = n > 1 ? (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX) : 0;
      const intercept = (sumY - slope * sumX) / n;
      const lastAmount = recent[recent.length - 1].amount;
      for (let i = 1; i <= 3; i++) {
        const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
        const monthStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        projection.push({
          month: monthStr,
          projected: Math.max(0, Math.round((intercept + slope * (n + i - 1)) * 100) / 100),
        });
      }
    }

    return { daily, weekly, monthly, growthRate, projection };
  }

  async getCreatorAnalytics(query: GetAnalyticsQueryDto): Promise<any> {
    const months = query.months ?? 6;
    const now = new Date();
    const monthsAgo = new Date(now.getFullYear(), now.getMonth() - months, 1);

    // Top creators by revenue
    const topByRevenue = await this.userModel
      .find({ isCreator: true })
      .select('displayName email creatorUsername lifetimeEarnings profilePicture')
      .sort({ lifetimeEarnings: -1 })
      .limit(20)
      .lean()
      .exec();

    const enrichedTopRevenue = await Promise.all(
      topByRevenue.map(async (c: any) => {
        const subscribers = await this.subscriptionModel
          .countDocuments({ creator: c._id, status: 'active' })
          .lean()
          .exec();
        const posts = await this.postModel
          .countDocuments({ creator: c._id, status: 'published' })
          .lean()
          .exec();
        return {
          ...c,
          id: c._id.toString(),
          revenue: c.lifetimeEarnings || 0,
          subscribers,
          posts,
        };
      }),
    );

    // Top creators by subscribers
    const topBySubscribers = [...enrichedTopRevenue].sort((a, b) => b.subscribers - a.subscribers);

    // Earnings distribution
    const distribution = await this.userModel.aggregate([
      { $match: { isCreator: true } },
      {
        $bucket: {
          groupBy: '$lifetimeEarnings',
          boundaries: [0, 100, 500, 1000, Infinity],
          default: '1000+',
          output: { count: { $sum: 1 } },
        },
      },
    ]);

    const distMap: Record<string, number> = { '0-100': 0, '100-500': 0, '500-1000': 0, '1000+': 0 };
    distribution.forEach((d: any) => {
      if (d._id === 0) distMap['0-100'] = d.count;
      else if (d._id === 100) distMap['100-500'] = d.count;
      else if (d._id === 500) distMap['500-1000'] = d.count;
      else distMap['1000+'] = d.count;
    });

    const earningsDistribution = Object.entries(distMap).map(([range, count]) => ({ range, count }));

    // New creators per month
    const newCreatorsPerMonth: Array<{ month: string; count: number }> = [];
    for (let i = months - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const monthEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0);
      const count = await this.userModel
        .countDocuments({ isCreator: true, createdAt: { $gte: d, $lte: monthEnd } })
        .lean()
        .exec();
      newCreatorsPerMonth.push({ month: monthStr, count });
    }

    return { topByRevenue: enrichedTopRevenue, topBySubscribers, earningsDistribution, newCreatorsPerMonth };
  }

  async getSubscriberAnalytics(query: GetAnalyticsQueryDto): Promise<any> {
    const months = query.months ?? 6;
    const now = new Date();

    // Retention rate
    const retentionRate = { month1: 0, month3: 0, month6: 0 };
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6, 1);
    const startedSixMonthsAgo = await this.subscriptionModel
      .countDocuments({ createdAt: { $lte: sixMonthsAgo } })
      .lean()
      .exec();
    if (startedSixMonthsAgo > 0) {
      const activeNow = await this.subscriptionModel
        .countDocuments({ createdAt: { $lte: sixMonthsAgo }, status: 'active' })
        .lean()
        .exec();
      retentionRate.month6 = Math.round((activeNow / startedSixMonthsAgo) * 100);
    }

    // Churn breakdown
    const churnBreakdown: Array<{ reason: string; count: number }> = [];
    const cancelled = await this.subscriptionModel
      .countDocuments({ status: 'cancelled' })
      .lean()
      .exec();
    churnBreakdown.push({ reason: 'cancelled', count: cancelled });
    const expired = await this.subscriptionModel
      .countDocuments({ status: 'expired' })
      .lean()
      .exec();
    churnBreakdown.push({ reason: 'expired', count: expired });

    // Trial to paid conversion
    const totalTrials = await this.subscriptionModel
      .countDocuments({ isTrial: true })
      .lean()
      .exec();
    const trialConverted = await this.subscriptionModel
      .countDocuments({ isTrial: false, createdAt: { $gte: new Date(now.getFullYear(), now.getMonth() - months, 1) } })
      .lean()
      .exec();
    const trialToPaidConversion = totalTrials > 0 ? Math.round((trialConverted / totalTrials) * 100) : 0;

    // Geographic distribution
    const geoDist = await this.userModel.aggregate([
      { $match: { isCreator: { $ne: true }, countryOfResidence: { $exists: true, $ne: null } } },
      { $group: { _id: '$countryOfResidence', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 20 },
    ]);
    const geoDistribution = geoDist.map((g: any) => ({ country: g._id, count: g.count }));

    return { retentionRate, churnBreakdown, trialToPaidConversion, geoDistribution };
  }

  async getReportAnalytics(query: GetAnalyticsQueryDto): Promise<any> {
    const months = query.months ?? 6;
    const now = new Date();

    // Volume over time
    const volumeOverTime: Array<{ date: string; count: number }> = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayEnd = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1);

      const postCount = await this.postReportModel
        .countDocuments({ createdAt: { $gte: d, $lt: dayEnd } })
        .lean()
        .exec();
      const userCount = await this.userReportModel
        .countDocuments({ createdAt: { $gte: d, $lt: dayEnd } })
        .lean()
        .exec();
      volumeOverTime.push({ date: dateStr, count: postCount + userCount });
    }

    // Resolution rate
    const totalReports =
      (await this.postReportModel.countDocuments().lean().exec()) +
      (await this.userReportModel.countDocuments().lean().exec());
    const resolvedReports =
      (await this.postReportModel.countDocuments({ status: 'resolved' }).lean().exec()) +
      (await this.userReportModel.countDocuments({ status: 'resolved' }).lean().exec()) +
      (await this.postReportModel.countDocuments({ status: 'dismissed' }).lean().exec()) +
      (await this.userReportModel.countDocuments({ status: 'dismissed' }).lean().exec());
    const resolutionRate = totalReports > 0 ? Math.round((resolvedReports / totalReports) * 100) : 0;

    // Common reasons
    const postReasons = await this.postReportModel.aggregate([
      { $group: { _id: '$reason', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);
    const userReasons = await this.userReportModel.aggregate([
      { $group: { _id: '$reason', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    const commonReasons = [
      ...postReasons.map((r: any) => ({ reason: `post:${r._id}`, count: r.count })),
      ...userReasons.map((r: any) => ({ reason: `user:${r._id}`, count: r.count })),
    ].sort((a, b) => b.count - a.count).slice(0, 10);

    return { volumeOverTime, resolutionRate, commonReasons };
  }

  async getEngagementAnalytics(query: GetAnalyticsQueryDto): Promise<any> {
    const months = query.months ?? 6;
    const now = new Date();

    // DAU/MAU approximation using subscription activity
    const dauMau: Array<{ date: string; ratio: number }> = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate());
      const dayEnd = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1);
      const monthStart = new Date(d.getFullYear(), d.getMonth(), 1);

      // Approximate DAU: users with activity today
      const dau = await this.subscriptionModel
        .countDocuments({ currentPeriodStart: { $gte: dayStart, $lt: dayEnd } })
        .lean()
        .exec();
      // MAU: active subscriptions this month
      const mau = await this.subscriptionModel
        .countDocuments({ currentPeriodStart: { $gte: monthStart } })
        .lean()
        .exec();

      dauMau.push({ date: dateStr, ratio: mau > 0 ? Math.round((dau / mau) * 100) : 0 });
    }

    // Post engagement rate
    const postEngagementRate: Array<{ month: string; rate: number }> = [];
    for (let i = months - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const monthEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0);

      const posts = await this.postModel
        .find({ createdAt: { $gte: d, $lte: monthEnd } })
        .select('likeCount commentCount shareCount viewCount')
        .lean()
        .exec();

      if (posts.length === 0) {
        postEngagementRate.push({ month: monthStr, rate: 0 });
        continue;
      }

      const totalEngagement = posts.reduce(
        (sum, p: any) => sum + (p.likeCount || 0) + (p.commentCount || 0) + (p.shareCount || 0),
        0,
      );
      const avgEngagement = totalEngagement / posts.length;
      const avgViews = posts.reduce((sum, p: any) => sum + (p.viewCount || 0), 0) / posts.length;
      const rate = avgViews > 0 ? Math.round((avgEngagement / avgViews) * 10000) / 100 : 0;
      postEngagementRate.push({ month: monthStr, rate });
    }

    return { dauMau, postEngagementRate };
  }
}
