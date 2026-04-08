import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ReportsService } from './reports.service';
import {
  CreatePostReportDto,
  CreateUserReportDto,
  UpdateReportStatusDto,
  UpdateUserReportStatusDto,
  GetReportsQueryDto,
  GetUserReportsQueryDto,
  WithholdPostDto,
  WithholdUserDto,
  RestorePostDto,
  RestoreUserDto,
} from './reports.dto';
import { AdminGuard } from '@/auth/admin.guard';

@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  // ==================== POST REPORTS ====================

  /**
   * Create a new post report
   * @route POST /reports/posts
   */
  @Post('posts')
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.CREATED)
  async createPostReport(
    @Request() req,
    @Body() createPostReportDto: CreatePostReportDto,
  ) {
    const report = await this.reportsService.createPostReport(
      req.user.userId,
      createPostReportDto,
    );

    return {
      message: 'Post reported successfully',
      report,
    };
  }

  /**
   * Get all post reports (Admin only)
   * @route GET /reports/posts
   */
  @Get('posts')
  @UseGuards(AuthGuard('jwt'), AdminGuard)
  async getPostReports(@Query() query: GetReportsQueryDto) {
    const { reports, total } = await this.reportsService.getPostReports(query);

    return {
      reports,
      pagination: {
        total,
        page: query.page || 1,
        limit: query.limit || 10,
        totalPages: Math.ceil(total / (query.limit || 10)),
      },
    };
  }

  /**
   * Get all reports for a specific post (Admin only)
   * @route GET /reports/posts/by-post/:postId
   * Note: This must come before /reports/posts/:id to avoid route conflicts
   */
  @Get('posts/by-post/:postId')
  @UseGuards(AuthGuard('jwt'), AdminGuard)
  async getReportsByPostId(@Param('postId') postId: string) {
    const reports = await this.reportsService.getPostReportsByPostId(postId);
    const count = await this.reportsService.getPostReportsCount(postId);

    return {
      reports,
      count,
    };
  }

  /**
   * Get a specific post report by ID (Admin only)
   * @route GET /reports/posts/:id
   */
  @Get('posts/:id')
  @UseGuards(AuthGuard('jwt'), AdminGuard)
  async getPostReportById(@Param('id') id: string) {
    const report = await this.reportsService.getPostReportById(id);
    return { report };
  }

  /**
   * Update post report status (Admin only)
   * @route PUT /reports/posts/:id/status
   */
  @Put('posts/:id/status')
  @UseGuards(AuthGuard('jwt'), AdminGuard)
  async updatePostReportStatus(
    @Request() req,
    @Param('id') id: string,
    @Body() updateStatusDto: UpdateReportStatusDto,
  ) {
    const report = await this.reportsService.updatePostReportStatus(
      id,
      req.user.userId,
      updateStatusDto,
    );

    return {
      message: 'Report status updated successfully',
      report,
    };
  }

  /**
   * Delete a post report (Admin only)
   * @route DELETE /reports/posts/:id
   */
  @Delete('posts/:id')
  @UseGuards(AuthGuard('jwt'), AdminGuard)
  async deletePostReport(@Param('id') id: string) {
    await this.reportsService.deletePostReport(id);
    return {
      message: 'Report deleted successfully',
    };
  }

  // ==================== USER REPORTS ====================

  /**
   * Create a new user report
   * @route POST /reports/users
   */
  @Post('users')
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.CREATED)
  async createUserReport(
    @Request() req,
    @Body() createUserReportDto: CreateUserReportDto,
  ) {
    const report = await this.reportsService.createUserReport(
      req.user.userId,
      createUserReportDto,
    );

    return {
      message: 'User reported successfully',
      report,
    };
  }

  /**
   * Get all user reports (Admin only)
   * @route GET /reports/users
   */
  @Get('users')
  @UseGuards(AuthGuard('jwt'), AdminGuard)
  async getUserReports(@Query() query: GetUserReportsQueryDto) {
    const { reports, total } = await this.reportsService.getUserReports(query);

    return {
      reports,
      pagination: {
        total,
        page: query.page || 1,
        limit: query.limit || 10,
        totalPages: Math.ceil(total / (query.limit || 10)),
      },
    };
  }

  /**
   * Get all reports for a specific user (Admin only)
   * @route GET /reports/users/by-user/:userId
   * Note: This must come before /reports/users/:id to avoid route conflicts
   */
  @Get('users/by-user/:userId')
  @UseGuards(AuthGuard('jwt'), AdminGuard)
  async getReportsByUserId(@Param('userId') userId: string) {
    const reports = await this.reportsService.getUserReportsByUserId(userId);
    const count = await this.reportsService.getUserReportsCount(userId);

    return {
      reports,
      count,
    };
  }

  /**
   * Get a specific user report by ID (Admin only)
   * @route GET /reports/users/:id
   */
  @Get('users/:id')
  @UseGuards(AuthGuard('jwt'), AdminGuard)
  async getUserReportById(@Param('id') id: string) {
    const report = await this.reportsService.getUserReportById(id);
    return { report };
  }

  /**
   * Update user report status (Admin only)
   * @route PUT /reports/users/:id/status
   */
  @Put('users/:id/status')
  @UseGuards(AuthGuard('jwt'), AdminGuard)
  async updateUserReportStatus(
    @Request() req,
    @Param('id') id: string,
    @Body() updateStatusDto: UpdateUserReportStatusDto,
  ) {
    const report = await this.reportsService.updateUserReportStatus(
      id,
      req.user.userId,
      updateStatusDto,
    );

    return {
      message: 'Report status updated successfully',
      report,
    };
  }

  /**
   * Delete a user report (Admin only)
   * @route DELETE /reports/users/:id
   */
  @Delete('users/:id')
  @UseGuards(AuthGuard('jwt'), AdminGuard)
  async deleteUserReport(@Param('id') id: string) {
    await this.reportsService.deleteUserReport(id);
    return {
      message: 'Report deleted successfully',
    };
  }

  // ==================== STATISTICS ====================

  /**
   * Get report statistics (Admin only)
   * @route GET /reports/statistics
   */
  @Get('statistics')
  @UseGuards(AuthGuard('jwt'), AdminGuard)
  async getReportStatistics() {
    const statistics = await this.reportsService.getReportStatistics();
    return { statistics };
  }

  // ==================== WITHHOLD POST ====================

  /**
   * Withhold a post (move to withheld collection) (Admin only)
   * @route POST /reports/withhold/post/:postId
   */
  @Post('withhold/post/:postId')
  @UseGuards(AuthGuard('jwt'), AdminGuard)
  @HttpCode(HttpStatus.OK)
  async withholdPost(
    @Request() req,
    @Param('postId') postId: string,
    @Body() withholdDto: WithholdPostDto,
  ) {
    const withheldPost = await this.reportsService.withholdPost(
      postId,
      req.user.userId,
      withholdDto,
    );

    return {
      message: 'Post withheld successfully',
      withheldPost,
    };
  }

  /**
   * Restore a withheld post (Admin only)
   * @route POST /reports/restore/post/:withheldPostId
   */
  @Post('restore/post/:withheldPostId')
  @UseGuards(AuthGuard('jwt'), AdminGuard)
  @HttpCode(HttpStatus.OK)
  async restorePost(
    @Request() req,
    @Param('withheldPostId') withheldPostId: string,
    @Body() restoreDto: RestorePostDto,
  ) {
    const restoredPost = await this.reportsService.restorePost(
      withheldPostId,
      req.user.userId,
      restoreDto,
    );

    return {
      message: 'Post restored successfully',
      post: restoredPost,
    };
  }

  /**
   * Get all withheld posts (Admin only)
   * @route GET /reports/withheld/posts
   */
  @Get('withheld/posts')
  @UseGuards(AuthGuard('jwt'), AdminGuard)
  async getWithheldPosts(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    const { posts, total } = await this.reportsService.getWithheldPosts(
      page,
      limit,
    );

    return {
      posts,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get a specific withheld post (Admin only)
   * @route GET /reports/withheld/posts/:id
   */
  @Get('withheld/posts/:id')
  @UseGuards(AuthGuard('jwt'), AdminGuard)
  async getWithheldPostById(@Param('id') id: string) {
    const post = await this.reportsService.getWithheldPostById(id);
    return { post };
  }

  // ==================== WITHHOLD USER ====================

  /**
   * Withhold a user (move to withheld collection) (Admin only)
   * @route POST /reports/withhold/user/:userId
   */
  @Post('withhold/user/:userId')
  @UseGuards(AuthGuard('jwt'), AdminGuard)
  @HttpCode(HttpStatus.OK)
  async withholdUser(
    @Request() req,
    @Param('userId') userId: string,
    @Body() withholdDto: WithholdUserDto,
  ) {
    const withheldUser = await this.reportsService.withholdUser(
      userId,
      req.user.userId,
      withholdDto,
    );

    return {
      message: 'User withheld successfully',
      withheldUser,
    };
  }

  /**
   * Restore a withheld user (Admin only)
   * @route POST /reports/restore/user/:withheldUserId
   */
  @Post('restore/user/:withheldUserId')
  @UseGuards(AuthGuard('jwt'), AdminGuard)
  @HttpCode(HttpStatus.OK)
  async restoreUser(
    @Request() req,
    @Param('withheldUserId') withheldUserId: string,
    @Body() restoreDto: RestoreUserDto,
  ) {
    const restoredUser = await this.reportsService.restoreUser(
      withheldUserId,
      req.user.userId,
      restoreDto,
    );

    return {
      message: 'User restored successfully',
      user: restoredUser,
    };
  }

  /**
   * Get all withheld users (Admin only)
   * @route GET /reports/withheld/users
   */
  @Get('withheld/users')
  @UseGuards(AuthGuard('jwt'), AdminGuard)
  async getWithheldUsers(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    const { users, total } = await this.reportsService.getWithheldUsers(
      page,
      limit,
    );

    return {
      users,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get a specific withheld user (Admin only)
   * @route GET /reports/withheld/users/:id
   */
  @Get('withheld/users/:id')
  @UseGuards(AuthGuard('jwt'), AdminGuard)
  async getWithheldUserById(@Param('id') id: string) {
    const user = await this.reportsService.getWithheldUserById(id);
    return { user };
  }
}
