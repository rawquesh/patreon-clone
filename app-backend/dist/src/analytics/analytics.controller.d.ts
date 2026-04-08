import { AnalyticsService } from './analytics.service';
import { MembershipInsightsDto, EarningsInsightsDto, PostsInsightsDto, PostsInsightsResponse, TransactionDetailsDto, TransactionDetailsResponse } from './analytics.dto';
export declare class AnalyticsController {
    private readonly analyticsService;
    constructor(analyticsService: AnalyticsService);
    getMembershipInsights(req: any, queryParams: MembershipInsightsDto): Promise<{
        membershipData: Record<string, number>;
        tiers: {
            name: string;
            count: number;
        }[];
    }>;
    getEarningsInsights(req: any, queryParams: EarningsInsightsDto): Promise<{
        totalEarnings: number;
        earningsData: Record<string, number>;
        tierBreakdown: any[];
        availablePayout: number;
        pendingBalance: number;
    }>;
    getTransactionDetails(req: any, queryParams: TransactionDetailsDto): Promise<TransactionDetailsResponse>;
    getPostsInsights(req: any, queryParams: PostsInsightsDto): Promise<PostsInsightsResponse>;
}
