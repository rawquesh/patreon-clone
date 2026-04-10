import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PayoutRequest } from '@/database/schemas/payout/payout.schema';
import { User } from '@/database/schemas/user';
import { PaymentsService } from '@/payments/payments.service';
import { AuditLogService } from './audit-log.service';
import {
  AuditAction,
  AuditTargetType,
} from '../schemas/audit-log.schema';
import { GetPayoutsQueryDto } from '../dto/payouts.dto';

@Injectable()
export class PayoutsService {
  constructor(
    @InjectModel(PayoutRequest.name)
    private payoutRequestModel: Model<PayoutRequest>,
    @InjectModel(User.name) private userModel: Model<User>,
    private paymentsService: PaymentsService,
    private readonly auditLogService: AuditLogService,
  ) {}

  async getPayouts(
    query: GetPayoutsQueryDto,
  ): Promise<{ payouts: any[]; total: number }> {
    const {
      page = 1,
      limit = 20,
      status,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = query;

    const filter: any = {};
    if (status) filter.status = status;

    const sortObj: any = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };
    const skip = (page - 1) * limit;

    const [payouts, total] = await Promise.all([
      this.payoutRequestModel
        .find(filter)
        .populate('creator', 'displayName creatorUsername profilePicture firstName lastName email availableBalance')
        .sort(sortObj)
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      this.payoutRequestModel.countDocuments(filter),
    ]);

    return {
      payouts: payouts.map((p: any) => ({
        id: p._id.toString(),
        amount: p.amount,
        status: p.status,
        stripeTransferId: p.stripeTransferId,
        completedAt: p.completedAt,
        failureReason: p.failureReason,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
        creator: p.creator
          ? {
              id: p.creator._id?.toString(),
              name:
                p.creator.displayName ||
                p.creator.creatorUsername ||
                `${p.creator.firstName || ''} ${p.creator.lastName || ''}`.trim(),
              username: p.creator.creatorUsername,
              avatar: p.creator.profilePicture,
              availableBalance: p.creator.availableBalance,
            }
          : null,
      })),
      total,
    };
  }

  async getPayoutById(id: string): Promise<any> {
    const payout = await this.payoutRequestModel
      .findById(id)
      .populate('creator', 'displayName creatorUsername profilePicture firstName lastName email availableBalance pendingBalance lifetimeEarnings stripeConnectAccountId')
      .lean()
      .exec();

    if (!payout) throw new NotFoundException('Payout not found');

    return {
      id: payout._id.toString(),
      amount: payout.amount,
      status: payout.status,
      stripeTransferId: payout.stripeTransferId,
      completedAt: payout.completedAt,
      failureReason: payout.failureReason,
      createdAt: payout.createdAt,
      updatedAt: payout.updatedAt,
      creator: payout.creator
        ? {
            id: (payout.creator as any)._id?.toString(),
            name:
              (payout.creator as any).displayName ||
              (payout.creator as any).creatorUsername ||
              `${(payout.creator as any).firstName || ''} ${(payout.creator as any).lastName || ''}`.trim(),
            username: (payout.creator as any).creatorUsername,
            avatar: (payout.creator as any).profilePicture,
            availableBalance: (payout.creator as any).availableBalance,
            pendingBalance: (payout.creator as any).pendingBalance,
            lifetimeEarnings: (payout.creator as any).lifetimeEarnings,
            hasStripeConnect: !!(payout.creator as any).stripeConnectAccountId,
          }
        : null,
    };
  }

  async approvePayout(id: string, adminId: string): Promise<any> {
    const payout = await this.payoutRequestModel.findById(id);
    if (!payout) throw new NotFoundException('Payout not found');
    if (payout.status !== 'pending') {
      throw new BadRequestException('Only pending payouts can be approved');
    }

    const creator = await this.userModel.findById(payout.creator);
    if (!creator) throw new NotFoundException('Creator not found');

    if ((creator.availableBalance || 0) < payout.amount) {
      throw new BadRequestException('Insufficient balance for this payout');
    }

    try {
      await this.paymentsService.initiatePayoutToBank(
        payout.creator.toString(),
        payout.amount,
      );

      payout.status = 'completed';
      payout.completedAt = new Date();
      payout.stripeTransferId = `tr_${Date.now()}`;
      await payout.save();

      creator.availableBalance = Math.max(0, creator.availableBalance - payout.amount);
      await creator.save();

      await this.auditLogService.log({
        action: AuditAction.PAYOUT_APPROVED,
        targetType: AuditTargetType.PAYOUT,
        targetId: id,
        performedBy: adminId,
        details: { amount: payout.amount, creatorId: payout.creator.toString() },
      });

      return {
        message: 'Payout approved and processed successfully',
        payoutId: id,
        amount: payout.amount,
        status: 'completed',
      };
    } catch (error) {
      payout.status = 'failed';
      payout.failureReason = error.message || 'Stripe transfer failed';
      await payout.save();
      throw new BadRequestException(`Payout failed: ${error.message}`);
    }
  }

  async rejectPayout(id: string, reason: string, adminId: string): Promise<any> {
    const payout = await this.payoutRequestModel.findById(id);
    if (!payout) throw new NotFoundException('Payout not found');
    if (payout.status !== 'pending') {
      throw new BadRequestException('Only pending payouts can be rejected');
    }

    payout.status = 'failed';
    payout.failureReason = reason || 'Rejected by admin';
    await payout.save();

    const creator = await this.userModel.findById(payout.creator);
    if (creator) {
      creator.pendingBalance = Math.max(
        0,
        creator.pendingBalance - payout.amount,
      );
      creator.availableBalance += payout.amount;
      await creator.save();
    }

    await this.auditLogService.log({
      action: AuditAction.PAYOUT_REJECTED,
      targetType: AuditTargetType.PAYOUT,
      targetId: id,
      performedBy: adminId,
      details: { reason, amount: payout.amount, creatorId: payout.creator.toString() },
    });

    return {
      message: 'Payout rejected successfully',
      payoutId: id,
      status: 'failed',
    };
  }

  async getPayoutStats(): Promise<any> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      pendingCount,
      pendingAmount,
      completedThisMonth,
      completedThisMonthAmount,
      totalCompleted,
      totalRejected,
    ] = await Promise.all([
      this.payoutRequestModel.countDocuments({ status: 'pending' }).exec(),
      this.payoutRequestModel
        .aggregate([
          { $match: { status: 'pending' } },
          { $group: { _id: null, total: { $sum: '$amount' } } },
        ])
        .exec(),
      this.payoutRequestModel
        .countDocuments({
          status: 'completed',
          completedAt: { $gte: startOfMonth },
        })
        .exec(),
      this.payoutRequestModel
        .aggregate([
          {
            $match: {
              status: 'completed',
              completedAt: { $gte: startOfMonth },
            },
          },
          { $group: { _id: null, total: { $sum: '$amount' } } },
        ])
        .exec(),
      this.payoutRequestModel
        .aggregate([
          { $match: { status: 'completed' } },
          { $group: { _id: null, total: { $sum: '$amount' } } },
        ])
        .exec(),
      this.payoutRequestModel
        .countDocuments({ status: 'failed' })
        .exec(),
    ]);

    return {
      pendingCount,
      pendingAmount: Math.round((pendingAmount[0]?.total || 0) * 100) / 100,
      paidThisMonth: completedThisMonth,
      paidThisMonthAmount:
        Math.round((completedThisMonthAmount[0]?.total || 0) * 100) / 100,
      totalPaid: Math.round((totalCompleted[0]?.total || 0) * 100) / 100,
      rejectedCount: totalRejected,
    };
  }
}
