import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AuditLog, AuditAction, AuditTargetType } from '../schemas/audit-log.schema';
import { GetAuditLogsQueryDto } from '../dto/audit-log.dto';

export interface LogParams {
  action: AuditAction;
  targetType: AuditTargetType;
  targetId: string;
  performedBy: string;
  details?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

@Injectable()
export class AuditLogService {
  constructor(
    @InjectModel(AuditLog.name)
    private auditLogModel: Model<AuditLog>,
  ) {}

  async log(params: LogParams): Promise<any> {
    const log = new this.auditLogModel({
      action: params.action,
      targetType: params.targetType,
      targetId: params.targetId,
      performedBy: params.performedBy,
      details: params.details,
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
    });
    return log.save();
  }

  async getLogs(query: GetAuditLogsQueryDto): Promise<{ logs: any[]; total: number }> {
    const filter: Record<string, any> = {};

    if (query.action) {
      filter.action = query.action;
    }
    if (query.targetType) {
      filter.targetType = query.targetType;
    }
    if (query.targetId) {
      filter.targetId = query.targetId;
    }
    if (query.performedBy) {
      filter.performedBy = query.performedBy;
    }
    if (query.startDate || query.endDate) {
      filter.createdAt = {};
      if (query.startDate) {
        filter.createdAt.$gte = new Date(query.startDate);
      }
      if (query.endDate) {
        filter.createdAt.$lte = new Date(query.endDate);
      }
    }

    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;
    const sortOrder = query.sortOrder === 'asc' ? 1 : -1;

    const [logs, total] = await Promise.all([
      this.auditLogModel
        .find(filter)
        .sort({ createdAt: sortOrder })
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      this.auditLogModel.countDocuments(filter).lean().exec(),
    ]);

    return { logs, total };
  }
}
