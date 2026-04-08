import { NotificationsService } from './notifications.service';
import { MarkReadDto, NotificationFilterDto, UpdateCreatorNotificationSettingsDto, UpdateMemberNotificationSettingsDto } from './notifications.dto';
import { UsersService } from '@/users/users.service';
export declare class NotificationsController {
    private readonly notificationsService;
    private readonly usersService;
    constructor(notificationsService: NotificationsService, usersService: UsersService);
    getNotifications(req: any, filterDto: NotificationFilterDto): Promise<{
        notifications: import("./notifications.dto").NotificationResponseDto[];
        unreadCount: number;
    }>;
    getUnreadCount(req: any): Promise<{
        count: number;
    }>;
    markAsRead(req: any, markReadDto: MarkReadDto): Promise<{
        success: boolean;
    }>;
    markAllAsRead(req: any): Promise<{
        success: boolean;
    }>;
    deleteNotification(req: any, id: string): Promise<{
        success: boolean;
    }>;
    getNotificationSettings(req: any): Promise<{
        creatorSettings: {
            creatorNotifyOnNewMember: boolean;
            creatorNotifyOnComments: boolean;
            creatorNotifyOnDirectMessages: boolean;
        };
        memberSettings: {
            memberNotifyOnNewPost: boolean;
            memberNotifyOnDirectMessages: boolean;
        };
    }>;
    updateCreatorNotificationSettings(req: any, settingsDto: UpdateCreatorNotificationSettingsDto): Promise<{
        creatorNotifyOnNewMember: boolean;
        creatorNotifyOnComments: boolean;
        creatorNotifyOnDirectMessages: boolean;
    }>;
    updateMemberNotificationSettings(req: any, settingsDto: UpdateMemberNotificationSettingsDto): Promise<{
        memberNotifyOnNewPost: boolean;
        memberNotifyOnDirectMessages: boolean;
    }>;
}
