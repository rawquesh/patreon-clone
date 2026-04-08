import { PostCreator } from "./IPost";
import { TierAccess } from "./ITierAccess";

// Interface for the creator details within the collection response
export interface CollectionCreator extends PostCreator {
  // Inherits id, name, profilePicture from PostCreator
  username: string;
}

// Interface for the main collection details
export interface CollectionDetails {
  _id: string;
  id: string;
  title: string;
  description: string;
  coverImage: string;
  postCount: number;
  createdAt: string;
  creator: CollectionCreator;
}

export interface CollectionWithPostsResponse {
  _id: string;
  title: string;
  description?: string;
  coverImage: string;
  creator: Creator;
  postCount: number;
  isActive: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
  posts: Post[];
}

export interface Creator {
  _id: string;
  displayName: string;
  profilePicture: string;
  creatorUsername: string;
}

export interface Post {
  _id: string;
  type: string;
  creator: Creator2;
  title: string;
  description: string;
  mediaUrls: any[];
  thumbnailUrl: string;
  videoId: string;
  videoProvider: string;
  videoUrl: string;
  collections: string[];
  tags: any[];
  status: string;
  isDeleted: boolean;
  isActive: boolean;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  shareCount: number;
  attachments: any[];
  tierAccess: TierAccess[];
  likes: any[];
  comments: any[];
  createdAt: string;
  updatedAt: string;
  isRestrictedView: boolean;
  previewText: string;
  id: string;
  publishDate: string;
  postType: string;
  likesCount: number;
  commentsCount: number;
  hasAccess: boolean;
  linkUrl?: string;
}

export interface Creator2 {
  id: string;
  displayName: string;
  profilePicture: string;
  username: string;
  category: string;
}
