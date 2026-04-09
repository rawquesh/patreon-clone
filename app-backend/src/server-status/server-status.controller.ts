import { Controller, Get, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ServerStatusService } from './server-status.service';

class CreateAdminDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

@Controller('server-status')
export class ServerStatusController {
  constructor(private readonly serverStatusService: ServerStatusService) {}

  @Get()
  async getServerStatus() {
    return this.serverStatusService.runAllChecks();
  }

  @Post('admin')
  @HttpCode(HttpStatus.CREATED)
  async createAdmin(@Body() dto: CreateAdminDto) {
    return this.serverStatusService.createAdmin(dto);
  }
}
