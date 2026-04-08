import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
  Body,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AdminGuard } from '../admin.guard';
import { ContentService } from '../services/content.service';
import { GetContentQueryDto, WithholdContentDto } from '../dto/content.dto';

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
  ) {
    return this.contentService.withholdPost(id, 'admin', dto);
  }

  @Post(':id/restore')
  async restorePost(@Param('id') id: string) {
    return this.contentService.restorePost(id);
  }

  @Delete(':id')
  async deletePost(@Param('id') id: string) {
    return this.contentService.deletePost(id);
  }
}
