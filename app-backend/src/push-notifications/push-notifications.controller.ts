import { Controller, Post, Body } from '@nestjs/common';
import { PushNotificationsService } from './push-notifications.service';

@Controller('push-notifications')
export class PushNotificationsController {
  constructor(
    private readonly pushNotificationsService: PushNotificationsService,
  ) {}

  @Post('store-token')
  storeToken(@Body() body: { userId: string; token: string }) {
    return this.pushNotificationsService.storeDeviceToken(
      body.userId,
      body.token,
    );
  }

  @Post('send')
  sendNotification(
    @Body() body: { userId: string; title: string; body: string },
  ) {
    return this.pushNotificationsService.sendPushNotification({
      userId: body.userId,
      title: body.title,
      body: body.body,
      data: {},
    });
  }
}
