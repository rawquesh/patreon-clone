import { SearchService } from './search.service';
import { UsersService } from '@/users/users.service';
export declare class SearchController {
    private readonly searchService;
    private readonly usersService;
    constructor(searchService: SearchService, usersService: UsersService);
    private getRequestingUser;
    search(query: string, req: any, category?: string): Promise<{
        creators: (import("mongoose").Document<unknown, {}, import("@/database/schemas/user").User, {}, {}> & import("@/database/schemas/user").User & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        })[];
        posts: {
            _id: import("mongoose").Types.ObjectId;
            title: string;
            content: string;
            coverImage: string;
            type: import("../database").PostType;
            creator: import("@/database/schemas/user").User | import("mongoose").Schema.Types.ObjectId;
            createdAt: string;
            tags: string[];
        }[];
    }>;
    searchCreator(query: string, req: any, category?: string): Promise<{
        creators: (import("mongoose").Document<unknown, {}, import("@/database/schemas/user").User, {}, {}> & import("@/database/schemas/user").User & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        })[];
    }>;
    searchPosts(query: string, category?: string): Promise<{
        posts: {
            _id: import("mongoose").Types.ObjectId;
            title: string;
            content: string;
            coverImage: string;
            type: import("../database").PostType;
            creator: import("@/database/schemas/user").User | import("mongoose").Schema.Types.ObjectId;
            createdAt: string;
            tags: string[];
        }[];
    }>;
}
