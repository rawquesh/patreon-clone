import { apiClient } from '@/lib/api-client';
import type { AdminUser } from '@/types/admin-user';

export type AdminListParams = {
  page?: number;
  limit?: number;
  search?: string;
};

export async function getAdmins(params: AdminListParams = {}): Promise<{
  admins: AdminUser[];
  pagination: { total: number; page: number; limit: number; totalPages: number };
}> {
  return apiClient.get('/admin/admins', params as Record<string, string | number | undefined>);
}

export async function updateAdmin(
  id: string,
  dto: { isAdmin: boolean },
): Promise<{ message: string }> {
  return apiClient.put(`/admin/admins/${id}`, dto);
}

export async function deleteAdmin(id: string): Promise<{ message: string }> {
  return apiClient.delete(`/admin/admins/${id}`);
}
