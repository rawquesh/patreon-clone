import { PostsService } from './posts.service';
import { S3Service } from '@/s3/s3.service';
import { CommentsQueryDto, CreateAudioPostDto, CreateImagePostDto, CreateLinkPostDto, CreateTextPostDto, CreateVideoPostDto, FetchPostsDto, UpdateAudioPostDto, UpdateImagePostDto, UpdateLinkPostDto, UpdateTextPostDto, UpdateVideoPostDto } from './posts.dto';
import { Post, PostStatus, PostType } from '@/database/schemas/post';
import { MembershipsService } from '@/memberships/memberships.service';
import { NotificationGeneratorService } from '../notifications/notification-generator.service';
export declare class PostsController {
    private readonly postsService;
    private readonly s3Service;
    private readonly membershipsService;
    private readonly notificationGenerator;
    constructor(postsService: PostsService, s3Service: S3Service, membershipsService: MembershipsService, notificationGenerator: NotificationGeneratorService);
    findPublishedPostsByCreator(creatorId: string, fetchPostsDto: FetchPostsDto, req: any): Promise<{
        posts: any[];
        pagination: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    findAllPublishedPosts(fetchPostsDto: FetchPostsDto, req: any): Promise<{
        posts: {
            id: string;
            title: string;
            publishDate: string;
            tierAccess: {
                id: string;
                name: string;
            }[];
            postType: string;
            thumbnail: string;
            description: string;
            creator: {
                id: unknown;
                name: string;
                profilePicture: string;
            };
            isRestrictedView: boolean;
        }[];
        pagination: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    findMyDrafts(req: any): Promise<{
        drafts: {
            id: string;
            title: string;
            createdAt: Date;
            updatedAt: Date;
            type: PostType;
            postType: string;
            tierAccess: {
                id: string;
                name: string;
            }[];
            status: PostStatus;
        }[];
    }>;
    findMyPosts(req: any, fetchPostsDto: FetchPostsDto): Promise<{
        posts: {
            id: string;
            title: string;
            publishDate: string;
            tierAccess: {
                id: string;
                name: string;
            }[];
            postType: string;
            thumbnail: string;
            status: PostStatus;
            collections: string[];
            createdAt: Date;
            updatedAt: Date;
        }[];
        pagination: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    getPostById(req: any, id: string, query: {
        userId: string;
    }): Promise<any>;
    createTextPost(req: any, createTextPostDto: CreateTextPostDto, files?: Express.Multer.File[]): Promise<Post>;
    updateTextPost(req: any, id: string, updateTextPostDto: UpdateTextPostDto, files?: Express.Multer.File[]): Promise<Post>;
    createVideoPost(req: any, createVideoPostDto: CreateVideoPostDto, files: {
        videoFile?: Express.Multer.File[];
        attachments?: Express.Multer.File[];
    }): Promise<Post>;
    updateVideoPost(req: any, id: string, updateVideoPostDto: UpdateVideoPostDto, files?: Express.Multer.File[]): Promise<Post>;
    createAudioPost(req: any, createAudioPostDto: CreateAudioPostDto, files: {
        audioFile?: Express.Multer.File[];
        attachments?: Express.Multer.File[];
    }): Promise<Post>;
    updateAudioPost(req: any, id: string, updateAudioPostDto: UpdateAudioPostDto, files: {
        audioFile?: Express.Multer.File[];
        attachments?: Express.Multer.File[];
    }): Promise<Post>;
    createImagePost(req: any, createImagePostDto: CreateImagePostDto, files: {
        images?: Express.Multer.File[];
        attachments?: Express.Multer.File[];
    }): Promise<Post>;
    updateImagePost(req: any, id: string, updateImagePostDto: UpdateImagePostDto, files: {
        images?: Express.Multer.File[];
        attachments?: Express.Multer.File[];
    }): Promise<Post>;
    createLinkPost(req: any, createLinkPostDto: CreateLinkPostDto, attachmentFiles?: Express.Multer.File[]): Promise<Post>;
    updateLinkPost(req: any, id: string, updateLinkPostDto: UpdateLinkPostDto, attachmentFiles?: Express.Multer.File[]): Promise<Post>;
    private formatDate;
    private getReadablePostType;
    private getThumbnailForPost;
    deletePost(req: any, id: string): Promise<{
        message: string;
        id: string;
    }>;
    permanentDeletePost(req: any, id: string): Promise<{
        message: string;
        id: string;
    }>;
    private getBucketNameForPostType;
    publishPost(req: any, id: string): Promise<{
        message: string;
        id: string;
        post?: undefined;
    } | {
        message: string;
        post: any;
        id?: undefined;
    }>;
    unpublishPost(req: any, id: string): Promise<{
        message: string;
        id: string;
        post?: undefined;
    } | {
        message: string;
        post: any;
        id?: undefined;
    }>;
    likePost(req: any, postId: string): Promise<{
        message: string;
        liked: boolean;
    }>;
    unlikePost(req: any, postId: string): Promise<{
        message: string;
        liked: boolean;
    }>;
    addComment(req: any, postId: string, commentData: {
        text: string;
        parentId?: string;
    }): Promise<{
        id: string;
        text: string;
        user: {
            id: any;
            displayName: any;
            profilePicture: any;
        };
        createdAt: Date;
        parentId: string;
        likesCount: number;
        isLiked: boolean;
    }>;
    getPostComments(postId: string, query: CommentsQueryDto, req: any): Promise<{
        comments: any[];
        pagination: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    getPostLikes(postId: string, query: CommentsQueryDto): Promise<{
        likes: any[];
        pagination: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    hasUserLikedPost(postId: string, req: any): Promise<{
        liked: boolean;
    }>;
    private transformPostForFrontend;
    private getPostType;
    private getMediaUrlForPost;
    likeComment(req: any, postId: string, commentId: string): Promise<any>;
    unlikeComment(req: any, postId: string, commentId: string): Promise<any>;
    getCommentLikes(postId: string, commentId: string, query: CommentsQueryDto): Promise<{
        likes: any[];
        pagination: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    hasUserLikedComment(req: any, postId: string, commentId: string): Promise<{
        liked: boolean;
    }>;
    deleteComment(req: any, postId: string, commentId: string): Promise<{
        success: boolean;
        message: string;
        deletedCount: number;
    }>;
    editComment(req: any, postId: string, commentId: string, body: {
        text: string;
    }): Promise<any>;
}
