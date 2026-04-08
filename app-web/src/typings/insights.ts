export enum TimeRange {
  SEVEN_DAYS = "7d",
  FOURTEEN_DAYS = "14d",
  THIRTY_DAYS = "30d",
  NINETY_DAYS = "90d",
  ONE_EIGHTY_DAYS = "180d",
  THREE_MONTHS = "3m",
  SIX_MONTHS = "6m",
  ONE_YEAR = "1y",
  ALL_TIME = "all",
}

export enum EarningsFilter {
  ALL = "all",
  MEMBERSHIP = "membership",
  ONE_TIME = "oneTime",
}

export interface TierStats {
  name: string;
  count: number;
  growth: number;
}

interface Tier {
  name: string;
  count: number;
}

export interface MembershipInsightsResponse {
  membershipData: Record<string, number>;
  tiers: Tier[];
}

export interface TierBreakdown {
  name: string;
  amount: number;
  percentage: number;
}

export interface EarningsInsightsResponse {
  totalEarnings: number;
  earningsData: Record<string, number>;
  tierBreakdown: {
    name: string;
    amount: number;
  }[];
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
  topPerformingPosts: {
    id: string;
    title: string;
    impressions: number;
    engagements: number;
  }[];
  impressionData: Record<string, number>;
  engagementData: Record<string, number>;
}
