import {
  IsString,
  IsNumber,
  IsArray,
  Min,
  IsOptional,
  IsBoolean,
  IsInt,
  Max,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class CreateMembershipDto {
  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsNumber()
  @Min(1)
  monthlyRate: number;

  @IsArray()
  @IsOptional()
  benefits?: string[];

  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => Boolean(value))
  isActive?: boolean;

  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => Boolean(value))
  isFeatured?: boolean;
}

export class CreateMembershipWithFileDto extends CreateMembershipDto {
  @IsOptional()
  coverImage?: string;
}

export class UpdateMembershipDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @IsOptional()
  @Min(1)
  monthlyRate?: number;

  @IsArray()
  @IsOptional()
  benefits?: string[];

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsBoolean()
  @IsOptional()
  isFeatured?: boolean;

  @IsOptional()
  @IsString()
  coverImage?: string;
}

export class CreatePayoutRequestDto {
  @IsNumber()
  @Min(1)
  amount: number;
}

export class GetMembershipsQueryDto {
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
  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  activeOnly?: boolean = true;
}
