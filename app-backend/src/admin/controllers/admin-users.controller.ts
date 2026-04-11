import {
  Controller,
  Get,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AdminGuard } from '../admin.guard';
import { SkipMaintenance } from '@/common/decorators/skip-maintenance.decorator';
import { AdminUsersService } from '../services/admin-users.service';

@SkipMaintenance()
@Controller('admin/admins')
@UseGuards(AuthGuard('jwt'), AdminGuard)
export class AdminUsersController {
  constructor(private readonly adminUsersService: AdminUsersService) {}

  @Get()
  async getAdmins(@Query() query: any) {
    const { admins, total } = await this.adminUsersService.getAdmins(query);
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    return {
      admins,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  @Put(':id')
  async updateAdmin(
    @Param('id') id: string,
    @Body() dto: any,
    @Request() req,
  ) {
    return this.adminUsersService.updateAdmin(id, dto, req.user.userId);
  }

  @Delete(':id')
  async deleteAdmin(@Param('id') id: string, @Request() req) {
    return this.adminUsersService.deleteAdmin(id, req.user.userId);
  }
}
