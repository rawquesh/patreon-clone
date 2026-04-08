import {
  Controller,
  Put,
  Body,
  UseGuards,
  Req,
  UploadedFile,
  UseInterceptors,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
  BadRequestException,
  Post,
  Request,
  UnauthorizedException,
  Get,
  Param,
  Query,
  ValidationPipe,
  Delete,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '@nestjs/passport';
import { UsersService } from './users.service';
import { S3Service } from '@/s3/s3.service';
import { UpdateProfileDto } from './UpdateProfileDto';
import {
  CreatorOnboardingDto,
  UpdateHeadlineDto,
  PublishCreatorDto,
  UpdateCreatorCategoryDto,
  SubscriptionStatus,
  GetSubscriptionsDto,
  UpdateAboutDto,
  UpdateContentVisibilityDto,
  ResetPasswordDto,
  UpdateSocialLinksDto,
  SearchSubscribersDto,
  DeleteUserDto,
} from './users.dto';
import { MembershipsService } from '@/memberships/memberships.service';

@Controller('users')
@UseGuards(AuthGuard('jwt'))
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly s3Service: S3Service,
    private readonly membershipsService: MembershipsService,
  ) {}

  @Put('profile')
  async updateProfile(@Req() req, @Body() updateProfileDto: UpdateProfileDto) {
    return this.usersService.updateProfile(req.user.userId, updateProfileDto);
  }

  @Put('about')
  async updateAboutInfo(
    @Request() req,
    @Body() updateAboutDto: UpdateAboutDto,
  ) {
    return this.usersService.updateAboutInfo(req.user.userId, updateAboutDto);
  }

  @Put('profile/photo')
  @UseInterceptors(
    FileInterceptor('photo', {
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  async updateProfilePhoto(
    @Req() req,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }),
          new FileTypeValidator({ fileType: /(jpg|jpeg|png)$/ }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    try {
      const user = await this.usersService.findById(req.user.userId);
      if (!user) {
        throw new Error('User not found');
      }

      const photoUrl = await this.s3Service.uploadFile(
        file,
        req.user.userId,
        'patreon-clone-assets',
      );

      if (user.profilePicture) {
        try {
          await this.s3Service.deleteFile(
            user.profilePicture,
            'patreon-clone-assets',
          );
        } catch (error) {
          console.error('Failed to delete old profile photo:', error);
        }
      }

      return this.usersService.updateProfilePhoto(req.user.userId, photoUrl);
    } catch (error) {
      throw new BadRequestException(
        `Failed to update profile photo: ${error.message}`,
      );
    }
  }

  @Post('reset-password')
  @UseGuards(AuthGuard('jwt'))
  async resetPassword(
    @Request() req,
    @Body() resetPasswordDto: ResetPasswordDto,
  ) {
    try {
      const userId = req.user.userId;
      if (!userId) {
        throw new UnauthorizedException('User not authenticated');
      }

      return await this.usersService.resetPassword(userId, resetPasswordDto);
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new BadRequestException(
        `Failed to reset password: ${error.message}`,
      );
    }
  }

  @Post('onboard-creator')
  async onboardCreator(
    @Request() req,
    @Body() creatorData: CreatorOnboardingDto,
  ) {
    if (!req.user?.userId) {
      throw new UnauthorizedException('User not authenticated');
    }
    return this.usersService.onboardCreator(req.user.userId, creatorData);
  }

  @Post('publish-creator')
  async publishCreator(@Request() req, @Body() publishData: PublishCreatorDto) {
    console.log({ publishData });
    if (!req.user?.userId) {
      throw new UnauthorizedException('User not authenticated');
    }

    if (publishData.acceptTerms === false) {
      throw new BadRequestException('You must accept the terms to continue');
    }

    return this.usersService.publishCreator(req.user.userId, publishData);
  }

  @Put('profile/cover')
  @UseInterceptors(
    FileInterceptor('cover', {
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    }),
  )
  async updateProfileCover(
    @Req() req,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }),
          new FileTypeValidator({ fileType: /(jpg|jpeg|png)$/ }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    try {
      const user = await this.usersService.findById(req.user.userId);
      const bucket = 'patreon-clone-assets';

      if (user.profileCover) {
        try {
          await this.s3Service.deleteFile(user.profileCover, bucket);
        } catch (error) {
          console.error('Failed to delete old profile cover:', error);
        }
      }

      const coverUrl = await this.s3Service.uploadFile(
        file,
        req.user.userId,
        bucket,
      );

      return this.usersService.updateProfileCover(req.user.userId, coverUrl);
    } catch (error) {
      throw new BadRequestException(
        `Failed to update profile cover: ${error.message}`,
      );
    }
  }

  @Put('creator/content-visibility')
  async updateContentVisibility(
    @Request() req,
    @Body() updateVisibilityDto: UpdateContentVisibilityDto,
  ) {
    if (!req.user?.userId) {
      throw new UnauthorizedException('User not authenticated');
    }

    const user = await this.usersService.findById(req.user.userId);
    if (!user || !user.isCreator) {
      throw new BadRequestException(
        'Only creators can update content visibility',
      );
    }

    return this.usersService.updateContentVisibility(
      req.user.userId,
      updateVisibilityDto,
    );
  }

  @Put('creator/headline')
  async updateCreatorHeadline(
    @Request() req,
    @Body() updateHeadlineDto: UpdateHeadlineDto,
  ) {
    return this.usersService.updateCreatorHeadline(
      req.user.userId,
      updateHeadlineDto,
    );
  }

  @Get('creators/published')
  async getPublishedCreators() {
    return this.usersService.getPublishedCreators();
  }

  @Put('creator/category')
  async updateCreatorCategory(
    @Request() req,
    @Body() updateCategoryDto: UpdateCreatorCategoryDto,
  ) {
    return this.usersService.updateCreatorCategory(
      req.user.userId,
      updateCategoryDto,
    );
  }

  @Get('subscriptions')
  async getCurrentUserSubscriptions(
    @Request() req,
    @Query(new ValidationPipe({ transform: true })) query: GetSubscriptionsDto,
  ) {
    try {
      const userId = req.user.userId;

      if (!userId) {
        throw new BadRequestException('User not authenticated');
      }

      const subscriptions =
        await this.membershipsService.getUserSubscriptions(userId);

      if (query.status !== SubscriptionStatus.ALL) {
        const { activeSubscriptions, cancelledSubscriptions } = subscriptions;

        if (query.status === SubscriptionStatus.ACTIVE) {
          return {
            subscriptions: activeSubscriptions,
            total: activeSubscriptions.length,
          };
        } else if (query.status === SubscriptionStatus.CANCELLED) {
          return {
            subscriptions: cancelledSubscriptions,
            total: cancelledSubscriptions.length,
          };
        }
      }

      return {
        activeSubscriptions: subscriptions.activeSubscriptions,
        cancelledSubscriptions: subscriptions.cancelledSubscriptions,
        total: {
          active: subscriptions.activeSubscriptions.length,
          cancelled: subscriptions.cancelledSubscriptions.length,
          all:
            subscriptions.activeSubscriptions.length +
            subscriptions.cancelledSubscriptions.length,
        },
      };
    } catch (error) {
      throw new BadRequestException(
        `Failed to fetch user subscriptions: ${error.message}`,
      );
    }
  }

  @Get(':userId/subscriptions')
  async getUserSubscriptionsById(
    @Request() req,
    @Param('userId') targetUserId: string,
    @Query(new ValidationPipe({ transform: true })) query: GetSubscriptionsDto,
  ) {
    try {
      const currentUserId = req.user.userId;
      const isAdmin = req.user.isAdmin === true;

      const isOwnAccount = currentUserId === targetUserId;

      if (!isOwnAccount && !isAdmin) {
        throw new UnauthorizedException(
          'Not authorized to access other user subscriptions',
        );
      }

      const subscriptions =
        await this.membershipsService.getUserSubscriptions(targetUserId);

      if (query.status !== SubscriptionStatus.ALL) {
        const { activeSubscriptions, cancelledSubscriptions } = subscriptions;

        if (query.status === SubscriptionStatus.ACTIVE) {
          return {
            subscriptions: activeSubscriptions,
            total: activeSubscriptions.length,
          };
        } else if (query.status === SubscriptionStatus.CANCELLED) {
          return {
            subscriptions: cancelledSubscriptions,
            total: cancelledSubscriptions.length,
          };
        }
      }

      return {
        activeSubscriptions: subscriptions.activeSubscriptions,
        cancelledSubscriptions: subscriptions.cancelledSubscriptions,
        total: {
          active: subscriptions.activeSubscriptions.length,
          cancelled: subscriptions.cancelledSubscriptions.length,
          all:
            subscriptions.activeSubscriptions.length +
            subscriptions.cancelledSubscriptions.length,
        },
      };
    } catch (error) {
      throw new BadRequestException(
        `Failed to fetch user subscriptions: ${error.message}`,
      );
    }
  }

  @Get('about')
  async getMyAboutInfo(@Request() req) {
    return this.usersService.getAboutInfo(req.user.userId);
  }

  @Get(':userId/about')
  async getUserAboutInfo(@Param('userId') userId: string) {
    return this.usersService.getAboutInfo(userId);
  }

  @Get('creator/:username/about')
  async getCreatorAboutInfo(@Param('username') username: string) {
    return this.usersService.getAboutInfoByUsername(username);
  }

  @Get('migrate')
  async migrate() {
    await this.usersService.createFreeMembershipsForAllCreators();
    return {
      success: true,
    };
  }

  @Put('social-links')
  @UseGuards(AuthGuard('jwt'))
  async updateMySocialLinks(
    @Request() req,
    @Body() updateSocialLinksDto: UpdateSocialLinksDto,
  ) {
    const updatedUser = await this.usersService.updateSocialLinks(
      req.user.userId,
      updateSocialLinksDto,
    );
    return { socialLinks: updatedUser.socialLinks };
  }

  @Get('creator/subscribers/search')
  async searchMySubscribers(
    @Request() req,
    @Query(new ValidationPipe()) searchDto: SearchSubscribersDto,
  ) {
    if (!req.user?.userId) {
      throw new UnauthorizedException('User not authenticated');
    }
    return this.usersService.searchSubscribers(
      req.user.userId,
      searchDto.query,
    );
  }

  @Get('check-username/:username')
  @UseGuards(AuthGuard('jwt'))
  async checkCreatorUsername(@Param('username') username: string) {
    return this.usersService.isCreatorUsernameAvailable(username);
  }

  @Get('public/check-username/:username')
  async checkCreatorUsernamePublic(@Param('username') username: string) {
    return this.usersService.isCreatorUsernameAvailable(username);
  }

  @Delete('account')
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.OK)
  async deleteAccount(@Request() req, @Body() deleteDto: DeleteUserDto) {
    try {
      if (!req.user?.userId) {
        throw new UnauthorizedException('User not authenticated');
      }

      const result = await this.usersService.deleteUserAccount(
        req.user.userId,
        deleteDto,
      );

      return {
        success: result.success,
        message: result.message,
        details: {
          subscriberSubscriptionsCancelled:
            result.cancelledSubscriptions.asSubscriber,
          creatorSubscriptionsCancelled:
            result.cancelledSubscriptions.asCreator,
          totalCancelled:
            result.cancelledSubscriptions.asSubscriber +
            result.cancelledSubscriptions.asCreator,
        },
      };
    } catch (error) {
      if (
        error instanceof UnauthorizedException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new BadRequestException(
        `Failed to delete account: ${error.message}`,
      );
    }
  }
}
