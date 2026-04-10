import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AdminGuard } from '../admin.guard';
import { AdminUser, AdminUserSchema } from './admin-user.schema';
import { AuthModule } from '@/auth/auth.module';

@Module({
  imports: [
    forwardRef(() => AuthModule),
    MongooseModule.forFeature([
      { name: AdminUser.name, schema: AdminUserSchema },
    ]),
  ],
  providers: [AdminGuard],
  exports: [AdminGuard],
})
export class AdminGuardModule {}
