import { Transform, Type } from 'class-transformer';
import {
  IsString,
  IsOptional,
  IsArray,
  IsUrl,
  IsBoolean,
  IsEnum,
  IsInt,
  Min,
  Max,
} from 'class-validator';
import { PostType } from '@/database/schemas/post';

export class CreateTextPostDto {
  @IsString()
  title: string;

  /**
   * Rich text content (HTML string). Embedded base64 images will be processed.
   */
  @IsString()
  textContent: string;

  @IsOptional()
  @IsArray()
  @Transform(({ value }) => {
    try {
      return JSON.parse(value);
    } catch {
      return [];
    }
  })
  tags?: string[];

  @IsOptional()
  @IsArray()
  @Transform(({ value }) => {
    try {
      return JSON.parse(value);
    } catch {
      return [];
    }
  })
  collections?: string[];

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    try {
      return JSON.parse(value);
    } catch {
      return false;
    }
  })
  isDraft?: boolean;

  @IsOptional()
  @IsArray()
  @Transform(({ value }) => {
    try {
      return JSON.parse(value);
    } catch {
      return [];
    }
  })
  tierAccess?: string[];

  // Keep existingAttachments if needed for non-rich-text uploads
  @IsOptional()
  @IsArray()
  @Transform(({ value }) => {
    try {
      return JSON.parse(value);
    } catch {
      return [];
    }
  })
  existingAttachments?: string[];
}

export class UpdateTextPostDto extends CreateTextPostDto {
  /**
   * Rich text content (HTML string). Embedded base64 images will be processed.
   */
  @IsString() // Ensure textContent is required for update DTO as well if needed
  textContent: string;
}

// ... (rest of the DTOs remain the same) ...

export class CreateVideoPostDto {
  @IsOptional()
  @IsString()
  @IsUrl({}, { message: 'Invalid video URL' })
  videoUrl?: string;

  @IsString()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsOptional()
  @IsArray()
  @Transform(({ value }) => {
    try {
      return JSON.parse(value);
    } catch {
      return [];
    }
  })
  tags?: string[];

  @IsOptional()
  @IsArray()
  @Transform(({ value }) => {
    try {
      return JSON.parse(value);
    } catch {
      return [];
    }
  })
  collections?: string[];

  @IsOptional()
  @IsArray()
  @Transform(({ value }) => {
    try {
      return JSON.parse(value);
    } catch {
      return [];
    }
  })
  tierAccess?: string[];

  @IsOptional()
  @IsArray()
  @Transform(({ value }) => {
    try {
      return JSON.parse(value);
    } catch {
      return [];
    }
  })
  existingAttachments?: string[];

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    try {
      return JSON.parse(value);
    } catch {
      return false;
    }
  })
  isDraft?: boolean;
}

export class UpdateVideoPostDto extends CreateVideoPostDto {}

export class CreateAudioPostDto {
  @IsString()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsArray()
  @IsOptional()
  @Transform(({ value }) => {
    try {
      return JSON.parse(value);
    } catch {
      return [];
    }
  })
  collections?: string[];

  @IsArray()
  @IsOptional()
  @Transform(({ value }) => {
    try {
      return JSON.parse(value);
    } catch {
      return [];
    }
  })
  tags?: string[];

  @IsOptional()
  @IsArray()
  @Transform(({ value }) => {
    try {
      return JSON.parse(value);
    } catch {
      return [];
    }
  })
  tierAccess?: string[];

  @IsOptional()
  @IsArray()
  @Transform(({ value }) => {
    try {
      return JSON.parse(value);
    } catch {
      return [];
    }
  })
  existingAttachments?: string[];

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    try {
      return JSON.parse(value);
    } catch {
      return false;
    }
  })
  isDraft?: boolean;
}

export class UpdateAudioPostDto extends CreateAudioPostDto {
  @IsString()
  @IsOptional()
  existingAudioFileUrl?: string;
}

export class CreateImagePostDto {
  @IsString()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsArray()
  @IsOptional()
  @Transform(({ value }) => {
    try {
      return JSON.parse(value);
    } catch {
      return [];
    }
  })
  collections?: string[];

  @IsArray()
  @IsOptional()
  @Transform(({ value }) => {
    try {
      return JSON.parse(value);
    } catch {
      return [];
    }
  })
  tags?: string[];

  @IsOptional()
  @IsArray()
  @Transform(({ value }) => {
    try {
      return JSON.parse(value);
    } catch {
      return [];
    }
  })
  tierAccess?: string[];

  @IsOptional()
  @IsArray()
  @Transform(({ value }) => {
    try {
      return JSON.parse(value);
    } catch {
      return [];
    }
  })
  existingAttachments?: string[];

  @IsOptional()
  @IsArray()
  @Transform(({ value }) => {
    try {
      return JSON.parse(value);
    } catch {
      return [];
    }
  })
  existingImages?: string[];

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    try {
      return JSON.parse(value);
    } catch {
      return false;
    }
  })
  isDraft?: boolean;
}

export class UpdateImagePostDto extends CreateImagePostDto {}

export class CreateLinkPostDto {
  @IsString()
  title: string;

  @IsString()
  @IsUrl({}, { message: 'Invalid link URL format' })
  linkUrl: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsArray()
  @IsOptional()
  @Transform(({ value }) => {
    try {
      return JSON.parse(value);
    } catch {
      return [];
    }
  })
  collections?: string[];

  @IsArray()
  @IsOptional()
  @Transform(({ value }) => {
    try {
      return JSON.parse(value);
    } catch {
      return [];
    }
  })
  tags?: string[];

  @IsOptional()
  @IsArray()
  @Transform(({ value }) => {
    try {
      return JSON.parse(value);
    } catch {
      return [];
    }
  })
  tierAccess?: string[];

  @IsOptional()
  @IsArray()
  @Transform(({ value }) => {
    try {
      return JSON.parse(value);
    } catch {
      return [];
    }
  })
  existingAttachments?: string[];

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    try {
      return JSON.parse(value);
    } catch {
      return false;
    }
  })
  isDraft?: boolean;
}

export class UpdateLinkPostDto extends CreateLinkPostDto {}

export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc',
}

export enum SortBy {
  CREATED_AT = 'createdAt',
  TITLE = 'title',
  TYPE = 'type',
}

export enum DatePublishedFilter {
  THIS_WEEK = 'week',
  THIS_MONTH = 'month',
  THIS_YEAR = 'year',
  ALL_TIME = 'All time',
}

export class FetchPostsDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page?: number = 1;

  @IsOptional()
  @IsString()
  userId?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  limit?: number = 10;

  @IsOptional()
  @IsEnum(SortBy)
  sortBy?: SortBy = SortBy.CREATED_AT;

  @IsOptional()
  @IsEnum(SortOrder)
  sortOrder?: SortOrder = SortOrder.DESC;

  @IsOptional()
  @IsEnum(PostType, { each: true })
  @IsArray()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch {
        return value ? [value] : undefined;
      }
    }
    return value;
  })
  types?: PostType[];

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString({ each: true })
  @IsArray()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch {
        return value ? [value] : undefined;
      }
    }
    return value;
  })
  collections?: string[];

  @IsOptional()
  @IsString({ each: true })
  @IsArray()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch {
        return value ? [value] : undefined;
      }
    }
    return value;
  })
  tags?: string[];

  @IsOptional()
  @IsString({ each: true })
  @IsArray()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch {
        return value ? [value] : undefined;
      }
    }
    return value;
  })
  tierAccess?: string[];

  @IsOptional()
  @IsEnum(DatePublishedFilter)
  datePublished?: DatePublishedFilter;
}

export class CommentsQueryDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page?: number = 1;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  limit?: number = 20;
}
