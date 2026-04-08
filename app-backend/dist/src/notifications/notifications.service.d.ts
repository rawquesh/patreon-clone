import { Model } from 'mongoose';
import { Notification } from '@/database/schemas/notification';
import { User } from '@/database/schemas/user';
import { Post } from '@/database/schemas/post';
import { CreateNotificationDto, NotificationFilterDto, NotificationResponseDto } from './notifications.dto';
import { PushNotificationsService } from '@/push-notifications/push-notifications.service';
export declare class NotificationsService {
    private notificationModel;
    private userModel;
    private postModel;
    private pushNotificationsService;
    constructor(notificationModel: Model<Notification>, userModel: Model<User>, postModel: Model<Post>, pushNotificationsService: PushNotificationsService);
    create(createNotificationDto: CreateNotificationDto): Promise<Notification>;
    findAllForUser(userId: string, filter?: NotificationFilterDto): Promise<{
        notifications: NotificationResponseDto[];
        unreadCount: number;
    }>;
    markAsRead(userId: string, notificationIds: string[]): Promise<boolean>;
    markAllAsRead(userId: string): Promise<boolean>;
    getUnreadCount(userId: string): Promise<number>;
    deleteNotification(userId: string, notificationId: string): Promise<boolean>;
    private transformNotification;
    private getPostThumbnail;
}
