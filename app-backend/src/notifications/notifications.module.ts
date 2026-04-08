import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { NotificationGeneratorService } from './notification-generator.service';
import {
  Notification,
  NotificationSchema,
} from '@/database/schemas/notification';
import { Post, PostSchema } from '@/database/schemas/post';
import { User, UserSchema } from '@/database/schemas/user';
import {
  Subscription,
  SubscriptionSchema,
} from '@/database/schemas/subscription';
import { PushNotificationsModule } from '@/push-notifications/push-notifications.module';
import { UsersModule } from '@/users/users.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Notification.name, schema: NotificationSchema },
      { name: Post.name, schema: PostSchema },
      { name: User.name, schema: UserSchema },
      { name: Subscription.name, schema: SubscriptionSchema },
    ]),
    PushNotificationsModule,
    forwardRef(() => UsersModule),
  ],
  controllers: [NotificationsController],
  providers: [NotificationsService, NotificationGeneratorService],
  exports: [NotificationsService, NotificationGeneratorService],
})
export class NotificationsModule {}
