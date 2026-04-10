import { IsOptional, IsString, IsDateString, IsNumber, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class GetAnalyticsQueryDto {
  @IsOptional()
  @IsString()
  period?: 'daily' | 'weekly' | 'monthly';

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  months?: number = 6;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;
}
