import { useQuery } from "@tanstack/react-query";
import api from "../api";
import { CreatorCategory, HARDCODED_CATEGORIES } from "../constants";
import { SubscribedFeedResponse } from "./home-service.types";

export interface Creator {
  _id: string;
  displayName: string;
  creatorUsername: string;
  profilePicture: string;
  creatorHeadline: string;
  creatorCategory?: CreatorCategory;
}

export interface RecentlyVisitedCreator extends Creator {
  lastVisitedAt: string;
}

export interface PopularCreator extends Creator {
  popularity: number;
}

export const useRecentlyVisitedCreators = () => {
  return useQuery({
    queryKey: ["recentlyVisitedCreators"],
    queryFn: async () => {
      const { data } = await api.get<RecentlyVisitedCreator[]>(
        "/creators/recently-visited"
      );
      return data;
    },
    staleTime: 5 * 60 * 1000,
  });
};

export const useTopCreators = () => {
  return useQuery({
    queryKey: ["topCreators"],
    queryFn: async () => {
      const { data } = await api.get<Creator[]>("/creators/top");
      return data;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

/**
 * Fetch popular creators this week
 */
export const usePopularThisWeek = () => {
  return useQuery({
    queryKey: ["popularThisWeek"],
    queryFn: async () => {
      const { data } = await api.get<PopularCreator[]>(
        "/creators/popular-this-week"
      );
      return data;
    },
    staleTime: 60 * 60 * 1000, // 1 hour
  });
};

/**
 * Fetch top creators by category
 */
export const useTopCreatorsByCategory = (category: string) => {
  return useQuery({
    queryKey: ["topCreatorsByCategory", category],
    queryFn: async () => {
      const { data } = await api.get<Creator[]>(
        `/creators/top-by-category/${category}`
      );
      return data;
    },
    staleTime: 60 * 60 * 1000, // 1 hour
    enabled: !!category,
  });
};

/**
 * Fetch all categories - Now uses hardcoded categories
 */
export const useCategories = () => {
  return useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      return Promise.resolve(HARDCODED_CATEGORIES);
    },
    staleTime: Infinity, // Data is static, never becomes stale
  });
};

/**
 * Fetch subscribed feed for the current user
 */
export const useSubscribedFeed = (page: number = 1, limit: number = 10) => {
  return useQuery({
    queryKey: ["subscribedFeed", page, limit],
    queryFn: async () => {
      const { data } = await api.get<SubscribedFeedResponse>(
        `/home/subscribed-feed?page=${page}&limit=${limit}`
      );
      return data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const homeAPI = {
  getRecentlyVisited: async (): Promise<RecentlyVisitedCreator[]> => {
    try {
      const { data } = await api.get("/home/recently-visited");
      return data;
    } catch (error) {
      console.log(error);
      const { data } = await api.get("/home/recently-visited-public");
      return data;
    }
  },

  getTopCreators: async (): Promise<Creator[]> => {
    const { data } = await api.get("/home/top-creators");
    return data;
  },

  getPopularThisWeek: async (): Promise<Creator[]> => {
    const { data } = await api.get("/home/popular-this-week");
    return data;
  },

  getTopCreatorsByCategory: async (category: string): Promise<Creator[]> => {
    const { data } = await api.get(
      `/home/top-by-category?category=${encodeURIComponent(category)}`
    );
    return data;
  },

  getSubscribedFeed: async (page: number = 1, limit: number = 10) => {
    const { data } = await api.get<SubscribedFeedResponse>(
      `/home/subscribed-feed?page=${page}&limit=${limit}`
    );
    return data;
  },
};
