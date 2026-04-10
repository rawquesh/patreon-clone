import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
  Body,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AdminGuard } from '../admin.guard';
import { ContentService } from '../services/content.service';
import { GetContentQueryDto, WithholdContentDto, NotifyCreatorDto } from '../dto/content.dto';

@Controller('admin/content')
@UseGuards(AuthGuard('jwt'), AdminGuard)
export class ContentController {
  constructor(private readonly contentService: ContentService) {}

  @Get()
  async getContent(@Query() query: GetContentQueryDto) {
    const { posts, total } = await this.contentService.getPosts(query);
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
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

  @Get(':id')
  async getPostById(@Param('id') id: string) {
    const post = await this.contentService.getPostById(id);
    return { post };
  }

  @Post(':id/withhold')
  async withholdPost(
    @Param('id') id: string,
    @Body() dto: WithholdContentDto,
    @Request() req,
  ) {
    return this.contentService.withholdPost(id, req.user.userId, dto);
  }

  @Post(':id/restore')
  async restorePost(@Param('id') id: string, @Request() req) {
    return this.contentService.restorePost(id, req.user.userId);
  }

  @Delete(':id')
  async deletePost(@Param('id') id: string, @Request() req) {
    return this.contentService.deletePost(id, req.user.userId);
  }

  @Post(':id/notify-creator')
  @HttpCode(HttpStatus.OK)
  async notifyCreator(
    @Param('id') id: string,
    @Body() dto: NotifyCreatorDto,
    @Request() req,
  ) {
    return this.contentService.notifyCreator(id, req.user.userId, dto);
  }
}
