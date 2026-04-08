import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CreatorHistoryService } from './creator-history.service';
import { CreatorController } from './creator.controller';
import { User, UserSchema } from '@/database/schemas/user';
import {
  CreatorVisit,
  CreatorVisitSchema,
} from '@/database/schemas/engagement';
import {
  Subscription,
  SubscriptionSchema,
} from '@/database/schemas/subscription';
import { PostsModule } from '@/posts/posts.module';
import { MembershipsModule } from '@/memberships/memberships.module';
import { CollectionsModule } from '@/collections/collections.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: CreatorVisit.name, schema: CreatorVisitSchema },
      { name: Subscription.name, schema: SubscriptionSchema },
    ]),
    PostsModule,
    MembershipsModule,
    CollectionsModule,
  ],
  controllers: [CreatorController],
  providers: [CreatorHistoryService],
  exports: [CreatorHistoryService],
})
export class CreatorHistoryModule {}
