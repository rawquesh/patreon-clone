import {
  Controller,
  Get,
  Query,
  UseGuards,
  Request,
  BadRequestException,
  ValidationPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AnalyticsService } from './analytics.service';
import {
  MembershipInsightsDto,
  EarningsInsightsDto,
  PostsInsightsDto,
  // MembershipInsightsResponse,
  // EarningsInsightsResponse,
  PostsInsightsResponse,
  TransactionDetailsDto,
  TransactionDetailsResponse,
} from './analytics.dto';

@Controller('analytics')
@UseGuards(AuthGuard('jwt'))
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('memberships')
  async getMembershipInsights(
    @Request() req,
    @Query(new ValidationPipe({ transform: true }))
    queryParams: MembershipInsightsDto,
  ) {
    try {
      const userId = req.user.userId;
      if (!userId) {
        throw new BadRequestException('User not authenticated');
      }

      return await this.analyticsService.getMembershipInsights(
        userId,
        queryParams.timeRange,
      );
    } catch (error) {
      throw new BadRequestException(
        `Failed to fetch membership insights: ${error.message}`,
      );
    }
  }

  @Get('earnings')
  async getEarningsInsights(
    @Request() req,
    @Query(new ValidationPipe({ transform: true }))
    queryParams: EarningsInsightsDto,
  ) {
    try {
      const userId = req.user.userId;
      if (!userId) {
        throw new BadRequestException('User not authenticated');
      }

      return await this.analyticsService.getEarningsInsights(
        userId,
        queryParams.timeRange,
      );
    } catch (error) {
      throw new BadRequestException(
        `Failed to fetch earnings insights: ${error.message}`,
      );
    }
  }

  @Get('transactions')
  async getTransactionDetails(
    @Request() req,
    @Query(new ValidationPipe({ transform: true }))
    queryParams: TransactionDetailsDto,
  ): Promise<TransactionDetailsResponse> {
    try {
      const userId = req.user.userId;
      if (!userId) {
        throw new BadRequestException('User not authenticated');
      }

      return await this.analyticsService.getTransactionDetails(
        userId,
        queryParams.timeRange,
      );
    } catch (error) {
      throw new BadRequestException(
        `Failed to fetch transaction details: ${error.message}`,
      );
    }
  }

  @Get('posts')
  async getPostsInsights(
    @Request() req,
    @Query(new ValidationPipe({ transform: true }))
    queryParams: PostsInsightsDto,
  ): Promise<PostsInsightsResponse> {
    try {
      const userId = req.user.userId;
      if (!userId) {
        throw new BadRequestException('User not authenticated');
      }

      return await this.analyticsService.getPostsInsights(
        userId,
        queryParams.timeRange,
      );
    } catch (error) {
      throw new BadRequestException(
        `Failed to fetch posts insights: ${error.message}`,
      );
    }
  }
}
