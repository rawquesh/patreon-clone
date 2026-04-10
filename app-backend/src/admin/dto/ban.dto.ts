import {
  IsEnum,
  IsOptional,
  IsString,
  IsDateString,
  IsNumber,
  Min,
  Max,
  IsMongoId,
} from 'class-validator';
import { Type } from 'class-transformer';
import { BanType, BanStatus } from '../schemas/ban.schema';

export class CreateBanDto {
  @IsOptional()
  @IsMongoId()
  userId?: string;

  @IsOptional()
  @IsString()
  targetIdentifier?: string;

  @IsEnum(BanType)
  type: BanType;

  @IsString()
  reason: string;

  @IsOptional()
  @IsString()
  adminNotes?: string;

  @IsOptional()
  @IsDateString()
  expiresAt?: string;
}

export class GetBansQueryDto {
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  page?: number = 1;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  limit?: number = 20;

  @IsOptional()
  @IsEnum(BanType)
  type?: BanType;

  @IsOptional()
  @IsEnum(BanStatus)
  status?: BanStatus;

  @IsOptional()
  @IsString()
  userId?: string;
}

export class LiftBanDto {
  @IsOptional()
  @IsString()
  adminNotes?: string;
}
