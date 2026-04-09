import { Model } from 'mongoose';
import { PaymentsService } from '@/payments/payments.service';
import { User } from '@/database/schemas/user';
import { UpdateMembershipDto, CreatePayoutRequestDto, GetMembershipsQueryDto, CreateMembershipWithFileDto } from './memberships.dto';
import { Membership } from '@/database/schemas/membership';
import { Subscription } from '@/database/schemas/subscription';
import { PayoutRequest } from '@/database/schemas/payout';
import { NotificationGeneratorService } from '@/notifications/notification-generator.service';
export declare class MembershipsService {
    private membershipModel;
    private subscriptionModel;
    private payoutRequestModel;
    private userModel;
    private paymentsService;
    private notificationGenerator;
    private readonly platformFeePercentage;
    constructor(membershipModel: Model<Membership>, subscriptionModel: Model<Subscription>, payoutRequestModel: Model<PayoutRequest>, userModel: Model<User>, paymentsService: PaymentsService, notificationGenerator: NotificationGeneratorService);
    createMembership(userId: string, createMembershipDto: CreateMembershipWithFileDto): Promise<Membership>;
    updateMembership(userId: string, membershipId: string, updateMembershipDto: UpdateMembershipDto): Promise<Membership>;
    createSubscription(userId: string, membershipId: string, discountInfo?: {
        discountId?: string;
        discountCode?: string;
        originalPrice?: number;
        discountedPrice?: number;
    }): Promise<Subscription>;
    createTrialSubscription(userId: string, membershipId: string, expiryDate: Date, giftInfo?: {
        giftId?: string;
        giftCode?: string;
        originalPrice?: number;
        trialDurationDays?: number;
    }): Promise<Subscription>;
    cancelSubscription(userId: string, subscriptionId: string): Promise<Subscription>;
    unsubscribeFromCreator(userId: string, creatorId: string): Promise<{
        success: boolean;
        message: string;
    }>;
    calculateCreatorShare(amount: number): number;
    createPayoutRequest(userId: string, createPayoutRequestDto: CreatePayoutRequestDto): Promise<PayoutRequest>;
    getCreatorEarnings(userId: string): Promise<{
        availableBalance: number;
        pendingBalance: number;
        lifetimeEarnings: number;
        recentPayouts: PayoutRequest[];
        monthlyEarnings: {
            month: string;
            earnings: number;
            subscriptions: number;
        }[];
    }>;
    getPayoutHistory(userId: string): Promise<{
        payouts: PayoutRequest[];
        total: number;
    }>;
    getCreatorMemberships(userId: string, query: GetMembershipsQueryDto): Promise<{
        creatorId: string;
        memberships: Membership[];
        total: number;
        totalSubscribers: number;
        totalEarnings: number;
    }>;
    getUserSubscriptions(userId: string): Promise<{
        activeSubscriptions: Array<Subscription & {
            daysUntilRenewal: number;
            nextBillingAmount: number;
        }>;
        cancelledSubscriptions: Subscription[];
    }>;
    getCreatorSubscribers(userId: string): Promise<{
        subscribers: {
            subscription: Subscription;
            totalPaid: number;
            subscriber: Partial<User>;
        }[];
        total: number;
        totalRevenue: number;
    }>;
    getMembershipById(membershipId: string): Promise<Membership>;
    isSubscribed(userId: string, membershipId: string): Promise<boolean>;
    createFreeSubscription(userId: string, creatorId: string): Promise<Subscription>;
    ensureStripeProductForMembership(membershipId: string): Promise<Membership>;
    extendSubscriptionPeriod(userId: string, membershipId: string, newEndTimestamp: number): Promise<Subscription>;
    createCheckoutSession(userId: string, membershipId: string, promotionCode?: string): Promise<string>;
    createSubscriptionFromStripe(userId: string, membershipId: string, stripeSubscriptionId: string, data: {
        currentPeriodStart: number;
        currentPeriodEnd: number;
        monthlyRate: number;
        status: string;
    }): Promise<Subscription>;
    updateSubscriptionFromStripe(userId: string, membershipId: string, stripeSubscriptionId: string, data: {
        status: string;
        currentPeriodEnd: number;
        cancelledAt?: number;
    }): Promise<Subscription | null>;
    findSubscriptionByStripeId(stripeSubscriptionId: string): Promise<Subscription | null>;
    markSubscriptionAsExpired(subscriptionId: string): Promise<Subscription | null>;
    updateSubscriptionPeriod(userId: string, membershipId: string, periodEndTimestamp: number): Promise<Subscription | null>;
    creditCreatorForPayment(creatorId: string, amount: number): Promise<void>;
    private mapStripeStatusToAppStatus;
    toggleFeaturedStatus(creatorId: string, membershipId: string, isFeatured: boolean): Promise<Membership>;
}
