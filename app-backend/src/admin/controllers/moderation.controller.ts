import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { SkipMaintenance } from '@/common/decorators/skip-maintenance.decorator';
import { AdminGuard } from '../admin.guard';
import { ModerationService } from '../services/moderation.service';
import { WithholdPostDto, WithholdUserDto } from '../dto/moderation.dto';

@SkipMaintenance()
@Controller('admin/moderation')
@UseGuards(AuthGuard('jwt'), AdminGuard)
export class ModerationController {
  constructor(private readonly moderationService: ModerationService) {}

  // ==================== WITHHELD POSTS ====================

  /**
   * Withhold a post (admin)
   * @route POST /admin/moderation/posts/:postId/withhold
   */
  @Post('posts/:postId/withhold')
  @HttpCode(HttpStatus.OK)
  async withholdPost(
    @Request() req,
    @Param('postId') postId: string,
    @Body() withholdDto: WithholdPostDto,
  ) {
    const withheldPost = await this.moderationService.withholdPost(
      postId,
      req.user.userId,
      withholdDto,
    );
    return { message: 'Post withheld successfully', withheldPost };
  }

  /**
   * Restore a withheld post (admin)
   * @route POST /admin/moderation/posts/:withheldPostId/restore
   */
  @Post('posts/:withheldPostId/restore')
  @HttpCode(HttpStatus.OK)
  async restorePost(@Param('withheldPostId') withheldPostId: string) {
    const post = await this.moderationService.restorePost(withheldPostId);
    return { message: 'Post restored successfully', post };
  }

  /**
   * Get all withheld posts (admin)
   * @route GET /admin/moderation/posts
   */
  @Get('posts')
  async getWithheldPosts(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    const { posts, total } = await this.moderationService.getWithheldPosts(
      page,
      limit,
    );
    return {
      posts,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  /**
   * Get a specific withheld post (admin)
   * @route GET /admin/moderation/posts/:id
   */
  @Get('posts/:id')
  async getWithheldPostById(@Param('id') id: string) {
    const post = await this.moderationService.getWithheldPostById(id);
    return { post };
  }

  // ==================== WITHHELD USERS ====================

  /**
   * Withhold a user (admin)
   * @route POST /admin/moderation/users/:userId/withhold
   */
  @Post('users/:userId/withhold')
  @HttpCode(HttpStatus.OK)
  async withholdUser(
    @Request() req,
    @Param('userId') userId: string,
    @Body() withholdDto: WithholdUserDto,
  ) {
    const withheldUser = await this.moderationService.withholdUser(
      userId,
      req.user.userId,
      withholdDto,
    );
    return { message: 'User withheld successfully', withheldUser };
  }

  /**
   * Restore a withheld user (admin)
   * @route POST /admin/moderation/users/:withheldUserId/restore
   */
  @Post('users/:withheldUserId/restore')
  @HttpCode(HttpStatus.OK)
  async restoreUser(@Param('withheldUserId') withheldUserId: string) {
    const user = await this.moderationService.restoreUser(withheldUserId);
    return { message: 'User restored successfully', user };
  }

  /**
   * Get all withheld users (admin)
   * @route GET /admin/moderation/users
   */
  @Get('users')
  async getWithheldUsers(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    const { users, total } = await this.moderationService.getWithheldUsers(
      page,
      limit,
    );
    return {
      users,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  /**
   * Get a specific withheld user (admin)
   * @route GET /admin/moderation/users/:id
   */
  @Get('users/:id')
  async getWithheldUserById(@Param('id') id: string) {
    const user = await this.moderationService.getWithheldUserById(id);
    return { user };
  }
}
