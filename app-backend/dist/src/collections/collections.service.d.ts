import { Model } from 'mongoose';
import { Collection } from './collections.schema';
import { Post } from '@/database/schemas/post';
import { CreateCollectionDto, GetCollectionPostsDto } from './collections.dto';
import { MembershipsService } from '@/memberships/memberships.service';
export declare class CollectionsService {
    private collectionModel;
    private postModel;
    private readonly membershipsService;
    constructor(collectionModel: Model<Collection>, postModel: Model<Post>, membershipsService: MembershipsService);
    create(creatorId: string, createCollectionDto: CreateCollectionDto, coverImageUrl?: string): Promise<Collection>;
    findByCreator(creatorId: string, includeDeleted?: boolean): Promise<Collection[]>;
    findById(id: string, userId?: string): Promise<any>;
    update(creatorId: string, collectionId: string, updateCollectionDto: Partial<Collection>): Promise<Collection>;
    addPostToCollection(userId: string, collectionId: string, postId: string): Promise<Collection>;
    removePostFromCollection(userId: string, collectionId: string, postId: string): Promise<Collection>;
    getCollectionPosts(collectionId: string, queryParams: GetCollectionPostsDto, userId?: string): Promise<{
        posts: any[];
        total: number;
        pagination: any;
    }>;
    private checkPostAccess;
    private filterPostForListing;
    private formatDate;
    private getReadablePostType;
    delete(id: string, userId: string): Promise<{
        acknowledged: boolean;
        deletedCount: number;
    }>;
}
