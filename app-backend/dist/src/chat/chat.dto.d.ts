import { ChatAccessType, ChatType } from '@/database/schemas/chat';
export declare class CreateGroupChatDto {
    title: string;
    description?: string;
    accessType: ChatAccessType;
    accessTiers?: string[];
}
export declare class CreateDirectChatDto {
    participantId: string;
    creatorId: string;
}
export declare class UpdateGroupChatDto {
    title?: string;
    description?: string;
    accessType?: ChatAccessType;
    accessTiers?: string[];
}
export declare class SendMessageDto {
    content: string;
}
export declare class GetMessagesQueryDto {
    limit?: number;
    before?: string;
    after?: string;
    beforeDate?: string;
    afterDate?: string;
    includeGrouping?: boolean;
    initialLoad?: boolean;
}
export declare class MarkMessagesReadDto {
    lastReadMessageId: string;
}
export declare class ChatParticipantDto {
    id: string;
    displayName: string;
    profilePicture?: string;
    isCreator: boolean;
}
export declare class AttachmentDto {
    url: string;
    fileName: string;
    fileType: string;
    fileSize?: number;
    uploadedAt: string;
}
export declare class MessageDto {
    id: string;
    content: string;
    sender: ChatParticipantDto;
    attachments?: AttachmentDto[];
    createdAt: string;
    updatedAt: string;
    readBy: string[];
    isDeleted: boolean;
    deletedAt?: string;
    dateGroup?: string;
}
export declare class MessagesResponse {
    messages: MessageDto[];
    hasMore: boolean;
    hasNewer: boolean;
    dateGroups?: {
        [date: string]: string[];
    };
    nextCursor?: string;
    previousCursor?: string;
}
export declare class GetMessageDatesQueryDto {
    startDate?: string;
    endDate?: string;
}
export declare class MessageDatesResponse {
    dates: {
        date: string;
        messageCount: number;
        firstMessageId: string;
    }[];
    oldestDate: string;
    newestDate: string;
}
export declare class ChatDto {
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
export declare class ChatListItemDto {
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
