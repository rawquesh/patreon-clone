export interface ICommentUser {
  id: string;
  displayName: string;
  profilePicture: string;
}

export interface ICommentData {
  id: string;
  text: string;
  user: ICommentUser;
  createdAt: string;
  updatedAt: string;
  likesCount: number;
  isLiked: boolean;
  parentId?: string;
}

export interface ICommentResponse {
  comments: ICommentData[];
  pagination: {
    total: number;
    page: string;
    limit: string;
    totalPages: number;
  };
}

// Interface for the internal comment state used in components
export interface IComment {
  id: string;
  comment: string;
  user: {
    avatar: string;
    username: string;
  };
  timeStamp: string;
  likes: number;
  liked: boolean;
  ownsComment: boolean;
  parentComment: string | null;
}
