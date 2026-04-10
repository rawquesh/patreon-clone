import { Controller, Get, Post, Param, Query, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AdminGuard } from '../admin.guard';
import { SubscriptionsService } from '../services/subscriptions.service';
import { GetSubscriptionsQueryDto } from '../dto/subscriptions.dto';

@Controller('admin/subscriptions')
@UseGuards(AuthGuard('jwt'), AdminGuard)
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Get()
  async getSubscriptions(@Query() query: GetSubscriptionsQueryDto) {
    const { subscriptions, total } =
      await this.subscriptionsService.getSubscriptions(query);
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    return {
      subscriptions,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  @Get('stats')
  async getSubscriptionStats() {
    return this.subscriptionsService.getSubscriptionStats();
  }

  @Get(':id')
  async getSubscriptionById(@Param('id') id: string) {
    const subscription = await this.subscriptionsService.getSubscriptionById(id);
    return { subscription };
  }

  @Post(':id/cancel')
  async cancelSubscription(@Param('id') id: string, @Request() req) {
    return this.subscriptionsService.cancelSubscription(id, req.user.userId);
  }
}
