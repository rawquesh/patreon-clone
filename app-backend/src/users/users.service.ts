import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  User,
  CreatorStatus,
  ContentVisibility,
  GenderPreference,
} from '@/database/schemas/user';
import { Membership } from '@/database/schemas/membership';
import { Subscription } from '@/database/schemas/subscription';
import { UpdateProfileDto } from './UpdateProfileDto';
import {
  CreatorOnboardingDto,
  UpdateHeadlineDto,
  PublishCreatorDto,
  UpdateCreatorCategoryDto,
  UpdateAboutDto,
  ResetPasswordDto,
  UpdateContentVisibilityDto,
  UpdateSocialLinksDto,
  UsernameAvailabilityResponseDto,
} from './users.dto';
import {
  UpdateCreatorNotificationSettingsDto,
  UpdateMemberNotificationSettingsDto,
} from '@/notifications/notifications.dto';
import { PaymentsService } from '@/payments/payments.service';
import * as bcrypt from 'bcrypt';
import Stripe from 'stripe';
import { DeleteUserDto } from './users.dto';
import { business } from '@/config';
import { SettingsService } from '@/admin/services/settings.service';

interface RequestingUser {
  userId: string;
  gender?: string;
  genderPreference?: GenderPreference;
}

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Membership.name) private membershipModel: Model<any>,
    @InjectModel(Subscription.name) private subscriptionModel: Model<any>,
    private paymentsService: PaymentsService,
    private readonly settingsService: SettingsService,
  ) {}

  async findById(userId: string): Promise<User> {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async updateProfile(
    userId: string,
    updateProfileDto: UpdateProfileDto,
  ): Promise<User> {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (updateProfileDto.email && updateProfileDto.email !== user.email) {
      const existingUser = await this.userModel.findOne({
        email: updateProfileDto.email,
      });
      if (existingUser) {
        throw new BadRequestException('Email already exists');
      }
    }

    const updatedUser = await this.userModel.findByIdAndUpdate(
      userId,
      {
        $set: {
          ...updateProfileDto,
          updatedAt: new Date(),
        },
      },
      { new: true, runValidators: true },
    );

    if (!updatedUser) {
      throw new NotFoundException('User not found');
    }

    return updatedUser;
  }

  async updateProfilePhoto(userId: string, photoUrl: string): Promise<User> {
    console.log('Updating profile photo for user:', userId);
    console.log('New photo URL:', photoUrl);

    if (!Types.ObjectId.isValid(userId)) {
      throw new Error('Invalid user ID format');
    }

    try {
      const updatedUser = await this.userModel.findOneAndUpdate(
        { _id: new Types.ObjectId(userId) },
        {
          $set: {
            profilePicture: photoUrl,
            updatedAt: new Date(),
          },
        },
        { new: true, runValidators: true },
      );

      console.log('Updated user result:', updatedUser);

      if (!updatedUser) {
        throw new NotFoundException(`User with ID ${userId} not found`);
      }

      return updatedUser;
    } catch (error) {
      console.error('Error updating user profile photo:', error);
      throw error;
    }
  }

  async onboardCreator(
    userId: string,
    creatorData: CreatorOnboardingDto,
  ): Promise<User> {
    if (!Types.ObjectId.isValid(userId)) {
      throw new Error('Invalid user ID format');
    }

    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    const enableNewCreators = await this.settingsService.get<boolean>('enableNewCreators', true);
    if (!enableNewCreators) {
      throw new BadRequestException('New creator applications are currently disabled');
    }

    const existingUsername = await this.userModel.findOne({
      creatorUsername: creatorData.username.toLowerCase(),
    });

    if (existingUsername) {
      throw new ConflictException('Username is already taken');
    }

    const updatedUser = await this.userModel.findOneAndUpdate(
      { _id: new Types.ObjectId(userId) },
      {
        $set: {
          creatorUsername: creatorData.username.toLowerCase(),
          contentVisibleTo: creatorData.contentVisibleTo,
          isCreator: true,
          creatorStatus: CreatorStatus.PENDING,
          updatedAt: new Date().toISOString(),
          creatorCategory: creatorData.category,
        },
      },
      { new: true, runValidators: true },
    );

    if (!updatedUser) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    await this.createDefaultFreeMembership(userId);

    return updatedUser;
  }

  async createDefaultFreeMembership(userId: string): Promise<void> {
    try {
      const defaultFreeMembership = {
        creator: new Types.ObjectId(userId),
        name: 'Free Membership',
        description: 'Access to free content from this creator',
        monthlyRate: 0,
        benefits: ['Access to public posts', 'Join the community'],
        coverImage:
          '${business.s3.baseUrl}/membership-covers/membership.jpg',
        isActive: true,
      };

      const existingFreeMembership = await this.membershipModel.findOne({
        creator: new Types.ObjectId(userId),
        monthlyRate: 0,
      });

      if (!existingFreeMembership) {
        await this.membershipModel.create(defaultFreeMembership);
      }
    } catch (error) {
      console.error(
        `Failed to create default free membership: ${error.message}`,
      );
    }
  }

  async publishCreator(
    userId: string,
    publishData: PublishCreatorDto,
  ): Promise<{ user: User; stripeOnboardingUrl: string }> {
    console.log(publishData);
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.isCreator) {
      throw new BadRequestException('User is not a creator');
    }

    if (user.creatorStatus === CreatorStatus.PUBLISHED) {
      throw new BadRequestException('Creator is already published');
    }

    const enableNewCreators = await this.settingsService.get<boolean>('enableNewCreators', true);
    if (!enableNewCreators) {
      throw new BadRequestException('New creator applications are currently disabled');
    }

    const { accountId, accountLinkUrl } =
      await this.paymentsService.createConnectAccount(userId, user.email);

    const updatedUser = await this.userModel.findByIdAndUpdate(
      userId,
      {
        $set: {
          stripeConnectAccountId: accountId,
          hasCompletedStripeOnboarding: false,
          creatorStatus: CreatorStatus.PENDING,
          updatedAt: new Date().toISOString(),
        },
      },
      { new: true },
    );

    await this.createDefaultFreeMembership(userId);

    return { user: updatedUser, stripeOnboardingUrl: accountLinkUrl };
  }

  async updateProfileCover(userId: string, coverUrl: string): Promise<User> {
    console.log('Updating profile cover for user:', userId);
    console.log('New cover URL:', coverUrl);

    if (!Types.ObjectId.isValid(userId)) {
      throw new Error('Invalid user ID format');
    }

    try {
      const updatedUser = await this.userModel.findOneAndUpdate(
        { _id: new Types.ObjectId(userId) },
        {
          $set: {
            profileCover: coverUrl,
            updatedAt: new Date().toISOString(),
          },
        },
        { new: true, runValidators: true },
      );

      console.log('Updated user result:', updatedUser);

      if (!updatedUser) {
        throw new NotFoundException(`User with ID ${userId} not found`);
      }

      return updatedUser;
    } catch (error) {
      console.error('Error updating user profile cover:', error);
      throw error;
    }
  }

  async updateCreatorHeadline(
    userId: string,
    { headline }: UpdateHeadlineDto,
  ): Promise<User> {
    if (!Types.ObjectId.isValid(userId)) {
      throw new Error('Invalid user ID format');
    }

    const updatedUser = await this.userModel.findOneAndUpdate(
      { _id: new Types.ObjectId(userId) },
      {
        $set: {
          creatorHeadline: headline,
          updatedAt: new Date().toISOString(),
        },
      },
      { new: true, runValidators: true },
    );

    if (!updatedUser) {
      throw new NotFoundException('User not found');
    }

    return updatedUser;
  }

  async updateUserStripeStatusFromWebhook(
    account: Stripe.Account,
  ): Promise<void> {
    const stripeAccountId = account.id;
    const user = await this.userModel.findOne({
      stripeConnectAccountId: stripeAccountId,
    });
    if (!user) {
      console.error(
        `Received account.updated webhook for Stripe account ${stripeAccountId}, but no matching user was found.`,
      );
      return;
    }

    const isEnabled = account.charges_enabled && account.payouts_enabled;

    if (isEnabled && !user.hasCompletedStripeOnboarding) {
      const requireApproval = await this.settingsService.get<boolean>('requireCreatorApproval', true);
      const newStatus = requireApproval ? CreatorStatus.REQUIRE_APPROVAL : CreatorStatus.PUBLISHED;
      if (requireApproval) {
        this.logger.log(`Creator ${user._id} completed Stripe onboarding but requires admin approval (requireCreatorApproval=true)`);
      }
      await this.userModel.findByIdAndUpdate(user._id, {
        $set: {
          hasCompletedStripeOnboarding: true,
          creatorStatus: newStatus,
          updatedAt: new Date(),
        },
      });
    } else {
      await this.userModel.findByIdAndUpdate(user._id, {
        $set: {
          hasCompletedStripeOnboarding: isEnabled,
          updatedAt: new Date(),
        },
      });
    }
  }

  private addGenderFilters(
    baseFilter: any,
    requestingUser?: RequestingUser,
  ): any {
    const filter = { ...baseFilter };
    const genderConditions = [];

    if (
      requestingUser?.genderPreference &&
      requestingUser.genderPreference !== GenderPreference.BOTH
    ) {
      if (requestingUser.genderPreference === GenderPreference.MALE) {
        genderConditions.push({
          $or: [{ gender: 'male' }, { gender: 'Male' }],
        });
      } else if (requestingUser.genderPreference === GenderPreference.FEMALE) {
        genderConditions.push({
          $or: [{ gender: 'female' }, { gender: 'Female' }],
        });
      }
    }

    if (requestingUser?.gender) {
      const userGenderLower = requestingUser.gender.toLowerCase();
      if (userGenderLower === 'male' || userGenderLower === 'female') {
        genderConditions.push({
          $or: [
            { contentVisibleTo: ContentVisibility.BOTH },
            { contentVisibleTo: userGenderLower as ContentVisibility },
          ],
        });
      } else {
        genderConditions.push({ contentVisibleTo: ContentVisibility.BOTH });
      }
    } else {
      genderConditions.push({ contentVisibleTo: ContentVisibility.BOTH });
    }

    if (genderConditions.length > 0) {
      if (filter.$and) {
        filter.$and = Array.isArray(filter.$and)
          ? [...filter.$and, ...genderConditions]
          : [filter.$and, ...genderConditions];
      } else {
        filter.$and = genderConditions;
      }
    }

    return filter;
  }

  async getPublishedCreators(requestingUser?: RequestingUser): Promise<User[]> {
    const baseFilter = {
      isCreator: true,
      creatorStatus: CreatorStatus.PUBLISHED,
    };

    const finalFilter = this.addGenderFilters(baseFilter, requestingUser);

    return this.userModel.find(finalFilter);
  }

  async updateCreatorCategory(
    userId: string,
    updateCategoryDto: UpdateCreatorCategoryDto,
  ): Promise<User> {
    if (!Types.ObjectId.isValid(userId)) {
      throw new Error('Invalid user ID format');
    }

    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.isCreator) {
      throw new BadRequestException('User is not a creator');
    }

    const updatedUser = await this.userModel.findOneAndUpdate(
      { _id: new Types.ObjectId(userId) },
      {
        $set: {
          creatorCategory: updateCategoryDto.category,
          updatedAt: new Date().toISOString(),
        },
      },
      { new: true, runValidators: true },
    );

    if (!updatedUser) {
      throw new NotFoundException('User not found after update');
    }

    return updatedUser;
  }

  async createFreeMembershipsForAllCreators() {
    const creators = await this.userModel.find({ isCreator: true });

    for (const creator of creators) {
      const existingFreeMembership = await this.membershipModel.findOne({
        creator: creator._id,
        monthlyRate: 0,
      });

      if (!existingFreeMembership) {
        await this.membershipModel.create({
          creator: creator._id,
          name: 'Free Membership',
          description: 'Access to free content from this creator',
          monthlyRate: 0,
          benefits: ['Access to public posts', 'Join the community'],
          coverImage:
            '${business.s3.baseUrl}/membership-covers/membership.jpg',
          isActive: true,
        });
      }
    }
  }

  async updateAboutInfo(
    userId: string,
    updateAboutDto: UpdateAboutDto,
  ): Promise<User> {
    if (!Types.ObjectId.isValid(userId)) {
      throw new Error('Invalid user ID format');
    }

    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }
    console.log(updateAboutDto);
    const updatedUser = await this.userModel.findOneAndUpdate(
      { _id: new Types.ObjectId(userId) },
      {
        $set: {
          introVideoUrl: updateAboutDto.introVideoUrl,
          bio: updateAboutDto.bio,
          socialLinks: updateAboutDto.socialLinks,
          updatedAt: new Date().toISOString(),
        },
      },
      { new: true, runValidators: true },
    );

    if (!updatedUser) {
      throw new NotFoundException(
        `User with ID ${userId} not found after update`,
      );
    }

    return updatedUser;
  }

  async getAboutInfo(userId: string): Promise<{
    introVideoUrl?: string;
    bio?: string;
    socialLinks?: {
      platform: string;
      url: string;
    }[];
  }> {
    if (!Types.ObjectId.isValid(userId)) {
      throw new Error('Invalid user ID format');
    }

    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    return {
      introVideoUrl: user.introVideoUrl,
      bio: user.bio,
      socialLinks: user.socialLinks || [],
    };
  }

  async getAboutInfoByUsername(creatorUsername: string): Promise<{
    introVideoUrl?: string;
    bio?: string;
    socialLinks?: {
      platform: string;
      url: string;
    }[];
  }> {
    const user = await this.userModel.findOne({ creatorUsername });
    if (!user) {
      throw new NotFoundException(
        `Creator with username ${creatorUsername} not found`,
      );
    }

    return {
      introVideoUrl: user.introVideoUrl,
      bio: user.bio,
      socialLinks: user.socialLinks || [],
    };
  }

  async updateContentVisibility(
    userId: string,
    updateVisibilityDto: UpdateContentVisibilityDto,
  ): Promise<User> {
    if (!Types.ObjectId.isValid(userId)) {
      throw new Error('Invalid user ID format');
    }

    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.isCreator) {
      throw new BadRequestException('User is not a creator');
    }

    const updatedUser = await this.userModel.findOneAndUpdate(
      { _id: new Types.ObjectId(userId) },
      {
        $set: {
          contentVisibleTo: updateVisibilityDto.contentVisibleTo,
          updatedAt: new Date().toISOString(),
        },
      },
      { new: true, runValidators: true },
    );

    if (!updatedUser) {
      throw new NotFoundException('User not found after update');
    }

    return updatedUser;
  }

  async resetPassword(
    userId: string,
    resetPasswordDto: ResetPasswordDto,
  ): Promise<{ success: boolean; message: string }> {
    const { currentPassword, newPassword, confirmPassword } = resetPasswordDto;

    if (newPassword !== confirmPassword) {
      throw new BadRequestException(
        'New password and confirmation do not match',
      );
    }

    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.password) {
      throw new BadRequestException(
        'User does not have a password set (social login)',
      );
    }

    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await this.userModel.updateOne(
      { _id: new Types.ObjectId(userId) },
      {
        $set: {
          password: hashedPassword,
          updatedAt: new Date().toISOString(),
        },
      },
    );

    return {
      success: true,
      message: 'Password has been successfully updated',
    };
  }

  async updateSocialLinks(
    userId: string,
    updateDto: UpdateSocialLinksDto,
  ): Promise<User> {
    if (!Types.ObjectId.isValid(userId)) {
      throw new BadRequestException('Invalid user ID format');
    }

    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const updatedUser = await this.userModel.findByIdAndUpdate(
      userId,
      {
        $set: {
          socialLinks: updateDto.socialLinks,
          updatedAt: new Date(),
        },
      },
      { new: true, runValidators: true },
    );

    if (!updatedUser) {
      throw new NotFoundException('User not found after update attempt');
    }

    return updatedUser;
  }

  async searchSubscribers(creatorId: string, searchQuery: string) {
    if (!Types.ObjectId.isValid(creatorId)) {
      throw new BadRequestException('Invalid creator ID format');
    }

    const creator = await this.userModel.findById(creatorId);
    if (!creator || !creator.isCreator) {
      throw new BadRequestException(
        'Only creators can search their subscribers',
      );
    }

    const query = searchQuery.toLowerCase();

    const subscriptions = await this.subscriptionModel
      .find({
        creator: new Types.ObjectId(creatorId),
        status: 'active',
      })
      .populate('subscriber')
      .populate('membership')
      .lean();

    const matchingSubscriptions = subscriptions.filter((subscription) => {
      const subscriber = subscription.subscriber as any;
      const firstName = (subscriber.firstName || '').toLowerCase();
      const lastName = (subscriber.lastName || '').toLowerCase();
      const fullName = `${firstName} ${lastName}`.toLowerCase();
      return (
        firstName.includes(query) ||
        lastName.includes(query) ||
        fullName.includes(query)
      );
    });

    return matchingSubscriptions.map((subscription) => {
      const subscriber = subscription.subscriber as any;
      return {
        subscriptionId: subscription._id,
        subscriberId: subscriber._id,
        firstName: subscriber.firstName,
        lastName: subscriber.lastName,
        email: subscriber.email,
        profilePicture: subscriber.profilePicture,
        membershipTier:
          (subscription.membership as any)?.name || 'Unknown Tier',
        monthlyRate: subscription.monthlyRate,
        subscribedSince: subscription.createdAt,
      };
    });
  }

  async isCreatorUsernameAvailable(
    username: string,
  ): Promise<UsernameAvailabilityResponseDto> {
    if (!username || typeof username !== 'string') {
      throw new BadRequestException('Username is required');
    }

    const normalizedUsername = username.trim().toLowerCase();

    if (normalizedUsername.length < 3) {
      throw new BadRequestException(
        'Username must be at least 3 characters long',
      );
    }

    if (!/^[a-z0-9_]+$/.test(normalizedUsername)) {
      throw new BadRequestException(
        'Username can only contain letters, numbers, and underscores',
      );
    }

    const existingUser = await this.userModel.findOne({
      creatorUsername: normalizedUsername,
    });

    return { available: !existingUser };
  }

  async updateNotificationSettings(
    userId: string,
    settingsDto:
      | UpdateCreatorNotificationSettingsDto
      | UpdateMemberNotificationSettingsDto,
  ): Promise<User> {
    const user = await this.userModel.findByIdAndUpdate(
      userId,
      { $set: settingsDto },
      { new: true },
    );
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  /**
   * Delete user account and handle all related Stripe subscriptions
   * This method:
   * 1. Verifies password
   * 2. Cancels all subscriptions where user is a subscriber
   * 3. Cancels all subscriptions where user is a creator
   * 4. Deletes the user account
   */
  async deleteUserAccount(
    userId: string,
    deleteDto: DeleteUserDto,
  ): Promise<{
    success: boolean;
    message: string;
    cancelledSubscriptions: {
      asSubscriber: number;
      asCreator: number;
    };
  }> {
    // Verify confirmation
    if (!deleteDto.confirmDeletion) {
      throw new BadRequestException('Deletion must be confirmed');
    }

    // Find user
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Verify password (only for local auth users)
    if (user.password) {
      const isPasswordValid = await bcrypt.compare(
        deleteDto.password,
        user.password,
      );
      if (!isPasswordValid) {
        throw new UnauthorizedException('Incorrect password');
      }
    } else {
      // For social login users, password check is skipped
      // but we might want to add additional verification
      console.log(
        `User ${userId} is using social login, skipping password verification`,
      );
    }

    let subscriberCancellations = 0;
    let creatorCancellations = 0;

    try {
      // Step 1: Cancel all subscriptions where user is a SUBSCRIBER
      const userSubscriptions = await this.subscriptionModel.find({
        subscriber: new Types.ObjectId(userId),
        status: 'active',
      });

      console.log(
        `Found ${userSubscriptions.length} active subscriptions as subscriber`,
      );

      for (const subscription of userSubscriptions) {
        try {
          // Cancel in Stripe if subscription has Stripe ID
          if (subscription.stripeSubscriptionId) {
            await this.paymentsService.stripe.subscriptions.cancel(
              subscription.stripeSubscriptionId,
            );
            console.log(
              `Cancelled Stripe subscription: ${subscription.stripeSubscriptionId}`,
            );
          }

          // Update subscription status in database
          subscription.status = 'cancelled';
          subscription.cancelledAt = new Date();
          await subscription.save();

          // Decrement subscriber count for the membership
          await this.membershipModel.findByIdAndUpdate(
            subscription.membership,
            {
              $inc: { subscriberCount: -1 },
            },
          );

          subscriberCancellations++;
        } catch (error) {
          console.error(
            `Error cancelling subscription ${subscription._id}:`,
            error,
          );
          // Continue with other subscriptions even if one fails
        }
      }

      // Step 2: Cancel all subscriptions where user is a CREATOR
      if (user.isCreator) {
        const creatorSubscriptions = await this.subscriptionModel.find({
          creator: new Types.ObjectId(userId),
          status: 'active',
        });

        console.log(
          `Found ${creatorSubscriptions.length} active subscriptions to this creator`,
        );

        for (const subscription of creatorSubscriptions) {
          try {
            // Cancel in Stripe if subscription has Stripe ID
            if (subscription.stripeSubscriptionId) {
              await this.paymentsService.stripe.subscriptions.cancel(
                subscription.stripeSubscriptionId,
              );
              console.log(
                `Cancelled Stripe subscription: ${subscription.stripeSubscriptionId}`,
              );
            }

            // Update subscription status in database
            subscription.status = 'cancelled';
            subscription.cancelledAt = new Date();
            await subscription.save();

            // Decrement subscriber count for the membership
            await this.membershipModel.findByIdAndUpdate(
              subscription.membership,
              {
                $inc: { subscriberCount: -1 },
              },
            );

            creatorCancellations++;
          } catch (error) {
            console.error(
              `Error cancelling creator subscription ${subscription._id}:`,
              error,
            );
            // Continue with other subscriptions even if one fails
          }
        }

        // Optionally: Deactivate all memberships created by this user
        await this.membershipModel.updateMany(
          { creator: new Types.ObjectId(userId) },
          { $set: { isActive: false } },
        );
      }

      // Step 3: Delete user from database
      // Note: Consider soft delete or anonymization instead of hard delete
      // For now, we'll do a hard delete
      await this.userModel.findByIdAndDelete(userId);

      console.log(
        `User ${userId} deleted successfully. Reason: ${deleteDto.reason}`,
      );

      return {
        success: true,
        message: 'Account successfully deleted',
        cancelledSubscriptions: {
          asSubscriber: subscriberCancellations,
          asCreator: creatorCancellations,
        },
      };
    } catch (error) {
      console.error(`Error deleting user ${userId}:`, error);
      throw new BadRequestException(
        `Failed to delete account: ${error.message}`,
      );
    }
  }
}
