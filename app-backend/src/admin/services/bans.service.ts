import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Ban, BanType, BanStatus } from '../schemas/ban.schema';
import { User } from '@/database/schemas/user';
import { AuditLogService } from './audit-log.service';
import {
  AuditAction,
  AuditTargetType,
} from '../schemas/audit-log.schema';
import { CreateBanDto, GetBansQueryDto, LiftBanDto } from '../dto/ban.dto';

@Injectable()
export class BansService {
  constructor(
    @InjectModel(Ban.name)
    private banModel: Model<Ban>,
    @InjectModel(User.name)
    private userModel: Model<User>,
    private readonly auditLogService: AuditLogService,
  ) {}

  async getBans(query: GetBansQueryDto): Promise<{ bans: any[]; total: number }> {
    const { page = 1, limit = 20, type, status, userId } = query;

    // Expire stale bans on read
    await this.expireBans();

    const filter: any = {};
    if (type) filter.type = type;
    if (status) filter.status = status;
    if (userId) filter.userId = userId;

    const skip = (page - 1) * limit;

    const [bans, total] = await Promise.all([
      this.banModel
        .find(filter)
        .populate('bannedBy', 'displayName email')
        .populate('liftedBy', 'displayName email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      this.banModel.countDocuments(filter),
    ]);

    return {
      bans: bans.map((b: any) => ({
        ...b,
        id: b._id.toString(),
        bannedBy: b.bannedBy
          ? {
              ...b.bannedBy,
              id: b.bannedBy._id?.toString(),
            }
          : null,
        liftedBy: b.liftedBy
          ? {
              ...b.liftedBy,
              id: b.liftedBy._id?.toString(),
            }
          : null,
      })),
      total,
    };
  }

  async getBanById(id: string): Promise<any> {
    await this.expireBans();
    const ban = await this.banModel
      .findById(id)
      .populate('bannedBy', 'displayName email')
      .populate('liftedBy', 'displayName email')
      .lean()
      .exec();
    if (!ban) throw new NotFoundException('Ban not found');
    return {
      ...ban,
      id: ban._id.toString(),
      bannedBy: (ban as any).bannedBy
        ? {
            ...(ban as any).bannedBy,
            id: (ban as any).bannedBy._id?.toString(),
          }
        : null,
      liftedBy: (ban as any).liftedBy
        ? {
            ...(ban as any).liftedBy,
            id: (ban as any).liftedBy._id?.toString(),
          }
        : null,
    };
  }

  async createBan(dto: CreateBanDto, adminId: string): Promise<any> {
    if (dto.type === BanType.ACCOUNT && dto.userId) {
      const user = await this.userModel.findById(dto.userId);
      if (!user) throw new NotFoundException('User not found');
      if (user.isAdmin) {
        throw new BadRequestException('Cannot ban admin users');
      }

      // Check existing active ban
      const existingBan = await this.banModel.findOne({
        userId: dto.userId,
        status: BanStatus.ACTIVE,
      });
      if (existingBan) {
        throw new ConflictException('User already has an active ban');
      }

      const ban = new this.banModel({
        userId: dto.userId,
        type: dto.type,
        reason: dto.reason,
        adminNotes: dto.adminNotes,
        bannedBy: adminId,
        expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : undefined,
        status: BanStatus.ACTIVE,
      });
      await ban.save();

      // Deactivate the user account
      user.isDeactivated = true;
      await user.save();

      await this.auditLogService.log({
        action: AuditAction.BAN_CREATED,
        targetType: AuditTargetType.BAN,
        targetId: ban._id.toString(),
        performedBy: adminId,
        details: {
          userId: dto.userId,
          type: dto.type,
          reason: dto.reason,
          expiresAt: dto.expiresAt,
        },
      });

      return {
        message: 'User banned successfully',
        ban: {
          id: ban._id.toString(),
          userId: ban.userId,
          type: ban.type,
          reason: ban.reason,
          status: ban.status,
          expiresAt: ban.expiresAt,
        },
      };
    } else {
      // IP or Email ban
      const identifier = dto.targetIdentifier;
      if (!identifier) {
        throw new BadRequestException('targetIdentifier is required for IP/Email bans');
      }

      const existingBan = await this.banModel.findOne({
        type: dto.type,
        status: BanStatus.ACTIVE,
        userId: identifier,
      });
      if (existingBan) {
        throw new BadRequestException('This target already has an active ban');
      }

      const ban = new this.banModel({
        userId: identifier,
        type: dto.type,
        reason: dto.reason,
        adminNotes: dto.adminNotes,
        bannedBy: adminId,
        expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : undefined,
        status: BanStatus.ACTIVE,
      });
      await ban.save();

      await this.auditLogService.log({
        action: AuditAction.BAN_CREATED,
        targetType: AuditTargetType.BAN,
        targetId: ban._id.toString(),
        performedBy: adminId,
        details: {
          type: dto.type,
          reason: dto.reason,
          expiresAt: dto.expiresAt,
        },
      });

      return {
        message: 'Ban created successfully',
        ban: {
          id: ban._id.toString(),
          type: ban.type,
          reason: ban.reason,
          status: ban.status,
          expiresAt: ban.expiresAt,
        },
      };
    }
  }

  async liftBan(id: string, dto: LiftBanDto, adminId: string): Promise<any> {
    const ban = await this.banModel.findById(id);
    if (!ban) throw new NotFoundException('Ban not found');
    if (ban.status !== BanStatus.ACTIVE) {
      throw new BadRequestException('Ban is not active');
    }

    ban.status = BanStatus.LIFTED;
    ban.liftedBy = adminId;
    ban.liftedAt = new Date();
    if (dto.adminNotes) ban.adminNotes = dto.adminNotes;
    await ban.save();

    // Reactivate user if it was an account ban
    if (ban.type === BanType.ACCOUNT && ban.userId) {
      await this.userModel.findByIdAndUpdate(ban.userId, {
        isDeactivated: false,
      });
    }

    await this.auditLogService.log({
      action: AuditAction.BAN_LIFTED,
      targetType: AuditTargetType.BAN,
      targetId: id,
      performedBy: adminId,
      details: { adminNotes: dto.adminNotes },
    });

    return {
      message: 'Ban lifted successfully',
      banId: id,
    };
  }

  async getBanStats(): Promise<any> {
    await this.expireBans();

    const [activeBans, expiredBans, accountBans, ipBans, emailBans] = await Promise.all([
      this.banModel.countDocuments({ status: BanStatus.ACTIVE }),
      this.banModel.countDocuments({ status: BanStatus.EXPIRED }),
      this.banModel.countDocuments({ type: BanType.ACCOUNT, status: BanStatus.ACTIVE }),
      this.banModel.countDocuments({ type: BanType.IP, status: BanStatus.ACTIVE }),
      this.banModel.countDocuments({ type: BanType.EMAIL, status: BanStatus.ACTIVE }),
    ]);

    return {
      activeBans,
      expiredBans,
      byType: {
        account: accountBans,
        ip: ipBans,
        email: emailBans,
      },
    };
  }

  async checkBan(userId?: string, ipAddress?: string, email?: string): Promise<boolean> {
    await this.expireBans();

    const filter: any = { status: BanStatus.ACTIVE };
    if (userId) filter.userId = userId;
    else if (ipAddress) filter.userId = ipAddress;
    else if (email) filter.userId = email;

    const ban = await this.banModel.findOne(filter);
    return !!ban;
  }

  private async expireBans(): Promise<void> {
    await this.banModel.updateMany(
      {
        status: BanStatus.ACTIVE,
        expiresAt: { $lt: new Date(), $exists: true },
      },
      { $set: { status: BanStatus.EXPIRED } },
    );
  }
}

