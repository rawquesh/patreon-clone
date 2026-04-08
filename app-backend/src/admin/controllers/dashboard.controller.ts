import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AdminGuard } from '../admin.guard';
import { DashboardService } from '../services/dashboard.service';
import { GetDashboardStatsQueryDto } from '../dto/dashboard.dto';

@Controller('admin/dashboard')
@UseGuards(AuthGuard('jwt'), AdminGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('stats')
  async getDashboardStats(@Query() query: GetDashboardStatsQueryDto) {
    const stats = await this.dashboardService.getDashboardStats(query.months);
    return stats;
  }
}
