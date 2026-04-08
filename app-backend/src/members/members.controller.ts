import {
  Controller,
  Get,
  Query,
  UseGuards,
  Request,
  Res,
  BadRequestException,
  NotFoundException,
  ValidationPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { MembersService } from './members.service';
import { Response } from 'express';
import { createObjectCsvStringifier } from 'csv-writer';
import { GetMembersDto, MembersResponseDto } from './members.dto';

@Controller('members')
@UseGuards(AuthGuard('jwt'))
export class MembersController {
  constructor(private readonly membersService: MembersService) {}

  @Get()
  async getMembers(
    @Request() req,
    @Query(new ValidationPipe({ transform: true })) queryParams: GetMembersDto,
  ): Promise<MembersResponseDto> {
    try {
      const userId = req.user.userId;

      if (!userId) {
        throw new BadRequestException('User not authenticated');
      }

      return await this.membersService.getMembers(userId, queryParams);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(
        `Failed to fetch members: ${error.message}`,
      );
    }
  }

  @Get('export')
  async exportMembersToCSV(
    @Request() req,
    @Query(new ValidationPipe({ transform: true })) queryParams: GetMembersDto,
    @Res() res: Response,
  ) {
    try {
      const userId = req.user.userId;

      if (!userId) {
        throw new BadRequestException('User not authenticated');
      }

      const exportParams = {
        ...queryParams,
        page: 1,
        limit: 1000,
      };

      const { members } = await this.membersService.getMembers(
        userId,
        exportParams,
      );

      if (!members || members.length === 0) {
        throw new NotFoundException('No members found matching the criteria');
      }

      const csvData = members.map((member) => ({
        id: member.id,
        name: member.name || 'N/A',
        email: member.email || 'N/A',
        tier: member.tier?.name || 'N/A',
        joinDate: member.joinDate
          ? new Date(member.joinDate).toLocaleDateString()
          : 'N/A',
        status: member.status,
        totalPaid: `$${member.totalPaid.toFixed(2)}`,
      }));

      const csvStringifier = createObjectCsvStringifier({
        header: [
          { id: 'id', title: 'ID' },
          { id: 'name', title: 'Name' },
          { id: 'email', title: 'Email' },
          { id: 'tier', title: 'Membership Tier' },
          { id: 'joinDate', title: 'Join Date' },
          { id: 'status', title: 'Status' },
          { id: 'totalPaid', title: 'Total Paid' },
        ],
      });

      const csvString =
        csvStringifier.getHeaderString() +
        csvStringifier.stringifyRecords(csvData);

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=members.csv');

      return res.send(csvString);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(
        `Failed to export members: ${error.message}`,
      );
    }
  }
}
