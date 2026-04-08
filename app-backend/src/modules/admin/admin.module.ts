import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { AdminGuard } from './admin.guard';
import {
  PostReport,
  PostReportSchema,
} from '@/database/schemas/report/post-report.schema';
import {
  UserReport,
  UserReportSchema,
} from '@/database/schemas/report/user-report.schema';
import {
  WithheldPost,
  WithheldPostSchema,
  WithheldUser,
  WithheldUserSchema,
} from '@/database/schemas/report/withheld.schema';
import { Post, PostSchema } from '@/database/schemas/post';
import { User, UserSchema } from '@/database/schemas/user';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PostReport.name, schema: PostReportSchema },
      { name: UserReport.name, schema: UserReportSchema },
      { name: WithheldPost.name, schema: WithheldPostSchema },
      { name: WithheldUser.name, schema: WithheldUserSchema },
      { name: Post.name, schema: PostSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [AdminController],
  providers: [AdminService, AdminGuard],
  exports: [AdminService, AdminGuard],
})
export class AdminModule {}
