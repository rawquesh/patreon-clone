"use client";
import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
  useMemo,
} from "react";
import {
  PostFilterParams,
  PostsResponse,
  SortBy,
  SortOrder,
  PostItem,
  PaginationInfo,
} from "@/typings/IPost";
import {
  fetchPosts,
  fetchCreatorPosts,
  fetchMyPosts,
  fetchMyDrafts,
} from "@/lib/backend-services/posts-service";
import { CreatorPostsResponse } from "@/lib/backend-services/creator-posts-response";
import { useAuth } from "./auth.provider";

interface PostsFilterContextType {
  posts: PostItem[];
  creatorPosts: CreatorPostsResponse["posts"];
  pagination: PaginationInfo | null;
  creatorPagination: PaginationInfo | null;
  filters: PostFilterParams;
  isLoading: boolean;
  error: Error | null;
  updateFilters: (newFilters: Partial<PostFilterParams>) => void;
  nextPage: () => void;
  prevPage: () => void;
  resetFilters: () => void;
  refetch: () => Promise<void>;
}

const PostsFilterContext = createContext<PostsFilterContextType | undefined>(
  undefined
);

interface PostsFilterProviderProps {
  children: ReactNode;
  creatorId?: string;
  myPosts?: boolean;
  isDrafts?: boolean;
  initialFilters?: PostFilterParams;
}

export function PostsFilterProvider({
  children,
  creatorId,
  myPosts,
  isDrafts,
  initialFilters,
}: PostsFilterProviderProps) {
  const { user } = useAuth();
  const defaultFilters: PostFilterParams = useMemo(
    () => ({
      page: 1,
      limit: 10,
      sortBy: SortBy.CREATED_AT,
      sortOrder: SortOrder.DESC,
      userId: user?._id,
      ...initialFilters,
    }),
    [initialFilters, user?._id]
  );

  const [filters, setFilters] = useState<PostFilterParams>(defaultFilters);
  const [postsData, setPostsData] = useState<PostsResponse | null>(null);
  const [creatorPostsData, setCreatorPostsData] =
    useState<CreatorPostsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchPostsData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      let response: PostsResponse;

      if (isDrafts) {
        response = await fetchMyDrafts(filters);
        setPostsData(response);
      } else if (myPosts) {
        response = await fetchMyPosts(filters);
        setPostsData(response);
      } else if (creatorId) {
        const res = await fetchCreatorPosts(creatorId, filters);
        setCreatorPostsData(res);
      } else {
        response = await fetchPosts(filters);
        setPostsData(response);
      }
    } catch (err: any) {
      setError(err);
      console.error("Error fetching posts:", err);
    } finally {
      setIsLoading(false);
    }
  }, [filters, creatorId, myPosts, isDrafts]);

  React.useEffect(() => {
    fetchPostsData();
  }, [fetchPostsData]);

  const updateFilters = useCallback((newFilters: Partial<PostFilterParams>) => {
    setFilters((prev) => {
      console.log({ prev });
      return {
        ...prev,
        ...newFilters,
        page: newFilters.page !== undefined ? newFilters.page : 1,
      };
    });
  }, []);

  const nextPage = useCallback(() => {
    const pagination = creatorId
      ? creatorPostsData?.pagination
      : postsData?.pagination;

    if (pagination && filters.page && filters.page < pagination.totalPages) {
      setFilters((prev) => ({
        ...prev,
        page: (prev.page || 1) + 1,
      }));
    }
  }, [postsData, creatorPostsData, filters.page, creatorId]);

  const prevPage = useCallback(() => {
    if (filters.page && filters.page > 1) {
      setFilters((prev) => ({
        ...prev,
        page: (prev.page || 2) - 1,
      }));
    }
  }, [filters.page]);

  const resetFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, [defaultFilters]);

  const value = {
    posts: postsData?.posts || [],
    creatorPosts: creatorPostsData?.posts || [],
    pagination: postsData?.pagination || null,
    creatorPagination: creatorPostsData?.pagination || null,
    filters,
    isLoading,
    error,
    updateFilters,
    nextPage,
    prevPage,
    resetFilters,
    refetch: fetchPostsData,
  };

  return (
    <PostsFilterContext.Provider value={value}>
      {children}
    </PostsFilterContext.Provider>
  );
}

export function usePostsFilter() {
  const context = useContext(PostsFilterContext);
  if (context === undefined) {
    throw new Error("usePostsFilter must be used within a PostsFilterProvider");
  }
  return context;
}
