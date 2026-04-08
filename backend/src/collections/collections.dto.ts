import {
  IsString,
  IsOptional,
  MaxLength,
  IsBoolean,
  IsMongoId,
  IsArray,
  IsNumber,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateCollectionDto {
  @IsString()
  @MaxLength(100)
  title: string;

  @IsString()
  @IsOptional()
  @MaxLength(180)
  description?: string;
}

export class UpdateCollectionDto {
  @IsString()
  @IsOptional()
  @MaxLength(100)
  title?: string;

  @IsString()
  @IsOptional()
  @MaxLength(180)
  description?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class AddPostToCollectionDto {
  @IsMongoId()
  postId: string;
}

export class RemovePostFromCollectionDto {
  @IsMongoId()
  postId: string;
}

export class GetCollectionPostsDto {
  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt';

  @IsOptional()
  @IsString()
  sortOrder?: string = 'desc';

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  types?: string[];

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  page?: number = 1;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  limit?: number = 10;
}
