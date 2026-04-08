export type PostType = 'text' | 'image' | 'audio' | 'video' | 'link';
export type PostStatus = 'draft' | 'published' | 'archived';

export type PostCreator = {
  _id?: string;
  id?: string;
  displayName?: string;
  creatorUsername?: string;
  profilePicture?: string;
  email?: string;
  bio?: string;
};

export type Post = {
  _id: string;
  id: string;
  type: PostType;
  title?: string;
  description?: string;
  textContent?: string;
  mediaUrls?: string[];
  linkUrl?: string;
  thumbnailUrl?: string;
  videoUrl?: string;
  creator: PostCreator;
  status: PostStatus;
  isActive: boolean;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  shareCount: number;
  tags?: string[];
  attachments?: Array<{
    url: string;
    fileName?: string;
    fileType?: string;
    fileSize?: number;
    uploadedAt?: string;
  }>;
  tierAccess?: string[];
  collections?: string[];
  createdAt: string;
  updatedAt: string;
  // convenience fields used by pages
  content?: string;
  image?: string;
};

export type PostDetail = Post & {
  content?: string;
  likes?: Array<{
    user: { displayName?: string; profilePicture?: string };
    createdAt: string;
  }>;
  comments?: Array<{
    _id: string;
    user: { displayName?: string; profilePicture?: string };
    text: string;
    createdAt: string;
    updatedAt?: string;
    likes?: Array<{ user: { displayName?: string; profilePicture?: string }; createdAt: string }>;
  }>;
};
