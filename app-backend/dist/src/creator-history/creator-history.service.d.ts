import { Model } from 'mongoose';
import { User } from '@/database/schemas/user';
import { CreatorVisit, DeviceInfo, GeoLocation, VisitReferrer } from '@/database/schemas/engagement';
import { Subscription } from '@/database/schemas/subscription';
export declare class CreatorHistoryService {
    private userModel;
    private creatorVisitModel;
    private subscriptionModel;
    constructor(userModel: Model<User>, creatorVisitModel: Model<CreatorVisit>, subscriptionModel: Model<Subscription>);
    recordVisit(userId: string, creatorId: string, metadata?: {
        referrer?: VisitReferrer;
        geoLocation?: GeoLocation;
        deviceInfo?: DeviceInfo;
    }): Promise<void>;
    getRecentlyVisited(userId: string, limit?: number): Promise<any[]>;
    getPublicRecentlyVisited(limit?: number): Promise<any[]>;
    getCreatorAnalytics(creatorId: string, period?: 'day' | 'week' | 'month'): Promise<any>;
    getMostEngagedVisitors(creatorId: string, limit?: number): Promise<any[]>;
    exportVisitorHistory(creatorId: string, startDate?: Date, endDate?: Date): Promise<any[]>;
}
