import { IsOptional, IsString, IsEnum, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export enum MemberSortBy {
  NAME = 'name',
  EMAIL = 'email',
  JOIN_DATE = 'joinDate',
  TOTAL_PAID = 'totalPaid',
  TIER = 'tier',
  STATUS = 'status',
}

export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc',
}

export enum SubscriptionStatus {
  ACTIVE = 'active',
  CANCELLED = 'cancelled',
  EXPIRED = 'expired',
}

export class GetMembersDto {
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
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(SubscriptionStatus)
  status?: SubscriptionStatus;

  @IsOptional()
  @IsString()
  tier?: string;

  @IsOptional()
  @IsString()
  joinDate?: string;

  @IsOptional()
  @IsEnum(MemberSortBy)
  sortBy?: MemberSortBy = MemberSortBy.JOIN_DATE;

  @IsOptional()
  @IsEnum(SortOrder)
  sortOrder?: SortOrder = SortOrder.DESC;
}

export class MemberTierDto {
  id: string;
  name: string;
  monthlyRate: number;
}

export class MemberDto {
  id: string;
  name: string;
  email: string;
  profilePicture?: string;
  tier: MemberTierDto;
  joinDate: Date;
  status: SubscriptionStatus;
  currentPeriodEnd: Date;
  totalPaid: number;
}

export class PaginationDto {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export class MembersResponseDto {
  members: MemberDto[];
  pagination: PaginationDto;
}
