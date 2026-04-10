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
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AdminGuard } from '../admin.guard';
import { SkipMaintenance } from '@/common/decorators/skip-maintenance.decorator';
import { AdminUsersService } from '../services/admin-users.service';
import {
  CreateAdminUserDto,
  UpdateAdminUserDto,
  UpdateAdminRoleDto,
  GetAdminsQueryDto,
} from '../dto/admin-user.dto';

@SkipMaintenance()
@Controller('admin/admins')
@UseGuards(AuthGuard('jwt'), AdminGuard)
export class AdminUsersController {
  constructor(private readonly adminUsersService: AdminUsersService) {}

  @Get()
  async getAdmins(@Query() query: GetAdminsQueryDto) {
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

  @Get(':id')
  async getAdminById(@Param('id') id: string) {
    return this.adminUsersService.getAdminById(id);
  }

  @Post()
  async createAdmin(@Body() dto: CreateAdminUserDto, @Request() req) {
    return this.adminUsersService.createAdmin(dto, req.user.userId);
  }

  @Put(':id')
  async updateAdmin(
    @Param('id') id: string,
    @Body() dto: UpdateAdminUserDto,
    @Request() req,
  ) {
    return this.adminUsersService.updateAdmin(id, dto, req.user.userId);
  }

  @Delete(':id')
  async deleteAdmin(@Param('id') id: string, @Request() req) {
    return this.adminUsersService.deleteAdmin(id, req.user.userId);
  }

  @Put(':id/role')
  async updateAdminRole(
    @Param('id') id: string,
    @Body() dto: UpdateAdminRoleDto,
    @Request() req,
  ) {
    return this.adminUsersService.updateAdminRole(id, dto, req.user.userId);
  }
}
