export declare class CreateCollectionDto {
    title: string;
    description?: string;
}
export declare class UpdateCollectionDto {
    title?: string;
    description?: string;
    isActive?: boolean;
}
export declare class AddPostToCollectionDto {
    postId: string;
}
export declare class RemovePostFromCollectionDto {
    postId: string;
}
export declare class GetCollectionPostsDto {
    sortBy?: string;
    sortOrder?: string;
    types?: string[];
    page?: number;
    limit?: number;
}
