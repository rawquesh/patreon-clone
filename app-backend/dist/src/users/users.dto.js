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
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeleteUserDto = exports.UpdateNotificationSettingsDto = exports.UsernameAvailabilityResponseDto = exports.SearchSubscribersDto = exports.UpdateSocialLinksDto = exports.SocialLinkDto = exports.ResetPasswordDto = exports.UpdateContentVisibilityDto = exports.UpdateAboutDto = exports.GetSubscriptionsDto = exports.SubscriptionStatus = exports.PublishCreatorDto = exports.UpdateHeadlineDto = exports.UpdateCreatorCategoryDto = exports.CreatorOnboardingDto = void 0;
const class_validator_1 = require("class-validator");
const user_1 = require("../database/schemas/user");
const class_transformer_1 = require("class-transformer");
class CreatorOnboardingDto {
}
exports.CreatorOnboardingDto = CreatorOnboardingDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(3),
    (0, class_validator_1.Matches)(/^[a-zA-Z0-9_]+$/, {
        message: 'Username can only contain letters, numbers, and underscores',
    }),
    __metadata("design:type", String)
], CreatorOnboardingDto.prototype, "username", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(user_1.ContentVisibility),
    __metadata("design:type", String)
], CreatorOnboardingDto.prototype, "contentVisibleTo", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(user_1.CreatorCategory),
    __metadata("design:type", String)
], CreatorOnboardingDto.prototype, "category", void 0);
class UpdateCreatorCategoryDto {
}
exports.UpdateCreatorCategoryDto = UpdateCreatorCategoryDto;
__decorate([
    (0, class_validator_1.IsEnum)(user_1.CreatorCategory),
    __metadata("design:type", String)
], UpdateCreatorCategoryDto.prototype, "category", void 0);
class UpdateHeadlineDto {
}
exports.UpdateHeadlineDto = UpdateHeadlineDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(3, { message: 'Headline must be at least 3 characters long' }),
    (0, class_validator_1.MaxLength)(300, { message: 'Headline cannot exceed 300 characters' }),
    __metadata("design:type", String)
], UpdateHeadlineDto.prototype, "headline", void 0);
class PublishCreatorDto {
}
exports.PublishCreatorDto = PublishCreatorDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], PublishCreatorDto.prototype, "acceptTerms", void 0);
var SubscriptionStatus;
(function (SubscriptionStatus) {
    SubscriptionStatus["ALL"] = "all";
    SubscriptionStatus["ACTIVE"] = "active";
    SubscriptionStatus["CANCELLED"] = "cancelled";
    SubscriptionStatus["EXPIRED"] = "expired";
})(SubscriptionStatus || (exports.SubscriptionStatus = SubscriptionStatus = {}));
class GetSubscriptionsDto {
    constructor() {
        this.status = SubscriptionStatus.ALL;
    }
}
exports.GetSubscriptionsDto = GetSubscriptionsDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(SubscriptionStatus),
    (0, class_transformer_1.Transform)(({ value }) => value || SubscriptionStatus.ALL),
    __metadata("design:type", String)
], GetSubscriptionsDto.prototype, "status", void 0);
class UpdateAboutDto {
}
exports.UpdateAboutDto = UpdateAboutDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsUrl)({}, { message: 'Invalid video URL format' }),
    __metadata("design:type", String)
], UpdateAboutDto.prototype, "introVideoUrl", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(1000, { message: 'Bio cannot exceed 1000 characters' }),
    __metadata("design:type", String)
], UpdateAboutDto.prototype, "bio", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], UpdateAboutDto.prototype, "socialLinks", void 0);
class UpdateContentVisibilityDto {
}
exports.UpdateContentVisibilityDto = UpdateContentVisibilityDto;
__decorate([
    (0, class_validator_1.IsEnum)(user_1.ContentVisibility),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], UpdateContentVisibilityDto.prototype, "contentVisibleTo", void 0);
class ResetPasswordDto {
}
exports.ResetPasswordDto = ResetPasswordDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(6, {
        message: 'Current password must be at least 6 characters long',
    }),
    __metadata("design:type", String)
], ResetPasswordDto.prototype, "currentPassword", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(6, { message: 'New password must be at least 6 characters long' }),
    __metadata("design:type", String)
], ResetPasswordDto.prototype, "newPassword", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(6, {
        message: 'Password confirmation must be at least 6 characters long',
    }),
    __metadata("design:type", String)
], ResetPasswordDto.prototype, "confirmPassword", void 0);
class SocialLinkDto {
}
exports.SocialLinkDto = SocialLinkDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SocialLinkDto.prototype, "platform", void 0);
__decorate([
    (0, class_validator_1.IsUrl)(),
    __metadata("design:type", String)
], SocialLinkDto.prototype, "url", void 0);
class UpdateSocialLinksDto {
}
exports.UpdateSocialLinksDto = UpdateSocialLinksDto;
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => SocialLinkDto),
    __metadata("design:type", Array)
], UpdateSocialLinksDto.prototype, "socialLinks", void 0);
class SearchSubscribersDto {
}
exports.SearchSubscribersDto = SearchSubscribersDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], SearchSubscribersDto.prototype, "query", void 0);
class UsernameAvailabilityResponseDto {
}
exports.UsernameAvailabilityResponseDto = UsernameAvailabilityResponseDto;
__decorate([
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UsernameAvailabilityResponseDto.prototype, "available", void 0);
class UpdateNotificationSettingsDto {
}
exports.UpdateNotificationSettingsDto = UpdateNotificationSettingsDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateNotificationSettingsDto.prototype, "notifyOnNewPost", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateNotificationSettingsDto.prototype, "notifyOnCommentsAndReplies", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateNotificationSettingsDto.prototype, "notifyOnDirectMessages", void 0);
class DeleteUserDto {
}
exports.DeleteUserDto = DeleteUserDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(8, { message: 'Password must be at least 8 characters' }),
    __metadata("design:type", String)
], DeleteUserDto.prototype, "password", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(10, {
        message: 'Please provide a reason for deletion (at least 10 characters)',
    }),
    (0, class_validator_1.MaxLength)(500, {
        message: 'Deletion reason must not exceed 500 characters',
    }),
    __metadata("design:type", String)
], DeleteUserDto.prototype, "reason", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    (0, class_transformer_1.Transform)(({ value }) => value === true || value === 'true'),
    __metadata("design:type", Boolean)
], DeleteUserDto.prototype, "confirmDeletion", void 0);
//# sourceMappingURL=users.dto.js.map