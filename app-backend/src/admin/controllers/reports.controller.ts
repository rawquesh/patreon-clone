import {
  Controller,
  Get,
  Post,
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
import { AdminGuard } from '../admin.guard';
import { ReportsService } from '../services/reports.service';
import {
  CreatePostReportDto,
  CreateUserReportDto,
  UpdateReportStatusDto,
  UpdateUserReportStatusDto,
  GetReportsQueryDto,
  GetUserReportsQueryDto,
} from '../dto/reports.dto';

@Controller('admin/reports')
@UseGuards(AuthGuard('jwt'), AdminGuard)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  // ==================== REPORT CREATION (public - any authenticated user) ====================

  /**
   * Create a new post report (public)
   * @route POST /admin/reports/posts
   */
  @Post('posts')
  @HttpCode(HttpStatus.CREATED)
  async createPostReport(
    @Request() req,
    @Body() createPostReportDto: CreatePostReportDto,
  ) {
    const report = await this.reportsService.createPostReport(
      req.user.userId,
      createPostReportDto,
    );
    return { message: 'Post reported successfully', report };
  }

  /**
   * Create a new user report (public)
   * @route POST /admin/reports/users
   */
  @Post('users')
  @HttpCode(HttpStatus.CREATED)
  async createUserReport(
    @Request() req,
    @Body() createUserReportDto: CreateUserReportDto,
  ) {
    const report = await this.reportsService.createUserReport(
      req.user.userId,
      createUserReportDto,
    );
    return { message: 'User reported successfully', report };
  }

  // ==================== POST REPORTS (admin) ====================

  /**
   * Get all post reports (admin)
   * @route GET /admin/reports/posts
   */
  @Get('posts')
  async getPostReports(@Query() query: GetReportsQueryDto) {
    const { reports, total } = await this.reportsService.getPostReports(query);
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    return {
      reports,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  /**
   * Get all reports for a specific post (admin)
   * @route GET /admin/reports/posts/by-post/:postId
   */
  @Get('posts/by-post/:postId')
  async getReportsByPostId(@Param('postId') postId: string) {
    const reports = await this.reportsService.getPostReportsByPostId(postId);
    return { reports, count: reports.length };
  }

  /**
   * Get a specific post report (admin)
   * @route GET /admin/reports/posts/:id
   */
  @Get('posts/:id')
  async getPostReportById(@Param('id') id: string) {
    const report = await this.reportsService.getPostReportById(id);
    return { report };
  }

  /**
   * Update post report status (admin)
   * @route PUT /admin/reports/posts/:id/status
   */
  @Put('posts/:id/status')
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
    return { message: 'Report status updated successfully', report };
  }

  /**
   * Delete a post report (admin)
   * @route DELETE /admin/reports/posts/:id
   */
  @Delete('posts/:id')
  async deletePostReport(@Param('id') id: string) {
    await this.reportsService.deletePostReport(id);
    return { message: 'Report deleted successfully' };
  }

  // ==================== USER REPORTS (admin) ====================

  /**
   * Get all user reports (admin)
   * @route GET /admin/reports/users
   */
  @Get('users')
  async getUserReports(@Query() query: GetUserReportsQueryDto) {
    const { reports, total } = await this.reportsService.getUserReports(query);
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    return {
      reports,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  /**
   * Get all reports for a specific user (admin)
   * @route GET /admin/reports/users/by-user/:userId
   */
  @Get('users/by-user/:userId')
  async getReportsByUserId(@Param('userId') userId: string) {
    const reports = await this.reportsService.getUserReportsByUserId(userId);
    return { reports, count: reports.length };
  }

  /**
   * Get a specific user report (admin)
   * @route GET /admin/reports/users/:id
   */
  @Get('users/:id')
  async getUserReportById(@Param('id') id: string) {
    const report = await this.reportsService.getUserReportById(id);
    return { report };
  }

  /**
   * Update user report status (admin)
   * @route PUT /admin/reports/users/:id/status
   */
  @Put('users/:id/status')
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
    return { message: 'Report status updated successfully', report };
  }

  /**
   * Delete a user report (admin)
   * @route DELETE /admin/reports/users/:id
   */
  @Delete('users/:id')
  async deleteUserReport(@Param('id') id: string) {
    await this.reportsService.deleteUserReport(id);
    return { message: 'Report deleted successfully' };
  }

  // ==================== STATISTICS (admin) ====================

  /**
   * Get report statistics (admin)
   * @route GET /admin/reports/statistics
   */
  @Get('statistics')
  async getReportStatistics() {
    const statistics = await this.reportsService.getReportStatistics();
    return { statistics };
  }
}
