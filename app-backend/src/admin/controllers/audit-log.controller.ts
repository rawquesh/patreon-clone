import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AdminGuard } from '../admin.guard';
import { AuditLogService } from '../services/audit-log.service';
import { GetAuditLogsQueryDto } from '../dto/audit-log.dto';

@Controller('admin/audit-logs')
@UseGuards(AuthGuard('jwt'), AdminGuard)
export class AuditLogController {
  constructor(private readonly auditLogService: AuditLogService) {}

  @Get()
  async getAuditLogs(@Query() query: GetAuditLogsQueryDto) {
    const { logs, total } = await this.auditLogService.getLogs(query);
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    return {
      logs,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
