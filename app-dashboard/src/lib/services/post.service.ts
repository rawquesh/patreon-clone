import { apiClient } from '@/lib/api-client';
import type { Post, PostDetail, PostListResponse } from '@/types';

export type PostListParams = {
  page?: number;
  limit?: number;
  search?: string;
  creatorId?: string;
  type?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
};

export async function getPosts(
  params: PostListParams = {},
): Promise<{ posts: Post[]; pagination: PostListResponse['pagination'] }> {
  const response = await apiClient.get<PostListResponse>('/admin/content', params);
  return {
    posts: response.posts.map((p) => ({
      ...p,
      id: p.id || (p._id as string),
      creator: {
        ...p.creator,
        id: p.creator?.id || (p.creator as any)?._id?.toString() || '',
        name: p.creator?.displayName || p.creator?.creatorUsername || 'Unknown',
        avatar: p.creator?.profilePicture || '',
      },
      content: p.textContent || p.description || p.title || '',
      image: p.mediaUrls?.[0],
      createdAt: p.createdAt,
    })),
    pagination: response.pagination,
  };
}

export async function getPostById(id: string): Promise<PostDetail> {
  const response = await apiClient.get<{ post: PostDetail }>(
    `/admin/content/${id}`,
  );
  return response.post;
}

export async function withholdPost(
  id: string,
  reason?: string,
): Promise<{ message: string }> {
  return apiClient.post(`/admin/content/${id}/withhold`, { reason });
}

export async function restorePost(id: string): Promise<{ message: string }> {
  return apiClient.post(`/admin/content/${id}/restore`);
}

export async function deletePost(id: string): Promise<{ message: string }> {
  return apiClient.delete(`/admin/content/${id}`);
}
