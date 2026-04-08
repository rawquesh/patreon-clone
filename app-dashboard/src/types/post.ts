export type PostType = 'text' | 'image' | 'video';
export type PostStatus = 'published' | 'draft' | 'archived';

export type Post = {
  id: string;
  creator: {
    name: string;
    avatar: string;
  };
  type: PostType;
  status: PostStatus;
  content: string;
  image?: string;
  createdAt: string;
};
