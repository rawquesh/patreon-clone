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
exports.PromotionValidationResponseDto = exports.GiftResponseDto = exports.DiscountResponseDto = exports.RedeemPromotionDto = exports.UpdateGiftDto = exports.CreateGiftDto = exports.UpdateDiscountDto = exports.CreateDiscountDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const promotion_1 = require("../database/schemas/promotion");
class CreateDiscountDto {
    constructor() {
        this.isPublic = false;
    }
}
exports.CreateDiscountDto = CreateDiscountDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateDiscountDto.prototype, "title", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateDiscountDto.prototype, "code", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateDiscountDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(promotion_1.DiscountType),
    __metadata("design:type", String)
], CreateDiscountDto.prototype, "percentageType", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(100),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], CreateDiscountDto.prototype, "discountNumber", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(promotion_1.DiscountApplicability),
    __metadata("design:type", String)
], CreateDiscountDto.prototype, "applicableTo", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsMongoId)({ each: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], CreateDiscountDto.prototype, "applicableTiers", void 0);
__decorate([
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateDiscountDto.prototype, "startDate", void 0);
__decorate([
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateDiscountDto.prototype, "endDate", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], CreateDiscountDto.prototype, "isPublic", void 0);
class UpdateDiscountDto {
}
exports.UpdateDiscountDto = UpdateDiscountDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateDiscountDto.prototype, "title", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateDiscountDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(promotion_1.DiscountStatus),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateDiscountDto.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(promotion_1.DiscountType),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateDiscountDto.prototype, "percentageType", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(100),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], UpdateDiscountDto.prototype, "discountNumber", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(promotion_1.DiscountApplicability),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateDiscountDto.prototype, "applicableTo", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsMongoId)({ each: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], UpdateDiscountDto.prototype, "applicableTiers", void 0);
__decorate([
    (0, class_validator_1.IsDateString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateDiscountDto.prototype, "startDate", void 0);
__decorate([
    (0, class_validator_1.IsDateString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateDiscountDto.prototype, "endDate", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], UpdateDiscountDto.prototype, "isPublic", void 0);
class CreateGiftDto {
    constructor() {
        this.isPublic = false;
    }
}
exports.CreateGiftDto = CreateGiftDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateGiftDto.prototype, "title", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateGiftDto.prototype, "code", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateGiftDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(promotion_1.GiftType),
    __metadata("design:type", String)
], CreateGiftDto.prototype, "giftType", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], CreateGiftDto.prototype, "durationDays", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(promotion_1.DiscountApplicability),
    __metadata("design:type", String)
], CreateGiftDto.prototype, "applicableTo", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsMongoId)({ each: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], CreateGiftDto.prototype, "applicableTiers", void 0);
__decorate([
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateGiftDto.prototype, "startDate", void 0);
__decorate([
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateGiftDto.prototype, "endDate", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], CreateGiftDto.prototype, "isPublic", void 0);
class UpdateGiftDto {
}
exports.UpdateGiftDto = UpdateGiftDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateGiftDto.prototype, "title", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateGiftDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(promotion_1.DiscountStatus),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateGiftDto.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(promotion_1.GiftType),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateGiftDto.prototype, "giftType", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], UpdateGiftDto.prototype, "durationDays", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(promotion_1.DiscountApplicability),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateGiftDto.prototype, "applicableTo", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsMongoId)({ each: true }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], UpdateGiftDto.prototype, "applicableTiers", void 0);
__decorate([
    (0, class_validator_1.IsDateString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateGiftDto.prototype, "startDate", void 0);
__decorate([
    (0, class_validator_1.IsDateString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateGiftDto.prototype, "endDate", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], UpdateGiftDto.prototype, "isPublic", void 0);
class RedeemPromotionDto {
}
exports.RedeemPromotionDto = RedeemPromotionDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], RedeemPromotionDto.prototype, "code", void 0);
__decorate([
    (0, class_validator_1.IsMongoId)(),
    __metadata("design:type", String)
], RedeemPromotionDto.prototype, "membershipId", void 0);
class DiscountResponseDto {
}
exports.DiscountResponseDto = DiscountResponseDto;
class GiftResponseDto {
}
exports.GiftResponseDto = GiftResponseDto;
class PromotionValidationResponseDto {
}
exports.PromotionValidationResponseDto = PromotionValidationResponseDto;
//# sourceMappingURL=promotions.dto.js.map