import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsMongoId,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';
import { Type } from 'class-transformer';
import { NotificationType } from '@/database/schemas/notification';

export class CreateNotificationDto {
  @IsMongoId()
  recipient: string;

  @IsMongoId()
  actor: string;

  @IsEnum(NotificationType)
  type: NotificationType;

  @IsMongoId()
  @IsOptional()
  post?: string;

  @IsString()
  @IsOptional()
  comment?: string;

  @IsString()
  @IsOptional()
  link?: string;

  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;

  @IsString()
  @IsEnum(['creator', 'member'])
  userMode: 'creator' | 'member';
}

export class NotificationFilterDto {
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  unreadOnly?: boolean;

  @IsOptional()
  @IsArray()
  @IsEnum(NotificationType, { each: true })
  type?: NotificationType[];

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  page?: number = 1;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  limit?: number = 10;

  @IsOptional()
  @IsString()
  @IsEnum(['creator', 'member'])
  userMode?: 'creator' | 'member';
}

export class MarkReadDto {
  @IsMongoId({ each: true })
  @IsArray()
  ids: string[];
}

export class NotificationActorDto {
  id: string;
  name: string;
  profilePicture: string;
}

export class NotificationPostDto {
  id: string;
  title: string;
  thumbnailUrl: string;
}

export class CommentDto {
  content: string;
}

export class NotificationResponseDto {
  id: string;
  actor: NotificationActorDto;
  type: NotificationType;
  post?: NotificationPostDto;
  comment?: CommentDto;
  metadata?: Record<string, any>;
  isRead: boolean;
  createdAt: string;
  timeStamp: string;
  userMode: string;
  link?: string;
}

export class UpdateCreatorNotificationSettingsDto {
  @IsOptional()
  @IsBoolean()
  creatorNotifyOnNewMember?: boolean;

  @IsOptional()
  @IsBoolean()
  creatorNotifyOnComments?: boolean;

  @IsOptional()
  @IsBoolean()
  creatorNotifyOnDirectMessages?: boolean;
}

export class UpdateMemberNotificationSettingsDto {
  @IsOptional()
  @IsBoolean()
  memberNotifyOnNewPost?: boolean;

  @IsOptional()
  @IsBoolean()
  memberNotifyOnDirectMessages?: boolean;
}
