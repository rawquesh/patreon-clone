import { apiClient } from '@/lib/api-client';
import type { PlatformSetting } from '@/types/settings';

export async function getSettings(category?: string): Promise<PlatformSetting[]> {
  const params: Record<string, string> = {};
  if (category) params.category = category;
  return apiClient.get('/admin/settings', params);
}

export async function getSetting(key: string): Promise<PlatformSetting> {
  return apiClient.get(`/admin/settings/${key}`);
}

export async function updateSetting(
  key: string,
  dto: { value?: any; description?: string; isPublic?: boolean },
): Promise<PlatformSetting> {
  return apiClient.put(`/admin/settings/${key}`, dto);
}

export async function bulkUpdateSettings(
  updates: Array<{ key: string; value?: any }>,
): Promise<PlatformSetting[]> {
  return apiClient.put('/admin/settings/bulk', { updates });
}
