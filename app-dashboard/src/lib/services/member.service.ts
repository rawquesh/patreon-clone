import { apiClient } from '@/lib/api-client';
import type { Member, MemberDetail, MemberListResponse } from '@/types';

export type MemberListParams = {
  page?: number;
  limit?: number;
  search?: string;
  status?: 'active' | 'inactive';
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
};

export async function getMembers(
  params: MemberListParams = {},
): Promise<{ members: Member[]; pagination: MemberListResponse['pagination'] }> {
  const response = await apiClient.get<MemberListResponse>('/admin/members', params);
  return {
    members: response.members.map((m) => ({
      ...m,
      id: m.id || (m._id as string),
      name: m.displayName || `${m.firstName || ''} ${m.lastName || ''}`.trim() || 'Unknown',
      email: m.email,
      avatar: m.profilePicture || '',
      status: m.isDeactivated ? 'inactive' : 'active',
      joinedDate: m.createdAt,
    })),
    pagination: response.pagination,
  };
}

export async function getMemberById(id: string): Promise<MemberDetail> {
  const response = await apiClient.get<{ member: MemberDetail }>(
    `/admin/members/${id}`,
  );
  return response.member;
}

export async function deactivateMember(id: string): Promise<{ message: string }> {
  return apiClient.post(`/admin/members/${id}/deactivate`);
}

export async function activateMember(id: string): Promise<{ message: string }> {
  return apiClient.post(`/admin/members/${id}/activate`);
}

export async function promoteToAdmin(id: string): Promise<{ message: string }> {
  return apiClient.post(`/admin/members/${id}/promote-to-admin`);
}
