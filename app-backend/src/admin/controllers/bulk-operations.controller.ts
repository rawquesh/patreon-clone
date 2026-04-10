import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AdminGuard } from '../admin.guard';
import { SkipMaintenance } from '@/common/decorators/skip-maintenance.decorator';
import { BulkOperationsService } from '../services/bulk-operations.service';
import {
  BulkCreatorsDto,
  BulkMembersDto,
  BulkPostsDto,
  BulkSubscriptionsDto,
  BulkReportsDto,
} from '../dto/bulk-operations.dto';

@SkipMaintenance()
@Controller('admin/bulk')
@UseGuards(AuthGuard('jwt'), AdminGuard)
export class BulkOperationsController {
  constructor(private readonly bulkOperationsService: BulkOperationsService) {}

  @Post('creators')
  async bulkCreators(@Body() dto: BulkCreatorsDto, @Request() req) {
    return this.bulkOperationsService.bulkCreators(dto, req.user.userId);
  }

  @Post('members')
  async bulkMembers(@Body() dto: BulkMembersDto, @Request() req) {
    return this.bulkOperationsService.bulkMembers(dto, req.user.userId);
  }

  @Post('posts')
  async bulkPosts(@Body() dto: BulkPostsDto, @Request() req) {
    return this.bulkOperationsService.bulkPosts(dto, req.user.userId);
  }

  @Post('subscriptions')
  async bulkSubscriptions(@Body() dto: BulkSubscriptionsDto, @Request() req) {
    return this.bulkOperationsService.bulkSubscriptions(dto, req.user.userId);
  }

  @Post('reports')
  async bulkReports(@Body() dto: BulkReportsDto, @Request() req) {
    return this.bulkOperationsService.bulkReports(dto, req.user.userId);
  }
}
