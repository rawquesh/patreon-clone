import { GenderPreference } from '@/schemas/users.schema';
import { IsOptional, IsString, IsEmail, IsEnum } from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  displayName?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  countryOfResidence?: string;

  @IsOptional()
  @IsString()
  gender?: string;

  @IsOptional()
  @IsEnum(GenderPreference)
  genderPreference?: GenderPreference;
}
