export type AnalyticsOverview = {
  mrr: number;
  mrrBreakdown: Array<{ tier: string; revenue: number; count: number }>;
  churnTrends: Array<{ month: string; rate: number }>;
  retentionCohorts: Array<{ cohort: string; month1: number; month3: number; month6: number }>;
  totalCreators: number;
  totalMembers: number;
  totalSubscriptions: number;
};

export type RevenueAnalytics = {
  daily: Array<{ date: string; amount: number }>;
  weekly: Array<{ week: string; amount: number }>;
  monthly: Array<{ month: string; amount: number }>;
  growthRate: number;
  projection: Array<{ month: string; projected: number }>;
};

export type CreatorAnalytics = {
  topByRevenue: Array<{
    id: string;
    displayName?: string;
    email?: string;
    creatorUsername?: string;
    profilePicture?: string;
    revenue: number;
    subscribers: number;
    posts: number;
  }>;
  topBySubscribers: Array<{
    id: string;
    displayName?: string;
    creatorUsername?: string;
    revenue: number;
    subscribers: number;
    posts: number;
  }>;
  earningsDistribution: Array<{ range: string; count: number }>;
  newCreatorsPerMonth: Array<{ month: string; count: number }>;
};

export type SubscriberAnalytics = {
  retentionRate: { month1: number; month3: number; month6: number };
  churnBreakdown: Array<{ reason: string; count: number }>;
  trialToPaidConversion: number;
  geoDistribution: Array<{ country: string; count: number }>;
};

export type ReportAnalytics = {
  volumeOverTime: Array<{ date: string; count: number }>;
  resolutionRate: number;
  commonReasons: Array<{ reason: string; count: number }>;
};

export type EngagementAnalytics = {
  dauMau: Array<{ date: string; ratio: number }>;
  postEngagementRate: Array<{ month: string; rate: number }>;
};
