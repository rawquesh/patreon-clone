import { PostType } from '@/database/schemas/post';
export declare class CreateTextPostDto {
    title: string;
    textContent: string;
    tags?: string[];
    collections?: string[];
    isDraft?: boolean;
    tierAccess?: string[];
    existingAttachments?: string[];
}
export declare class UpdateTextPostDto extends CreateTextPostDto {
    textContent: string;
}
export declare class CreateVideoPostDto {
    videoUrl?: string;
    title: string;
    description?: string;
    tags?: string[];
    collections?: string[];
    tierAccess?: string[];
    existingAttachments?: string[];
    isDraft?: boolean;
}
export declare class UpdateVideoPostDto extends CreateVideoPostDto {
}
export declare class CreateAudioPostDto {
    title: string;
    description?: string;
    collections?: string[];
    tags?: string[];
    tierAccess?: string[];
    existingAttachments?: string[];
    isDraft?: boolean;
}
export declare class UpdateAudioPostDto extends CreateAudioPostDto {
    existingAudioFileUrl?: string;
}
export declare class CreateImagePostDto {
    title: string;
    description?: string;
    collections?: string[];
    tags?: string[];
    tierAccess?: string[];
    existingAttachments?: string[];
    existingImages?: string[];
    isDraft?: boolean;
}
export declare class UpdateImagePostDto extends CreateImagePostDto {
}
export declare class CreateLinkPostDto {
    title: string;
    linkUrl: string;
    description?: string;
    collections?: string[];
    tags?: string[];
    tierAccess?: string[];
    existingAttachments?: string[];
    isDraft?: boolean;
}
export declare class UpdateLinkPostDto extends CreateLinkPostDto {
}
export declare enum SortOrder {
    ASC = "asc",
    DESC = "desc"
}
export declare enum SortBy {
    CREATED_AT = "createdAt",
    TITLE = "title",
    TYPE = "type"
}
export declare enum DatePublishedFilter {
    THIS_WEEK = "week",
    THIS_MONTH = "month",
    THIS_YEAR = "year",
    ALL_TIME = "All time"
}
export declare class FetchPostsDto {
    page?: number;
    userId?: string;
    limit?: number;
    sortBy?: SortBy;
    sortOrder?: SortOrder;
    types?: PostType[];
    search?: string;
    collections?: string[];
    tags?: string[];
    tierAccess?: string[];
    datePublished?: DatePublishedFilter;
}
export declare class CommentsQueryDto {
    page?: number;
    limit?: number;
}
