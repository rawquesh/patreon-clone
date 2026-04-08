import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '@/database/schemas/user';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.userId) {
      return false;
    }

    const userRecord = await this.userModel.findById(user.userId).lean();
    return !!userRecord?.isAdmin;
  }
}
