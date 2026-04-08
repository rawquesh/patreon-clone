import { MembershipsService } from './memberships.service';
import { UpdateMembershipDto, CreatePayoutRequestDto, GetMembershipsQueryDto, CreateMembershipDto } from './memberships.dto';
import { S3Service } from '@/s3/s3.service';
import { PromotionsService } from '@/promotions/promotions.service';
import { Membership } from '@/database/schemas/membership';
import { User } from '@/database/schemas/user';
import { Model } from 'mongoose';
export declare class MembershipsController {
    private readonly membershipsService;
    private readonly s3Service;
    private readonly promotionsService;
    private membershipModel;
    constructor(membershipsService: MembershipsService, s3Service: S3Service, promotionsService: PromotionsService, membershipModel: Model<Membership>);
    getCreatorMembershipsForSelf(req: any, query: GetMembershipsQueryDto): Promise<{
        creatorId: string;
        memberships: Membership[];
        total: number;
        totalSubscribers: number;
        totalEarnings: number;
    }>;
    getMembership(id: string): Promise<Membership | {
        id: string;
        name: string;
        description: string;
        monthlyRate: number;
        isActive: boolean;
        benefits: string[];
        isTrial: boolean;
    }>;
    getCreatorMemberships(creatorId: string, query?: GetMembershipsQueryDto): Promise<{
        _id: string;
        name: string;
        description: string;
        monthlyPrice: number;
        yearlyPrice: number;
        benefits: string[];
        isLimited: boolean;
        seatsLeft: number;
        isFeatured: boolean;
        isActive: boolean;
        coverImage: string;
        subscriberCount: number;
    }[]>;
    checkSubscription(req: any, creatorId: string): Promise<{
        isSubscribed: boolean;
    }>;
    createMembership(req: any, createMembershipDto: CreateMembershipDto, coverImage: Express.Multer.File): Promise<Membership>;
    getSubscriptions(req: any): Promise<{
        activeSubscriptions: Array<import("../database").Subscription & {
            daysUntilRenewal: number;
            nextBillingAmount: number;
        }>;
        cancelledSubscriptions: import("../database").Subscription[];
    }>;
    updateMembership(req: any, id: string, updateMembershipDto: UpdateMembershipDto, coverImage?: Express.Multer.File): Promise<Membership>;
    createCheckoutSession(req: any, membershipId: string, body: {
        promotionCode?: string;
    }): Promise<{
        checkoutUrl: string;
    }>;
    createSubscription(req: any, membershipId: string, body: {
        promotionCode?: string;
    }): Promise<{
        subscription: any;
        checkoutUrl: any;
        success: boolean;
    }>;
    cancelSubscription(req: any, subscriptionId: string): Promise<import("../database").Subscription>;
    unsubscribeFromCreator(req: any, creatorId: string): Promise<{
        success: boolean;
        message: string;
    }>;
    getSubscribers(req: any): Promise<{
        subscribers: {
            subscription: import("../database").Subscription;
            totalPaid: number;
            subscriber: Partial<User>;
        }[];
        total: number;
        totalRevenue: number;
    }>;
    getEarnings(req: any): Promise<{
        availableBalance: number;
        pendingBalance: number;
        lifetimeEarnings: number;
        recentPayouts: import("../database").PayoutRequest[];
        monthlyEarnings: {
            month: string;
            earnings: number;
            subscriptions: number;
        }[];
    }>;
    requestPayout(req: any, createPayoutRequestDto: CreatePayoutRequestDto): Promise<import("../database").PayoutRequest>;
    getPayoutHistory(req: any): Promise<{
        payouts: import("../database").PayoutRequest[];
        total: number;
    }>;
    subscribeToFreeMembership(req: any, creatorId: string): Promise<{
        subscription: import("../database").Subscription;
        success: boolean;
        message: string;
    }>;
    ensureStripeProducts(req: any): Promise<{
        processed: number;
        results: any[];
    }>;
    toggleFeaturedStatus(req: any, id: string, body: {
        isFeatured: boolean;
    }): Promise<Membership>;
}
