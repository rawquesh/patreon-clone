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

    // Query User collection for isAdmin=true, then left-join AdminUser for role/permissions
    const userFilter: any = { isAdmin: true };
    if (search) {
      userFilter.$or = [
        { displayName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
      ];
    }
    if (isActive !== undefined) {
      userFilter.isDeactivated = isActive ? { $ne: true } : true;
    }

    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      this.userModel
        .find(userFilter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      this.userModel.countDocuments(userFilter),
    ]);

    // Fetch AdminUser records for all returned users
    const adminUserMap = new Map<string, any>();
    if (users.length > 0) {
      const adminUsersForUsers = await this.adminUserModel
        .find({ userId: { $in: users.map((u: any) => u._id) } })
        .lean()
        .exec();
      for (const au of adminUsersForUsers) {
        adminUserMap.set((au as any).userId?.toString(), au);
      }
    }

    // Apply role filter if specified (after join)
    let admins = users.map((u: any) => {
      const adminUser = adminUserMap.get(u._id.toString());
      return {
        id: adminUser?._id?.toString() || u._id.toString(),
        email: u.email,
        role: adminUser?.role || 'viewer',
        permissions: adminUser?.permissions || [],
        isActive: adminUser?.isActive ?? true,
        lastLoginAt: adminUser?.lastLoginAt || null,
        createdAt: adminUser?.createdAt || u.createdAt,
        user: {
          id: u._id.toString(),
          displayName: u.displayName,
          email: u.email,
          profilePicture: u.profilePicture,
          firstName: u.firstName,
          lastName: u.lastName,
        },
      };
    });

    if (role) {
      admins = admins.filter((a) => a.role === role);
    }

    return { admins, total };
  }

  async getAdminById(id: string): Promise<any> {
    // Try AdminUser first, then fall back to User (id could be either)
    let adminUser = await this.adminUserModel
      .findById(id)
      .populate('userId', 'displayName email profilePicture firstName lastName')
      .lean()
      .exec();

    if (!adminUser) {
      // Fall back: treat id as a User id and check isAdmin
      const user = await this.userModel.findById(id).lean().exec();
      if (!user || !user.isAdmin) throw new NotFoundException('Admin not found');
      const linkedAdminUser = await this.adminUserModel
        .findOne({ userId: user._id })
        .lean()
        .exec();
      if (linkedAdminUser) {
        adminUser = linkedAdminUser as any;
        (adminUser as any).userId = user;
      } else {
        return {
          id: user._id.toString(),
          email: user.email,
          role: 'viewer',
          permissions: [],
          isActive: true,
          lastLoginAt: null,
          user: {
            id: user._id.toString(),
            displayName: user.displayName,
            email: user.email,
            profilePicture: user.profilePicture,
            firstName: user.firstName,
            lastName: user.lastName,
          },
        };
      }
    }

    return {
      ...adminUser,
      id: adminUser._id.toString(),
      user: (adminUser as any).userId
        ? {
            ...(adminUser as any).userId,
            id: (adminUser as any).userId._id?.toString(),
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

    const user = await this.userModel.findById(dto.userId);
    if (!user) throw new NotFoundException('User not found');

    // Set isAdmin=true on the User document
    user.isAdmin = true;
    await user.save();

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

    // Toggle isAdmin on the underlying User document
    if (dto.isAdmin !== undefined) {
      const user = await this.userModel.findById(admin.userId);
      if (user) {
        user.isAdmin = dto.isAdmin;
        await user.save();
      }
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
