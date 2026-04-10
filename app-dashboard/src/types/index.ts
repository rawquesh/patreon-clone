export type { Creator, CreatorStatus, CreatorDetail } from './creator';
export type { Member, MemberStatus, MemberDetail } from './member';
export type { Post, PostType, PostStatus, PostCreator, PostDetail } from './post';
export type { Subscription, SubscriptionStatus, SubscriptionDetail, SubscriptionStats } from './subscription';
export type { Payout, PayoutStatus, PayoutDetail, PayoutStats } from './payout';
export type { AnalyticsOverview, RevenueAnalytics, CreatorAnalytics, SubscriberAnalytics, ReportAnalytics, EngagementAnalytics } from './analytics';
export type { PlatformSetting } from './settings';
export type { AdminUser, AdminRole, AdminPermission } from './admin-user';
export type { Ban, BanType, BanStatus, BanStats } from './ban';
export type { AuditLog, AuditAction, AuditTargetType } from './audit-log';

export type PaginatedResponse<T> = {
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};

export type CreatorListResponse = {
  creators: import('./creator').Creator[];
} & PaginatedResponse<import('./creator').Creator>;

export type MemberListResponse = {
  members: import('./member').Member[];
} & PaginatedResponse<import('./member').Member>;

export type PostListResponse = {
  posts: import('./post').Post[];
} & PaginatedResponse<import('./post').Post>;

export type SubscriptionListResponse = {
  subscriptions: import('./subscription').Subscription[];
} & PaginatedResponse<import('./subscription').Subscription>;

export type PayoutListResponse = {
  payouts: import('./payout').Payout[];
} & PaginatedResponse<import('./payout').Payout>;

export type DashboardStats = {
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
  newSubscriptionsThisMonth: number;
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
};
