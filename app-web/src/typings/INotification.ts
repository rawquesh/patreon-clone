export enum NotificationType {
  LIKE = "liked",
  COMMENT = "commented",
  NEW_MEMBER = "new_member",
  UPGRADE = "upgrade",
  DOWNGRADE = "downgrade",
  CANCELLATION = "cancellation",
  NEW_POST = "new_post",
  COMMENT_REPLY = "comment_reply",
  CHAT_MESSAGE = "chat_message",
  GROUP_CHAT_CREATED = "group_chat_created",
  DIRECT_MESSAGE = "direct_message",
  DIRECT_CHAT_CREATED = "direct_chat_created",
}

export interface INotification {
  id: string;
  actor: {
    id: string;
    name: string;
    profilePicture: string;
  };
  type: string;
  post?: {
    id: string;
    title: string;
    thumbnailUrl: string;
  };
  comment?: {
    content: string;
  };
  metadata?: Record<string, any>;
  isRead: boolean;
  createdAt: string;
  timeStamp: string;
}

export interface NotificationResponseDto {
  id: string;
  type: NotificationType;
  isRead: boolean;
  createdAt: string;
  actor?: {
    id: string;
    name: string;
    username?: string;
    profilePicture?: string;
  };
  post?: {
    id: string;
    title: string;
    thumbnailUrl?: string;
  };
  comment?: {
    id: string;
    content: string;
  };
  userMode: string;
  link?: string;
}

export interface NotificationFilterDto {
  page?: number;
  limit?: number;
  type?: string[];
  userMode?: string;
}

export interface MarkReadDto {
  ids: string[];
}
