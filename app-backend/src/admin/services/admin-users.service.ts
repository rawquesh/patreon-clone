import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '@/database/schemas/user';
import { AuditLogService } from './audit-log.service';
import {
  AuditAction,
  AuditTargetType,
} from '../schemas/audit-log.schema';

@Injectable()
export class AdminUsersService {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<User>,
    private readonly auditLogService: AuditLogService,
  ) {}

  async getAdmins(query: any): Promise<{ admins: any[]; total: number }> {
    const { page = 1, limit = 20, search } = query;

    const filter: any = { isAdmin: true };
    if (search) {
      filter.$or = [
        { displayName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      this.userModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      this.userModel.countDocuments(filter),
    ]);

    const admins = users.map((u: any) => ({
      id: u._id.toString(),
      email: u.email,
      isActive: u.isDeactivated !== true,
      lastLoginAt: null,
      createdAt: u.createdAt,
      user: {
        id: u._id.toString(),
        displayName: u.displayName,
        email: u.email,
        profilePicture: u.profilePicture,
        firstName: u.firstName,
        lastName: u.lastName,
      },
    }));

    return { admins, total };
  }

  async updateAdmin(id: string, dto: any, adminId: string): Promise<any> {
    if (id === adminId) {
      throw new BadRequestException('Cannot modify your own admin account');
    }

    const user = await this.userModel.findById(id);
    if (!user) throw new NotFoundException('Admin not found');
    if (!user.isAdmin) throw new NotFoundException('Admin not found');

    if (dto.isAdmin !== undefined) {
      user.isAdmin = dto.isAdmin;
      await user.save();
    }

    await this.auditLogService.log({
      action: AuditAction.ADMIN_UPDATED,
      targetType: AuditTargetType.USER,
      targetId: id,
      performedBy: adminId,
      details: { isAdmin: dto.isAdmin },
    });

    return {
      message: 'Admin updated successfully',
      admin: {
        id: user._id.toString(),
        email: user.email,
      },
    };
  }

  async deleteAdmin(id: string, adminId: string): Promise<any> {
    if (id === adminId) {
      throw new BadRequestException('Cannot delete your own admin account');
    }

    const user = await this.userModel.findById(id);
    if (!user) throw new NotFoundException('Admin not found');
    if (!user.isAdmin) throw new NotFoundException('Admin not found');

    user.isAdmin = false;
    await user.save();

    await this.auditLogService.log({
      action: AuditAction.ADMIN_DELETED,
      targetType: AuditTargetType.USER,
      targetId: id,
      performedBy: adminId,
      details: { email: user.email },
    });

    return { message: 'Admin deleted successfully' };
  }
}
