import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Request,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { NotificationsService } from './notifications.service';
import {
  MarkReadDto,
  NotificationFilterDto,
  UpdateCreatorNotificationSettingsDto,
  UpdateMemberNotificationSettingsDto,
} from './notifications.dto';
import { UsersService } from '@/users/users.service';

@Controller('notifications')
@UseGuards(AuthGuard('jwt'))
export class NotificationsController {
  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly usersService: UsersService,
  ) {}

  @Get()
  async getNotifications(
    @Request() req,
    @Query(new ValidationPipe({ transform: true }))
    filterDto: NotificationFilterDto,
  ) {
    const userId = req.user.userId;
    return this.notificationsService.findAllForUser(userId, filterDto);
  }

  @Get('count')
  async getUnreadCount(@Request() req) {
    const count = await this.notificationsService.getUnreadCount(
      req.user.userId,
    );
    return { count };
  }

  @Post('mark-read')
  async markAsRead(@Request() req, @Body() markReadDto: MarkReadDto) {
    const success = await this.notificationsService.markAsRead(
      req.user.userId,
      markReadDto.ids,
    );
    return { success };
  }

  @Post('mark-all-read')
  async markAllAsRead(@Request() req) {
    const success = await this.notificationsService.markAllAsRead(
      req.user.userId,
    );
    return { success };
  }

  @Delete(':id')
  async deleteNotification(@Request() req, @Param('id') id: string) {
    const success = await this.notificationsService.deleteNotification(
      req.user.userId,
      id,
    );
    return { success };
  }

  @Get('settings')
  async getNotificationSettings(@Request() req) {
    const user = await this.usersService.findById(req.user.userId);
    return {
      creatorSettings: {
        creatorNotifyOnNewMember: user.creatorNotifyOnNewMember,
        creatorNotifyOnComments: user.creatorNotifyOnComments,
        creatorNotifyOnDirectMessages: user.creatorNotifyOnDirectMessages,
      },
      memberSettings: {
        memberNotifyOnNewPost: user.memberNotifyOnNewPost,
        memberNotifyOnDirectMessages: user.memberNotifyOnDirectMessages,
      },
    };
  }

  @Put('settings/creator')
  async updateCreatorNotificationSettings(
    @Request() req,
    @Body() settingsDto: UpdateCreatorNotificationSettingsDto,
  ) {
    const updatedUser = await this.usersService.updateNotificationSettings(
      req.user.userId,
      settingsDto,
    );
    return {
      creatorNotifyOnNewMember: updatedUser.creatorNotifyOnNewMember,
      creatorNotifyOnComments: updatedUser.creatorNotifyOnComments,
      creatorNotifyOnDirectMessages: updatedUser.creatorNotifyOnDirectMessages,
    };
  }

  @Put('settings/member')
  async updateMemberNotificationSettings(
    @Request() req,
    @Body() settingsDto: UpdateMemberNotificationSettingsDto,
  ) {
    const updatedUser = await this.usersService.updateNotificationSettings(
      req.user.userId,
      settingsDto,
    );
    return {
      memberNotifyOnNewPost: updatedUser.memberNotifyOnNewPost,
      memberNotifyOnDirectMessages: updatedUser.memberNotifyOnDirectMessages,
    };
  }
}
