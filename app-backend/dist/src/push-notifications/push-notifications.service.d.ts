import { ConfigService } from '@nestjs/config';
import { Model } from 'mongoose';
import { Device, DeviceDocument } from '@/database/schemas/device';
export declare class PushNotificationsService {
    private deviceModel;
    private configService;
    private readonly logger;
    constructor(deviceModel: Model<DeviceDocument>, configService: ConfigService);
    storeDeviceToken(userId: string, token: string): Promise<Device>;
    sendPushNotification({ userId, title, body, data, }: {
        userId: string;
        title: string;
        body: string;
        data: {
            [key: string]: string;
        };
    }): Promise<void>;
}
