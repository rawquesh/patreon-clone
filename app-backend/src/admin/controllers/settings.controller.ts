import { Controller, Get, Put, Body, Param, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AdminGuard } from '../admin.guard';
import { SettingsService } from '../services/settings.service';
import { UpdateSettingDto, BulkUpdateSettingsDto, GetSettingsQueryDto } from '../dto/settings.dto';

@Controller('admin/settings')
@UseGuards(AuthGuard('jwt'), AdminGuard)
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

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
    @Body('performedBy') performedBy?: string,
  ) {
    const adminId = performedBy || 'unknown';
    return this.settingsService.updateSetting(key, dto, adminId);
  }

  @Put('bulk')
  async bulkUpdateSettings(
    @Body() dto: BulkUpdateSettingsDto,
    @Body('performedBy') performedBy?: string,
  ) {
    const adminId = performedBy || 'unknown';
    return this.settingsService.bulkUpdateSettings(dto.updates, adminId);
  }
}
