import { ContentVisibility, CreatorCategory } from '@/database/schemas/user';
export declare class CreatorOnboardingDto {
    username: string;
    contentVisibleTo: ContentVisibility;
    category: CreatorCategory;
}
export declare class UpdateCreatorCategoryDto {
    category: CreatorCategory;
}
export declare class UpdateHeadlineDto {
    headline: string;
}
export declare class PublishCreatorDto {
    acceptTerms?: boolean;
}
export declare enum SubscriptionStatus {
    ALL = "all",
    ACTIVE = "active",
    CANCELLED = "cancelled",
    EXPIRED = "expired"
}
export declare class GetSubscriptionsDto {
    status?: SubscriptionStatus;
}
export declare class UpdateAboutDto {
    introVideoUrl?: string;
    bio?: string;
    socialLinks?: {
        youtube?: string;
        instagram?: string;
        twitter?: string;
        facebook?: string;
        tiktok?: string;
        twitch?: string;
    };
}
export declare class UpdateContentVisibilityDto {
    contentVisibleTo: ContentVisibility;
}
export declare class ResetPasswordDto {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}
export declare class SocialLinkDto {
    platform: string;
    url: string;
}
export declare class UpdateSocialLinksDto {
    socialLinks: SocialLinkDto[];
}
export declare class SearchSubscribersDto {
    query: string;
}
export declare class UsernameAvailabilityResponseDto {
    available: boolean;
}
export declare class UpdateNotificationSettingsDto {
    notifyOnNewPost?: boolean;
    notifyOnCommentsAndReplies?: boolean;
    notifyOnDirectMessages?: boolean;
}
export declare class DeleteUserDto {
    password: string;
    reason: string;
    confirmDeletion: boolean;
}
