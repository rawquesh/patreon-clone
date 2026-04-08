export declare enum TimeRange {
    SEVEN_DAYS = "7d",
    FOURTEEN_DAYS = "14d",
    THIRTY_DAYS = "30d",
    NINETY_DAYS = "90d",
    ONE_EIGHTY_DAYS = "180d",
    THREE_MONTHS = "3m",
    SIX_MONTHS = "6m",
    ONE_YEAR = "1y",
    ALL_TIME = "all"
}
export declare enum EarningsFilter {
    ALL = "all",
    MEMBERSHIP = "membership"
}
export declare class MembershipInsightsDto {
    timeRange?: TimeRange;
}
export declare class EarningsInsightsDto {
    timeRange?: TimeRange;
    filter?: EarningsFilter;
}
export declare class TransactionDetailsDto {
    timeRange?: TimeRange;
}
export declare class PostsInsightsDto {
    timeRange?: TimeRange;
}
export interface TierStats {
    name: string;
    count: number;
    growth: number;
}
export interface MembershipInsightsResponse {
    activeMembers: number;
    activeGrowth: number;
    newMembers: number;
    upgradedMembers: number;
    cancelledMembers: number;
    membershipData: number[];
    tiers: TierStats[];
}
export interface TierBreakdown {
    name: string;
    amount: number;
    percentage: number;
}
export interface EarningsInsightsResponse {
    totalEarnings: number;
    growthPercentage: number;
    monthlyEarnings: number[];
    earningsData: number[];
    yearlyProjection: number;
    periods: string[];
    tierBreakdown: TierBreakdown[];
    availablePayout: number;
    pendingBalance: number;
}
export interface PostStats {
    id: string;
    title: string;
    impressions: number;
    engagements: number;
}
export interface PostsInsightsResponse {
    totalImpressions: number;
    totalEngagements: number;
    topPerformingPosts: PostStats[];
    impressionData: Record<string, number>;
    engagementData: Record<string, number>;
}
export interface StripeTransaction {
    id: string;
    amount: number;
    net: number;
    fee: number;
    date: string;
    description: string;
    customerName?: string;
    membershipTier?: string;
    status: string;
    type: string;
}
export interface DailyTransactions {
    date: string;
    total: number;
    transactions: StripeTransaction[];
}
export interface TransactionDetailsResponse {
    timeRange: string;
    totalEarnings: number;
    dailyTransactions: DailyTransactions[];
}
