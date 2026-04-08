import { apiClient } from '@/lib/api-client';
import type { Payout, PayoutDetail, PayoutStats, PayoutListResponse } from '@/types';

export type PayoutListParams = {
  page?: number;
  limit?: number;
  status?: 'pending' | 'processing' | 'completed' | 'failed';
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
};

export async function getPayouts(
  params: PayoutListParams = {},
): Promise<{ payouts: Payout[]; pagination: PayoutListResponse['pagination'] }> {
  const response = await apiClient.get<PayoutListResponse>('/admin/payouts', params);
  return {
    payouts: response.payouts.map((p) => ({
      ...p,
      requestDate: p.createdAt,
      processedDate: p.completedAt,
      creator: {
        ...p.creator,
        name: p.creator?.name || 'Unknown',
        avatar: p.creator?.avatar || '',
      },
    })),
    pagination: response.pagination,
  };
}

export async function getPayoutById(id: string): Promise<PayoutDetail> {
  const response = await apiClient.get<{ payout: PayoutDetail }>(
    `/admin/payouts/${id}`,
  );
  return response.payout;
}

export async function approvePayout(
  id: string,
): Promise<{ message: string; payoutId: string }> {
  return apiClient.post(`/admin/payouts/${id}/approve`);
}

export async function rejectPayout(
  id: string,
  reason?: string,
): Promise<{ message: string }> {
  return apiClient.post(`/admin/payouts/${id}/reject`, { reason });
}

export async function getPayoutStats(): Promise<PayoutStats> {
  return apiClient.get<PayoutStats>('/admin/payouts/stats');
}
