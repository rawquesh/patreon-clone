"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const user_1 = require("../database/schemas/user");
const membership_1 = require("../database/schemas/membership");
const subscription_1 = require("../database/schemas/subscription");
const payments_service_1 = require("../payments/payments.service");
const bcrypt = require("bcrypt");
let UsersService = class UsersService {
    constructor(userModel, membershipModel, subscriptionModel, paymentsService) {
        this.userModel = userModel;
        this.membershipModel = membershipModel;
        this.subscriptionModel = subscriptionModel;
        this.paymentsService = paymentsService;
    }
    async findById(userId) {
        const user = await this.userModel.findById(userId);
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        return user;
    }
    async updateProfile(userId, updateProfileDto) {
        const user = await this.userModel.findById(userId);
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        if (updateProfileDto.email && updateProfileDto.email !== user.email) {
            const existingUser = await this.userModel.findOne({
                email: updateProfileDto.email,
            });
            if (existingUser) {
                throw new common_1.BadRequestException('Email already exists');
            }
        }
        const updatedUser = await this.userModel.findByIdAndUpdate(userId, {
            $set: {
                ...updateProfileDto,
                updatedAt: new Date(),
            },
        }, { new: true, runValidators: true });
        if (!updatedUser) {
            throw new common_1.NotFoundException('User not found');
        }
        return updatedUser;
    }
    async updateProfilePhoto(userId, photoUrl) {
        console.log('Updating profile photo for user:', userId);
        console.log('New photo URL:', photoUrl);
        if (!mongoose_2.Types.ObjectId.isValid(userId)) {
            throw new Error('Invalid user ID format');
        }
        try {
            const updatedUser = await this.userModel.findOneAndUpdate({ _id: new mongoose_2.Types.ObjectId(userId) }, {
                $set: {
                    profilePicture: photoUrl,
                    updatedAt: new Date(),
                },
            }, { new: true, runValidators: true });
            console.log('Updated user result:', updatedUser);
            if (!updatedUser) {
                throw new common_1.NotFoundException(`User with ID ${userId} not found`);
            }
            return updatedUser;
        }
        catch (error) {
            console.error('Error updating user profile photo:', error);
            throw error;
        }
    }
    async onboardCreator(userId, creatorData) {
        if (!mongoose_2.Types.ObjectId.isValid(userId)) {
            throw new Error('Invalid user ID format');
        }
        const user = await this.userModel.findById(userId);
        if (!user) {
            throw new common_1.NotFoundException(`User with ID ${userId} not found`);
        }
        const existingUsername = await this.userModel.findOne({
            creatorUsername: creatorData.username.toLowerCase(),
        });
        if (existingUsername) {
            throw new common_1.ConflictException('Username is already taken');
        }
        const updatedUser = await this.userModel.findOneAndUpdate({ _id: new mongoose_2.Types.ObjectId(userId) }, {
            $set: {
                creatorUsername: creatorData.username.toLowerCase(),
                contentVisibleTo: creatorData.contentVisibleTo,
                isCreator: true,
                creatorStatus: user_1.CreatorStatus.DRAFT,
                updatedAt: new Date().toISOString(),
                creatorCategory: creatorData.category,
            },
        }, { new: true, runValidators: true });
        if (!updatedUser) {
            throw new common_1.NotFoundException(`User with ID ${userId} not found`);
        }
        await this.createDefaultFreeMembership(userId);
        return updatedUser;
    }
    async createDefaultFreeMembership(userId) {
        try {
            const defaultFreeMembership = {
                creator: new mongoose_2.Types.ObjectId(userId),
                name: 'Free Membership',
                description: 'Access to free content from this creator',
                monthlyRate: 0,
                benefits: ['Access to public posts', 'Join the community'],
                coverImage: '${business.s3.baseUrl}/membership-covers/membership.jpg',
                isActive: true,
            };
            const existingFreeMembership = await this.membershipModel.findOne({
                creator: new mongoose_2.Types.ObjectId(userId),
                monthlyRate: 0,
            });
            if (!existingFreeMembership) {
                await this.membershipModel.create(defaultFreeMembership);
            }
        }
        catch (error) {
            console.error(`Failed to create default free membership: ${error.message}`);
        }
    }
    async publishCreator(userId, publishData) {
        console.log(publishData);
        const user = await this.userModel.findById(userId);
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        if (!user.isCreator) {
            throw new common_1.BadRequestException('User is not a creator');
        }
        if (user.creatorStatus === user_1.CreatorStatus.PUBLISHED) {
            throw new common_1.BadRequestException('Creator is already published');
        }
        const { accountId, accountLinkUrl } = await this.paymentsService.createConnectAccount(userId, user.email);
        const updatedUser = await this.userModel.findByIdAndUpdate(userId, {
            $set: {
                stripeConnectAccountId: accountId,
                hasCompletedStripeOnboarding: false,
                creatorStatus: user_1.CreatorStatus.ONBOARDING,
                updatedAt: new Date().toISOString(),
            },
        }, { new: true });
        await this.createDefaultFreeMembership(userId);
        return { user: updatedUser, stripeOnboardingUrl: accountLinkUrl };
    }
    async updateProfileCover(userId, coverUrl) {
        console.log('Updating profile cover for user:', userId);
        console.log('New cover URL:', coverUrl);
        if (!mongoose_2.Types.ObjectId.isValid(userId)) {
            throw new Error('Invalid user ID format');
        }
        try {
            const updatedUser = await this.userModel.findOneAndUpdate({ _id: new mongoose_2.Types.ObjectId(userId) }, {
                $set: {
                    profileCover: coverUrl,
                    updatedAt: new Date().toISOString(),
                },
            }, { new: true, runValidators: true });
            console.log('Updated user result:', updatedUser);
            if (!updatedUser) {
                throw new common_1.NotFoundException(`User with ID ${userId} not found`);
            }
            return updatedUser;
        }
        catch (error) {
            console.error('Error updating user profile cover:', error);
            throw error;
        }
    }
    async updateCreatorHeadline(userId, { headline }) {
        if (!mongoose_2.Types.ObjectId.isValid(userId)) {
            throw new Error('Invalid user ID format');
        }
        const updatedUser = await this.userModel.findOneAndUpdate({ _id: new mongoose_2.Types.ObjectId(userId) }, {
            $set: {
                creatorHeadline: headline,
                updatedAt: new Date().toISOString(),
            },
        }, { new: true, runValidators: true });
        if (!updatedUser) {
            throw new common_1.NotFoundException('User not found');
        }
        return updatedUser;
    }
    async updateUserStripeStatusFromWebhook(account) {
        const stripeAccountId = account.id;
        const user = await this.userModel.findOne({
            stripeConnectAccountId: stripeAccountId,
        });
        if (!user) {
            console.error(`Received account.updated webhook for Stripe account ${stripeAccountId}, but no matching user was found.`);
            return;
        }
        const isEnabled = account.charges_enabled && account.payouts_enabled;
        if (isEnabled && !user.hasCompletedStripeOnboarding) {
            await this.userModel.findByIdAndUpdate(user._id, {
                $set: {
                    hasCompletedStripeOnboarding: true,
                    creatorStatus: user_1.CreatorStatus.PUBLISHED,
                    updatedAt: new Date(),
                },
            });
        }
        else {
            await this.userModel.findByIdAndUpdate(user._id, {
                $set: {
                    hasCompletedStripeOnboarding: isEnabled,
                    updatedAt: new Date(),
                },
            });
        }
    }
    addGenderFilters(baseFilter, requestingUser) {
        const filter = { ...baseFilter };
        const genderConditions = [];
        if (requestingUser?.genderPreference &&
            requestingUser.genderPreference !== user_1.GenderPreference.BOTH) {
            if (requestingUser.genderPreference === user_1.GenderPreference.MALE) {
                genderConditions.push({
                    $or: [{ gender: 'male' }, { gender: 'Male' }],
                });
            }
            else if (requestingUser.genderPreference === user_1.GenderPreference.FEMALE) {
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
                        { contentVisibleTo: user_1.ContentVisibility.BOTH },
                        { contentVisibleTo: userGenderLower },
                    ],
                });
            }
            else {
                genderConditions.push({ contentVisibleTo: user_1.ContentVisibility.BOTH });
            }
        }
        else {
            genderConditions.push({ contentVisibleTo: user_1.ContentVisibility.BOTH });
        }
        if (genderConditions.length > 0) {
            if (filter.$and) {
                filter.$and = Array.isArray(filter.$and)
                    ? [...filter.$and, ...genderConditions]
                    : [filter.$and, ...genderConditions];
            }
            else {
                filter.$and = genderConditions;
            }
        }
        return filter;
    }
    async getPublishedCreators(requestingUser) {
        const baseFilter = {
            isCreator: true,
            creatorStatus: user_1.CreatorStatus.PUBLISHED,
        };
        const finalFilter = this.addGenderFilters(baseFilter, requestingUser);
        return this.userModel.find(finalFilter);
    }
    async updateCreatorCategory(userId, updateCategoryDto) {
        if (!mongoose_2.Types.ObjectId.isValid(userId)) {
            throw new Error('Invalid user ID format');
        }
        const user = await this.userModel.findById(userId);
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        if (!user.isCreator) {
            throw new common_1.BadRequestException('User is not a creator');
        }
        const updatedUser = await this.userModel.findOneAndUpdate({ _id: new mongoose_2.Types.ObjectId(userId) }, {
            $set: {
                creatorCategory: updateCategoryDto.category,
                updatedAt: new Date().toISOString(),
            },
        }, { new: true, runValidators: true });
        if (!updatedUser) {
            throw new common_1.NotFoundException('User not found after update');
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
                    coverImage: '${business.s3.baseUrl}/membership-covers/membership.jpg',
                    isActive: true,
                });
            }
        }
    }
    async updateAboutInfo(userId, updateAboutDto) {
        if (!mongoose_2.Types.ObjectId.isValid(userId)) {
            throw new Error('Invalid user ID format');
        }
        const user = await this.userModel.findById(userId);
        if (!user) {
            throw new common_1.NotFoundException(`User with ID ${userId} not found`);
        }
        console.log(updateAboutDto);
        const updatedUser = await this.userModel.findOneAndUpdate({ _id: new mongoose_2.Types.ObjectId(userId) }, {
            $set: {
                introVideoUrl: updateAboutDto.introVideoUrl,
                bio: updateAboutDto.bio,
                socialLinks: updateAboutDto.socialLinks,
                updatedAt: new Date().toISOString(),
            },
        }, { new: true, runValidators: true });
        if (!updatedUser) {
            throw new common_1.NotFoundException(`User with ID ${userId} not found after update`);
        }
        return updatedUser;
    }
    async getAboutInfo(userId) {
        if (!mongoose_2.Types.ObjectId.isValid(userId)) {
            throw new Error('Invalid user ID format');
        }
        const user = await this.userModel.findById(userId);
        if (!user) {
            throw new common_1.NotFoundException(`User with ID ${userId} not found`);
        }
        return {
            introVideoUrl: user.introVideoUrl,
            bio: user.bio,
            socialLinks: user.socialLinks || [],
        };
    }
    async getAboutInfoByUsername(creatorUsername) {
        const user = await this.userModel.findOne({ creatorUsername });
        if (!user) {
            throw new common_1.NotFoundException(`Creator with username ${creatorUsername} not found`);
        }
        return {
            introVideoUrl: user.introVideoUrl,
            bio: user.bio,
            socialLinks: user.socialLinks || [],
        };
    }
    async updateContentVisibility(userId, updateVisibilityDto) {
        if (!mongoose_2.Types.ObjectId.isValid(userId)) {
            throw new Error('Invalid user ID format');
        }
        const user = await this.userModel.findById(userId);
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        if (!user.isCreator) {
            throw new common_1.BadRequestException('User is not a creator');
        }
        const updatedUser = await this.userModel.findOneAndUpdate({ _id: new mongoose_2.Types.ObjectId(userId) }, {
            $set: {
                contentVisibleTo: updateVisibilityDto.contentVisibleTo,
                updatedAt: new Date().toISOString(),
            },
        }, { new: true, runValidators: true });
        if (!updatedUser) {
            throw new common_1.NotFoundException('User not found after update');
        }
        return updatedUser;
    }
    async resetPassword(userId, resetPasswordDto) {
        const { currentPassword, newPassword, confirmPassword } = resetPasswordDto;
        if (newPassword !== confirmPassword) {
            throw new common_1.BadRequestException('New password and confirmation do not match');
        }
        const user = await this.userModel.findById(userId);
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        if (!user.password) {
            throw new common_1.BadRequestException('User does not have a password set (social login)');
        }
        const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
        if (!isPasswordValid) {
            throw new common_1.UnauthorizedException('Current password is incorrect');
        }
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await this.userModel.updateOne({ _id: new mongoose_2.Types.ObjectId(userId) }, {
            $set: {
                password: hashedPassword,
                updatedAt: new Date().toISOString(),
            },
        });
        return {
            success: true,
            message: 'Password has been successfully updated',
        };
    }
    async updateSocialLinks(userId, updateDto) {
        if (!mongoose_2.Types.ObjectId.isValid(userId)) {
            throw new common_1.BadRequestException('Invalid user ID format');
        }
        const user = await this.userModel.findById(userId);
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        const updatedUser = await this.userModel.findByIdAndUpdate(userId, {
            $set: {
                socialLinks: updateDto.socialLinks,
                updatedAt: new Date(),
            },
        }, { new: true, runValidators: true });
        if (!updatedUser) {
            throw new common_1.NotFoundException('User not found after update attempt');
        }
        return updatedUser;
    }
    async searchSubscribers(creatorId, searchQuery) {
        if (!mongoose_2.Types.ObjectId.isValid(creatorId)) {
            throw new common_1.BadRequestException('Invalid creator ID format');
        }
        const creator = await this.userModel.findById(creatorId);
        if (!creator || !creator.isCreator) {
            throw new common_1.BadRequestException('Only creators can search their subscribers');
        }
        const query = searchQuery.toLowerCase();
        const subscriptions = await this.subscriptionModel
            .find({
            creator: new mongoose_2.Types.ObjectId(creatorId),
            status: 'active',
        })
            .populate('subscriber')
            .populate('membership')
            .lean();
        const matchingSubscriptions = subscriptions.filter((subscription) => {
            const subscriber = subscription.subscriber;
            const firstName = (subscriber.firstName || '').toLowerCase();
            const lastName = (subscriber.lastName || '').toLowerCase();
            const fullName = `${firstName} ${lastName}`.toLowerCase();
            return (firstName.includes(query) ||
                lastName.includes(query) ||
                fullName.includes(query));
        });
        return matchingSubscriptions.map((subscription) => {
            const subscriber = subscription.subscriber;
            return {
                subscriptionId: subscription._id,
                subscriberId: subscriber._id,
                firstName: subscriber.firstName,
                lastName: subscriber.lastName,
                email: subscriber.email,
                profilePicture: subscriber.profilePicture,
                membershipTier: subscription.membership?.name || 'Unknown Tier',
                monthlyRate: subscription.monthlyRate,
                subscribedSince: subscription.createdAt,
            };
        });
    }
    async isCreatorUsernameAvailable(username) {
        if (!username || typeof username !== 'string') {
            throw new common_1.BadRequestException('Username is required');
        }
        const normalizedUsername = username.trim().toLowerCase();
        if (normalizedUsername.length < 3) {
            throw new common_1.BadRequestException('Username must be at least 3 characters long');
        }
        if (!/^[a-z0-9_]+$/.test(normalizedUsername)) {
            throw new common_1.BadRequestException('Username can only contain letters, numbers, and underscores');
        }
        const existingUser = await this.userModel.findOne({
            creatorUsername: normalizedUsername,
        });
        return { available: !existingUser };
    }
    async updateNotificationSettings(userId, settingsDto) {
        const user = await this.userModel.findByIdAndUpdate(userId, { $set: settingsDto }, { new: true });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        return user;
    }
    async deleteUserAccount(userId, deleteDto) {
        if (!deleteDto.confirmDeletion) {
            throw new common_1.BadRequestException('Deletion must be confirmed');
        }
        const user = await this.userModel.findById(userId);
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        if (user.password) {
            const isPasswordValid = await bcrypt.compare(deleteDto.password, user.password);
            if (!isPasswordValid) {
                throw new common_1.UnauthorizedException('Incorrect password');
            }
        }
        else {
            console.log(`User ${userId} is using social login, skipping password verification`);
        }
        let subscriberCancellations = 0;
        let creatorCancellations = 0;
        try {
            const userSubscriptions = await this.subscriptionModel.find({
                subscriber: new mongoose_2.Types.ObjectId(userId),
                status: 'active',
            });
            console.log(`Found ${userSubscriptions.length} active subscriptions as subscriber`);
            for (const subscription of userSubscriptions) {
                try {
                    if (subscription.stripeSubscriptionId) {
                        await this.paymentsService.stripe.subscriptions.cancel(subscription.stripeSubscriptionId);
                        console.log(`Cancelled Stripe subscription: ${subscription.stripeSubscriptionId}`);
                    }
                    subscription.status = 'cancelled';
                    subscription.cancelledAt = new Date();
                    await subscription.save();
                    await this.membershipModel.findByIdAndUpdate(subscription.membership, {
                        $inc: { subscriberCount: -1 },
                    });
                    subscriberCancellations++;
                }
                catch (error) {
                    console.error(`Error cancelling subscription ${subscription._id}:`, error);
                }
            }
            if (user.isCreator) {
                const creatorSubscriptions = await this.subscriptionModel.find({
                    creator: new mongoose_2.Types.ObjectId(userId),
                    status: 'active',
                });
                console.log(`Found ${creatorSubscriptions.length} active subscriptions to this creator`);
                for (const subscription of creatorSubscriptions) {
                    try {
                        if (subscription.stripeSubscriptionId) {
                            await this.paymentsService.stripe.subscriptions.cancel(subscription.stripeSubscriptionId);
                            console.log(`Cancelled Stripe subscription: ${subscription.stripeSubscriptionId}`);
                        }
                        subscription.status = 'cancelled';
                        subscription.cancelledAt = new Date();
                        await subscription.save();
                        await this.membershipModel.findByIdAndUpdate(subscription.membership, {
                            $inc: { subscriberCount: -1 },
                        });
                        creatorCancellations++;
                    }
                    catch (error) {
                        console.error(`Error cancelling creator subscription ${subscription._id}:`, error);
                    }
                }
                await this.membershipModel.updateMany({ creator: new mongoose_2.Types.ObjectId(userId) }, { $set: { isActive: false } });
            }
            await this.userModel.findByIdAndDelete(userId);
            console.log(`User ${userId} deleted successfully. Reason: ${deleteDto.reason}`);
            return {
                success: true,
                message: 'Account successfully deleted',
                cancelledSubscriptions: {
                    asSubscriber: subscriberCancellations,
                    asCreator: creatorCancellations,
                },
            };
        }
        catch (error) {
            console.error(`Error deleting user ${userId}:`, error);
            throw new common_1.BadRequestException(`Failed to delete account: ${error.message}`);
        }
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(user_1.User.name)),
    __param(1, (0, mongoose_1.InjectModel)(membership_1.Membership.name)),
    __param(2, (0, mongoose_1.InjectModel)(subscription_1.Subscription.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        payments_service_1.PaymentsService])
], UsersService);
//# sourceMappingURL=users.service.js.map