import {
  Controller,
  Get,
  Param,
  Post,
  Query,
  Request,
  UseGuards,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CreatorHistoryService } from './creator-history.service';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '@/database/schemas/user';
import { PostsService } from '@/posts/posts.service';
import { MembershipsService } from '@/memberships/memberships.service';
import { CollectionsService } from '@/collections/collections.service';

@Controller('creator')
export class CreatorController {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private readonly creatorHistoryService: CreatorHistoryService,
    private readonly postsService: PostsService,
    private readonly membershipsService: MembershipsService,
    private readonly collectionsService: CollectionsService,
  ) {}

  @Get(':username')
  async getCreatorByUsername(
    @Param('username') username: string,
    @Request() req,
  ) {
    const creator = await this.userModel
      .findOne({
        creatorUsername: username,
        isCreator: true,
      })
      .select(
        '_id displayName creatorUsername profilePicture profileCover creatorHeadline creatorCategory',
      );

    if (!creator) {
      throw new NotFoundException('Creator not found');
    }

    if (req.user?.userId) {
      try {
        await this.creatorHistoryService.recordVisit(
          req.user.userId,
          creator._id.toString(),
        );
      } catch (error) {
        console.error('Failed to record creator visit:', error.message);
      }
    }

    return creator;
  }

  @Post(':creatorId/record-visit')
  @UseGuards(AuthGuard('jwt'))
  async recordVisit(@Param('creatorId') creatorId: string, @Request() req) {
    await this.creatorHistoryService.recordVisit(req.user.userId, creatorId);
    return { success: true };
  }

  @Get(':creatorId/stats')
  async getCreatorStats(@Param('creatorId') creatorId: string) {
    const creator = await this.userModel.findById(creatorId);
    if (!creator || !creator.isCreator) {
      throw new NotFoundException('Creator not found');
    }

    // Get total post count
    const postsCount = await this.postsService.getPostCount(creatorId);

    // Get total members count and tier breakdown
    const membershipsData = await this.membershipsService.getCreatorMemberships(
      creatorId,
      {
        activeOnly: true,
        page: 1,
        limit: 100, // Get all memberships
      },
    );

    const totalMembers = membershipsData.totalSubscribers || 0;

    const tierBreakdown = membershipsData.memberships.map((tier) => ({
      id: tier._id.toString(),
      name: tier.name,
      count: tier.subscriberCount || 0,
      monthlyRate: tier.monthlyRate,
    }));

    return {
      totalPosts: postsCount,
      totalMembers,
      tierBreakdown,
      totalEarnings: membershipsData.totalEarnings || 0,
      introVideoUrl: creator.introVideoUrl,
      bio: creator.bio,
      socialLinks: creator.socialLinks || [],
    };
  }

  @Get('history/recent')
  @UseGuards(AuthGuard('jwt'))
  async getRecentlyVisitedCreators(
    @Request() req,
    @Query('limit') limit?: string,
  ) {
    const recentlyVisited = await this.creatorHistoryService.getRecentlyVisited(
      req.user.userId,
      limit ? parseInt(limit, 10) : 10,
    );
    return recentlyVisited;
  }

  @Get(':creatorId/analytics')
  @UseGuards(AuthGuard('jwt'))
  async getCreatorAnalytics(
    @Param('creatorId') creatorId: string,
    @Request() req,
    @Query('period') period?: 'day' | 'week' | 'month',
  ) {
    if (req.user.userId !== creatorId) {
      throw new UnauthorizedException(
        'You can only view analytics for your own profile',
      );
    }

    return this.creatorHistoryService.getCreatorAnalytics(
      creatorId,
      period || 'month',
    );
  }

  @Get(':creatorId/engaged-visitors')
  @UseGuards(AuthGuard('jwt'))
  async getMostEngagedVisitors(
    @Param('creatorId') creatorId: string,
    @Request() req,
    @Query('limit') limit?: string,
  ) {
    if (req.user.userId !== creatorId) {
      throw new UnauthorizedException(
        'You can only view visitor data for your own profile',
      );
    }

    return this.creatorHistoryService.getMostEngagedVisitors(
      creatorId,
      limit ? parseInt(limit, 10) : 10,
    );
  }

  @Get(':creatorId/export-visitors')
  @UseGuards(AuthGuard('jwt'))
  async exportVisitorHistory(
    @Param('creatorId') creatorId: string,
    @Request() req,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    if (req.user.userId !== creatorId) {
      throw new UnauthorizedException(
        'You can only export visitor data for your own profile',
      );
    }

    return this.creatorHistoryService.exportVisitorHistory(
      creatorId,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );
  }
}
