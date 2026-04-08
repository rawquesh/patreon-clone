import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  IsUrl,
  Matches,
  MaxLength,
  MinLength,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { ContentVisibility, CreatorCategory } from '@/schemas/users.schema';
import { Transform, Type } from 'class-transformer';

export class CreatorOnboardingDto {
  @IsString()
  @MinLength(3)
  @Matches(/^[a-zA-Z0-9_]+$/, {
    message: 'Username can only contain letters, numbers, and underscores',
  })
  username: string;

  @IsEnum(ContentVisibility)
  contentVisibleTo: ContentVisibility;

  @IsEnum(CreatorCategory)
  category: CreatorCategory;
}

export class UpdateCreatorCategoryDto {
  @IsEnum(CreatorCategory)
  category: CreatorCategory;
}

export class UpdateHeadlineDto {
  @IsString()
  @MinLength(3, { message: 'Headline must be at least 3 characters long' })
  @MaxLength(300, { message: 'Headline cannot exceed 300 characters' })
  headline: string;
}

export class PublishCreatorDto {
  @IsOptional()
  @IsBoolean()
  acceptTerms?: boolean;
}

export enum SubscriptionStatus {
  ALL = 'all',
  ACTIVE = 'active',
  CANCELLED = 'cancelled',
  EXPIRED = 'expired',
}

export class GetSubscriptionsDto {
  @IsOptional()
  @IsEnum(SubscriptionStatus)
  @Transform(({ value }) => value || SubscriptionStatus.ALL)
  status?: SubscriptionStatus = SubscriptionStatus.ALL;
}

export class UpdateAboutDto {
  @IsOptional()
  @IsString()
  @IsUrl({}, { message: 'Invalid video URL format' })
  introVideoUrl?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000, { message: 'Bio cannot exceed 1000 characters' })
  bio?: string;

  @IsOptional()
  @IsObject()
  socialLinks?: {
    youtube?: string;
    instagram?: string;
    twitter?: string;
    facebook?: string;
    tiktok?: string;
    twitch?: string;
  };
}

export class UpdateContentVisibilityDto {
  @IsEnum(ContentVisibility)
  @IsNotEmpty()
  contentVisibleTo: ContentVisibility;
}

export class ResetPasswordDto {
  @IsString()
  @MinLength(6, {
    message: 'Current password must be at least 6 characters long',
  })
  currentPassword: string;

  @IsString()
  @MinLength(6, { message: 'New password must be at least 6 characters long' })
  newPassword: string;

  @IsString()
  @MinLength(6, {
    message: 'Password confirmation must be at least 6 characters long',
  })
  confirmPassword: string;
}

export class SocialLinkDto {
  @IsString()
  platform: string;

  @IsUrl()
  url: string;
}

export class UpdateSocialLinksDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SocialLinkDto)
  socialLinks: SocialLinkDto[];
}

export class SearchSubscribersDto {
  @IsString()
  @IsNotEmpty()
  query: string;
}

export class UsernameAvailabilityResponseDto {
  @IsBoolean()
  available: boolean;
}

export class UpdateNotificationSettingsDto {
  @IsOptional()
  @IsBoolean()
  notifyOnNewPost?: boolean;

  @IsOptional()
  @IsBoolean()
  notifyOnCommentsAndReplies?: boolean;

  @IsOptional()
  @IsBoolean()
  notifyOnDirectMessages?: boolean;
}

export class DeleteUserDto {
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  password: string;

  @IsString()
  @MinLength(10, {
    message: 'Please provide a reason for deletion (at least 10 characters)',
  })
  @MaxLength(500, {
    message: 'Deletion reason must not exceed 500 characters',
  })
  reason: string;

  @IsBoolean()
  @Transform(({ value }) => value === true || value === 'true')
  confirmDeletion: boolean;
}
