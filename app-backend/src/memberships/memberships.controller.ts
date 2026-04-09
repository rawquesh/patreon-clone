import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  Query,
  UseInterceptors,
  BadRequestException,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
  Inject,
  forwardRef,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { MembershipsService } from './memberships.service';
import { business } from '@/config';
import {
  UpdateMembershipDto,
  CreatePayoutRequestDto,
  GetMembershipsQueryDto,
  CreateMembershipDto,
} from './memberships.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { S3Service } from '@/s3/s3.service';
import { PromotionsService } from '@/promotions/promotions.service';
import { InjectModel } from '@nestjs/mongoose';
import { Membership } from '@/database/schemas/membership';
import { User } from '@/database/schemas/user';
import { Model } from 'mongoose';

@Controller('memberships')
export class MembershipsController {
  constructor(
    private readonly membershipsService: MembershipsService,
    private readonly s3Service: S3Service,
    @Inject(forwardRef(() => PromotionsService))
    private readonly promotionsService: PromotionsService,
    @InjectModel(Membership.name) private membershipModel: Model<Membership>,
  ) {}

  @Get('creator')
  @UseGuards(AuthGuard('jwt'))
  async getCreatorMembershipsForSelf(
    @Request() req,
    @Query() query: GetMembershipsQueryDto,
  ) {
    console.log('User');
    console.log(JSON.stringify(req.user));
    return this.membershipsService.getCreatorMemberships(
      req.user.userId,
      query,
    );
  }

  @Get(':id')
  @UseGuards(AuthGuard('jwt'))
  async getMembership(@Param('id') id: string) {
    try {
      if (id === 'free') {
        return {
          id: 'free',
          name: 'Free Membership',
          description: 'Access to free content from this creator',
          monthlyRate: 0,
          isActive: true,
          benefits: ['Access to public posts', 'Join the community'],
          isTrial: false,
        };
      }

      const membership = await this.membershipsService.getMembershipById(id);
      return membership;
    } catch (error) {
      throw new NotFoundException(`Membership not found: ${error.message}`);
    }
  }

  @Get('creator/:creatorId')
  async getCreatorMemberships(
    @Param('creatorId') creatorId: string,
    @Query()
    query: GetMembershipsQueryDto = {
      page: 1,
      limit: 10,
      activeOnly: true,
    },
  ) {
    const result = await this.membershipsService.getCreatorMemberships(
      creatorId,
      query,
    );

    const memberships = result.memberships.map((membership) => ({
      _id: membership._id.toString(),
      name: membership.name,
      description: membership.description,
      monthlyPrice: membership.monthlyRate,
      yearlyPrice: membership.monthlyRate * 10,
      benefits: membership.benefits || [],
      isLimited: false,
      seatsLeft: 0,
      isFeatured: membership.isFeatured || false,
      isActive: membership.isActive,
      // isTrial: membership.isTrial || false,
      coverImage: membership.coverImage,
      subscriberCount: membership.subscriberCount || 0,
    }));

    return memberships;
  }

  @Get('check/:creatorId')
  @UseGuards(AuthGuard('jwt'))
  async checkSubscription(
    @Request() req,
    @Param('creatorId') creatorId: string,
  ) {
    try {
      const subscriptions = await this.membershipsService.getUserSubscriptions(
        req.user.userId,
      );
      console.log(
        subscriptions.activeSubscriptions.map((s) =>
          (s.creator as User)._id.toString(),
        ),
      );
      const isSubscribed = subscriptions.activeSubscriptions.some(
        (sub) => (sub.creator as User)._id.toString() === creatorId,
      );

      return { isSubscribed };
    } catch (error) {
      console.log(error);
      return { isSubscribed: false };
    }
  }

  @Post()
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(
    FileInterceptor('coverImage', {
      limits: {
        fileSize: 5 * 1024 * 1024,
      },
      fileFilter: (req, file, cb) => {
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
          return cb(
            new BadRequestException('Only image files are allowed!'),
            false,
          );
        }
        cb(null, true);
      },
    }),
  )
  async createMembership(
    @Request() req,
    @Body() createMembershipDto: CreateMembershipDto,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }),
          new FileTypeValidator({ fileType: /(jpg|jpeg|png|gif)$/ }),
        ],
      }),
    )
    coverImage: Express.Multer.File,
  ) {
    try {
      const coverImageUrl = await this.s3Service.uploadFile(
        coverImage,
        'membership-covers',
        business.s3.defaultBucket,
      );

      return this.membershipsService.createMembership(req.user.userId, {
        ...createMembershipDto,
        coverImage: coverImageUrl,
      });
    } catch (error) {
      throw new BadRequestException(
        `Failed to create membership: ${error.message}`,
      );
    }
  }

  @Get('subscriber')
  @UseGuards(AuthGuard('jwt'))
  async getSubscriptions(@Request() req) {
    return this.membershipsService.getUserSubscriptions(req.user.userId);
  }

  @Put(':id')
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(
    FileInterceptor('coverImage', {
      limits: {
        fileSize: 5 * 1024 * 1024,
      },
      fileFilter: (req, file, cb) => {
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
          return cb(
            new BadRequestException('Only image files are allowed!'),
            false,
          );
        }
        cb(null, true);
      },
    }),
  )
  async updateMembership(
    @Request() req,
    @Param('id') id: string,
    @Body() updateMembershipDto: UpdateMembershipDto,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }),
          new FileTypeValidator({ fileType: /(jpg|jpeg|png|gif)$/ }),
        ],
        fileIsRequired: false,
      }),
    )
    coverImage?: Express.Multer.File,
  ) {
    try {
      const membership = await this.membershipsService.getMembershipById(id);

      if ((membership.creator as User)._id.toString() !== req.user.userId) {
        throw new ForbiddenException(
          'Not authorized to update this membership',
        );
      }

      let coverImageUrl = membership.coverImage;

      if (coverImage) {
        coverImageUrl = await this.s3Service.uploadFile(
          coverImage,
          'membership-covers',
          business.s3.defaultBucket,
        );

        if (membership.coverImage && membership.coverImage !== coverImageUrl) {
          try {
            await this.s3Service.deleteFile(
              membership.coverImage,
              'patreon-clone-test-cover',
            );
          } catch (error) {
            console.error('Failed to delete old cover image:', error);
          }
        }
      }

      return this.membershipsService.updateMembership(req.user.userId, id, {
        ...updateMembershipDto,
        coverImage: coverImageUrl,
      });
    } catch (error) {
      throw new BadRequestException(
        `Failed to update membership: ${error.message}`,
      );
    }
  }

  @Post('checkout/:membershipId')
  @UseGuards(AuthGuard('jwt'))
  async createCheckoutSession(
    @Request() req,
    @Param('membershipId') membershipId: string,
    @Body() body: { promotionCode?: string },
  ) {
    try {
      const checkoutUrl = await this.membershipsService.createCheckoutSession(
        req.user.userId,
        membershipId,
        body.promotionCode,
      );

      return { checkoutUrl };
    } catch (error) {
      console.log(error);
      throw new BadRequestException(
        `Failed to create checkout session: ${error.message}`,
      );
    }
  }

  @Post('subscribe/:membershipId')
  @UseGuards(AuthGuard('jwt'))
  async createSubscription(
    @Request() req,
    @Param('membershipId') membershipId: string,
    @Body() body: { promotionCode?: string },
  ) {
    try {
      console.log('Subscribe');

      let subscription;
      let checkoutUrl;

      if (body.promotionCode) {
        const redemptionResult = await this.promotionsService.redeemPromotion(
          req.user.userId,
          {
            code: body.promotionCode,
            membershipId,
          },
        );

        subscription = redemptionResult.subscription;
        checkoutUrl = redemptionResult.checkoutUrl;
      } else {
        subscription = await this.membershipsService.createSubscription(
          req.user.userId,
          membershipId,
        );
      }

      return {
        subscription,
        checkoutUrl,
        success: true,
      };
    } catch (error) {
      throw new BadRequestException(
        `Failed to create subscription: ${error.message}`,
      );
    }
  }

  @Delete('subscribe/:subscriptionId')
  @UseGuards(AuthGuard('jwt'))
  async cancelSubscription(
    @Request() req,
    @Param('subscriptionId') subscriptionId: string,
  ) {
    return this.membershipsService.cancelSubscription(
      req.user.userId,
      subscriptionId,
    );
  }

  @Delete('unsubscribe/:creatorId')
  @UseGuards(AuthGuard('jwt'))
  async unsubscribeFromCreator(
    @Request() req,
    @Param('creatorId') creatorId: string,
  ) {
    return this.membershipsService.unsubscribeFromCreator(
      req.user.userId,
      creatorId,
    );
  }

  @Get('subscribers')
  @UseGuards(AuthGuard('jwt'))
  async getSubscribers(@Request() req) {
    return this.membershipsService.getCreatorSubscribers(req.user.userId);
  }

  @Get('earnings')
  @UseGuards(AuthGuard('jwt'))
  async getEarnings(@Request() req) {
    return this.membershipsService.getCreatorEarnings(req.user.userId);
  }

  @Post('payout')
  @UseGuards(AuthGuard('jwt'))
  async requestPayout(
    @Request() req,
    @Body() createPayoutRequestDto: CreatePayoutRequestDto,
  ) {
    return this.membershipsService.createPayoutRequest(
      req.user.userId,
      createPayoutRequestDto,
    );
  }

  @Get('payouts')
  @UseGuards(AuthGuard('jwt'))
  async getPayoutHistory(@Request() req) {
    return this.membershipsService.getPayoutHistory(req.user.userId);
  }

  @Post('subscribe/free/:creatorId')
  @UseGuards(AuthGuard('jwt'))
  async subscribeToFreeMembership(
    @Request() req,
    @Param('creatorId') creatorId: string,
  ) {
    console.log({ creatorId });
    try {
      const subscription = await this.membershipsService.createFreeSubscription(
        req.user.userId,
        creatorId,
      );

      return {
        subscription,
        success: true,
        message: 'You are now a free member',
      };
    } catch (error) {
      throw new BadRequestException(`Failed to subscribe: ${error.message}`);
    }
  }

  @Post('ensure-stripe-products')
  @UseGuards(AuthGuard('jwt'))
  async ensureStripeProducts(@Request() req) {
    try {
      const memberships = await this.membershipModel.find({
        creator: req.user.userId,
        isActive: true,
        stripeProductId: { $exists: false },
      });

      const results = [];
      for (const membership of memberships) {
        try {
          const updated =
            await this.membershipsService.ensureStripeProductForMembership(
              membership._id.toString(),
            );
          results.push({
            id: updated._id.toString(),
            name: updated.name,
            success: true,
            stripeProductId: updated.stripeProductId,
            stripePriceId: updated.stripePriceId,
          });
        } catch (error) {
          results.push({
            id: membership._id.toString(),
            name: membership.name,
            success: false,
            error: error.message,
          });
        }
      }

      return {
        processed: results.length,
        results,
      };
    } catch (error) {
      throw new BadRequestException(
        `Failed to process memberships: ${error.message}`,
      );
    }
  }

  @Put(':id/featured')
  @UseGuards(AuthGuard('jwt'))
  async toggleFeaturedStatus(
    @Request() req,
    @Param('id') id: string,
    @Body() body: { isFeatured: boolean },
  ) {
    return this.membershipsService.toggleFeaturedStatus(
      req.user.userId,
      id,
      body.isFeatured,
    );
  }
}
