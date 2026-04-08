import { Model } from 'mongoose';
import { MembershipInsight, EarningsInsight, PostInsight } from '@/database/schemas/analytics';
import { Membership } from '@/database/schemas/membership';
import { User } from '@/database/schemas/user';
import { Post } from '@/database/schemas/post';
import { Subscription } from '@/database/schemas/subscription';
import { PayoutRequest } from '@/database/schemas/payout';
import { PaymentsService } from '@/payments/payments.service';
import { PostsInsightsResponse } from './analytics.dto';
export declare class AnalyticsService {
    private membershipInsightModel;
    private earningsInsightModel;
    private postInsightModel;
    private userModel;
    private postModel;
    private membershipModel;
    private subscriptionModel;
    private payoutRequestModel;
    private paymentsService;
    constructor(membershipInsightModel: Model<MembershipInsight>, earningsInsightModel: Model<EarningsInsight>, postInsightModel: Model<PostInsight>, userModel: Model<User>, postModel: Model<Post>, membershipModel: Model<Membership>, subscriptionModel: Model<Subscription>, payoutRequestModel: Model<PayoutRequest>, paymentsService: PaymentsService);
    getMembershipInsights(userId: string, timeRange: string): Promise<{
        membershipData: Record<string, number>;
        tiers: {
            name: string;
            count: number;
        }[];
    }>;
    private getDateRangeAndInterval;
    private initializeMembershipData;
    private generateAccurateMembershipData;
    private initializeDataMap;
    getEarningsInsights(userId: string, timeRange: string): Promise<{
        totalEarnings: number;
        earningsData: Record<string, number>;
        tierBreakdown: any[];
        availablePayout: number;
        pendingBalance: number;
    }>;
    private initializePostDataMap;
    getPostsInsights(userId: string, timeRange: string): Promise<PostsInsightsResponse>;
    private getDateKey;
    private getDateRangeFromTimeRange;
    private getTimeLabels;
    private getMonthPeriods;
    private calculatePreviousPeriodEarnings;
    private calculateYearlyProjection;
    private calculateTierBreakdown;
    private calculateAvailableBalance;
    private fetchStripeMonthlyEarnings;
    private fetchStripePreviousPeriodEarnings;
    private generateDailyEarningsData;
    getTransactionDetails(userId: string, timeRange: string): Promise<{
        timeRange: string;
        totalEarnings: any;
        dailyTransactions: any[];
    }>;
    private groupTransactionsByDay;
    private fetchStripeTransactions;
    private generateTimeSeriesData;
    private groupSubscriptionsByMonth;
    private getMonthName;
}
