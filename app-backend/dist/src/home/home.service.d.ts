import { Model } from 'mongoose';
import { User, GenderPreference } from '@/database/schemas/user';
import { Post } from '@/database/schemas/post';
import { Subscription } from '@/database/schemas/subscription';
import { PostsService } from '@/posts/posts.service';
import { MembershipsService } from '@/memberships/memberships.service';
interface RequestingUser {
    userId: string;
    gender?: string;
    genderPreference?: GenderPreference;
}
export declare class HomeService {
    private userModel;
    private postModel;
    private subscriptionModel;
    private readonly postsService;
    private readonly membershipsService;
    constructor(userModel: Model<User>, postModel: Model<Post>, subscriptionModel: Model<Subscription>, postsService: PostsService, membershipsService: MembershipsService);
    private addGenderFilters;
    getTopCreators(limit?: number, requestingUser?: RequestingUser): Promise<User[]>;
    getPopularThisWeek(limit?: number, requestingUser?: RequestingUser): Promise<User[]>;
    getTopCreatorsByCategory(category: string, limit?: number, requestingUser?: RequestingUser): Promise<User[]>;
    getCategories(): Promise<string[]>;
    getRecentlyVisitedCreators(userId: string, limit?: number, requestingUser?: RequestingUser): Promise<any[]>;
    getSubscribedFeed(userId: string, page?: number, limit?: number, gender?: string): Promise<{
        posts: any[];
        pagination: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    private formatDate;
    private getReadablePostType;
}
export {};
