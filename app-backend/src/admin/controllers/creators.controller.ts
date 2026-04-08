import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  Body,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AdminGuard } from '../admin.guard';
import { CreatorsService } from '../services/creators.service';
import {
  GetCreatorsQueryDto,
  CreatorActionDto,
} from '../dto/creators.dto';

@Controller('admin/creators')
@UseGuards(AuthGuard('jwt'), AdminGuard)
export class CreatorsController {
  constructor(private readonly creatorsService: CreatorsService) {}

  @Get()
  async getCreators(@Query() query: GetCreatorsQueryDto) {
    const { creators, total } = await this.creatorsService.getCreators(query);
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    return {
      creators,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  @Get(':id')
  async getCreatorById(@Param('id') id: string) {
    const creator = await this.creatorsService.getCreatorById(id);
    return { creator };
  }

  @Post(':id/approve')
  async approveCreator(
    @Param('id') id: string,
    @Body() dto: CreatorActionDto,
  ) {
    return this.creatorsService.approveCreator(id, dto);
  }

  @Post(':id/reject')
  async rejectCreator(
    @Param('id') id: string,
    @Body() dto: CreatorActionDto,
  ) {
    return this.creatorsService.rejectCreator(id, dto);
  }

  @Post(':id/suspend')
  async suspendCreator(
    @Param('id') id: string,
    @Body() dto: CreatorActionDto,
  ) {
    return this.creatorsService.suspendCreator(id, dto);
  }

  @Post(':id/activate')
  async activateCreator(@Param('id') id: string) {
    return this.creatorsService.activateCreator(id);
  }
}
