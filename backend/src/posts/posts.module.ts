import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { Post, PostSchema } from '@/schemas/posts.schema';
import { S3Module } from '@/s3/s3.module';
import { MembershipsModule } from '@/memberships/memberships.module';
import { NotificationsModule } from '@/notifications/notifications.module';
import { Subscription, SubscriptionSchema } from '@/schemas/subscribers.schema';
import { Membership, MembershipSchema } from '@/schemas/membersip.schema';
import { PostInsight, PostInsightSchema } from '@/schemas/analytics.schema';
import { User, UserSchema } from '@/schemas/users.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Post.name, schema: PostSchema },
      { name: Subscription.name, schema: SubscriptionSchema },
      { name: Membership.name, schema: MembershipSchema },
      { name: PostInsight.name, schema: PostInsightSchema },
      { name: User.name, schema: UserSchema },
    ]),
    S3Module,
    MembershipsModule,
    NotificationsModule,
  ],
  providers: [PostsService],
  controllers: [PostsController],
  exports: [PostsService],
})
export class PostsModule {}
