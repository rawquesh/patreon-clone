import { Injectable } from '@nestjs/common';
import { CreatorsService } from './creators.service';
import { MembersService } from './members.service';
import { ContentService } from './content.service';
import { SubscriptionsService } from './subscriptions.service';
import { ReportsService } from './reports.service';
import { AuditLogService } from './audit-log.service';
import {
  AuditAction,
  AuditTargetType,
} from '../schemas/audit-log.schema';
import {
  BulkCreatorsDto,
  BulkMembersDto,
  BulkPostsDto,
  BulkSubscriptionsDto,
  BulkReportsDto,
} from '../dto/bulk-operations.dto';
import { CreatorActionDto } from '../dto/creators.dto';
import { WithholdContentDto } from '../dto/content.dto';
import { ReportStatus } from '@/database/schemas/report/enums';

export interface BulkResult {
  successful: string[];
  failed: Array<{ id: string; reason: string }>;
}

@Injectable()
export class BulkOperationsService {
  constructor(
    private readonly creatorsService: CreatorsService,
    private readonly membersService: MembersService,
    private readonly contentService: ContentService,
    private readonly subscriptionsService: SubscriptionsService,
    private readonly reportsService: ReportsService,
    private readonly auditLogService: AuditLogService,
  ) {}

  async bulkCreators(dto: BulkCreatorsDto, adminId: string): Promise<BulkResult> {
    const { ids, action, reason } = dto;
    const successful: string[] = [];
    const failed: Array<{ id: string; reason: string }> = [];

    for (const id of ids) {
      try {
        const actionDto: CreatorActionDto = { reason };
        if (action === 'approve') {
          await this.creatorsService.approveCreator(id, actionDto, adminId);
        } else if (action === 'reject') {
          await this.creatorsService.rejectCreator(id, actionDto, adminId);
        } else if (action === 'suspend') {
          await this.creatorsService.suspendCreator(id, actionDto, adminId);
        } else if (action === 'activate') {
          await this.creatorsService.activateCreator(id, adminId);
        }
        successful.push(id);
      } catch (e: any) {
        failed.push({ id, reason: e.message || 'Unknown error' });
      }
    }

    await this.auditLogService.log({
      action: AuditAction.BULK_ACTION,
      targetType: AuditTargetType.USER,
      targetId: ids.join(','),
      performedBy: adminId,
      details: { entity: 'creators', action, successfulCount: successful.length, failedCount: failed.length },
    });

    return { successful, failed };
  }

  async bulkMembers(dto: BulkMembersDto, adminId: string): Promise<BulkResult> {
    const { ids, action, reason } = dto;
    const successful: string[] = [];
    const failed: Array<{ id: string; reason: string }> = [];

    for (const id of ids) {
      try {
        if (action === 'activate') {
          await this.membersService.activateMember(id, adminId);
        } else if (action === 'deactivate') {
          await this.membersService.deactivateMember(id, adminId);
        }
        successful.push(id);
      } catch (e: any) {
        failed.push({ id, reason: e.message || 'Unknown error' });
      }
    }

    await this.auditLogService.log({
      action: AuditAction.BULK_ACTION,
      targetType: AuditTargetType.USER,
      targetId: ids.join(','),
      performedBy: adminId,
      details: { entity: 'members', action, successfulCount: successful.length, failedCount: failed.length },
    });

    return { successful, failed };
  }

  async bulkPosts(dto: BulkPostsDto, adminId: string): Promise<BulkResult> {
    const { ids, action, reason } = dto;
    const successful: string[] = [];
    const failed: Array<{ id: string; reason: string }> = [];

    for (const id of ids) {
      try {
        if (action === 'withhold') {
          const withholdDto: WithholdContentDto = { reason };
          await this.contentService.withholdPost(id, adminId, withholdDto);
        } else if (action === 'restore') {
          await this.contentService.restorePost(id, adminId);
        } else if (action === 'delete') {
          await this.contentService.deletePost(id, adminId);
        }
        successful.push(id);
      } catch (e: any) {
        failed.push({ id, reason: e.message || 'Unknown error' });
      }
    }

    await this.auditLogService.log({
      action: AuditAction.BULK_ACTION,
      targetType: AuditTargetType.POST,
      targetId: ids.join(','),
      performedBy: adminId,
      details: { entity: 'posts', action, successfulCount: successful.length, failedCount: failed.length },
    });

    return { successful, failed };
  }

  async bulkSubscriptions(
    dto: BulkSubscriptionsDto,
    adminId: string,
  ): Promise<BulkResult> {
    const { ids } = dto;
    const successful: string[] = [];
    const failed: Array<{ id: string; reason: string }> = [];

    for (const id of ids) {
      try {
        await this.subscriptionsService.cancelSubscription(id, adminId);
        successful.push(id);
      } catch (e: any) {
        failed.push({ id, reason: e.message || 'Unknown error' });
      }
    }

    await this.auditLogService.log({
      action: AuditAction.BULK_ACTION,
      targetType: AuditTargetType.SUBSCRIPTION,
      targetId: ids.join(','),
      performedBy: adminId,
      details: { entity: 'subscriptions', action: 'cancel', successfulCount: successful.length, failedCount: failed.length },
    });

    return { successful, failed };
  }

  async bulkReports(dto: BulkReportsDto, adminId: string): Promise<BulkResult> {
    const { ids, action, adminNotes } = dto;
    const successful: string[] = [];
    const failed: Array<{ id: string; reason: string }> = [];

    for (const id of ids) {
      try {
        const newStatus = action === 'resolve' ? ReportStatus.RESOLVED : ReportStatus.DISMISSED;
        await this.reportsService.updatePostReportStatus(
          id,
          adminId,
          { status: newStatus, adminNotes },
        );
        successful.push(id);
      } catch (e: any) {
        failed.push({ id, reason: e.message || 'Unknown error' });
      }
    }

    await this.auditLogService.log({
      action: AuditAction.BULK_ACTION,
      targetType: AuditTargetType.REPORT,
      targetId: ids.join(','),
      performedBy: adminId,
      details: { entity: 'reports', action, successfulCount: successful.length, failedCount: failed.length },
    });

    return { successful, failed };
  }
}
