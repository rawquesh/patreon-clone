import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { NotificationGeneratorService } from './notification-generator.service';
import {
  Notification,
  NotificationSchema,
} from '@/schemas/notifications.schema';
import { Post, PostSchema } from '@/schemas/posts.schema';
import { User, UserSchema } from '@/schemas/users.schema';
import { Subscription, SubscriptionSchema } from '@/schemas/subscribers.schema';
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
