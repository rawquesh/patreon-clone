import { Controller, Get, Post, Param, Query, Body, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AdminGuard } from '../admin.guard';
import { MembersService } from '../services/members.service';
import { GetMembersQueryDto } from '../dto/members.dto';

@Controller('admin/members')
@UseGuards(AuthGuard('jwt'), AdminGuard)
export class MembersController {
  constructor(private readonly membersService: MembersService) {}

  @Get()
  async getMembers(@Query() query: GetMembersQueryDto) {
    const { members, total } = await this.membersService.getMembers(query);
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    return {
      members,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  @Get(':id')
  async getMemberById(@Param('id') id: string) {
    const member = await this.membersService.getMemberById(id);
    return { member };
  }

  @Post(':id/deactivate')
  async deactivateMember(
    @Param('id') id: string,
    @Request() req,
  ) {
    return this.membersService.deactivateMember(id, req.user.userId);
  }

  @Post(':id/activate')
  async activateMember(@Param('id') id: string, @Request() req) {
    return this.membersService.activateMember(id, req.user.userId);
  }

  @Post(':id/promote-to-admin')
  async promoteToAdmin(@Param('id') id: string, @Request() req) {
    return this.membersService.promoteToAdmin(id, req.user.userId);
  }
}
