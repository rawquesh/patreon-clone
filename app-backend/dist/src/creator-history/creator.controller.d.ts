import { CreatorHistoryService } from './creator-history.service';
import { Model } from 'mongoose';
import { User } from '@/database/schemas/user';
import { PostsService } from '@/posts/posts.service';
import { MembershipsService } from '@/memberships/memberships.service';
import { CollectionsService } from '@/collections/collections.service';
export declare class CreatorController {
    private userModel;
    private readonly creatorHistoryService;
    private readonly postsService;
    private readonly membershipsService;
    private readonly collectionsService;
    constructor(userModel: Model<User>, creatorHistoryService: CreatorHistoryService, postsService: PostsService, membershipsService: MembershipsService, collectionsService: CollectionsService);
    getCreatorByUsername(username: string, req: any): Promise<import("mongoose").Document<unknown, {}, User, {}, {}> & User & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    recordVisit(creatorId: string, req: any): Promise<{
        success: boolean;
    }>;
    getCreatorStats(creatorId: string): Promise<{
        totalPosts: number;
        totalMembers: number;
        tierBreakdown: {
            id: string;
            name: string;
            count: number;
            monthlyRate: number;
        }[];
        totalEarnings: number;
        introVideoUrl: string;
        bio: string;
        socialLinks: {
            platform: string;
            url: string;
        }[];
    }>;
    getRecentlyVisitedCreators(req: any, limit?: string): Promise<any[]>;
    getCreatorAnalytics(creatorId: string, req: any, period?: 'day' | 'week' | 'month'): Promise<any>;
    getMostEngagedVisitors(creatorId: string, req: any, limit?: string): Promise<any[]>;
    exportVisitorHistory(creatorId: string, req: any, startDate?: string, endDate?: string): Promise<any[]>;
}
