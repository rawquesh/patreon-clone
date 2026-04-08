import { PushNotificationsService } from './push-notifications.service';
export declare class PushNotificationsController {
    private readonly pushNotificationsService;
    constructor(pushNotificationsService: PushNotificationsService);
    storeToken(body: {
        userId: string;
        token: string;
    }): Promise<import("../database").Device>;
    sendNotification(body: {
        userId: string;
        title: string;
        body: string;
    }): Promise<void>;
}
