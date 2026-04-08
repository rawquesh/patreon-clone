import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HomeController } from './home.controller';
import { HomeService } from './home.service';
import { User, UserSchema } from '@/schemas/users.schema';
import { Post, PostSchema } from '@/schemas/posts.schema';
import { Subscription, SubscriptionSchema } from '@/schemas/subscribers.schema';
import { CreatorsController } from './creators.controller';
import { UsersModule } from '@/users/users.module';
import { CategoriesController } from './categories.controller';
import { PostsModule } from '@/posts/posts.module';
import { MembershipsModule } from '@/memberships/memberships.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Post.name, schema: PostSchema },
      { name: Subscription.name, schema: SubscriptionSchema },
    ]),
    UsersModule,
    PostsModule,
    MembershipsModule,
  ],
  controllers: [HomeController, CreatorsController, CategoriesController],
  providers: [HomeService],
  exports: [HomeService],
})
export class HomeModule {}
