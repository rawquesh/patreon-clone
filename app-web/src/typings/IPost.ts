import { TierAccess as ITierAccess } from "./ITierAccess";

export enum SortOrder {
  ASC = "asc",
  DESC = "desc",
}

export enum SortBy {
  CREATED_AT = "createdAt",
  TITLE = "title",
  TYPE = "type",
}

export enum TierAccess {
  ALL = "All",
  FREE = "Free Members",
  PAID = "Paid only",
}

export enum PostType {
  TEXT = "text",
  IMAGE = "image",
  AUDIO = "audio",
  VIDEO = "video",
  LINK = "link",
}

export interface PostFilterParams {
  userId?: string;
  page?: number;
  limit?: number;
  sortBy?: SortBy;
  sortOrder?: SortOrder;
  types?: PostType[];
  tierAccess?: TierAccess[];
  search?: string;
  collection?: string;
  tags?: string[];
  datePublished?: string;
}

export interface PostCreator {
  id: string;
  name: string;
  profilePicture?: string;
}

export interface PostItem {
  id: string;
  title: string;
  description?: string;
  body?: string;
  likes?: number;
  comments?: number;
  isLocked?: boolean;
  isFeatured?: boolean;
  mediaUrls?: string[];
  videoUrl?: string;
  audioUrl?: string;
  linkUrl?: string;
  videoLength?: number;
  publishDate: string;
  tierAccess: { id: string; name: string }[];
  postType: string;
  thumbnail: string;
  creator?: PostCreator;
  status: "published" | "draft";
  type: "text" | "image" | "video" | "audio" | "link";
  collections: string[];
  previewText?: string;
}

export interface PaginationInfo {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PostsResponse {
  posts: PostItem[];
  pagination: PaginationInfo;
}

export interface PostData {
  _id: string;
  title: string;
  type: string;
  description?: string;
  textContent?: string;
  previewText?: string;
  mediaUrls?: string[];
  videoUrl?: string;
  audioUrl?: string;
  linkUrl?: string;
  creator: {
    id: string;
    username: string;
    profilePicture?: string;
    description?: string;
    displayName: string;
  };
  createdAt: string;

  isAccessible: boolean;
  membershipRequired?: boolean;
  hasAccess: boolean;
  attachments?: {
    url: string;
    fileName: string;
    fileType: string;
    fileSize: number;
    uploadedAt: string;
    _id: string;
  }[];
  likesCount: number;
  commentsCount: number;
  thumbnailUrl: string;
  tierAccess: ITierAccess[];
}

export interface IComment {
  id: string;
  text: string;
  user: {
    id: string;
    displayName: string;
    profilePicture?: string;
  };
  createdAt: string;
  updatedAt: string;
  parentId?: string;
  replies?: IComment[];
}

export interface CommentsResponse {
  comments: IComment[];
  pagination: {
    total: number;
    page: string | number;
    limit: string | number;
    totalPages: number;
  };
}

export interface CommentResponse {
  message: string;
  comment: IComment;
}

export interface LikeResponse {
  success?: boolean;
  likesCount?: number;
  isLiked?: boolean;
  liked?: boolean;
  message?: string;
  likes?: any[];
  pagination?: {
    total: number;
    page?: number;
    limit?: number;
    totalPages?: number;
  };
}
