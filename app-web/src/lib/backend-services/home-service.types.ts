export interface SubscribedFeedResponse {
  posts: Post[];
  pagination: Pagination;
}

export interface Post {
  _id: string;
  type: string;
  creator: Creator;
  title: string;
  mediaUrls: string[];
  collections: any[];
  tags: string[];
  status: string;
  isDeleted: boolean;
  isActive: boolean;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  shareCount: number;
  attachments: any[];
  tierAccess: string[];
  likes: Like[];
  comments: Comment[];
  createdAt: string;
  updatedAt: string;
  __v: number;
  id: string;
  previewText: string;
  thumbnail?: string;
  likesCount: number;
  commentsCount: number;
  publishDate: string;
  postType: string;
  isRestrictedView: boolean;
  textContent?: string;
  description?: string;
  thumbnailUrl?: string;
  videoId?: string;
  videoProvider?: string;
  videoUrl?: string;
}

export interface Creator {
  id: string;
  displayName: string;
  profilePicture: string;
  username: string;
  category: string;
}

export interface Like {
  user: string;
  createdAt: string;
  _id: string;
}

export interface Comment {
  parentComment?: string;
  _id: string;
  user: string;
  text: string;
  createdAt: string;
  likes: Like2[];
  updatedAt?: string;
}

export interface Like2 {
  _id: string;
  user: string;
  createdAt: string;
}

export interface Pagination {
  total: number;
  page: string;
  limit: string;
  totalPages: number;
}
