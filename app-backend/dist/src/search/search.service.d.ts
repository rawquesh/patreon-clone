import { Model } from 'mongoose';
import { User, GenderPreference } from '@/database/schemas/user';
import { Post } from '@/database/schemas/post';
interface RequestingUser {
    userId: string;
    gender?: string;
    genderPreference?: GenderPreference;
}
export declare class SearchService {
    private userModel;
    private postModel;
    constructor(userModel: Model<User>, postModel: Model<Post>);
    private addGenderFilters;
    search(query: string, category?: string, requestingUser?: RequestingUser, fullSearch?: boolean): Promise<{
        creators: (import("mongoose").Document<unknown, {}, User, {}, {}> & User & Required<{
            _id: unknown;
        }> & {
            __v: number;
        })[];
        posts: {
            _id: string;
            title: string;
            content: string;
            coverImage: string;
            type: import("@/database/schemas/post").PostType;
            creator: User | import("mongoose").Schema.Types.ObjectId;
            createdAt: string;
            tags: string[];
        }[];
    }>;
    searchCreators(query: string, category?: string, requestingUser?: RequestingUser): Promise<(import("mongoose").Document<unknown, {}, User, {}, {}> & User & Required<{
        _id: unknown;
    }> & {
        __v: number;
    })[]>;
    searchPosts(query: string, category?: string): Promise<{
        _id: string;
        title: string;
        content: string;
        coverImage: string;
        type: import("@/database/schemas/post").PostType;
        creator: User | import("mongoose").Schema.Types.ObjectId;
        createdAt: string;
        tags: string[];
    }[]>;
}
export {};
