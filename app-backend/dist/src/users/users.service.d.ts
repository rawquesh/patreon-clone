import { Model } from 'mongoose';
import { User, GenderPreference } from '@/database/schemas/user';
import { UpdateProfileDto } from './UpdateProfileDto';
import { CreatorOnboardingDto, UpdateHeadlineDto, PublishCreatorDto, UpdateCreatorCategoryDto, UpdateAboutDto, ResetPasswordDto, UpdateContentVisibilityDto, UpdateSocialLinksDto, UsernameAvailabilityResponseDto } from './users.dto';
import { UpdateCreatorNotificationSettingsDto, UpdateMemberNotificationSettingsDto } from '@/notifications/notifications.dto';
import { PaymentsService } from '@/payments/payments.service';
import Stripe from 'stripe';
import { DeleteUserDto } from './users.dto';
interface RequestingUser {
    userId: string;
    gender?: string;
    genderPreference?: GenderPreference;
}
export declare class UsersService {
    private userModel;
    private membershipModel;
    private subscriptionModel;
    private paymentsService;
    constructor(userModel: Model<User>, membershipModel: Model<any>, subscriptionModel: Model<any>, paymentsService: PaymentsService);
    findById(userId: string): Promise<User>;
    updateProfile(userId: string, updateProfileDto: UpdateProfileDto): Promise<User>;
    updateProfilePhoto(userId: string, photoUrl: string): Promise<User>;
    onboardCreator(userId: string, creatorData: CreatorOnboardingDto): Promise<User>;
    createDefaultFreeMembership(userId: string): Promise<void>;
    publishCreator(userId: string, publishData: PublishCreatorDto): Promise<{
        user: User;
        stripeOnboardingUrl: string;
    }>;
    updateProfileCover(userId: string, coverUrl: string): Promise<User>;
    updateCreatorHeadline(userId: string, { headline }: UpdateHeadlineDto): Promise<User>;
    updateUserStripeStatusFromWebhook(account: Stripe.Account): Promise<void>;
    private addGenderFilters;
    getPublishedCreators(requestingUser?: RequestingUser): Promise<User[]>;
    updateCreatorCategory(userId: string, updateCategoryDto: UpdateCreatorCategoryDto): Promise<User>;
    createFreeMembershipsForAllCreators(): Promise<void>;
    updateAboutInfo(userId: string, updateAboutDto: UpdateAboutDto): Promise<User>;
    getAboutInfo(userId: string): Promise<{
        introVideoUrl?: string;
        bio?: string;
        socialLinks?: {
            platform: string;
            url: string;
        }[];
    }>;
    getAboutInfoByUsername(creatorUsername: string): Promise<{
        introVideoUrl?: string;
        bio?: string;
        socialLinks?: {
            platform: string;
            url: string;
        }[];
    }>;
    updateContentVisibility(userId: string, updateVisibilityDto: UpdateContentVisibilityDto): Promise<User>;
    resetPassword(userId: string, resetPasswordDto: ResetPasswordDto): Promise<{
        success: boolean;
        message: string;
    }>;
    updateSocialLinks(userId: string, updateDto: UpdateSocialLinksDto): Promise<User>;
    searchSubscribers(creatorId: string, searchQuery: string): Promise<{
        subscriptionId: unknown;
        subscriberId: any;
        firstName: any;
        lastName: any;
        email: any;
        profilePicture: any;
        membershipTier: any;
        monthlyRate: any;
        subscribedSince: any;
    }[]>;
    isCreatorUsernameAvailable(username: string): Promise<UsernameAvailabilityResponseDto>;
    updateNotificationSettings(userId: string, settingsDto: UpdateCreatorNotificationSettingsDto | UpdateMemberNotificationSettingsDto): Promise<User>;
    deleteUserAccount(userId: string, deleteDto: DeleteUserDto): Promise<{
        success: boolean;
        message: string;
        cancelledSubscriptions: {
            asSubscriber: number;
            asCreator: number;
        };
    }>;
}
export {};
