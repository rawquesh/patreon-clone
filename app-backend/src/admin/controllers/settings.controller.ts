import { Controller, Get, Put, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AdminGuard } from '../admin.guard';
import { SkipMaintenance } from '@/common/decorators/skip-maintenance.decorator';
import { SettingsService } from '../services/settings.service';
import { AuditLogService } from '../services/audit-log.service';
import {
  AuditAction,
  AuditTargetType,
} from '../schemas/audit-log.schema';
import { UpdateSettingDto, BulkUpdateSettingsDto, GetSettingsQueryDto } from '../dto/settings.dto';

@SkipMaintenance()
@Controller('admin/settings')
@UseGuards(AuthGuard('jwt'), AdminGuard)
export class SettingsController {
  constructor(
    private readonly settingsService: SettingsService,
    private readonly auditLogService: AuditLogService,
  ) {}

  @Get()
  async getAllSettings(@Query() query: GetSettingsQueryDto) {
    return this.settingsService.getAllSettings(query.category);
  }

  @Get(':key')
  async getSettingByKey(@Param('key') key: string) {
    return this.settingsService.getSettingByKey(key);
  }

  @Put(':key')
  async updateSetting(
    @Param('key') key: string,
    @Body() dto: UpdateSettingDto,
    @Request() req,
  ) {
    const adminId = req.user.userId;
    const result = await this.settingsService.updateSetting(key, dto, adminId);

    await this.auditLogService.log({
      action: AuditAction.SETTING_UPDATED,
      targetType: AuditTargetType.SETTING,
      targetId: key,
      performedBy: adminId,
      details: { key, value: dto.value },
    });

    return result;
  }

  @Put('bulk')
  async bulkUpdateSettings(
    @Body() dto: BulkUpdateSettingsDto,
    @Request() req,
  ) {
    const adminId = req.user.userId;
    const result = await this.settingsService.bulkUpdateSettings(dto.updates, adminId);

    await this.auditLogService.log({
      action: AuditAction.SETTING_BULK_UPDATED,
      targetType: AuditTargetType.SETTING,
      targetId: dto.updates.map((u) => u.key).join(','),
      performedBy: adminId,
      details: { count: dto.updates.length },
    });

    return result;
  }
}
