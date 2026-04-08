import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { S3Module } from './s3/s3.module';
import { PostsModule } from './posts/posts.module';
import { CollectionsModule } from './collections/collections.module';
import { MulterModule } from '@nestjs/platform-express';
import { MembershipsModule } from './memberships/memberships.module';
import { PaymentsModule } from './payments/payments.module';
import { MembersModule } from './members/members.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { NotificationsModule } from './notifications/notifications.module';
import { PromotionsModule } from './promotions/promotions.module';
import { ChatModule } from './chat/chat.module';
import { SearchModule } from './search/search.module';
import { HomeModule } from './home/home.module';
import { CreatorHistoryModule } from './creator-history/creator-history.module';
import { WebhooksModule } from './webhooks/webhooks.module';
import { PushNotificationsModule } from './push-notifications/push-notifications.module';
import { ReportsModule } from './reports/reports.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRoot(process.env.MONGODB_URI),
    UsersModule,
    AuthModule,
    S3Module,
    PostsModule,
    CollectionsModule,
    MulterModule.register({
      limits: {
        fileSize: 1000 * 1024 * 1024,
      },
    }),
    MembershipsModule,
    PaymentsModule,
    MembersModule,
    AnalyticsModule,
    NotificationsModule,
    PromotionsModule,
    ChatModule,
    SearchModule,
    HomeModule,
    CreatorHistoryModule,
    WebhooksModule,
    PushNotificationsModule,
    ReportsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
