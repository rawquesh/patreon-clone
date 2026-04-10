"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../api";
import { ApiEndpoints } from "./api_endpoints";
import {
  toastHandlers,
  getErrorMessage,
} from "@/lib/toasts";
import { CommentResponse, LikeResponse } from "@/typings/IPost";
import { ICommentResponse } from "@/typings/IComment";

export const usePostComments = (postId: string, page = 1, limit = 10) => {
  return useQuery({
    queryKey: ["postComments", postId, page, limit],
    queryFn: async () => {
      const { data } = await api.get<ICommentResponse>(
        `${ApiEndpoints.postComments(postId)}?page=${page}&limit=${limit}`
      );
      return data;
    },
    enabled: !!postId,
  });
};

export const usePostLikes = (postId: string) => {
  return useQuery({
    queryKey: ["postLikes", postId],
    queryFn: async () => {
      const { data } = await api.get(ApiEndpoints.postLikes(postId));
      return data;
    },
    enabled: !!postId,
  });
};

// Hook to check if the current user has liked a post
export const usePostLiked = (postId: string) => {
  return useQuery({
    queryKey: ["postLiked", postId],
    queryFn: async () => {
      const { data } = await api.get<{
        liked: boolean;
        message: string;
      }>(ApiEndpoints.postLiked(postId));
      return data.liked;
    },
    enabled: !!postId,
  });
};

// Hook to add a comment to a post
export const useAddComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      postId,
      content,
      parentId,
    }: {
      postId: string;
      content: string;
      parentId?: string;
    }) => {
      const payload = parentId
        ? { text: content, parentId }
        : { text: content };
      const { data } = await api.post<CommentResponse>(
        ApiEndpoints.postComments(postId),
        payload
      );
      return data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["postComments", variables.postId],
      });
      toastHandlers.commentAdded();
    },
    onError: (error: unknown) => {
      toastHandlers.commentError(getErrorMessage(error, "Could not post your comment"));
    },
  });
};

// Hook to edit a comment
export const useEditComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      postId,
      commentId,
      content,
    }: {
      postId: string;
      commentId: string;
      content: string;
    }) => {
      const { data } = await api.put<CommentResponse>(
        ApiEndpoints.commentUpdate(postId, commentId),
        { text: content }
      );
      return data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["postComments", variables.postId],
      });
      toastHandlers.commentUpdated();
    },
    onError: (error: unknown) => {
      toastHandlers.commentUpdateError(getErrorMessage(error, "Could not update your comment"));
    },
  });
};

// Hook to delete a comment
export const useDeleteComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      postId,
      commentId,
    }: {
      postId: string;
      commentId: string;
    }) => {
      const { data } = await api.delete(
        ApiEndpoints.commentUpdate(postId, commentId)
      );
      return data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["postComments", variables.postId],
      });
      toastHandlers.commentDeleted();
    },
    onError: (error: unknown) => {
      toastHandlers.commentDeleteError(getErrorMessage(error, "Could not delete your comment"));
    },
  });
};

// Hook to like a post
export const useLikePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ postId }: { postId: string }) => {
      const { data } = await api.post<LikeResponse>(ApiEndpoints.postLike(postId));
      return data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["creatorPosts"],
      });
      queryClient.invalidateQueries({
        queryKey: ["post", variables.postId],
      });
      queryClient.invalidateQueries({
        queryKey: ["postLikes", variables.postId],
      });
      queryClient.invalidateQueries({
        queryKey: ["postLiked", variables.postId],
      });
    },
    onError: (error: unknown) => {
      toastHandlers.likeError(getErrorMessage(error, "Could not like the post"));
    },
  });
};

// Hook to unlike a post
export const useUnlikePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ postId }: { postId: string }) => {
      const { data } = await api.delete<LikeResponse>(ApiEndpoints.postLike(postId));
      return data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["creatorPosts"],
      });
      queryClient.invalidateQueries({
        queryKey: ["post", variables.postId],
      });
      queryClient.invalidateQueries({
        queryKey: ["postLikes", variables.postId],
      });
      queryClient.invalidateQueries({
        queryKey: ["postLiked", variables.postId],
      });
    },
    onError: (error: unknown) => {
      toastHandlers.unlikeError(getErrorMessage(error, "Could not unlike the post"));
    },
  });
};

// Hook to like a comment
export const useLikeComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      postId,
      commentId,
    }: {
      postId: string;
      commentId: string;
    }) => {
      const { data } = await api.post<LikeResponse>(
        ApiEndpoints.commentLike(postId, commentId)
      );
      return data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["postComments", variables.postId],
      });
    },
    onError: (error: unknown) => {
      toastHandlers.commentLikeError(getErrorMessage(error, "Could not like the comment"));
    },
  });
};

// Hook to unlike a comment
export const useUnlikeComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      postId,
      commentId,
    }: {
      postId: string;
      commentId: string;
    }) => {
      const { data } = await api.delete<LikeResponse>(
        ApiEndpoints.commentLike(postId, commentId)
      );
      return data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["postComments", variables.postId],
      });
    },
    onError: (error: unknown) => {
      toastHandlers.commentUnlikeError(getErrorMessage(error, "Could not unlike the comment"));
    },
  });
};
