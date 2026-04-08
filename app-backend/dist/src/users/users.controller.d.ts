import { UsersService } from './users.service';
import { S3Service } from '@/s3/s3.service';
import { UpdateProfileDto } from './UpdateProfileDto';
import { CreatorOnboardingDto, UpdateHeadlineDto, PublishCreatorDto, UpdateCreatorCategoryDto, GetSubscriptionsDto, UpdateAboutDto, UpdateContentVisibilityDto, ResetPasswordDto, UpdateSocialLinksDto, SearchSubscribersDto, DeleteUserDto } from './users.dto';
import { MembershipsService } from '@/memberships/memberships.service';
export declare class UsersController {
    private readonly usersService;
    private readonly s3Service;
    private readonly membershipsService;
    constructor(usersService: UsersService, s3Service: S3Service, membershipsService: MembershipsService);
    updateProfile(req: any, updateProfileDto: UpdateProfileDto): Promise<import("../database").User>;
    updateAboutInfo(req: any, updateAboutDto: UpdateAboutDto): Promise<import("../database").User>;
    updateProfilePhoto(req: any, file: Express.Multer.File): Promise<import("../database").User>;
    resetPassword(req: any, resetPasswordDto: ResetPasswordDto): Promise<{
        success: boolean;
        message: string;
    }>;
    onboardCreator(req: any, creatorData: CreatorOnboardingDto): Promise<import("../database").User>;
    publishCreator(req: any, publishData: PublishCreatorDto): Promise<{
        user: import("../database").User;
        stripeOnboardingUrl: string;
    }>;
    updateProfileCover(req: any, file: Express.Multer.File): Promise<import("../database").User>;
    updateContentVisibility(req: any, updateVisibilityDto: UpdateContentVisibilityDto): Promise<import("../database").User>;
    updateCreatorHeadline(req: any, updateHeadlineDto: UpdateHeadlineDto): Promise<import("../database").User>;
    getPublishedCreators(): Promise<import("../database").User[]>;
    updateCreatorCategory(req: any, updateCategoryDto: UpdateCreatorCategoryDto): Promise<import("../database").User>;
    getCurrentUserSubscriptions(req: any, query: GetSubscriptionsDto): Promise<{
        subscriptions: import("../database").Subscription[];
        total: number;
        activeSubscriptions?: undefined;
        cancelledSubscriptions?: undefined;
    } | {
        activeSubscriptions: (import("../database").Subscription & {
            daysUntilRenewal: number;
            nextBillingAmount: number;
        })[];
        cancelledSubscriptions: import("../database").Subscription[];
        total: {
            active: number;
            cancelled: number;
            all: number;
        };
        subscriptions?: undefined;
    }>;
    getUserSubscriptionsById(req: any, targetUserId: string, query: GetSubscriptionsDto): Promise<{
        subscriptions: import("../database").Subscription[];
        total: number;
        activeSubscriptions?: undefined;
        cancelledSubscriptions?: undefined;
    } | {
        activeSubscriptions: (import("../database").Subscription & {
            daysUntilRenewal: number;
            nextBillingAmount: number;
        })[];
        cancelledSubscriptions: import("../database").Subscription[];
        total: {
            active: number;
            cancelled: number;
            all: number;
        };
        subscriptions?: undefined;
    }>;
    getMyAboutInfo(req: any): Promise<{
        introVideoUrl?: string;
        bio?: string;
        socialLinks?: {
            platform: string;
            url: string;
        }[];
    }>;
    getUserAboutInfo(userId: string): Promise<{
        introVideoUrl?: string;
        bio?: string;
        socialLinks?: {
            platform: string;
            url: string;
        }[];
    }>;
    getCreatorAboutInfo(username: string): Promise<{
        introVideoUrl?: string;
        bio?: string;
        socialLinks?: {
            platform: string;
            url: string;
        }[];
    }>;
    migrate(): Promise<{
        success: boolean;
    }>;
    updateMySocialLinks(req: any, updateSocialLinksDto: UpdateSocialLinksDto): Promise<{
        socialLinks: {
            platform: string;
            url: string;
        }[];
    }>;
    searchMySubscribers(req: any, searchDto: SearchSubscribersDto): Promise<{
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
    checkCreatorUsername(username: string): Promise<import("./users.dto").UsernameAvailabilityResponseDto>;
    checkCreatorUsernamePublic(username: string): Promise<import("./users.dto").UsernameAvailabilityResponseDto>;
    deleteAccount(req: any, deleteDto: DeleteUserDto): Promise<{
        success: boolean;
        message: string;
        details: {
            subscriberSubscriptionsCancelled: number;
            creatorSubscriptionsCancelled: number;
            totalCancelled: number;
        };
    }>;
}
