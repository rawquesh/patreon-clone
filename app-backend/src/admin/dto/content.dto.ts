import { IsOptional, IsInt, Min, Max, IsString, IsEnum, IsNotEmpty, MinLength, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';
import { PostType, PostStatus } from '@/database/schemas/post';

export class GetContentQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  creatorId?: string;

  @IsOptional()
  @IsEnum(PostType)
  type?: PostType;

  @IsOptional()
  @IsEnum(PostStatus)
  status?: PostStatus;

  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt';

  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc' = 'desc';
}

export class WithholdContentDto {
  @IsOptional()
  @IsString()
  reason?: string;

  @IsOptional()
  @IsString()
  adminNotes?: string;
}

export class NotifyCreatorDto {
  @IsString()
  @IsNotEmpty({ message: 'Message is required' })
  @MinLength(10, { message: 'Message must be at least 10 characters' })
  @MaxLength(500, { message: 'Message must not exceed 500 characters' })
  message: string;
}
