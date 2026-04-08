import { CollectionsService } from './collections.service';
import { S3Service } from '../s3/s3.service';
import { CreateCollectionDto, UpdateCollectionDto, AddPostToCollectionDto, RemovePostFromCollectionDto, GetCollectionPostsDto } from './collections.dto';
export declare class CollectionsController {
    private readonly collectionsService;
    private readonly s3Service;
    constructor(collectionsService: CollectionsService, s3Service: S3Service);
    getMyCollections(req: any): Promise<{
        collections: import("./collections.schema").Collection[];
        total: number;
    }>;
    updateCollection(req: any, id: string, updateCollectionDto: UpdateCollectionDto, coverImage?: Express.Multer.File): Promise<import("./collections.schema").Collection>;
    deleteCollection(req: any, id: string): Promise<{
        success: boolean;
        message: string;
    }>;
    getCollectionsByCreator(creatorId: string): Promise<{
        collections: import("./collections.schema").Collection[];
        total: number;
    }>;
    getCreatorCollections(creatorId: string): Promise<{
        collections: {
            id: string;
            title: string;
            description: string;
            coverImage: string;
            postCount: number;
            createdAt: Date;
        }[];
        total: number;
    }>;
    create(req: any, createCollectionDto: CreateCollectionDto, coverImage?: Express.Multer.File): Promise<import("./collections.schema").Collection>;
    getCollectionById(req: any, id: string): Promise<any>;
    addPostToCollection(req: any, id: string, addPostDto: AddPostToCollectionDto): Promise<{
        success: boolean;
        message: string;
        collection: import("./collections.schema").Collection;
    }>;
    removePostFromCollection(req: any, id: string, removePostDto: RemovePostFromCollectionDto): Promise<{
        success: boolean;
        message: string;
        collection: import("./collections.schema").Collection;
    }>;
    getCollectionPosts(req: any, id: string, queryParams: GetCollectionPostsDto): Promise<{
        posts: any[];
        total: number;
        pagination: any;
    }>;
}
