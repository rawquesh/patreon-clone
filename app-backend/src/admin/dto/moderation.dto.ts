import { IsMongoId, IsNotEmpty, IsOptional, IsString } from 'class-validator';

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
