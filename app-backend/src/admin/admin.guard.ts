import { Injectable, CanActivate, ExecutionContext, Inject, forwardRef } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '@/database/schemas/user';
import { AdminUser } from './schemas/admin-user.schema';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(AdminUser.name) private adminUserModel: Model<AdminUser>,
    private reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.userId) {
      return false;
    }

    // Primary check: AdminUser model (new role-based system)
    const adminUser = await this.adminUserModel
      .findOne({ userId: user.userId, isActive: true })
      .lean()
      .exec();

    if (adminUser) {
      return true;
    }

    // Backward-compatible fallback: check isAdmin flag on User model
    // This ensures existing superadmins (created before this module) still work
    const userRecord = await this.userModel.findById(user.userId).lean().exec();
    return !!userRecord?.isAdmin;
  }
}
