import { Controller, Get, Post, Param, Query, Body, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AdminGuard } from '../admin.guard';
import { MembersService } from '../services/members.service';
import { GetMembersQueryDto, MemberActionDto } from '../dto/members.dto';

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
    @Body() dto: MemberActionDto,
  ) {
    return this.membersService.deactivateMember(id);
  }

  @Post(':id/activate')
  async activateMember(@Param('id') id: string) {
    return this.membersService.activateMember(id);
  }
}
