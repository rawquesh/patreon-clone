import {
  IsArray,
  IsEnum,
  IsOptional,
  IsString,
  IsDateString,
  IsMongoId,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class BulkCreatorsDto {
  @IsArray()
  @IsMongoId({ each: true })
  ids: string[];

  @IsEnum(['approve', 'reject', 'suspend', 'activate'])
  action: string;

  @IsOptional()
  @IsString()
  reason?: string;
}

export class BulkMembersDto {
  @IsArray()
  @IsMongoId({ each: true })
  ids: string[];

  @IsEnum(['activate', 'deactivate'])
  action: string;

  @IsOptional()
  @IsString()
  reason?: string;
}

export class BulkPostsDto {
  @IsArray()
  @IsMongoId({ each: true })
  ids: string[];

  @IsEnum(['withhold', 'restore', 'delete'])
  action: string;

  @IsOptional()
  @IsString()
  reason?: string;
}

export class BulkSubscriptionsDto {
  @IsArray()
  @IsMongoId({ each: true })
  ids: string[];
}

export class BulkReportsDto {
  @IsArray()
  @IsMongoId({ each: true })
  ids: string[];

  @IsEnum(['resolve', 'dismiss'])
  action: string;

  @IsOptional()
  @IsString()
  adminNotes?: string;
}
