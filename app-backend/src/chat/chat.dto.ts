import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { ChatAccessType, ChatType } from '@/database/schemas/chat';

export class CreateGroupChatDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(ChatAccessType)
  accessType: ChatAccessType;

  @IsArray()
  @IsMongoId({ each: true })
  @IsOptional()
  accessTiers?: string[];
}

export class CreateDirectChatDto {
  @IsMongoId()
  @IsNotEmpty()
  participantId: string;

  @IsMongoId()
  @IsNotEmpty()
  creatorId: string;
}

export class UpdateGroupChatDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(ChatAccessType)
  @IsOptional()
  accessType?: ChatAccessType;

  @IsArray()
  @IsMongoId({ each: true })
  @IsOptional()
  accessTiers?: string[];
}

export class SendMessageDto {
  @IsString()
  @IsNotEmpty()
  content: string;
}

export class GetMessagesQueryDto {
  @IsOptional()
  @Type(() => Number)
  limit?: number = 20;

  @IsOptional()
  @IsString()
  before?: string;

  @IsOptional()
  @IsString()
  after?: string;

  @IsOptional()
  @IsString()
  beforeDate?: string;

  @IsOptional()
  @IsString()
  afterDate?: string;

  @IsOptional()
  @Type(() => Boolean)
  includeGrouping?: boolean;

  @IsOptional()
  @Type(() => Boolean)
  initialLoad?: boolean;
}

export class MarkMessagesReadDto {
  @IsMongoId()
  @IsNotEmpty()
  lastReadMessageId: string;
}

export class ChatParticipantDto {
  id: string;
  displayName: string;
  profilePicture?: string;
  isCreator: boolean;
}

export class AttachmentDto {
  url: string;
  fileName: string;
  fileType: string;
  fileSize?: number;
  uploadedAt: string;
}

export class MessageDto {
  id: string;
  content: string;
  sender: ChatParticipantDto;
  attachments?: AttachmentDto[];
  createdAt: string;
  updatedAt: string;
  readBy: string[];
  isDeleted: boolean;
  deletedAt?: string;
  dateGroup?: string; // "today", "yesterday", or "YYYY-MM-DD"
}

export class MessagesResponse {
  messages: MessageDto[];
  hasMore: boolean;
  hasNewer: boolean;
  dateGroups?: { [date: string]: string[] };
  nextCursor?: string;
  previousCursor?: string;
}

export class GetMessageDatesQueryDto {
  @IsOptional()
  @IsString()
  startDate?: string;

  @IsOptional()
  @IsString()
  endDate?: string;
}

export class MessageDatesResponse {
  dates: {
    date: string;
    messageCount: number;
    firstMessageId: string;
  }[];
  oldestDate: string;
  newestDate: string;
}

export class ChatDto {
  id: string;
  type: ChatType;
  title: string;
  description?: string;
  creator: ChatParticipantDto;
  participants: ChatParticipantDto[];
  lastMessage?: MessageDto;
  accessType?: ChatAccessType;
  accessTiers?: any[];
  createdAt: string;
  updatedAt: string;
  unreadCount?: number;
}

export class ChatListItemDto {
  id: string;
  title: string;
  type: ChatType;
  lastMessage?: {
    content: string;
    sender: string;
    timestamp: string;
  };
  unreadCount: number;
  participants: {
    id: string;
    name: string;
    profilePicture?: string;
  }[];
  creator: {
    id: string;
    name: string;
  };
}
