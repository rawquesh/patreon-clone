import { PaymentsService } from '../payments/payments.service';
export declare class PayoutsController {
    private readonly paymentsService;
    constructor(paymentsService: PaymentsService);
    getAvailableAmount(req: any): Promise<{
        available: number;
        pending: number;
    }>;
    createPayout(req: any): Promise<{
        success: boolean;
        message: string;
        amount: number;
        timestamp: string;
    }>;
    getPayoutHistory(req: any): Promise<{
        payouts: any[];
        total: number;
    }>;
}
