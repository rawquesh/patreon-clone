import { apiClient } from '@/lib/api-client';
import type {
  Creator,
  CreatorDetail,
  CreatorListResponse,
} from '@/types';

export type CreatorListParams = {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
};

export async function getCreators(
  params: CreatorListParams = {},
): Promise<{ creators: Creator[]; pagination: CreatorListResponse['pagination'] }> {
  const response = await apiClient.get<CreatorListResponse>('/admin/creators', params);
  return {
    creators: response.creators.map((c) => ({
      ...c,
      id: c.id || (c._id as string),
      name: c.displayName || c.creatorUsername || `${c.firstName || ''} ${c.lastName || ''}`.trim() || 'Unknown',
      email: c.email,
      avatar: c.profilePicture || '',
      creatorStatus: c.creatorStatus,
      joinedDate: c.createdAt,
      stripeOnboarded: c.hasCompletedStripeOnboarding,
    })),
    pagination: response.pagination,
  };
}

export async function getCreatorById(
  id: string,
): Promise<CreatorDetail> {
  const response = await apiClient.get<{ creator: CreatorDetail }>(
    `/admin/creators/${id}`,
  );
  return response.creator;
}

export async function approveCreator(id: string): Promise<{ message: string }> {
  return apiClient.post(`/admin/creators/${id}/approve`);
}

export async function rejectCreator(
  id: string,
  reason?: string,
): Promise<{ message: string }> {
  return apiClient.post(`/admin/creators/${id}/reject`, { reason });
}

export async function suspendCreator(
  id: string,
  reason?: string,
): Promise<{ message: string }> {
  return apiClient.post(`/admin/creators/${id}/suspend`, { reason });
}

export async function activateCreator(id: string): Promise<{ message: string }> {
  return apiClient.post(`/admin/creators/${id}/activate`);
}
