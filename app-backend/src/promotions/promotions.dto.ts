import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  DiscountApplicability,
  DiscountStatus,
  DiscountType,
  GiftType,
} from '@/database/schemas/promotion';

export class CreateDiscountDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  code: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(DiscountType)
  percentageType: DiscountType;

  @IsNumber()
  @Min(0)
  @Max(100)
  @Type(() => Number)
  discountNumber: number;

  @IsEnum(DiscountApplicability)
  applicableTo: DiscountApplicability;

  @IsArray()
  @IsMongoId({ each: true })
  @IsOptional()
  applicableTiers?: string[];

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsBoolean()
  @IsOptional()
  isPublic?: boolean = false;
}

export class UpdateDiscountDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(DiscountStatus)
  @IsOptional()
  status?: DiscountStatus;

  @IsEnum(DiscountType)
  @IsOptional()
  percentageType?: DiscountType;

  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  @Type(() => Number)
  discountNumber?: number;

  @IsEnum(DiscountApplicability)
  @IsOptional()
  applicableTo?: DiscountApplicability;

  @IsArray()
  @IsMongoId({ each: true })
  @IsOptional()
  applicableTiers?: string[];

  @IsDateString()
  @IsOptional()
  startDate?: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;

  @IsBoolean()
  @IsOptional()
  isPublic?: boolean;
}

export class CreateGiftDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  code: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(GiftType)
  giftType: GiftType;

  @IsNumber()
  @Min(1)
  @Type(() => Number)
  durationDays: number;

  @IsEnum(DiscountApplicability)
  applicableTo: DiscountApplicability;

  @IsArray()
  @IsMongoId({ each: true })
  @IsOptional()
  applicableTiers?: string[];

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsBoolean()
  @IsOptional()
  isPublic?: boolean = false;
}

export class UpdateGiftDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(DiscountStatus)
  @IsOptional()
  status?: DiscountStatus;

  @IsEnum(GiftType)
  @IsOptional()
  giftType?: GiftType;

  @IsNumber()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  durationDays?: number;

  @IsEnum(DiscountApplicability)
  @IsOptional()
  applicableTo?: DiscountApplicability;

  @IsArray()
  @IsMongoId({ each: true })
  @IsOptional()
  applicableTiers?: string[];

  @IsDateString()
  @IsOptional()
  startDate?: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;

  @IsBoolean()
  @IsOptional()
  isPublic?: boolean;
}

export class RedeemPromotionDto {
  @IsString()
  @IsNotEmpty()
  code: string;

  @IsMongoId()
  membershipId: string;
}

export class DiscountResponseDto {
  id: string;
  title: string;
  code: string;
  description: string;
  status: DiscountStatus;
  redeemed: number;
  percentageType: DiscountType;
  discountNumber: number;
  applicableTo: DiscountApplicability;
  applicableTiers?: any[];
  startDate: string;
  endDate: string;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

export class GiftResponseDto {
  id: string;
  title: string;
  code: string;
  description: string;
  status: DiscountStatus;
  redeemed: number;
  giftType: GiftType;
  durationDays: number;
  applicableTo: DiscountApplicability;
  applicableTiers?: any[];
  startDate: string;
  endDate: string;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

export class PromotionValidationResponseDto {
  isValid: boolean;
  message: string;
  promotion?: DiscountResponseDto | GiftResponseDto;
}
