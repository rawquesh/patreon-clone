import { IsString, IsOptional, IsBoolean, IsNumber, IsEnum, ValidateNested, IsArray } from 'class-validator';
import { Type } from 'class-transformer';
import { SettingCategory } from '../schemas/platform-setting.schema';

export class UpdateSettingDto {
  @IsOptional()
  value?: any;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;
}

export class BulkUpdateItemDto {
  @IsString()
  key: string;

  @IsOptional()
  value?: any;
}

export class BulkUpdateSettingsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BulkUpdateItemDto)
  updates: BulkUpdateItemDto[];
}

export class GetSettingsQueryDto {
  @IsOptional()
  @IsEnum(SettingCategory)
  category?: SettingCategory;
}
