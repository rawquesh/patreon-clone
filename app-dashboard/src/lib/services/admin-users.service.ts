import { apiClient } from '@/lib/api-client';
import type { AdminUser, AdminRole, AdminPermission } from '@/types/admin-user';

export type AdminListParams = {
  page?: number;
  limit?: number;
  role?: AdminRole;
  isActive?: boolean;
  search?: string;
};

export async function getAdmins(params: AdminListParams = {}): Promise<{
  admins: AdminUser[];
  pagination: { total: number; page: number; limit: number; totalPages: number };
}> {
  return apiClient.get('/admin/admins', params as Record<string, string | number | undefined>);
}

export async function getAdminById(id: string): Promise<AdminUser> {
  const res = await apiClient.get<{ admin: AdminUser }>(`/admin/admins/${id}`);
  return res.admin;
}

export async function createAdmin(dto: {
  email: string;
  userId: string;
  role: AdminRole;
  permissions?: AdminPermission[];
}): Promise<{ message: string; admin: AdminUser }> {
  return apiClient.post('/admin/admins', dto);
}

export async function updateAdmin(
  id: string,
  dto: { role?: AdminRole; isActive?: boolean; isAdmin?: boolean; permissions?: AdminPermission[] },
): Promise<{ message: string; admin: AdminUser }> {
  return apiClient.put(`/admin/admins/${id}`, dto);
}

export async function deleteAdmin(id: string): Promise<{ message: string }> {
  return apiClient.delete(`/admin/admins/${id}`);
}

export async function updateAdminRole(
  id: string,
  dto: { role: AdminRole; permissions?: AdminPermission[] },
): Promise<{ message: string; admin: AdminUser }> {
  return apiClient.put(`/admin/admins/${id}/role`, dto);
}
