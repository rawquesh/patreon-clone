import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AdminGuard } from '../admin.guard';
import { AdminUser, AdminUserSchema } from './admin-user.schema';
import { User, UserSchema } from '@/database/schemas/user';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: AdminUser.name, schema: AdminUserSchema },
    ]),
  ],
  providers: [AdminGuard],
  exports: [AdminGuard],
})
export class AdminGuardModule {}
