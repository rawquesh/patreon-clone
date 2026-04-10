import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AdminUser, AdminRole, AdminPermission, ROLE_DEFAULT_PERMISSIONS } from '../schemas/admin-user.schema';
import { User } from '@/database/schemas/user';
import { AuditLogService } from './audit-log.service';
import {
  AuditAction,
  AuditTargetType,
} from '../schemas/audit-log.schema';
import {
  CreateAdminUserDto,
  UpdateAdminUserDto,
  UpdateAdminRoleDto,
  GetAdminsQueryDto,
} from '../dto/admin-user.dto';

@Injectable()
export class AdminUsersService {
  constructor(
    @InjectModel(AdminUser.name)
    private adminUserModel: Model<AdminUser>,
    @InjectModel(User.name)
    private userModel: Model<User>,
    private readonly auditLogService: AuditLogService,
  ) {}

  async getAdmins(query: GetAdminsQueryDto): Promise<{ admins: any[]; total: number }> {
    const { page = 1, limit = 20, role, isActive, search } = query;

    const filter: any = {};
    if (role) filter.role = role;
    if (isActive !== undefined) filter.isActive = isActive;
    if (search) {
      filter.$or = [
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;

    const [admins, total] = await Promise.all([
      this.adminUserModel
        .find(filter)
        .populate('userId', 'displayName email profilePicture firstName lastName')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      this.adminUserModel.countDocuments(filter),
    ]);

    return {
      admins: admins.map((a: any) => ({
        ...a,
        id: a._id.toString(),
        user: a.userId
          ? {
              ...a.userId,
              id: a.userId._id?.toString(),
            }
          : null,
      })),
      total,
    };
  }

  async getAdminById(id: string): Promise<any> {
    const admin = await this.adminUserModel
      .findById(id)
      .populate('userId', 'displayName email profilePicture firstName lastName')
      .lean()
      .exec();
    if (!admin) throw new NotFoundException('Admin not found');
    return {
      ...admin,
      id: admin._id.toString(),
      user: (admin as any).userId
        ? {
            ...(admin as any).userId,
            id: (admin as any).userId._id?.toString(),
          }
        : null,
    };
  }

  async createAdmin(dto: CreateAdminUserDto, adminId: string): Promise<any> {
    const existing = await this.adminUserModel.findOne({
      $or: [{ email: dto.email }, { userId: dto.userId }],
    });
    if (existing) {
      throw new ConflictException('Admin with this email or user ID already exists');
    }

    const user = await this.userModel.findById(dto.userId).lean();
    if (!user) throw new NotFoundException('User not found');

    const permissions = dto.permissions ?? ROLE_DEFAULT_PERMISSIONS[dto.role] ?? [];

    const admin = new this.adminUserModel({
      email: dto.email,
      userId: dto.userId,
      role: dto.role,
      permissions,
    });
    await admin.save();

    await this.auditLogService.log({
      action: AuditAction.ADMIN_CREATED,
      targetType: AuditTargetType.ADMIN_USER,
      targetId: admin._id.toString(),
      performedBy: adminId,
      details: { email: dto.email, role: dto.role },
    });

    return {
      message: 'Admin created successfully',
      admin: {
        id: admin._id.toString(),
        email: admin.email,
        role: admin.role,
        permissions: admin.permissions,
        isActive: admin.isActive,
      },
    };
  }

  async updateAdmin(id: string, dto: UpdateAdminUserDto, adminId: string): Promise<any> {
    const admin = await this.adminUserModel.findById(id);
    if (!admin) throw new NotFoundException('Admin not found');
    if (admin._id.toString() === adminId) {
      throw new BadRequestException('Cannot modify your own admin account');
    }

    if (dto.role !== undefined) admin.role = dto.role;
    if (dto.isActive !== undefined) admin.isActive = dto.isActive;
    if (dto.permissions !== undefined) {
      admin.permissions = dto.permissions;
    } else if (dto.role !== undefined) {
      admin.permissions = ROLE_DEFAULT_PERMISSIONS[dto.role] ?? [];
    }
    await admin.save();

    await this.auditLogService.log({
      action: AuditAction.ADMIN_UPDATED,
      targetType: AuditTargetType.ADMIN_USER,
      targetId: id,
      performedBy: adminId,
      details: { role: dto.role, isActive: dto.isActive },
    });

    return {
      message: 'Admin updated successfully',
      admin: {
        id: admin._id.toString(),
        email: admin.email,
        role: admin.role,
        permissions: admin.permissions,
        isActive: admin.isActive,
      },
    };
  }

  async deleteAdmin(id: string, adminId: string): Promise<any> {
    if (id === adminId) {
      throw new BadRequestException('Cannot delete your own admin account');
    }
    const admin = await this.adminUserModel.findById(id);
    if (!admin) throw new NotFoundException('Admin not found');

    await this.adminUserModel.findByIdAndDelete(id);

    await this.auditLogService.log({
      action: AuditAction.ADMIN_DELETED,
      targetType: AuditTargetType.ADMIN_USER,
      targetId: id,
      performedBy: adminId,
      details: { email: admin.email },
    });

    return { message: 'Admin deleted successfully' };
  }

  async updateAdminRole(id: string, dto: UpdateAdminRoleDto, adminId: string): Promise<any> {
    const admin = await this.adminUserModel.findById(id);
    if (!admin) throw new NotFoundException('Admin not found');

    admin.role = dto.role;
    admin.permissions = dto.permissions ?? ROLE_DEFAULT_PERMISSIONS[dto.role] ?? [];
    await admin.save();

    await this.auditLogService.log({
      action: AuditAction.ADMIN_ROLE_CHANGED,
      targetType: AuditTargetType.ADMIN_USER,
      targetId: id,
      performedBy: adminId,
      details: { newRole: dto.role },
    });

    return {
      message: 'Admin role updated successfully',
      admin: {
        id: admin._id.toString(),
        email: admin.email,
        role: admin.role,
        permissions: admin.permissions,
        isActive: admin.isActive,
      },
    };
  }

  async updateLastLogin(adminId: string): Promise<void> {
    await this.adminUserModel.findOneAndUpdate(
      { userId: adminId },
      { lastLoginAt: new Date() },
    );
  }
}
