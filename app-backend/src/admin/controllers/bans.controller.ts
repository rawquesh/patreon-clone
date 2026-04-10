import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AdminGuard } from '../admin.guard';
import { BansService } from '../services/bans.service';
import { CreateBanDto, GetBansQueryDto, LiftBanDto } from '../dto/ban.dto';

@Controller('admin/bans')
@UseGuards(AuthGuard('jwt'), AdminGuard)
export class BansController {
  constructor(private readonly bansService: BansService) {}

  @Get()
  async getBans(@Query() query: GetBansQueryDto) {
    const { bans, total } = await this.bansService.getBans(query);
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    return {
      bans,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  @Get('stats')
  async getBanStats() {
    return this.bansService.getBanStats();
  }

  @Get(':id')
  async getBanById(@Param('id') id: string) {
    return this.bansService.getBanById(id);
  }

  @Post()
  async createBan(@Body() dto: CreateBanDto, @Request() req) {
    return this.bansService.createBan(dto, req.user.userId);
  }

  @Delete(':id')
  async liftBan(@Param('id') id: string, @Body() dto: LiftBanDto, @Request() req) {
    return this.bansService.liftBan(id, dto, req.user.userId);
  }
}
