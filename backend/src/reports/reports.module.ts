import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';
import { PostReport, PostReportSchema } from '@/schemas/post-reports.schema';
import { UserReport, UserReportSchema } from '@/schemas/user-reports.schema';
import { Post, PostSchema } from '@/schemas/posts.schema';
import { User, UserSchema } from '@/schemas/users.schema';
import {
  WithheldPost,
  WithheldPostSchema,
} from '@/schemas/withheld-posts.schema';
import {
  WithheldUser,
  WithheldUserSchema,
} from '@/schemas/withheld-users.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PostReport.name, schema: PostReportSchema },
      { name: UserReport.name, schema: UserReportSchema },
      { name: Post.name, schema: PostSchema },
      { name: User.name, schema: UserSchema },
      { name: WithheldPost.name, schema: WithheldPostSchema },
      { name: WithheldUser.name, schema: WithheldUserSchema },
    ]),
  ],
  controllers: [ReportsController],
  providers: [ReportsService],
  exports: [ReportsService],
})
export class ReportsModule {}
