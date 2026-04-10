import { apiClient } from '@/lib/api-client';
import type { Ban, BanType, BanStatus, BanStats } from '@/types/ban';

export type BanListParams = {
  page?: number;
  limit?: number;
  type?: BanType;
  status?: BanStatus;
  userId?: string;
};

export async function getBans(params: BanListParams = {}): Promise<{
  bans: Ban[];
  pagination: { total: number; page: number; limit: number; totalPages: number };
}> {
  return apiClient.get('/admin/bans', params as Record<string, string | number | undefined>);
}

export async function getBanStats(): Promise<BanStats> {
  return apiClient.get('/admin/bans/stats');
}

export async function getBanById(id: string): Promise<Ban> {
  const res = await apiClient.get<{ ban: Ban }>(`/admin/bans/${id}`);
  return res.ban;
}

export async function createBan(dto: {
  userId?: string;
  targetIdentifier?: string;
  type: BanType;
  reason: string;
  adminNotes?: string;
  expiresAt?: string;
}): Promise<{ message: string; ban: Ban }> {
  return apiClient.post('/admin/bans', dto);
}

export async function liftBan(
  id: string,
): Promise<{ message: string; banId: string }> {
  return apiClient.delete(`/admin/bans/${id}`);
}
