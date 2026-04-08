import { apiClient } from '@/lib/api-client';
import type {
  Subscription,
  SubscriptionStats,
  SubscriptionListResponse,
} from '@/types';

export type SubscriptionListParams = {
  page?: number;
  limit?: number;
  search?: string;
  creatorId?: string;
  memberId?: string;
  status?: 'active' | 'cancelled' | 'expired';
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
};

export async function getSubscriptions(
  params: SubscriptionListParams = {},
): Promise<{
  subscriptions: Subscription[];
  pagination: SubscriptionListResponse['pagination'];
}> {
  const response = await apiClient.get<SubscriptionListResponse>(
    '/admin/subscriptions',
    params,
  );
  return {
    subscriptions: response.subscriptions.map((s) => ({
      ...s,
      plan: s.membership?.name || '',
      startDate: s.createdAt,
      nextBilling: s.currentPeriodEnd,
      amount: s.monthlyRate,
    })),
    pagination: response.pagination,
  };
}

export async function getSubscriptionById(id: string): Promise<Subscription> {
  const response = await apiClient.get<{ subscription: Subscription }>(
    `/admin/subscriptions/${id}`,
  );
  return response.subscription;
}

export async function cancelSubscription(
  id: string,
): Promise<{ message: string }> {
  return apiClient.post(`/admin/subscriptions/${id}/cancel`);
}

export async function getSubscriptionStats(): Promise<SubscriptionStats> {
  return apiClient.get<SubscriptionStats>('/admin/subscriptions/stats');
}
