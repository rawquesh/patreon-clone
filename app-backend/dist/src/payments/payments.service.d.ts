import { ConfigService } from '@nestjs/config';
import { Model } from 'mongoose';
import Stripe from 'stripe';
import { User } from '@/database/schemas/user';
export declare class PaymentsService {
    private userModel;
    private configService;
    readonly stripe: Stripe;
    constructor(userModel: Model<User>, configService: ConfigService);
    createCustomerForSubscriber(userId: string, email: string): Promise<string>;
    createConnectAccount(userId: string, email: string): Promise<{
        accountId: string;
        accountLinkUrl: string;
    }>;
    getConnectAccountStatus(userId: string): Promise<{
        isEnabled: boolean;
        requiresAction: boolean;
        actionNeeded?: string[];
    }>;
    generateNewOnboardingLink(userId: string): Promise<string>;
    getPayoutBalance(userId: string): Promise<{
        available: number;
        pending: number;
    }>;
    initiatePayoutToBank(userId: string, amount: number): Promise<void>;
    getPayoutHistory(userId: string): Promise<any[]>;
}
