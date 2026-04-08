import { Model, Types } from 'mongoose';
import { Post, PostComment, PostStatus, PostType, Attachment } from '@/database/schemas/post';
import { CreateAudioPostDto, CreateImagePostDto, CreateLinkPostDto, CreateVideoPostDto, FetchPostsDto } from './posts.dto';
import { Subscription } from '@/database/schemas/subscription';
import { S3Service } from '@/s3/s3.service';
import { PostInsight } from '@/database/schemas/analytics';
import { MembershipsService } from '@/memberships/memberships.service';
import { User } from '@/database/schemas/user';
export interface PostLike {
    _id?: string;
    user: Types.ObjectId | string;
    createdAt: Date;
}
export declare class PostsService {
    private postModel;
    private userModel;
    private subscriptionModel;
    private postInsightModel;
    private readonly s3Service;
    private readonly membershipsService;
    constructor(postModel: Model<Post>, userModel: Model<User>, subscriptionModel: Model<Subscription>, postInsightModel: Model<PostInsight>, s3Service: S3Service, membershipsService: MembershipsService);
    private _processRichTextImages;
    findById(id: string): Promise<Post>;
    findByCreator(creatorId: string, options?: {
        type?: PostType;
        status?: string;
        limit?: number;
        offset?: number;
    }): Promise<Post[]>;
    updatePost(id: string, updateData: Partial<Post>): Promise<Post>;
    softDelete(id: string): Promise<Post>;
    createTextPost(createPostData: {
        type: PostType.TEXT;
        creator: string;
        title: string;
        textContent?: string;
        mediaUrls?: string[];
        tags?: string[] | string;
        collections?: string[] | string;
        status?: string;
        tierAccess?: string[] | string;
        attachments?: Attachment[];
    }): Promise<Post>;
    createVideoPost(userId: string, createVideoPostDto: CreateVideoPostDto & {
        status?: string;
    }, attachments?: Attachment[]): Promise<Post>;
    extractVideoInfo(url: string): {
        isValid: boolean;
        platform?: string;
        videoId?: string;
        thumbnailUrl?: string;
    };
    createAudioPost(userId: string, createAudioPostDto: CreateAudioPostDto & {
        status?: string;
    }, audioFileUrl: string, attachments?: Attachment[]): Promise<Post>;
    createImagePost(userId: string, createImagePostDto: CreateImagePostDto & {
        status?: string;
        thumbnailUrl: string;
    }, imageUrls: string[], attachments?: Attachment[]): Promise<Post>;
    createLinkPost(userId: string, createLinkPostDto: CreateLinkPostDto & {
        status?: string;
    }, attachments?: Attachment[]): Promise<Post>;
    findPublishedPosts(fetchPostsDto: FetchPostsDto, userId?: string, creatorId?: string): Promise<{
        posts: (Post & {
            isRestrictedView?: boolean;
            previewText?: string;
            thumbnailUrl?: string;
        })[];
        total: number;
    }>;
    findPublishedPostsByCreator(creatorId: string, fetchPostsDto: FetchPostsDto, userId?: string): Promise<{
        posts: (Post & {
            isRestrictedView?: boolean;
            previewText?: string;
            thumbnailUrl?: string;
        })[];
        total: number;
    }>;
    filterPostForListing(post: Post & {
        previewText?: string;
    }, hasFullAccess: boolean): any;
    permanentDelete(id: string): Promise<void>;
    hasUserLikedPost(userId: string, postId: string): Promise<boolean>;
    likePost(userId: string, postId: string): Promise<void>;
    unlikePost(userId: string, postId: string): Promise<void>;
    addComment(userId: string, postId: string, commentText: string, parentId?: string): Promise<PostComment>;
    getComments(postId: string): Promise<PostComment[]>;
    getPostLikes(postId: string): Promise<any[]>;
    getPostComments(postId: string, userId?: string): Promise<any[]>;
    getPostCount(creatorId: string, status?: PostStatus): Promise<number>;
    checkPostAccess(userId: string | undefined | null, post: Post): Promise<boolean>;
    checkPostAccessWithId(userId: string | undefined | null, post: Post): Promise<{
        hasAccess: boolean;
        postId: string;
    }>;
    hasUserLikedComment(userId: string, commentId: string): Promise<boolean>;
    likeComment(userId: string, postId: string, commentId: string): Promise<any>;
    unlikeComment(userId: string, postId: string, commentId: string): Promise<any>;
    getCommentLikes(postId: string, commentId: string): Promise<any[]>;
    isCommentLiked(userId: string, postId: string, commentId: string): Promise<boolean>;
    editComment(userId: string, postId: string, commentId: string, text: string): Promise<any>;
    deleteComment(userId: string, postId: string, commentId: string): Promise<{
        success: boolean;
        deletedCount: number;
    }>;
    private findAllChildComments;
    private processTags;
    formatDate(date: Date): string;
    getReadablePostType(type: string): string;
    recordPostView(postId: string, userId?: string): Promise<void>;
    getPostById(id: string, userId?: string): Promise<any>;
}
