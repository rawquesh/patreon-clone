import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AdminGuard } from '../admin.guard';
import { AdminAnalyticsService } from '../services/analytics.service';
import { GetAnalyticsQueryDto } from '../dto/analytics.dto';

@Controller('admin/analytics')
@UseGuards(AuthGuard('jwt'), AdminGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AdminAnalyticsService) {}

  @Get('overview')
  async getOverviewMetrics(@Query() query: GetAnalyticsQueryDto) {
    return this.analyticsService.getOverviewMetrics(query);
  }

  @Get('revenue')
  async getRevenueAnalytics(@Query() query: GetAnalyticsQueryDto) {
    return this.analyticsService.getRevenueAnalytics(query);
  }

  @Get('creators')
  async getCreatorAnalytics(@Query() query: GetAnalyticsQueryDto) {
    return this.analyticsService.getCreatorAnalytics(query);
  }

  @Get('subscribers')
  async getSubscriberAnalytics(@Query() query: GetAnalyticsQueryDto) {
    return this.analyticsService.getSubscriberAnalytics(query);
  }

  @Get('reports')
  async getReportAnalytics(@Query() query: GetAnalyticsQueryDto) {
    return this.analyticsService.getReportAnalytics(query);
  }

  @Get('engagement')
  async getEngagementAnalytics(@Query() query: GetAnalyticsQueryDto) {
    return this.analyticsService.getEngagementAnalytics(query);
  }
}
