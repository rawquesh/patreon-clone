import { apiClient } from '@/lib/api-client';
import type { DashboardStats } from '@/types';

export async function getDashboardStats(
  months = 6,
): Promise<DashboardStats> {
  return apiClient.get<DashboardStats>('/admin/dashboard/stats', { months });
}
