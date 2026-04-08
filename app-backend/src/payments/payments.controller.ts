import {
  Controller,
  Post,
  Get,
  UseGuards,
  Request,
  BadRequestException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PaymentsService } from '../payments/payments.service';

@Controller('payments')
@UseGuards(AuthGuard('jwt'))
export class PayoutsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Get('available')
  async getAvailableAmount(@Request() req) {
    try {
      const creatorId = req.user.userId;
      const balance = await this.paymentsService.getPayoutBalance(creatorId);

      return {
        available: balance.available,
        pending: balance.pending,
      };
    } catch (error) {
      throw new BadRequestException(
        `Failed to fetch available balance: ${error.message}`,
      );
    }
  }

  @Post('transfer')
  async createPayout(@Request() req) {
    try {
      const creatorId = req.user.userId;

      const balance = await this.paymentsService.getPayoutBalance(creatorId);

      if (balance.available <= 0) {
        throw new BadRequestException('No funds available for payout');
      }

      await this.paymentsService.initiatePayoutToBank(
        creatorId,
        balance.available,
      );

      return {
        success: true,
        message: 'Payout initiated successfully',
        amount: balance.available,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      throw new BadRequestException(
        `Failed to create payout: ${error.message}`,
      );
    }
  }

  @Get('history')
  async getPayoutHistory(@Request() req) {
    try {
      const creatorId = req.user.userId;

      // This would need to be implemented in the PaymentsService
      // It should return a list of previous payouts for this creator
      const payouts = await this.paymentsService.getPayoutHistory(creatorId);

      return {
        payouts,
        total: payouts.length,
      };
    } catch (error) {
      throw new BadRequestException(
        `Failed to fetch payout history: ${error.message}`,
      );
    }
  }
}
