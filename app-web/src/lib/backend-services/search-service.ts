import { useQuery } from "@tanstack/react-query";
import { CreatorCategory } from "@/lib/constants";
import api from "../api";

interface Creator {
  _id: string;
  displayName: string;
  creatorUsername: string;
  profilePicture: string;
  creatorHeadline: string;
  creatorCategory?: CreatorCategory;
}

interface Post {
  _id: string;
  title: string;
  content: string;
  coverImage?: string;
  creator: Creator;
  createdAt: string;
  categories?: string[];
}

interface Topic {
  _id: string;
  title: string;
  description: string;
  postCount: number;
  category?: string;
}

interface SearchResults {
  creators: Creator[];
  posts: Post[];
  topics: Topic[];
}

export const useSearchResults = (query: string, category: string = "all") => {
  return useQuery<SearchResults>({
    queryKey: ["search", query, category],
    queryFn: async () => {
      if (!query) {
        return { creators: [], posts: [], topics: [] };
      }

      const params = new URLSearchParams();
      params.set("q", query);

      if (category && category !== "all") {
        params.set("category", category);
      }

      const { data } = await api.get(`/search?${params.toString()}`);
      return data;
    },
    enabled: !!query,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const searchAPI = {
  search: async (query: string, category?: string): Promise<SearchResults> => {
    let searchUrl = `/search?q=${encodeURIComponent(query)}&full=true`;

    if (category && category !== "all") {
      searchUrl += `&category=${encodeURIComponent(category)}`;
    }

    const { data } = await api.get(searchUrl);
    return data;
  },
};
