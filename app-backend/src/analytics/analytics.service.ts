/* eslint-disable prefer-const */
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  MembershipInsight,
  EarningsInsight,
  PostInsight,
} from '@/database/schemas/analytics';
import { Membership } from '@/database/schemas/membership';
import { User } from '@/database/schemas/user';
import { Post } from '@/database/schemas/post';
import { Subscription } from '@/database/schemas/subscription';
import { PayoutRequest } from '@/database/schemas/payout';
import { PaymentsService } from '@/payments/payments.service';
import Stripe from 'stripe';
import { PostsInsightsResponse, PostStats } from './analytics.dto';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectModel(MembershipInsight.name)
    private membershipInsightModel: Model<MembershipInsight>,
    @InjectModel(EarningsInsight.name)
    private earningsInsightModel: Model<EarningsInsight>,
    @InjectModel(PostInsight.name) private postInsightModel: Model<PostInsight>,
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Post.name) private postModel: Model<Post>,
    @InjectModel(Membership.name) private membershipModel: Model<Membership>,
    @InjectModel(Subscription.name)
    private subscriptionModel: Model<Subscription>,
    @InjectModel(PayoutRequest.name)
    private payoutRequestModel: Model<PayoutRequest>,
    private paymentsService: PaymentsService,
  ) {}

  async getMembershipInsights(userId: string, timeRange: string) {
    const creatorExists = await this.userModel.findById(userId).lean();
    if (!creatorExists) {
      throw new NotFoundException('Creator not found');
    }

    const { startDate, endDate, interval } =
      this.getDateRangeAndInterval(timeRange);

    const newSubscriptions = await this.subscriptionModel
      .find({
        creator: new Types.ObjectId(userId),
        createdAt: { $gte: startDate, $lte: endDate },
      })
      .populate({
        path: 'membership',
        select: 'name',
      })
      .lean();

    const membershipData = this.initializeMembershipData(
      startDate,
      endDate,
      interval,
    );
    const tierCounts = new Map<string, number>();

    for (const sub of newSubscriptions) {
      if (!sub.createdAt) continue;

      let key = '';
      const subDate = new Date(sub.createdAt);

      switch (interval) {
        case 'day':
          // Use local date parts to avoid timezone issues with toISOString()
          const year = subDate.getFullYear();
          const month = String(subDate.getMonth() + 1).padStart(2, '0');
          const day = String(subDate.getDate()).padStart(2, '0');
          key = `${year}-${month}-${day}`;
          break;
        case 'week':
          const monthName = subDate.toLocaleString('default', {
            month: 'long',
          });
          const weekOfMonth = Math.ceil(subDate.getDate() / 7);
          key = `${monthName} Week ${weekOfMonth}`;
          break;
        case 'month':
          key = subDate.toLocaleString('default', { month: 'long' });
          break;
      }

      if (key in membershipData) {
        membershipData[key]++;
      }

      const tierName = (sub.membership as any)?.name || 'Unknown Tier';
      tierCounts.set(tierName, (tierCounts.get(tierName) || 0) + 1);
    }

    const tiers = Array.from(tierCounts, ([name, count]) => ({ name, count }));

    return {
      membershipData,
      tiers,
    };
  }

  private getDateRangeAndInterval(timeRange: string): {
    startDate: Date;
    endDate: Date;
    interval: 'day' | 'week' | 'month';
  } {
    const endDate = new Date();
    let startDate = new Date();
    let interval: 'day' | 'week' | 'month' = 'day';

    endDate.setHours(23, 59, 59, 999);

    let daysToSubtract = 30;

    switch (timeRange) {
      case '7d':
        daysToSubtract = 7;
        interval = 'day';
        break;
      case '30d':
        daysToSubtract = 30;
        interval = 'day';
        break;
      case '90d':
        daysToSubtract = 90;
        interval = 'week';
        break;
      case '180d':
        daysToSubtract = 180;
        interval = 'month';
        break;
      case '365d':
      case '1y':
        daysToSubtract = 365;
        interval = 'month';
        break;
      case 'all':
        daysToSubtract = 365; // Default to 1 year for 'all'
        interval = 'month';
        break;
      default: // Default to 30d
        daysToSubtract = 30;
        interval = 'day';
        break;
    }

    startDate.setDate(endDate.getDate() - (daysToSubtract - 1));
    startDate.setHours(0, 0, 0, 0);

    return { startDate, endDate, interval };
  }

  private initializeMembershipData(
    startDate: Date,
    endDate: Date,
    interval: 'day' | 'week' | 'month',
  ): Record<string, number> {
    const data: Record<string, number> = {};
    let currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      let key = '';
      switch (interval) {
        case 'day':
          const year = currentDate.getFullYear();
          const month = String(currentDate.getMonth() + 1).padStart(2, '0');
          const day = String(currentDate.getDate()).padStart(2, '0');
          key = `${year}-${month}-${day}`;
          data[key] = 0;
          break;
        case 'week':
          const monthName = currentDate.toLocaleString('default', {
            month: 'long',
          });
          const weekOfMonth = Math.ceil(currentDate.getDate() / 7);
          key = `${monthName} Week ${weekOfMonth}`;
          data[key] = 0;
          break;
        case 'month':
          key = currentDate.toLocaleString('default', { month: 'long' });
          data[key] = 0;
          break;
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }
    return data;
  }

  private async generateAccurateMembershipData(
    userId: string,
    labels: string[],
    startDate: Date,
  ): Promise<number[]> {
    const daysInPeriod = labels.length;
    // Initialize all days with 0 new subscriptions
    const data: number[] = new Array(daysInPeriod).fill(0);

    console.log(
      `DEBUG: Generating accurate membership data with ${daysInPeriod} days`,
    );

    // Get all subscriptions for this creator
    const allSubscriptions = await this.subscriptionModel.find({
      creator: new Types.ObjectId(userId),
      createdAt: { $gte: startDate }, // Only consider subscriptions created during the period
    });

    console.log(
      `DEBUG: Found ${allSubscriptions.length} total subscriptions to analyze in period`,
    );

    // For each day in the time range, count new subscriptions created on that day
    for (let i = 0; i < daysInPeriod; i++) {
      // Calculate the date for this day
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i);
      currentDate.setHours(0, 0, 0, 0);

      // Calculate end of the day
      const endOfDay = new Date(currentDate);
      endOfDay.setHours(23, 59, 59, 999);

      // Count subscriptions created on this specific day
      const createdOnThisDay = allSubscriptions.filter((subscription) => {
        const createdAt = new Date(subscription.createdAt);
        return createdAt >= currentDate && createdAt <= endOfDay;
      }).length;

      data[i] = createdOnThisDay;
    }

    console.log(`DEBUG: Daily new subscription data: ${JSON.stringify(data)}`);
    return data;
  }

  private initializeDataMap(
    startDate: Date,
    endDate: Date,
    interval: 'day' | 'week' | 'month',
  ): Record<string, number> {
    const data: Record<string, number> = {};
    let currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      let key = '';
      switch (interval) {
        case 'day':
          const year = currentDate.getFullYear();
          const month = String(currentDate.getMonth() + 1).padStart(2, '0');
          const day = String(currentDate.getDate()).padStart(2, '0');
          key = `${year}-${month}-${day}`;
          data[key] = 0;
          break;
        case 'week':
          const monthName = currentDate.toLocaleString('default', {
            month: 'long',
          });
          const weekOfMonth = Math.ceil(currentDate.getDate() / 7);
          key = `${monthName} Week ${weekOfMonth}`;
          data[key] = 0;
          break;
        case 'month':
          key = currentDate.toLocaleString('default', { month: 'long' });
          data[key] = 0;
          break;
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }
    return data;
  }

  async getEarningsInsights(userId: string, timeRange: string) {
    const creator = await this.userModel.findById(userId).lean();
    if (!creator) {
      throw new NotFoundException('Creator not found');
    }
    if (!creator.stripeConnectAccountId) {
      throw new NotFoundException('Creator has not connected to Stripe yet');
    }

    const { startDate, endDate, interval } =
      this.getDateRangeAndInterval(timeRange);

    const allCharges: Stripe.Charge[] = [];
    let hasMore = true;
    let startingAfter: string | undefined = undefined;

    while (hasMore) {
      const charges: Stripe.ApiList<Stripe.Charge> =
        await this.paymentsService.stripe.charges.list(
          {
            limit: 100,
            created: {
              gte: Math.floor(startDate.getTime() / 1000),
              lte: Math.floor(endDate.getTime() / 1000),
            },
            starting_after: startingAfter,
          },
          {
            stripeAccount: creator.stripeConnectAccountId,
          },
        );

      allCharges.push(...charges.data);
      hasMore = charges.has_more;
      if (hasMore) {
        startingAfter = charges.data[charges.data.length - 1].id;
      }
    }

    const successfulCharges = allCharges.filter(
      (charge) => charge.paid && !charge.refunded,
    );

    const earningsData = this.initializeDataMap(startDate, endDate, interval);

    for (const charge of successfulCharges) {
      const transactionDate = new Date(charge.created * 1000);
      let key = '';

      switch (interval) {
        case 'day':
          const year = transactionDate.getFullYear();
          const month = String(transactionDate.getMonth() + 1).padStart(2, '0');
          const day = String(transactionDate.getDate()).padStart(2, '0');
          key = `${year}-${month}-${day}`;
          break;
        case 'week':
          const monthName = transactionDate.toLocaleString('default', {
            month: 'long',
          });
          const weekOfMonth = Math.ceil(transactionDate.getDate() / 7);
          key = `${monthName} Week ${weekOfMonth}`;
          break;
        case 'month':
          key = transactionDate.toLocaleString('default', { month: 'long' });
          break;
      }

      if (key in earningsData) {
        earningsData[key] += charge.amount / 100;
      }
    }

    const totalEarnings = Object.values(earningsData).reduce(
      (sum, amount) => sum + amount,
      0,
    );

    const activeSubscriptions = await this.subscriptionModel
      .find({
        creator: new Types.ObjectId(userId),
        status: 'active',
      })
      .populate('membership');

    const tierBreakdown = activeSubscriptions.reduce((acc, sub) => {
      const tierName = (sub.membership as Membership)?.name || 'Unknown Tier';
      const tierAmount = (sub.membership as Membership)?.monthlyRate || 0;
      const existingTier = acc.find((t) => t.name === tierName);
      if (existingTier) {
        existingTier.amount += tierAmount;
      } else {
        acc.push({ name: tierName, amount: tierAmount });
      }
      return acc;
    }, []);

    const { available: availablePayout, pending: pendingBalance } =
      await this.paymentsService.getPayoutBalance(userId);

    return {
      totalEarnings,
      earningsData,
      tierBreakdown,
      availablePayout,
      pendingBalance,
    };
  }

  private initializePostDataMap(
    startDate: Date,
    endDate: Date,
    interval: 'day' | 'week' | 'month',
  ): Record<string, number> {
    const data: Record<string, number> = {};
    let currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      let key = '';
      switch (interval) {
        case 'day':
          const year = currentDate.getFullYear();
          const month = String(currentDate.getMonth() + 1).padStart(2, '0');
          const day = String(currentDate.getDate()).padStart(2, '0');
          key = `${year}-${month}-${day}`;
          data[key] = 0;
          break;
        case 'week':
          const monthName = currentDate.toLocaleString('default', {
            month: 'long',
          });
          const weekOfMonth = Math.ceil(currentDate.getDate() / 7);
          key = `${monthName} Week ${weekOfMonth}`;
          data[key] = 0;
          break;
        case 'month':
          key = currentDate.toLocaleString('default', { month: 'long' });
          data[key] = 0;
          break;
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }
    return data;
  }

  async getPostsInsights(
    userId: string,
    timeRange: string,
  ): Promise<PostsInsightsResponse> {
    const creator = await this.userModel.findById(userId).lean();
    if (!creator) {
      throw new NotFoundException('Creator not found');
    }

    const { startDate, endDate, interval } =
      this.getDateRangeAndInterval(timeRange);

    const allPosts = await this.postModel
      .find({ creator: new Types.ObjectId(userId) })
      .lean();

    const impressionData = this.initializePostDataMap(
      startDate,
      endDate,
      interval,
    );
    const engagementData = this.initializePostDataMap(
      startDate,
      endDate,
      interval,
    );
    const postPerformance: Record<string, PostStats> = {};

    for (const post of allPosts) {
      const postId = post._id.toString();
      postPerformance[postId] = {
        id: postId,
        title: post.title || 'Untitled Post',
        impressions: post.viewCount || 0,
        engagements: 0,
      };
    }

    for (const post of allPosts) {
      const postId = post._id.toString();
      const postCreationDate = new Date(post.createdAt);
      if (postCreationDate >= startDate && postCreationDate <= endDate) {
        const impressionKey = this.getDateKey(postCreationDate, interval);
        if (impressionKey in impressionData) {
          impressionData[impressionKey] += post.viewCount || 0;
        }
      }

      const engagements = [...(post.likes || []), ...(post.comments || [])];
      for (const engagement of engagements) {
        const engagementDate = new Date(engagement.createdAt);
        if (engagementDate >= startDate && engagementDate <= endDate) {
          const engagementKey = this.getDateKey(engagementDate, interval);
          if (engagementKey in engagementData) {
            engagementData[engagementKey]++;
          }
          if (postPerformance[postId]) {
            postPerformance[postId].engagements++;
          }
        }
      }
    }

    const totalImpressions = Object.values(impressionData).reduce(
      (sum, count) => sum + count,
      0,
    );
    const totalEngagements = Object.values(engagementData).reduce(
      (sum, count) => sum + count,
      0,
    );

    const topPerformingPosts = Object.values(postPerformance)
      .sort((a, b) => b.impressions - a.impressions)
      .slice(0, 5);

    return {
      totalImpressions,
      totalEngagements,
      topPerformingPosts,
      impressionData,
      engagementData,
    };
  }

  private getDateKey(date: Date, interval: 'day' | 'week' | 'month'): string {
    let key = '';
    switch (interval) {
      case 'day':
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
        break;
      case 'week':
        const monthName = date.toLocaleString('default', { month: 'long' });
        const weekOfMonth = Math.ceil(date.getDate() / 7);
        key = `${monthName} Week ${weekOfMonth}`;
        break;
      case 'month':
        key = date.toLocaleString('default', { month: 'long' });
        break;
    }
    return key;
  }

  private getDateRangeFromTimeRange(timeRange: string) {
    const now = new Date();
    const endDate = new Date(now);
    let startDate = new Date(now);
    let previousStartDate, previousEndDate;
    let labels = [];
    let periods = [];

    switch (timeRange) {
      case '7d':
        startDate.setDate(startDate.getDate() - 7);
        previousStartDate = new Date(startDate);
        previousStartDate.setDate(previousStartDate.getDate() - 7);
        previousEndDate = new Date(startDate);
        previousEndDate.setDate(previousEndDate.getDate() - 1);
        labels = this.getTimeLabels('7d');
        break;

      case '14d':
        startDate.setDate(startDate.getDate() - 14);
        previousStartDate = new Date(startDate);
        previousStartDate.setDate(previousStartDate.getDate() - 14);
        previousEndDate = new Date(startDate);
        previousEndDate.setDate(previousEndDate.getDate() - 1);
        labels = this.getTimeLabels('14d');
        break;

      // case '30d':
      case '30d':
        startDate.setDate(startDate.getDate() - 30);
        previousStartDate = new Date(startDate);
        previousStartDate.setDate(previousStartDate.getDate() - 30);
        previousEndDate = new Date(startDate);
        previousEndDate.setDate(previousEndDate.getDate() - 1);
        labels = this.getTimeLabels('30d');

        // For '30d', also set periods for monthly view
        // This ensures that both daily and monthly data can be generated
        const oneMonthAgo = new Date(now);
        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
        const currentMonth = `${this.getMonthName(now.getMonth())} ${now.getFullYear()}`;
        const previousMonth = `${this.getMonthName(oneMonthAgo.getMonth())} ${oneMonthAgo.getFullYear()}`;
        periods = [previousMonth, currentMonth];
        break;

      // case '90d':
      case '90d':
        startDate.setMonth(startDate.getMonth() - 3);
        previousStartDate = new Date(startDate);
        previousStartDate.setMonth(previousStartDate.getMonth() - 3);
        previousEndDate = new Date(startDate);
        previousEndDate.setDate(previousEndDate.getDate() - 1);
        periods = this.getMonthPeriods('3m');
        break;

      // case '180d':
      case '180d':
        startDate.setMonth(startDate.getMonth() - 6);
        previousStartDate = new Date(startDate);
        previousStartDate.setMonth(previousStartDate.getMonth() - 6);
        previousEndDate = new Date(startDate);
        previousEndDate.setDate(previousEndDate.getDate() - 1);
        periods = this.getMonthPeriods('6m');
        break;

      case '365d':
      case '1y':
        startDate.setFullYear(startDate.getFullYear() - 1);
        previousStartDate = new Date(startDate);
        previousStartDate.setFullYear(previousStartDate.getFullYear() - 1);
        previousEndDate = new Date(startDate);
        previousEndDate.setDate(previousEndDate.getDate() - 1);
        periods = this.getMonthPeriods('1y');
        break;

      case 'all':
        startDate = new Date(0);
        previousStartDate = new Date(0);
        previousEndDate = new Date(0);
        periods = this.getMonthPeriods('all');
        break;

      default:
        startDate.setDate(startDate.getDate() - 30);
        previousStartDate = new Date(startDate);
        previousStartDate.setDate(previousStartDate.getDate() - 30);
        previousEndDate = new Date(startDate);
        previousEndDate.setDate(previousEndDate.getDate() - 1);
        labels = this.getTimeLabels('30d');

        // Same as the '30d' case
        const defaultOneMonthAgo = new Date(now);
        defaultOneMonthAgo.setMonth(defaultOneMonthAgo.getMonth() - 1);
        const defaultCurrentMonth = `${this.getMonthName(now.getMonth())} ${now.getFullYear()}`;
        const defaultPreviousMonth = `${this.getMonthName(defaultOneMonthAgo.getMonth())} ${defaultOneMonthAgo.getFullYear()}`;
        periods = [defaultPreviousMonth, defaultCurrentMonth];
        break;
    }

    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);

    if (previousStartDate) {
      previousStartDate.setHours(0, 0, 0, 0);
    }

    if (previousEndDate) {
      previousEndDate.setHours(23, 59, 59, 999);
    }

    return {
      startDate,
      endDate,
      previousStartDate,
      previousEndDate,
      labels,
      periods,
    };
  }

  private getTimeLabels(timeRange: string): string[] {
    const now = new Date();
    const labels: string[] = [];
    let daysToShow = 30;

    switch (timeRange) {
      case '7d':
        daysToShow = 7;
        break;
      case '14d':
        daysToShow = 14;
        break;
      case '30d':
        daysToShow = 30;
        break;
      case '90d':
        daysToShow = 90;
        break;
    }

    // Use consistent date format for all timeframes
    for (let i = daysToShow - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      labels.push(`${date.getMonth() + 1}/${date.getDate()}`);
    }

    return labels;
  }

  private getMonthPeriods(timeRange: string): string[] {
    const now = new Date();
    const periods: string[] = [];
    let monthsToShow = 6;

    switch (timeRange) {
      case '3m':
        monthsToShow = 3;
        break;
      case '6m':
        monthsToShow = 6;
        break;
      case '1y':
        monthsToShow = 12;
        break;
      case 'all':
        monthsToShow = 24;
        break;
    }

    const monthNames = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];

    for (let i = monthsToShow - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setMonth(date.getMonth() - i);
      periods.push(`${monthNames[date.getMonth()]} ${date.getFullYear()}`);
    }

    return periods;
  }

  private calculatePreviousPeriodEarnings(
    subscriptionsByMonth: Record<string, any>,
    previousStartDate: Date,
    previousEndDate: Date,
  ): number {
    const monthNames = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];

    let totalEarnings = 0;

    const currentStart = new Date(previousStartDate);
    const currentEnd = new Date(previousEndDate);

    while (currentStart <= currentEnd) {
      const month = monthNames[currentStart.getMonth()];
      const year = currentStart.getFullYear();
      const key = `${month} ${year}`;

      if (subscriptionsByMonth[key]) {
        totalEarnings += subscriptionsByMonth[key].earnings;
      }

      currentStart.setMonth(currentStart.getMonth() + 1);
    }

    return totalEarnings;
  }

  private calculateYearlyProjection(monthlyEarnings: number[]): number {
    if (monthlyEarnings.length === 0) return 0;

    const avgMonthlyEarnings =
      monthlyEarnings.reduce((sum, earnings) => sum + earnings, 0) /
      monthlyEarnings.length;

    return Math.round(avgMonthlyEarnings * 12);
  }

  private calculateTierBreakdown(subscriptions: Subscription[]): any[] {
    const tierMap = {};

    subscriptions.forEach((sub) => {
      if (!sub.membership) return;

      const tierName = (sub.membership as any).name || 'Unknown Tier';
      if (!tierMap[tierName]) {
        tierMap[tierName] = {
          name: tierName,
          amount: 0,
          percentage: 0,
        };
      }

      if (sub.status === 'active') {
        tierMap[tierName].amount += sub.monthlyRate;
      }
    });

    // We'll calculate percentages in the main method
    // based on final total earnings

    return Object.values(tierMap);
  }

  private async calculateAvailableBalance(
    userId: string,
  ): Promise<{ availablePayout: number; pendingBalance: number }> {
    const user = await this.userModel.findById(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      availablePayout: user.availableBalance || 0,
      pendingBalance: user.pendingBalance || 0,
    };
  }

  // New method to fetch monthly earnings from Stripe
  private async fetchStripeMonthlyEarnings(
    stripeAccountId: string,
    periods: string[],
  ): Promise<number[]> {
    const monthlyEarnings: number[] = [];
    const stripe = this.paymentsService.stripe;

    console.log('STRIPE MONTHLY EARNINGS - Periods:', periods);

    for (const period of periods) {
      const [month, year] = period.split(' ');
      console.log(
        `Processing period: ${period}, parsed as month=${month}, year=${year}`,
      );

      // Parse the month name to get the month number (0-11)
      const monthNames = [
        'Jan',
        'Feb',
        'Mar',
        'Apr',
        'May',
        'Jun',
        'Jul',
        'Aug',
        'Sep',
        'Oct',
        'Nov',
        'Dec',
      ];
      const monthIndex = monthNames.indexOf(month);

      if (monthIndex === -1) {
        // Skip invalid month names
        console.error(`Invalid month name: ${month}`);
        monthlyEarnings.push(0);
        continue;
      }

      // Make sure year is correctly parsed as a number
      const yearNum = parseInt(year, 10);
      if (isNaN(yearNum)) {
        console.error(`Invalid year: ${year}`);
        monthlyEarnings.push(0);
        continue;
      }

      // Create start date and end date for the period
      const startDate = new Date(yearNum, monthIndex, 1);
      const endDate = new Date(yearNum, monthIndex + 1, 0, 23, 59, 59, 999);

      // Convert to UNIX timestamps for Stripe API
      const startTimestamp = Math.floor(startDate.getTime() / 1000);
      const endTimestamp = Math.floor(endDate.getTime() / 1000);

      try {
        // Fetch balance transactions for the period - try without type filter
        const balanceTransactions = await stripe.balanceTransactions.list(
          {
            limit: 100,
            created: {
              gte: startTimestamp,
              lte: endTimestamp,
            },
            // Remove specific type filter to see all transaction types
            expand: ['data.source'],
          },
          {
            stripeAccount: stripeAccountId,
          },
        );

        console.log(
          JSON.stringify({
            bal: balanceTransactions.data,
            gte: startTimestamp,
            lte: endTimestamp,
            startDate: startDate,
            endDate: endDate,
          }),
        );

        // If we got data, log the transaction types to determine which ones to include
        if (balanceTransactions.data.length > 0) {
          const typesCounts = {};
          balanceTransactions.data.forEach((transaction) => {
            if (!typesCounts[transaction.type]) {
              typesCounts[transaction.type] = 0;
            }
            typesCounts[transaction.type]++;
          });
          console.log(`Transaction types in this period:`, typesCounts);
        }

        // Sum up the net amount for the period - only include transaction types that represent income
        const periodEarnings = balanceTransactions.data
          .filter((transaction) =>
            // Include transaction types that represent income
            ['charge', 'payment'].includes(transaction.type),
          )
          .reduce(
            (sum, transaction) => sum + transaction.net / 100, // Convert from cents to dollars
            0,
          );

        monthlyEarnings.push(parseFloat(periodEarnings.toFixed(2)));
        console.log(`Period ${period} earnings: ${periodEarnings.toFixed(2)}`);
      } catch (error) {
        console.error(`Error fetching earnings for ${period}:`, error);
        // If there's an error, use zero or try to estimate from existing data
        if (monthlyEarnings.length > 0) {
          // Use average of existing earnings as an estimate
          const avgEarnings =
            monthlyEarnings.reduce((sum, earnings) => sum + earnings, 0) /
            monthlyEarnings.length;
          monthlyEarnings.push(parseFloat(avgEarnings.toFixed(2)));
        } else {
          monthlyEarnings.push(0);
        }
      }
    }

    return monthlyEarnings;
  }

  private async fetchStripePreviousPeriodEarnings(
    stripeAccountId: string,
    previousStartDate: Date,
    previousEndDate: Date,
  ): Promise<number> {
    const stripe = this.paymentsService.stripe;

    // Ensure we're working with proper Date objects
    const startDate = new Date(previousStartDate);
    const endDate = new Date(previousEndDate);

    console.log(
      `Previous period date range: ${startDate.toISOString()} to ${endDate.toISOString()}`,
    );

    // Convert to UNIX timestamps for Stripe API
    const startTimestamp = Math.floor(startDate.getTime() / 1000);
    const endTimestamp = Math.floor(endDate.getTime() / 1000);

    try {
      // Fetch balance transactions for the period - remove type filter to see all transactions
      const balanceTransactions = await stripe.balanceTransactions.list(
        {
          limit: 100,
          created: {
            gte: startTimestamp,
            lte: endTimestamp,
          },
          // Remove type filter to get all transactions
        },
        {
          stripeAccount: stripeAccountId,
        },
      );

      console.log(
        `Found ${balanceTransactions.data.length} transactions for previous period`,
      );

      // Log transaction types if any found
      if (balanceTransactions.data.length > 0) {
        const typesCounts = {};
        balanceTransactions.data.forEach((transaction) => {
          if (!typesCounts[transaction.type]) {
            typesCounts[transaction.type] = 0;
          }
          typesCounts[transaction.type]++;
        });
        console.log(`Transaction types in previous period:`, typesCounts);
      }

      // Sum up the net amount for the period - only include income transaction types
      const totalEarnings = balanceTransactions.data
        .filter((transaction) =>
          // Include transaction types that represent income
          ['charge', 'payment'].includes(transaction.type),
        )
        .reduce(
          (sum, transaction) => sum + transaction.net / 100, // Convert from cents to dollars
          0,
        );

      return parseFloat(totalEarnings.toFixed(2));
    } catch (error) {
      console.error('Error fetching previous period earnings:', error);
      return 0;
    }
  }

  // New method to generate daily earnings data from Stripe
  private async generateDailyEarningsData(
    stripeAccountId: string,
    startDate: Date,
    endDate: Date,
    labels: string[],
  ): Promise<number[]> {
    const daysInPeriod = labels.length;
    // Initialize all days with 0 earnings
    const data: number[] = new Array(daysInPeriod).fill(0);
    const stripe = this.paymentsService.stripe;

    // Ensure we're working with proper Date objects
    const start = new Date(startDate);
    const end = new Date(endDate);

    console.log(
      `Generating daily earnings data with ${daysInPeriod} days, from ${start.toISOString()} to ${end.toISOString()}`,
    );

    try {
      // Fetch balance transactions for the entire period
      const startTimestamp = Math.floor(start.getTime() / 1000);
      const endTimestamp = Math.floor(end.getTime() / 1000);

      // Removing type filter to see all transaction types
      const balanceTransactions = await stripe.balanceTransactions.list(
        {
          limit: 100,
          created: {
            gte: startTimestamp,
            lte: endTimestamp,
          },
          // Remove specific type filter to see all transaction types
        },
        {
          stripeAccount: stripeAccountId,
        },
      );

      console.log(
        `Found ${balanceTransactions.data.length} transactions for daily earnings`,
      );

      // Log transaction types if any found
      if (balanceTransactions.data.length > 0) {
        const typesCounts = {};
        balanceTransactions.data.forEach((transaction) => {
          if (!typesCounts[transaction.type]) {
            typesCounts[transaction.type] = 0;
          }
          typesCounts[transaction.type]++;
        });
        console.log(`Transaction types in daily period:`, typesCounts);
      }

      // Filter for income transactions and store with date
      const transactionsWithDate: Array<{ date: Date; amount: number }> = [];

      balanceTransactions.data
        .filter((transaction) =>
          // Include transaction types that represent income
          ['charge', 'payment'].includes(transaction.type),
        )
        .forEach((transaction) => {
          const transactionDate = new Date(transaction.created * 1000);
          console.log(
            `Transaction: ${transaction.id}, type: ${transaction.type}, date: ${transactionDate.toISOString()}, amount: ${transaction.net / 100}`,
          );
          transactionsWithDate.push({
            date: transactionDate,
            amount: transaction.net / 100, // Convert from cents to dollars
          });
        });

      // For each day in the time range, calculate earnings on that specific day
      for (let i = 0; i < daysInPeriod; i++) {
        // Calculate the date for this day
        const currentDate = new Date(start);
        currentDate.setDate(start.getDate() + i);
        currentDate.setHours(0, 0, 0, 0);

        // Calculate end of the day
        const endOfDay = new Date(currentDate);
        endOfDay.setHours(23, 59, 59, 999);

        // Sum up transactions that occurred on this specific day
        const earningsOnThisDay = transactionsWithDate
          .filter((item) => item.date >= currentDate && item.date <= endOfDay)
          .reduce((sum, item) => sum + item.amount, 0);

        data[i] = parseFloat(earningsOnThisDay.toFixed(2));
      }

      console.log(`Final daily earnings data: ${JSON.stringify(data)}`);
      return data;
    } catch (error) {
      console.error('Error generating daily earnings data:', error);
      // Return an array of zeros if there's an error
      return new Array(daysInPeriod).fill(0);
    }
  }

  async getTransactionDetails(userId: string, timeRange: string) {
    const creator = await this.userModel.findById(userId);
    if (!creator) {
      throw new NotFoundException('Creator not found');
    }

    if (!creator.stripeConnectAccountId) {
      throw new NotFoundException('Creator has not connected to Stripe yet');
    }

    const { startDate, endDate } = this.getDateRangeFromTimeRange(timeRange);

    // Fetch transactions from Stripe
    const transactions = await this.fetchStripeTransactions(
      creator.stripeConnectAccountId,
      startDate,
      endDate,
    );

    // Group transactions by day
    const dailyTransactions = this.groupTransactionsByDay(transactions);

    // Calculate total earnings
    const totalEarnings = dailyTransactions.reduce(
      (sum, day) => sum + day.total,
      0,
    );

    return {
      timeRange,
      totalEarnings,
      dailyTransactions,
    };
  }

  private groupTransactionsByDay(transactions: any[]) {
    // Group transactions by day
    const transactionsByDay: Record<string, any> = {};

    transactions.forEach((transaction) => {
      const date = new Date(transaction.date);
      const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

      if (!transactionsByDay[dateKey]) {
        transactionsByDay[dateKey] = {
          date: dateKey,
          total: 0,
          transactions: [],
        };
      }

      transactionsByDay[dateKey].transactions.push(transaction);
      transactionsByDay[dateKey].total += transaction.net;
    });

    // Convert to array and sort by date (newest first)
    return Object.values(transactionsByDay).sort(
      (a: any, b: any) =>
        new Date(b.date).getTime() - new Date(a.date).getTime(),
    );
  }

  private async fetchStripeTransactions(
    stripeAccountId: string,
    startDate: Date,
    endDate: Date,
  ) {
    const stripe = this.paymentsService.stripe;

    // Convert to UNIX timestamps for Stripe API
    const startTimestamp = Math.floor(startDate.getTime() / 1000);
    const endTimestamp = Math.floor(endDate.getTime() / 1000);

    try {
      // Fetch balance transactions from Stripe
      const balanceTransactions = await stripe.balanceTransactions.list(
        {
          limit: 100,
          created: {
            gte: startTimestamp,
            lte: endTimestamp,
          },
          expand: ['data.source'],
        },
        {
          stripeAccount: stripeAccountId,
        },
      );

      // Transform to our format
      const transactions = [];

      for (const transaction of balanceTransactions.data) {
        // Try to get customer information from the charge object
        let customerName = 'Unknown Customer';
        let membershipTier = 'Unknown Tier';

        if (
          transaction.source &&
          typeof transaction.source === 'object' &&
          'object' in transaction.source
        ) {
          const charge = transaction.source as any;

          if (charge.metadata && charge.metadata.subscriberId) {
            // Look up subscriber info
            try {
              const subscriber = await this.userModel.findById(
                charge.metadata.subscriberId,
              );
              if (subscriber) {
                // Get display name from user - avoid type issues by using string property access
                customerName =
                  subscriber['fullName'] || subscriber['username'] || 'Unknown';
              }
            } catch (error) {
              console.error('Error fetching subscriber info:', error);
            }

            // Look up membership tier info if available
            if (charge.metadata.membershipId) {
              try {
                const membership = await this.membershipModel.findById(
                  charge.metadata.membershipId,
                );
                if (membership) {
                  membershipTier = membership['name'] || 'Unknown Tier';
                }
              } catch (error) {
                console.error('Error fetching membership info:', error);
              }
            }
          }
        }

        transactions.push({
          id: transaction.id,
          amount: transaction.amount / 100, // Convert from cents to dollars
          net: transaction.net / 100, // Convert from cents to dollars
          fee: transaction.fee / 100, // Convert from cents to dollars
          date: new Date(transaction.created * 1000).toISOString(),
          description: transaction.description || 'Stripe transaction',
          customerName,
          membershipTier,
          status: transaction.status,
          type: transaction.type,
        });
      }

      return transactions;
    } catch (error) {
      console.error('Error fetching transactions from Stripe:', error);
      return [];
    }
  }

  // Helper method to generate time series data for any metric
  private generateTimeSeriesData(
    insights: any[],
    labels: string[],
    metricName: string,
  ): number[] {
    const data: number[] = [];
    const metricsByDate: Record<string, number> = {};

    // Log labels for debugging
    console.log('Labels:', labels);

    // Group metrics by date
    insights.forEach((insight) => {
      const date = new Date(insight.date);

      // Create both possible date key formats to ensure matching
      const simpleFormat = `${date.getMonth() + 1}/${date.getDate()}`;
      const monthNames = [
        'Jan',
        'Feb',
        'Mar',
        'Apr',
        'May',
        'Jun',
        'Jul',
        'Aug',
        'Sep',
        'Oct',
        'Nov',
        'Dec',
      ];
      const fancyFormat = `${monthNames[date.getMonth()]} ${date.getDate()}`;

      // Store the metric value using both formats as keys to ensure we match
      if (!metricsByDate[simpleFormat]) {
        metricsByDate[simpleFormat] = 0;
      }
      metricsByDate[simpleFormat] += insight[metricName] || 0;

      if (!metricsByDate[fancyFormat]) {
        metricsByDate[fancyFormat] = 0;
      }
      metricsByDate[fancyFormat] += insight[metricName] || 0;

      // Log insight date and corresponding key for debugging
      console.log(
        'Insight date:',
        insight.date,
        'DateKey (simple):',
        simpleFormat,
        'DateKey (fancy):',
        fancyFormat,
        'Value:',
        insight[metricName],
      );
    });

    // Log all metrics by date for debugging
    console.log('MetricsByDate:', metricsByDate);

    // Generate the data array in the correct order based on labels
    for (const label of labels) {
      if (label && metricsByDate[label]) {
        data.push(metricsByDate[label]);
      } else {
        // If no data for this date or empty label, use 0
        data.push(0);
      }
    }

    return data;
  }

  private groupSubscriptionsByMonth(
    subscriptions: Subscription[],
  ): Record<string, any> {
    const monthNames = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];

    const result = {};

    subscriptions.forEach((sub) => {
      const date = new Date(sub.createdAt);
      const month = monthNames[date.getMonth()];
      const year = date.getFullYear();
      const key = `${month} ${year}`;

      if (!result[key]) {
        result[key] = {
          subscriptions: 0,
          earnings: 0,
        };
      }

      if (sub.status === 'active') {
        const monthlyRate = sub.monthlyRate;
        result[key].subscriptions += 1;
        result[key].earnings += monthlyRate;
      }
    });

    return result;
  }

  // Helper method to get month name
  private getMonthName(monthIndex: number): string {
    const monthNames = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];
    return monthNames[monthIndex];
  }
}
