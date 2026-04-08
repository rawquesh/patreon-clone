import api from "@/lib/api";
import {
  PostFilterParams,
  PostsResponse,
  // PostItem, // Removed as it's implicitly imported via CollectionWithPostsResponse
} from "@/typings/IPost";
import { CreatorPostsResponse } from "./creator-posts-response";
import {
  CollectionWithPostsResponse,
  CollectionDetails,
} from "@/typings/ICollection";

// Interface for the response of fetchMyCollections
interface MyCollectionsResponse {
  collections: CollectionDetails[];
  total: number;
}

export const buildPostQueryParams = (
  params: PostFilterParams
): URLSearchParams => {
  const queryParams = new URLSearchParams();
  if (params.page) queryParams.append("page", params.page.toString());
  if (params.limit) queryParams.append("limit", params.limit.toString());
  if (params.sortBy) queryParams.append("sortBy", params.sortBy);
  if (params.sortOrder) queryParams.append("sortOrder", params.sortOrder);
  if (params.search) queryParams.append("search", params.search);
  if (params.types?.length) {
    const typesString = JSON.stringify(params.types);
    queryParams.append("types", typesString);
  }
  if (params.tierAccess?.length) {
    const tierAccessString = JSON.stringify(params.tierAccess);
    queryParams.append("tierAccess", tierAccessString);
  }
  if (params.collection) {
    queryParams.append("collection", params.collection);
  }
  if (params.tags?.length) {
    const tagsString = JSON.stringify(params.tags);
    queryParams.append("tags", tagsString);
  }
  if (params.datePublished) {
    queryParams.append("datePublished", params.datePublished);
  }
  return queryParams;
};

export const fetchPosts = async (
  params: PostFilterParams = {}
): Promise<PostsResponse> => {
  const queryParams = buildPostQueryParams(params);
  const { data } = await api.get(`/posts/my-posts?${queryParams}`);
  return data;
};

export const fetchCreatorPosts = async (
  creatorId: string,
  params: PostFilterParams = {}
): Promise<CreatorPostsResponse> => {
  const queryParams = buildPostQueryParams(params);
  console.log(`/posts/by-creator/${creatorId}?${queryParams}`);
  const { data } = await api.get<CreatorPostsResponse>(
    `/posts/by-creator/${creatorId}?${queryParams}`
  );
  return data;
};

export const fetchMyPosts = async (
  params: PostFilterParams = {}
): Promise<PostsResponse> => {
  const queryParams = buildPostQueryParams(params);
  const { data } = await api.get(`/posts/my-posts?${queryParams}`);
  return data;
};

export const fetchMyDrafts = async (
  params: PostFilterParams = {}
): Promise<PostsResponse> => {
  const queryParams = buildPostQueryParams(params);
  const response = await api.get(`/posts/drafts?${queryParams}`);

  const draftsData = response.data.drafts || [];
  return {
    posts: draftsData.map((draft: any) => ({
      id: draft.id,
      title: draft.title,
      publishDate: new Date(draft.createdAt).toLocaleDateString(),
      tierAccess: draft.tierAccess || [],
      postType: draft.postType,
      thumbnail: draft.thumbnailUrl || "/images/placeholder.jpg",
    })),
    pagination: {
      total: draftsData.length,
      page: params.page || 1,
      limit: params.limit || 10,
      totalPages: Math.ceil(draftsData.length / (params.limit || 10)),
    },
  };
};

export const fetchCollectionWithPosts = async (
  collectionId: string,
  params: PostFilterParams = {}
): Promise<CollectionWithPostsResponse> => {
  const queryParams = buildPostQueryParams(params);
  const endpoint = `/collections/${collectionId}?${queryParams}`;
  const { data } = await api.get<CollectionWithPostsResponse>(endpoint);
  return data;
};

// Fetch collections created by the logged-in user
export const fetchMyCollections = async (): Promise<MyCollectionsResponse> => {
  const { data } = await api.get<MyCollectionsResponse>("/collections");
  return data;
};

// Add a post to a specific collection
export const addPostToCollection = async (
  collectionId: string,
  postId: string
): Promise<void> => {
  await api.post(`/collections/${collectionId}/posts`, { postId });
};

// Remove a post from a specific collection
export const removePostFromCollection = async (
  collectionId: string,
  postId: string
): Promise<void> => {
  // The DTO only contains postId, which is sent in the request body for DELETE
  await api.delete(`/collections/${collectionId}/posts`, { data: { postId } });
};

export const deletePost = async (postId: string): Promise<void> => {
  await api.delete(`/posts/permanent/${postId}`);
};

export const publishPost = async (postId: string): Promise<void> => {
  await api.post(`/posts/${postId}/publish`);
};

export const unpublishPost = async (postId: string): Promise<void> => {
  await api.post(`/posts/${postId}/unpublish`);
};
