import { apiClient } from '@/lib/api-client';

export interface StatusCheck {
  name: string;
  status: 'pending' | 'checking' | 'success' | 'error';
  message: string;
  error?: string;
}

export interface ServerStatus {
  checks: StatusCheck[];
  allPassed: boolean;
  adminExists: boolean;
}

export interface CreateAdminRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface AdminUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  isAdmin: boolean;
}

export async function getServerStatus(): Promise<ServerStatus> {
  return apiClient.get<ServerStatus>('/server-status');
}

export async function createAdmin(data: CreateAdminRequest): Promise<{ user: AdminUser }> {
  return apiClient.post<{ user: AdminUser }>('/server-status/admin', data);
}
