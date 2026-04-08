/* eslint-disable @typescript-eslint/ban-ts-comment */
import { useQuery } from "@tanstack/react-query";
import api from "../api";
import { useParams } from "next/navigation";
import { PostFilterParams } from "@/typings/IPost";
import { fetchCreatorPosts } from "./posts-service";
import { useAuth } from "@/context/auth.provider";

export interface Creator {
  _id: string;
  displayName: string;
  creatorUsername: string;
  profilePicture: string;
  profileCover: string;
  creatorHeadline: string;
  creatorCategory?: string;
}

export interface CreatorPost {
  _id: string;
  id?: string;
  title: string;
  body: string;
  type: "text" | "image" | "video" | "audio";
  mediaUrl?: string;
  thumbnailUrl?: string;
  createdAt: string;
  likes: number;
  comments: number;
  isLocked: boolean;
  videoId?: string;
  videoUrl?: string;
  previewText?: string;
  thumbnail?: string;
  linkUrl?: string;
  // hasAccess: boolean;
  mediaUrls: string[];
}

// Note: The Membership interface is now defined in typings/ISubscription.ts
// Keeping this for backward compatibility
export interface Membership {
  _id: string;
  name: string;
  description: string;
  monthlyPrice: number;
  yearlyPrice: number;
  benefits: string[];
  isLimited: boolean;
  seatsLeft?: number;
  isFeatured: boolean;
  coverImage?: string;
}

export const useCreator = (username?: string) => {
  const params = useParams();
  const creatorUsername = username || (params.id as string);

  return useQuery({
    queryKey: ["creator", creatorUsername],
    queryFn: async () => {
      const { data } = await api.get<Creator>(`/creator/${creatorUsername}`);
      return data;
    },
    enabled: !!creatorUsername,
  });
};

export const useCreatorPosts = (
  creatorId: string,
  options?: {
    type?: string;
    tier?: string;
    datePublished?: string;
    search?: string;
    page?: number;
    limit?: number;
  }
) => {
  const { user } = useAuth();
  console.log("options", options);
  return useQuery({
    queryKey: ["creatorPosts", creatorId, JSON.stringify(options)],
    queryFn: async () => {
      const filterParams: PostFilterParams = {
        page: options?.page || 1,
        limit: options?.limit || 10,
        search: options?.search,
        userId: user?._id,
        datePublished: options?.datePublished,
      };

      if (options?.type && options.type !== "all") {
        filterParams.types = [options.type as any];
      }

      if (options?.tier) {
        filterParams.tierAccess = [
          options.tier === "free" ? "Free Members" : ("Paid only" as any),
        ];
      }

      console.log({ filterParams });
      const response = await fetchCreatorPosts(creatorId, filterParams);

      return response.posts.map((post) => ({
        //@ts-ignore
        _id: post.id || post._id,
        title: post.title,
        body: "",
        type: post.type.toLowerCase() as
          | "text"
          | "image"
          | "video"
          | "audio"
          | "link",
        mediaUrl: post.mediaUrls![0]!,
        videoUrl: post.videoUrl,
        thumbnailUrl: post.thumbnail,
        createdAt: post.publishDate,
        likes: post.likesCount,
        comments: post.commentsCount,
        isLocked: post.tierAccess.some((tier) => tier.name !== "Free Members"),
        linkUrl: post.linkUrl,
        previewText: post.previewText,
        description: post.description,
        hasAccess: post.hasAccess,
        tierAccess: post.tierAccess,
        mediaUrls: post.mediaUrls || [],
      }));
    },
    enabled: !!creatorId,
  });
};

// Note: The following hooks are now in subscription-service.tsx:
// - useCreatorMemberships
// - useSubscriptionStatus (previously useIsSubscribed)
// - useSubscribeToFreeMembership (previously joinCreatorForFree function)

export const recordCreatorVisit = async (creatorId: string) => {
  try {
    // await api.post(`/creators/${creatorId}/record-visit`);
    console.log({ creatorId });
  } catch (error) {
    console.error("Error recording creator visit:", error);
  }
};

export const creatorAPI = {
  getCreator: async (username: string): Promise<Creator> => {
    const { data } = await api.get(`/creator/${username}`);
    return data;
  },

  getCreatorPosts: async (
    creatorId: string,
    options?: {
      type?: string;
      tier?: string;
      datePublished?: string;
      search?: string;
    }
  ): Promise<CreatorPost[]> => {
    const filterParams: PostFilterParams = {
      page: 1,
      limit: 20,
      search: options?.search,
    };

    if (options?.type && options.type !== "all") {
      filterParams.types = [options.type as any];
    }

    if (options?.tier) {
      filterParams.tierAccess = [
        options.tier === "free" ? "Free Members" : ("Paid only" as any),
      ];
    }

    if (options?.datePublished) {
      (filterParams as any).dateRange = options.datePublished;
    }

    const response = await fetchCreatorPosts(creatorId, filterParams);
    return response.posts.map((post) => ({
      //@ts-ignore
      _id: post.id || post._id,
      title: post.title,
      body: "",
      type: post.postType.toLowerCase() as "text" | "image" | "video" | "audio",
      mediaUrl: post.mediaUrls![0],
      thumbnailUrl: post.thumbnail,
      createdAt: post.publishDate,
      likes: post.likesCount,
      comments: post.commentsCount,
      isLocked: post.tierAccess.some((tier) => tier.name !== "Free Members"),
      videoUrl: post.videoUrl,
      videoId: post.videoId,
      previewText: post.previewText,
      linkUrl: post.linkUrl,
      mediaUrls: post.mediaUrls || [],
    }));
  },

  // Note: These API methods will remain for legacy code, but should be deprecated
  getCreatorMemberships: async (creatorId: string): Promise<Membership[]> => {
    const { data } = await api.get(`/memberships/creator/${creatorId}`);
    return data;
  },

  checkSubscription: async (creatorId: string): Promise<boolean> => {
    try {
      const { data } = await api.get<{ isSubscribed: boolean }>(
        `/memberships/check/${creatorId}`
      );
      return data.isSubscribed;
    } catch (_error) {
      console.log(_error);
      return false;
    }
  },
};
