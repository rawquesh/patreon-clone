import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';
import {
  PostReport,
  PostReportSchema,
} from '@/database/schemas/report/post-report.schema';
import {
  UserReport,
  UserReportSchema,
} from '@/database/schemas/report/user-report.schema';
import { Post, PostSchema } from '@/database/schemas/post';
import { User, UserSchema } from '@/database/schemas/user';
import {
  WithheldPost,
  WithheldPostSchema,
} from '@/database/schemas/report/withheld.schema';
import {
  WithheldUser,
  WithheldUserSchema,
} from '@/database/schemas/report/withheld.schema';

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
