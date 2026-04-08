import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as admin from 'firebase-admin';
import { getMessaging } from 'firebase-admin/messaging';
import { Device, DeviceDocument } from '@/database/schemas/device';

@Injectable()
export class PushNotificationsService {
  private readonly logger = new Logger(PushNotificationsService.name);

  constructor(
    @InjectModel(Device.name) private deviceModel: Model<DeviceDocument>,
    private configService: ConfigService,
  ) {
    const firebaseServiceAccount = this.configService.get<string>(
      'FIREBASE_SERVICE_ACCOUNT_KEY_JSON',
    );

    if (!firebaseServiceAccount) {
      this.logger.error(
        'FIREBASE_SERVICE_ACCOUNT_KEY_JSON environment variable not set.',
      );
      return;
    }

    try {
      const serviceAccount = JSON.parse(firebaseServiceAccount);

      if (admin.apps.length === 0) {
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
        });
        this.logger.log('Firebase Admin SDK initialized successfully.');
      }
    } catch (error) {
      this.logger.error(
        'Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY_JSON or initialize Firebase Admin SDK.',
        error.stack,
      );
    }
  }

  async storeDeviceToken(userId: string, token: string): Promise<Device> {
    console.log('storeDeviceToken', { userId });
    return this.deviceModel.findOneAndUpdate(
      { userId },
      { token },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
  }

  async sendPushNotification({
    userId,
    title,
    body,
    data,
  }: {
    userId: string;
    title: string;
    body: string;
    data: { [key: string]: string };
  }) {
    console.log({ userId, title, body, data });
    const devices = await this.deviceModel.find({ userId }).exec();
    const tokens = devices.map((device) => device.token);
    if (tokens.length === 0) {
      console.log('No devices found for this user.');
      return;
    }

    try {
      const response = await getMessaging().sendEachForMulticast({
        data, // Pass the entire data object here
        tokens,
        notification: {
          title,
          body,
        },
      });
      console.log('Successfully sent message:', response);
    } catch (error) {
      console.log('Error sending message:', error);
    }
  }
}
