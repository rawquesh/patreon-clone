// TypeScript type definitions for Posts Response

import { TierAccess } from "@/typings/ITierAccess";

export interface CreatorInfo {
  id: string;
  displayName: string;
  profilePicture?: string;
  username: string;
  category?: string;
}

export interface PostAttachment {
  url: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  uploadedAt: string;
}

export interface PostItem {
  id: string;
  title: string;
  type: string;
  postType: string;
  previewText: string;
  thumbnail?: string;
  creator: CreatorInfo;
  likesCount: number;
  commentsCount: number;
  publishDate: string;
  isRestrictedView: boolean;

  textContent?: string;
  description?: string;
  mediaUrls?: string[];
  videoUrl?: string;
  videoId?: string;
  videoProvider?: string;
  linkUrl?: string;

  createdAt: string;
  updatedAt: string;
  tags: string[];
  collections: string[];
  tierAccess: TierAccess[];
  status: string;
  attachments?: PostAttachment[];
  hasAccess: boolean;
}

export interface PaginationInfo {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreatorPostsResponse {
  posts: PostItem[];
  pagination: PaginationInfo;
}
