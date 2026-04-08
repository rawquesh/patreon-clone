import { Model } from 'mongoose';
import { MembershipInsight, EarningsInsight, PostInsight } from '@/database/schemas/analytics';
import { Post } from '@/database/schemas/post';
import { User } from '@/database/schemas/user';
import { Subscription } from '@/database/schemas/subscription';
export declare class AnalyticsTrackerService {
    private membershipInsightModel;
    private earningsInsightModel;
    private postInsightModel;
    private postModel;
    private userModel;
    private subscriptionModel;
    private readonly logger;
    constructor(membershipInsightModel: Model<MembershipInsight>, earningsInsightModel: Model<EarningsInsight>, postInsightModel: Model<PostInsight>, postModel: Model<Post>, userModel: Model<User>, subscriptionModel: Model<Subscription>);
    recordDailyMembershipInsights(): Promise<void>;
    recordDailyEarningsInsights(): Promise<void>;
    recordHourlyPostInsights(): Promise<void>;
}
