import {
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
  ReportReason,
  ReportStatus,
  UserReportReason,
} from '@/database/schemas/report/enums';

// ==================== POST REPORT DTOs ====================

export class CreatePostReportDto {
  @IsMongoId()
  postId: string;

  @IsEnum(ReportReason)
  reason: ReportReason;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsOptional()
  additionalContext?: string;
}

export class UpdateReportStatusDto {
  @IsEnum(ReportStatus)
  status: ReportStatus;

  @IsString()
  @IsOptional()
  adminNotes?: string;
}

export class GetReportsQueryDto {
  @IsOptional() @IsNumber() @Min(1) @Type(() => Number) page?: number = 1;
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  limit?: number = 10;
  @IsOptional() @IsString() sortBy?: string = 'createdAt';
  @IsOptional() @IsString() sortOrder?: 'asc' | 'desc' = 'desc';
  @IsOptional() @IsEnum(ReportStatus) status?: ReportStatus;
  @IsOptional() @IsMongoId() reportedBy?: string;
  @IsOptional() @IsMongoId() postId?: string;
}

// ==================== USER REPORT DTOs ====================

export class CreateUserReportDto {
  @IsMongoId()
  userId: string;

  @IsEnum(UserReportReason)
  reason: UserReportReason;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsOptional()
  additionalContext?: string;
}

export class UpdateUserReportStatusDto {
  @IsEnum(ReportStatus)
  status: ReportStatus;

  @IsString()
  @IsOptional()
  adminNotes?: string;
}

export class GetUserReportsQueryDto {
  @IsOptional() @IsNumber() @Min(1) @Type(() => Number) page?: number = 1;
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  limit?: number = 10;
  @IsOptional() @IsString() sortBy?: string = 'createdAt';
  @IsOptional() @IsString() sortOrder?: 'asc' | 'desc' = 'desc';
  @IsOptional() @IsEnum(ReportStatus) status?: ReportStatus;
  @IsOptional() @IsMongoId() reportedBy?: string;
  @IsOptional() @IsMongoId() userId?: string;
}

// ==================== WITHHELD CONTENT DTOs ====================

export class WithholdPostDto {
  @IsString() @IsNotEmpty() reason: string;
  @IsString() @IsOptional() adminNotes?: string;
  @IsMongoId() @IsOptional() relatedReportId?: string;
}

export class RestorePostDto {}

export class WithholdUserDto {
  @IsString() @IsNotEmpty() reason: string;
  @IsString() @IsOptional() adminNotes?: string;
  @IsMongoId() @IsOptional() relatedReportId?: string;
}

export class RestoreUserDto {}
