import { Controller, Get, Query, UseGuards, Res, Header } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AdminGuard } from '../admin.guard';
import { ExportService } from '../services/export.service';
import { Response } from 'express';

@Controller('admin/export')
@UseGuards(AuthGuard('jwt'), AdminGuard)
export class ExportController {
  constructor(private readonly exportService: ExportService) {}

  @Get('users')
  async exportUsers(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('status') status?: string,
    @Res() res?: Response,
  ) {
    const result = await this.exportService.exportUsers({ startDate, endDate, status });
    res?.setHeader('Content-Type', 'text/csv');
    res?.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
    res?.send(result.csv);
    return result;
  }

  @Get('subscriptions')
  async exportSubscriptions(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('status') status?: string,
    @Res() res?: Response,
  ) {
    const result = await this.exportService.exportSubscriptions({ startDate, endDate, status });
    res?.setHeader('Content-Type', 'text/csv');
    res?.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
    res?.send(result.csv);
    return result;
  }

  @Get('payouts')
  async exportPayouts(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('status') status?: string,
    @Res() res?: Response,
  ) {
    const result = await this.exportService.exportPayouts({ startDate, endDate, status });
    res?.setHeader('Content-Type', 'text/csv');
    res?.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
    res?.send(result.csv);
    return result;
  }

  @Get('reports')
  async exportReports(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('status') status?: string,
    @Res() res?: Response,
  ) {
    const result = await this.exportService.exportReports({ startDate, endDate, status });
    res?.setHeader('Content-Type', 'text/csv');
    res?.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
    res?.send(result.csv);
    return result;
  }
}
