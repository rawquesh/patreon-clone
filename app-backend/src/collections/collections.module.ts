import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CollectionsService } from './collections.service';
import { CollectionsController } from './collections.controller';
import { S3Module } from '../s3/s3.module';
import { Collection, CollectionSchema } from './collections.schema';
import { Post, PostSchema } from '@/database/schemas/post';
import {
  Subscription,
  SubscriptionSchema,
} from '@/database/schemas/subscription';
import { MembershipsModule } from '@/memberships/memberships.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Collection.name, schema: CollectionSchema },
      { name: Post.name, schema: PostSchema },
      { name: Subscription.name, schema: SubscriptionSchema },
    ]),
    S3Module,
    MembershipsModule,
  ],
  providers: [CollectionsService],
  controllers: [CollectionsController],
  exports: [CollectionsService],
})
export class CollectionsModule {}
