import { NotificationType } from '@/database/schemas/notification';
export declare class CreateNotificationDto {
    recipient: string;
    actor: string;
    type: NotificationType;
    post?: string;
    comment?: string;
    link?: string;
    metadata?: Record<string, any>;
    userMode: 'creator' | 'member';
}
export declare class NotificationFilterDto {
    unreadOnly?: boolean;
    type?: NotificationType[];
    page?: number;
    limit?: number;
    userMode?: 'creator' | 'member';
}
export declare class MarkReadDto {
    ids: string[];
}
export declare class NotificationActorDto {
    id: string;
    name: string;
    profilePicture: string;
}
export declare class NotificationPostDto {
    id: string;
    title: string;
    thumbnailUrl: string;
}
export declare class CommentDto {
    content: string;
}
export declare class NotificationResponseDto {
    id: string;
    actor: NotificationActorDto;
    type: NotificationType;
    post?: NotificationPostDto;
    comment?: CommentDto;
    metadata?: Record<string, any>;
    isRead: boolean;
    createdAt: string;
    timeStamp: string;
    userMode: string;
    link?: string;
}
export declare class UpdateCreatorNotificationSettingsDto {
    creatorNotifyOnNewMember?: boolean;
    creatorNotifyOnComments?: boolean;
    creatorNotifyOnDirectMessages?: boolean;
}
export declare class UpdateMemberNotificationSettingsDto {
    memberNotifyOnNewPost?: boolean;
    memberNotifyOnDirectMessages?: boolean;
}
