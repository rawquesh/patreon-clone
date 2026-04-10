import { Controller, Get, Post, Param, Query, Body, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AdminGuard } from '../admin.guard';
import { PayoutsService } from '../services/payouts.service';
import { GetPayoutsQueryDto, PayoutActionDto } from '../dto/payouts.dto';

@Controller('admin/payouts')
@UseGuards(AuthGuard('jwt'), AdminGuard)
export class PayoutsController {
  constructor(private readonly payoutsService: PayoutsService) {}

  @Get()
  async getPayouts(@Query() query: GetPayoutsQueryDto) {
    const { payouts, total } = await this.payoutsService.getPayouts(query);
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    return {
      payouts,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  @Get('stats')
  async getPayoutStats() {
    return this.payoutsService.getPayoutStats();
  }

  @Get(':id')
  async getPayoutById(@Param('id') id: string) {
    const payout = await this.payoutsService.getPayoutById(id);
    return { payout };
  }

  @Post(':id/approve')
  async approvePayout(@Param('id') id: string, @Request() req) {
    return this.payoutsService.approvePayout(id, req.user.userId);
  }

  @Post(':id/reject')
  async rejectPayout(
    @Param('id') id: string,
    @Body() dto: PayoutActionDto,
    @Request() req,
  ) {
    return this.payoutsService.rejectPayout(id, dto.reason, req.user.userId);
  }
}
