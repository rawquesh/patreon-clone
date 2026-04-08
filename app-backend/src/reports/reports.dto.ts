import { Type } from 'class-transformer';
import {
  IsString,
  IsOptional,
  IsEnum,
  IsInt,
  Min,
  Max,
  IsMongoId,
  MaxLength,
  MinLength,
} from 'class-validator';
import {
  ReportReason,
  ReportStatus,
  UserReportReason,
} from '@/database/schemas/report/enums';

export class CreatePostReportDto {
  @IsMongoId({ message: 'Invalid post ID' })
  postId: string;

  @IsEnum(ReportReason, {
    message: 'Invalid report reason',
  })
  reason: ReportReason;

  @IsString()
  @MinLength(10, {
    message: 'Description must be at least 10 characters long',
  })
  @MaxLength(1000, {
    message: 'Description must not exceed 1000 characters',
  })
  description: string;

  @IsOptional()
  @IsString()
  @MaxLength(500, {
    message: 'Additional context must not exceed 500 characters',
  })
  additionalContext?: string;
}

export class CreateUserReportDto {
  @IsMongoId({ message: 'Invalid user ID' })
  userId: string;

  @IsEnum(UserReportReason, {
    message: 'Invalid report reason',
  })
  reason: UserReportReason;

  @IsString()
  @MinLength(10, {
    message: 'Description must be at least 10 characters long',
  })
  @MaxLength(1000, {
    message: 'Description must not exceed 1000 characters',
  })
  description: string;

  @IsOptional()
  @IsString()
  @MaxLength(500, {
    message: 'Additional context must not exceed 500 characters',
  })
  additionalContext?: string;
}

export class UpdateReportStatusDto {
  @IsEnum(ReportStatus, {
    message: 'Invalid report status',
  })
  status: ReportStatus;

  @IsOptional()
  @IsString()
  @MaxLength(1000, {
    message: 'Admin notes must not exceed 1000 characters',
  })
  adminNotes?: string;
}

export class UpdateUserReportStatusDto {
  @IsEnum(ReportStatus, {
    message: 'Invalid report status',
  })
  status: ReportStatus;

  @IsOptional()
  @IsString()
  @MaxLength(1000, {
    message: 'Admin notes must not exceed 1000 characters',
  })
  adminNotes?: string;
}

export enum ReportSortBy {
  CREATED_AT = 'createdAt',
  UPDATED_AT = 'updatedAt',
  STATUS = 'status',
}

export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc',
}

export class GetReportsQueryDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page?: number = 1;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  limit?: number = 10;

  @IsOptional()
  @IsEnum(ReportSortBy)
  sortBy?: ReportSortBy = ReportSortBy.CREATED_AT;

  @IsOptional()
  @IsEnum(SortOrder)
  sortOrder?: SortOrder = SortOrder.DESC;

  @IsOptional()
  @IsEnum(ReportStatus)
  status?: ReportStatus;

  @IsOptional()
  @IsMongoId()
  reportedBy?: string;

  @IsOptional()
  @IsMongoId()
  postId?: string;
}

export class GetUserReportsQueryDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page?: number = 1;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  limit?: number = 10;

  @IsOptional()
  @IsEnum(ReportSortBy)
  sortBy?: ReportSortBy = ReportSortBy.CREATED_AT;

  @IsOptional()
  @IsEnum(SortOrder)
  sortOrder?: SortOrder = SortOrder.DESC;

  @IsOptional()
  @IsEnum(ReportStatus)
  status?: ReportStatus;

  @IsOptional()
  @IsMongoId()
  reportedBy?: string;

  @IsOptional()
  @IsMongoId()
  userId?: string;
}

export class WithholdPostDto {
  @IsString()
  @MinLength(10, {
    message: 'Reason must be at least 10 characters long',
  })
  @MaxLength(500, {
    message: 'Reason must not exceed 500 characters',
  })
  reason: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000, {
    message: 'Admin notes must not exceed 1000 characters',
  })
  adminNotes?: string;

  @IsOptional()
  @IsMongoId()
  relatedReportId?: string;
}

export class WithholdUserDto {
  @IsString()
  @MinLength(10, {
    message: 'Reason must be at least 10 characters long',
  })
  @MaxLength(500, {
    message: 'Reason must not exceed 500 characters',
  })
  reason: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000, {
    message: 'Admin notes must not exceed 1000 characters',
  })
  adminNotes?: string;

  @IsOptional()
  @IsMongoId()
  relatedReportId?: string;
}

export class RestorePostDto {
  @IsOptional()
  @IsString()
  @MaxLength(500, {
    message: 'Restoration notes must not exceed 500 characters',
  })
  restorationNotes?: string;
}

export class RestoreUserDto {
  @IsOptional()
  @IsString()
  @MaxLength(500, {
    message: 'Restoration notes must not exceed 500 characters',
  })
  restorationNotes?: string;
}
