import { apiClient } from '@/lib/api-client';
import type {
  AnalyticsOverview,
  RevenueAnalytics,
  CreatorAnalytics,
  SubscriberAnalytics,
  ReportAnalytics,
  EngagementAnalytics,
} from '@/types/analytics';

export type AnalyticsParams = {
  period?: 'daily' | 'weekly' | 'monthly';
  months?: number;
  startDate?: string;
  endDate?: string;
};

export async function getAnalyticsOverview(params: AnalyticsParams = {}): Promise<AnalyticsOverview> {
  return apiClient.get('/admin/analytics/overview', params as Record<string, string | number | undefined>);
}

export async function getRevenueAnalytics(params: AnalyticsParams = {}): Promise<RevenueAnalytics> {
  return apiClient.get('/admin/analytics/revenue', params as Record<string, string | number | undefined>);
}

export async function getCreatorAnalytics(params: AnalyticsParams = {}): Promise<CreatorAnalytics> {
  return apiClient.get('/admin/analytics/creators', params as Record<string, string | number | undefined>);
}

export async function getSubscriberAnalytics(params: AnalyticsParams = {}): Promise<SubscriberAnalytics> {
  return apiClient.get('/admin/analytics/subscribers', params as Record<string, string | number | undefined>);
}

export async function getReportAnalytics(params: AnalyticsParams = {}): Promise<ReportAnalytics> {
  return apiClient.get('/admin/analytics/reports', params as Record<string, string | number | undefined>);
}

export async function getEngagementAnalytics(params: AnalyticsParams = {}): Promise<EngagementAnalytics> {
  return apiClient.get('/admin/analytics/engagement', params as Record<string, string | number | undefined>);
}
