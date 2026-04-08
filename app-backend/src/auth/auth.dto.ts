import { IsEmail, IsString, MinLength, IsEnum } from 'class-validator';

export class SignUpDto {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

export class LoginDto {
  email: string;
  password: string;
}

export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other',
}

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  @MinLength(2)
  firstName: string;

  @IsString()
  @MinLength(2)
  lastName: string;

  @IsEnum(Gender)
  gender: Gender;
}

export class GoogleTokenDto {
  @IsString()
  accessToken: string;
}

export class GoogleIdTokenDto {
  @IsString()
  idToken: string;
}
