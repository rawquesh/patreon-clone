import { MembershipsService } from '@/memberships/memberships.service';
import { PaymentsService } from '@/payments/payments.service';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { ChatService } from '@/chat/chat.service';
import { UsersService } from '@/users/users.service';
export declare class StripeWebhookController {
    private readonly membershipsService;
    private configService;
    private paymentsService;
    private readonly chatService;
    private readonly usersService;
    private readonly logger;
    constructor(membershipsService: MembershipsService, configService: ConfigService, paymentsService: PaymentsService, chatService: ChatService, usersService: UsersService);
    handleStripeWebhook(request: Request, signature: string): Promise<{
        received: boolean;
    }>;
    private handleAccountUpdated;
    private handleSubscriptionCreated;
    private handleSubscriptionUpdated;
    private handleSubscriptionDeleted;
    private handleInvoicePaid;
    private handleInvoicePaymentFailed;
}
