import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '@/database/schemas/user';
import { Subscription } from '@/database/schemas/subscription/subscription.schema';
import { AuditLogService } from './audit-log.service';
import {
  AuditAction,
  AuditTargetType,
} from '../schemas/audit-log.schema';
import { GetMembersQueryDto } from '../dto/members.dto';

@Injectable()
export class MembersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Subscription.name)
    private subscriptionModel: Model<Subscription>,
    private readonly auditLogService: AuditLogService,
  ) {}

  async getMembers(
    query: GetMembersQueryDto,
  ): Promise<{ members: any[]; total: number }> {
    const {
      page = 1,
      limit = 20,
      search,
      status,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = query;

    const filter: any = { isCreator: { $ne: true }, isAdmin: { $ne: true } };
    if (status === 'active') filter.isDeactivated = { $ne: true };
    if (status === 'inactive') filter.isDeactivated = true;
    if (search) {
      filter.$or = [
        { displayName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
      ];
    }

    const sortObj: any = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };
    const skip = (page - 1) * limit;

    const [members, total] = await Promise.all([
      this.userModel
        .find(filter)
        .select(
          'email displayName firstName lastName profilePicture countryOfResidence createdAt isDeactivated stripeCustomerId isAdmin',
        )
        .sort(sortObj)
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      this.userModel.countDocuments(filter),
    ]);

    const enrichedMembers = await Promise.all(
      members.map(async (member: any) => {
        const activeSubscription = await this.subscriptionModel
          .findOne({ subscriber: member._id, status: 'active' })
          .populate('creator', 'displayName creatorUsername')
          .populate('membership', 'name monthlyRate')
          .lean()
          .exec();

        return {
          ...member,
          id: member._id.toString(),
          subscription: activeSubscription
            ? {
                plan: (activeSubscription.membership as any)?.name || 'Unknown',
                status: activeSubscription.status,
                amount: (activeSubscription.membership as any)?.monthlyRate || 0,
                creator:
                  (activeSubscription.creator as any)?.displayName ||
                  (activeSubscription.creator as any)?.creatorUsername ||
                  'Unknown',
              }
            : null,
        };
      }),
    );

    return { members: enrichedMembers, total };
  }

  async getMemberById(id: string): Promise<any> {
    const member = await this.userModel
      .findById(id)
      .select(
        'email displayName firstName lastName profilePicture countryOfResidence createdAt isDeactivated stripeCustomerId isAdmin',
      )
      .lean()
      .exec();

    if (!member) throw new NotFoundException('Member not found');

    const subscriptions = await this.subscriptionModel
      .find({ subscriber: id })
      .populate('creator', 'displayName creatorUsername profilePicture')
      .populate('membership', 'name monthlyRate description')
      .sort({ createdAt: -1 })
      .lean()
      .exec();

    return {
      ...member,
      id: member._id.toString(),
      subscriptions: subscriptions.map((s: any) => ({
        id: s._id.toString(),
        status: s.status,
        monthlyRate: s.monthlyRate,
        currentPeriodStart: s.currentPeriodStart,
        currentPeriodEnd: s.currentPeriodEnd,
        createdAt: s.createdAt,
        creator: s.creator
          ? {
              id: s.creator._id?.toString(),
              displayName: s.creator.displayName,
              creatorUsername: s.creator.creatorUsername,
              profilePicture: s.creator.profilePicture,
            }
          : null,
        membership: s.membership
          ? {
              id: s.membership._id?.toString(),
              name: s.membership.name,
              monthlyRate: s.membership.monthlyRate,
              description: s.membership.description,
            }
          : null,
      })),
    };
  }

  async deactivateMember(id: string, adminId: string): Promise<any> {
    const member = await this.userModel.findById(id);
    if (!member) throw new NotFoundException('Member not found');
    if (member.isCreator) throw new BadRequestException('User is a creator');
    if (member.isAdmin) throw new BadRequestException('Cannot deactivate admin users');

    member.isDeactivated = true;
    await member.save();

    await this.auditLogService.log({
      action: AuditAction.USER_DEACTIVATED,
      targetType: AuditTargetType.USER,
      targetId: id,
      performedBy: adminId,
    });

    return {
      message: 'Member deactivated successfully',
      member: {
        id: (member._id as any).toString(),
        displayName: member.displayName,
        email: member.email,
        isDeactivated: member.isDeactivated,
      },
    };
  }

  async activateMember(id: string, adminId: string): Promise<any> {
    const member = await this.userModel.findById(id);
    if (!member) throw new NotFoundException('Member not found');

    member.isDeactivated = false;
    await member.save();

    await this.auditLogService.log({
      action: AuditAction.USER_REACTIVATED,
      targetType: AuditTargetType.USER,
      targetId: id,
      performedBy: adminId,
    });

    return {
      message: 'Member activated successfully',
      member: {
        id: (member._id as any).toString(),
        displayName: member.displayName,
        email: member.email,
        isDeactivated: member.isDeactivated,
      },
    };
  }

  async promoteToAdmin(id: string, adminId: string): Promise<any> {
    const member = await this.userModel.findById(id);
    if (!member) throw new NotFoundException('Member not found');
    if (member.isAdmin) throw new BadRequestException('User is already an admin');
    if (member.isCreator) throw new BadRequestException('Cannot promote a creator to admin');

    member.isAdmin = true;
    await member.save();

    await this.auditLogService.log({
      action: AuditAction.ADMIN_CREATED,
      targetType: AuditTargetType.USER,
      targetId: id,
      performedBy: adminId,
      details: { displayName: member.displayName, email: member.email },
    });

    return {
      message: 'Member promoted to admin successfully',
      member: {
        id: (member._id as any).toString(),
        displayName: member.displayName,
        email: member.email,
        isAdmin: member.isAdmin,
      },
    };
  }
}
