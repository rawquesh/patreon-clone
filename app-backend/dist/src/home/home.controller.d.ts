import { HomeService } from './home.service';
import { UsersService } from '@/users/users.service';
export declare class HomeController {
    private readonly homeService;
    private readonly usersService;
    constructor(homeService: HomeService, usersService: UsersService);
    private getRequestingUser;
    getTopCreators(req: any, limit?: number): Promise<import("@/database/schemas/user").User[]>;
    getPopularThisWeek(req: any, limit?: number): Promise<import("@/database/schemas/user").User[]>;
    getCategories(): Promise<string[]>;
    getTopCreatorsByCategory(category: string, req: any, limit?: number): Promise<import("@/database/schemas/user").User[]>;
    getRecentlyVisitedCreators(req: any, limit?: number): Promise<any[]>;
    getRecentlyVisitedCreatorsPublic(req: any, limit?: number): Promise<any[]>;
    getSubscribedFeed(req: any, page?: number, limit?: number): Promise<{
        posts: any[];
        pagination: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
}
