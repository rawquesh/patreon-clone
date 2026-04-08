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
import { AdminService } from './admin.service';
import { AdminGuard } from './admin.guard';
import {
  CreatePostReportDto,
  CreateUserReportDto,
  UpdateReportStatusDto,
  UpdateUserReportStatusDto,
  GetReportsQueryDto,
  GetUserReportsQueryDto,
  WithholdPostDto,
  WithholdUserDto,
} from './admin.dto';

@Controller('admin')
@UseGuards(AuthGuard('jwt'), AdminGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // ==================== REPORT CREATION (public - any authenticated user) ====================

  /**
   * Create a new post report (public)
   * @route POST /admin/reports/posts
   */
  @Post('reports/posts')
  @HttpCode(HttpStatus.CREATED)
  async createPostReport(
    @Request() req,
    @Body() createPostReportDto: CreatePostReportDto,
  ) {
    const report = await this.adminService.createPostReport(
      req.user.userId,
      createPostReportDto,
    );
    return { message: 'Post reported successfully', report };
  }

  /**
   * Create a new user report (public)
   * @route POST /admin/reports/users
   */
  @Post('reports/users')
  @HttpCode(HttpStatus.CREATED)
  async createUserReport(
    @Request() req,
    @Body() createUserReportDto: CreateUserReportDto,
  ) {
    const report = await this.adminService.createUserReport(
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
  @Get('reports/posts')
  async getPostReports(@Query() query: GetReportsQueryDto) {
    const { reports, total } = await this.adminService.getPostReports(query);
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
  @Get('reports/posts/by-post/:postId')
  async getReportsByPostId(@Param('postId') postId: string) {
    const reports = await this.adminService.getPostReportsByPostId(postId);
    return { reports, count: reports.length };
  }

  /**
   * Get a specific post report (admin)
   * @route GET /admin/reports/posts/:id
   */
  @Get('reports/posts/:id')
  async getPostReportById(@Param('id') id: string) {
    const report = await this.adminService.getPostReportById(id);
    return { report };
  }

  /**
   * Update post report status (admin)
   * @route PUT /admin/reports/posts/:id/status
   */
  @Put('reports/posts/:id/status')
  async updatePostReportStatus(
    @Request() req,
    @Param('id') id: string,
    @Body() updateStatusDto: UpdateReportStatusDto,
  ) {
    const report = await this.adminService.updatePostReportStatus(
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
  @Delete('reports/posts/:id')
  async deletePostReport(@Param('id') id: string) {
    await this.adminService.deletePostReport(id);
    return { message: 'Report deleted successfully' };
  }

  // ==================== USER REPORTS (admin) ====================

  /**
   * Get all user reports (admin)
   * @route GET /admin/reports/users
   */
  @Get('reports/users')
  async getUserReports(@Query() query: GetUserReportsQueryDto) {
    const { reports, total } = await this.adminService.getUserReports(query);
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
  @Get('reports/users/by-user/:userId')
  async getReportsByUserId(@Param('userId') userId: string) {
    const reports = await this.adminService.getUserReportsByUserId(userId);
    return { reports, count: reports.length };
  }

  /**
   * Get a specific user report (admin)
   * @route GET /admin/reports/users/:id
   */
  @Get('reports/users/:id')
  async getUserReportById(@Param('id') id: string) {
    const report = await this.adminService.getUserReportById(id);
    return { report };
  }

  /**
   * Update user report status (admin)
   * @route PUT /admin/reports/users/:id/status
   */
  @Put('reports/users/:id/status')
  async updateUserReportStatus(
    @Request() req,
    @Param('id') id: string,
    @Body() updateStatusDto: UpdateUserReportStatusDto,
  ) {
    const report = await this.adminService.updateUserReportStatus(
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
  @Delete('reports/users/:id')
  async deleteUserReport(@Param('id') id: string) {
    await this.adminService.deleteUserReport(id);
    return { message: 'Report deleted successfully' };
  }

  // ==================== STATISTICS (admin) ====================

  /**
   * Get report statistics (admin)
   * @route GET /admin/reports/statistics
   */
  @Get('reports/statistics')
  async getReportStatistics() {
    const statistics = await this.adminService.getReportStatistics();
    return { statistics };
  }

  // ==================== WITHHELD POSTS (admin) ====================

  /**
   * Withhold a post (admin)
   * @route POST /admin/reports/withhold/post/:postId
   */
  @Post('reports/withhold/post/:postId')
  @HttpCode(HttpStatus.OK)
  async withholdPost(
    @Request() req,
    @Param('postId') postId: string,
    @Body() withholdDto: WithholdPostDto,
  ) {
    const withheldPost = await this.adminService.withholdPost(
      postId,
      req.user.userId,
      withholdDto,
    );
    return { message: 'Post withheld successfully', withheldPost };
  }

  /**
   * Restore a withheld post (admin)
   * @route POST /admin/reports/restore/post/:withheldPostId
   */
  @Post('reports/restore/post/:withheldPostId')
  @HttpCode(HttpStatus.OK)
  async restorePost(@Param('withheldPostId') withheldPostId: string) {
    const post = await this.adminService.restorePost(withheldPostId);
    return { message: 'Post restored successfully', post };
  }

  /**
   * Get all withheld posts (admin)
   * @route GET /admin/reports/withheld/posts
   */
  @Get('reports/withheld/posts')
  async getWithheldPosts(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    const { posts, total } = await this.adminService.getWithheldPosts(
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
   * @route GET /admin/reports/withheld/posts/:id
   */
  @Get('reports/withheld/posts/:id')
  async getWithheldPostById(@Param('id') id: string) {
    const post = await this.adminService.getWithheldPostById(id);
    return { post };
  }

  // ==================== WITHHELD USERS (admin) ====================

  /**
   * Withhold a user (admin)
   * @route POST /admin/reports/withhold/user/:userId
   */
  @Post('reports/withhold/user/:userId')
  @HttpCode(HttpStatus.OK)
  async withholdUser(
    @Request() req,
    @Param('userId') userId: string,
    @Body() withholdDto: WithholdUserDto,
  ) {
    const withheldUser = await this.adminService.withholdUser(
      userId,
      req.user.userId,
      withholdDto,
    );
    return { message: 'User withheld successfully', withheldUser };
  }

  /**
   * Restore a withheld user (admin)
   * @route POST /admin/reports/restore/user/:withheldUserId
   */
  @Post('reports/restore/user/:withheldUserId')
  @HttpCode(HttpStatus.OK)
  async restoreUser(@Param('withheldUserId') withheldUserId: string) {
    const user = await this.adminService.restoreUser(withheldUserId);
    return { message: 'User restored successfully', user };
  }

  /**
   * Get all withheld users (admin)
   * @route GET /admin/reports/withheld/users
   */
  @Get('reports/withheld/users')
  async getWithheldUsers(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    const { users, total } = await this.adminService.getWithheldUsers(
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
   * @route GET /admin/reports/withheld/users/:id
   */
  @Get('reports/withheld/users/:id')
  async getWithheldUserById(@Param('id') id: string) {
    const user = await this.adminService.getWithheldUserById(id);
    return { user };
  }
}
