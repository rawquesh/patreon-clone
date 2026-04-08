"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var StripeWebhookController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.StripeWebhookController = void 0;
const memberships_service_1 = require("../memberships/memberships.service");
const payments_service_1 = require("../payments/payments.service");
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const chat_service_1 = require("../chat/chat.service");
const users_service_1 = require("../users/users.service");
let StripeWebhookController = StripeWebhookController_1 = class StripeWebhookController {
    constructor(membershipsService, configService, paymentsService, chatService, usersService) {
        this.membershipsService = membershipsService;
        this.configService = configService;
        this.paymentsService = paymentsService;
        this.chatService = chatService;
        this.usersService = usersService;
        this.logger = new common_1.Logger(StripeWebhookController_1.name);
    }
    async handleStripeWebhook(request, signature) {
        this.logger.log('Received Stripe webhook request');
        this.logger.log(`Headers: ${JSON.stringify(request.headers)}`);
        if (!signature) {
            this.logger.error('Missing stripe-signature header');
            throw new common_1.BadRequestException('Missing stripe-signature header');
        }
        this.logger.log(`Stripe signature received: ${signature.substring(0, 10)}...`);
        const webhookSecret = this.configService.get('STRIPE_WEBHOOK_SECRET');
        const connectWebhookSecret = this.configService.get('STRIPE_WEBHOOK_CONNECT_SECRET');
        if (!webhookSecret || !connectWebhookSecret) {
            this.logger.error('Missing STRIPE_WEBHOOK_SECRET or STRIPE_CONNECT_WEBHOOK_SECRET in environment variables');
            throw new common_1.BadRequestException('Webhook secrets not configured');
        }
        this.logger.log('Webhook secrets found');
        const rawBody = request.rawBody;
        if (!rawBody) {
            this.logger.error('No raw body found on request');
            this.logger.log(`Request properties: ${JSON.stringify(Object.keys(request))}`);
            throw new common_1.BadRequestException('No raw body found on request');
        }
        this.logger.log(`Raw body type: ${typeof rawBody}, length: ${rawBody.length || (rawBody.toString ? rawBody.toString().length : 'unknown')}`);
        let event;
        try {
            this.logger.log('Attempting to verify webhook signature');
            const tempEvent = JSON.parse(rawBody);
            const secret = tempEvent.account ? connectWebhookSecret : webhookSecret;
            event = this.paymentsService.stripe.webhooks.constructEvent(rawBody, signature, secret);
            this.logger.log('Signature verification successful');
        }
        catch (err) {
            this.logger.error(`Webhook signature verification failed: ${err.message}`);
            this.logger.error(`Error stack: ${err.stack}`);
            throw new common_1.BadRequestException(`Webhook signature verification failed: ${err.message}`);
        }
        this.logger.log(`Processing webhook event: ${event.type}, id: ${event.id}`);
        try {
            switch (event.type) {
                case 'account.updated':
                    this.logger.log('Handling account.updated event');
                    await this.handleAccountUpdated(event.data.object);
                    break;
                case 'checkout.session.completed':
                    this.logger.log('Handling checkout.session.completed event');
                    break;
                case 'customer.subscription.created':
                    this.logger.log('Handling customer.subscription.created event');
                    await this.handleSubscriptionCreated(event.data.object);
                    break;
                case 'customer.subscription.updated':
                    this.logger.log('Handling customer.subscription.updated event');
                    await this.handleSubscriptionUpdated(event.data.object);
                    break;
                case 'customer.subscription.deleted':
                    this.logger.log('Handling customer.subscription.deleted event');
                    await this.handleSubscriptionDeleted(event.data.object);
                    break;
                case 'invoice.paid':
                    this.logger.log('Handling invoice.paid event');
                    await this.handleInvoicePaid(event.data.object);
                    break;
                case 'invoice.payment_failed':
                    this.logger.log('Handling invoice.payment_failed event');
                    await this.handleInvoicePaymentFailed(event.data.object);
                    break;
                default:
                    this.logger.log(`Unhandled event type: ${event.type}`);
            }
            this.logger.log(`Successfully processed webhook event: ${event.type}`);
        }
        catch (error) {
            this.logger.error(`Error handling webhook ${event.type}: ${error.message}`);
            this.logger.error(`Error stack: ${error.stack}`);
        }
        this.logger.log('Webhook processing completed');
        return { received: true };
    }
    async handleAccountUpdated(account) {
        this.logger.log(`Account updated: ${account.id}, Charges Enabled: ${account.charges_enabled}, Payouts Enabled: ${account.payouts_enabled}`);
        try {
            await this.usersService.updateUserStripeStatusFromWebhook(account);
            this.logger.log(`Successfully processed account update for ${account.id}.`);
        }
        catch (error) {
            this.logger.error(`Error processing account update for ${account.id}: ${error.message}`, error.stack);
        }
    }
    async handleSubscriptionCreated(subscription) {
        this.logger.log(`Subscription created event: ${subscription.id}, Status: ${subscription.status}`);
        try {
            const metadata = subscription.metadata || {};
            const { membershipId, subscriberId } = metadata;
            if (!membershipId || !subscriberId) {
                this.logger.warn(`Missing metadata in subscription created event: ${subscription.id}`);
                return;
            }
            this.logger.log(`Processing subscription created for: memberId=${membershipId}, subscriberId=${subscriberId}`);
            const subscriptionItem = subscription.items.data[0];
            const priceAmount = subscriptionItem?.price?.unit_amount || 0;
            console.log('subscription', subscription);
            await this.membershipsService.createSubscriptionFromStripe(subscriberId, membershipId, subscription.id, {
                currentPeriodStart: subscription.current_period_start,
                currentPeriodEnd: subscription.current_period_end,
                monthlyRate: priceAmount / 100,
                status: subscription.plan.status === true ? 'active' : 'expired',
            });
            this.logger.log('Subscription record created/updated from subscription_created event.');
            if (subscription.status === 'active' ||
                subscription.status === 'trialing') {
                this.logger.log(`Subscription ${subscription.id} is active/trialing, adding user to chats.`);
                try {
                    await this.chatService.handleNewSubscription(subscriberId, membershipId);
                    this.logger.log(`ChatService.handleNewSubscription called for user ${subscriberId}, membership ${membershipId}`);
                }
                catch (chatError) {
                    this.logger.error(`Error calling handleNewSubscription after subscription_created: ${chatError.message}`, chatError.stack);
                }
            }
        }
        catch (error) {
            this.logger.error(`Error in handleSubscriptionCreated ${subscription.id}: ${error.message}`, error.stack);
        }
    }
    async handleSubscriptionUpdated(subscription) {
        this.logger.log(`Subscription updated event: ${subscription.id}, Status: ${subscription.status}`);
        try {
            const metadata = subscription.metadata || {};
            const { membershipId, subscriberId } = metadata;
            if (!membershipId || !subscriberId) {
                this.logger.warn(`Missing metadata in subscription updated event: ${subscription.id}. Cannot process update or chat access.`);
                return;
            }
            this.logger.log(`Processing subscription update for: memberId=${membershipId}, subscriberId=${subscriberId}`);
            const subscriptionItem = subscription.items.data[0];
            const priceAmount = subscriptionItem?.price?.unit_amount || 0;
            const updateData = {
                currentPeriodStart: subscription.current_period_start,
                currentPeriodEnd: subscription.current_period_end,
                monthlyRate: priceAmount / 100,
                status: subscription.status,
                cancelAtPeriodEnd: subscription.cancel_at_period_end,
                cancelledAt: subscription.canceled_at,
            };
            await this.membershipsService.updateSubscriptionFromStripe(subscriberId, membershipId, subscription.id, updateData);
            this.logger.log('Subscription record updated from subscription_updated event.');
            const isActive = subscription.status === 'active' || subscription.status === 'trialing';
            const isEffectivelyCancelled = subscription.status === 'canceled' ||
                subscription.status === 'incomplete_expired' ||
                subscription.status === 'past_due';
            if (isActive) {
                this.logger.log(`Subscription ${subscription.id} became active/trialing, calling handleNewSubscription.`);
                try {
                    await this.chatService.handleNewSubscription(subscriberId, membershipId);
                    this.logger.log(`ChatService.handleNewSubscription called for user ${subscriberId}, membership ${membershipId}`);
                }
                catch (chatError) {
                    this.logger.error(`Error calling handleNewSubscription after subscription_updated: ${chatError.message}`, chatError.stack);
                }
            }
            else if (isEffectivelyCancelled) {
                this.logger.log(`Subscription ${subscription.id} became inactive (${subscription.status}), calling handleExpiredSubscription.`);
                try {
                    await this.chatService.handleExpiredSubscription(subscriberId, membershipId);
                    this.logger.log(`ChatService.handleExpiredSubscription called for user ${subscriberId}, membership ${membershipId}`);
                }
                catch (chatError) {
                    this.logger.error(`Error calling handleExpiredSubscription after subscription_updated: ${chatError.message}`, chatError.stack);
                }
            }
            else {
                this.logger.log(`Subscription ${subscription.id} status (${subscription.status}) requires no immediate chat access change.`);
            }
        }
        catch (error) {
            this.logger.error(`Error in handleSubscriptionUpdated ${subscription.id}: ${error.message}`, error.stack);
        }
    }
    async handleSubscriptionDeleted(subscription) {
        this.logger.log(`Subscription deleted event: ${subscription.id}, Status: ${subscription.status}`);
        try {
            const metadata = subscription.metadata || {};
            const { membershipId, subscriberId } = metadata;
            if (!membershipId || !subscriberId) {
                this.logger.warn(`Missing metadata in subscription deleted event: ${subscription.id}. Cannot process update or chat access.`);
                return;
            }
            this.logger.log(`Processing subscription deleted for: memberId=${membershipId}, subscriberId=${subscriberId}`);
            const subscriptionItem = subscription.items?.data[0];
            const priceAmount = subscriptionItem?.price?.unit_amount || 0;
            const updateData = {
                currentPeriodStart: subscription.current_period_start,
                currentPeriodEnd: subscription.current_period_end,
                monthlyRate: priceAmount / 100,
                status: 'cancelled',
                cancelAtPeriodEnd: subscription.cancel_at_period_end,
                cancelledAt: subscription.canceled_at || Math.floor(Date.now() / 1000),
            };
            await this.membershipsService.updateSubscriptionFromStripe(subscriberId, membershipId, subscription.id, updateData);
            this.logger.log('Subscription record updated from subscription_deleted event.');
            this.logger.log(`Subscription ${subscription.id} deleted, calling handleExpiredSubscription.`);
            try {
                await this.chatService.handleExpiredSubscription(subscriberId, membershipId);
                this.logger.log(`ChatService.handleExpiredSubscription called for user ${subscriberId}, membership ${membershipId}`);
            }
            catch (chatError) {
                this.logger.error(`Error calling handleExpiredSubscription after subscription_deleted: ${chatError.message}`, chatError.stack);
            }
        }
        catch (error) {
            this.logger.error(`Error in handleSubscriptionDeleted ${subscription.id}: ${error.message}`, error.stack);
        }
    }
    async handleInvoicePaid(invoice) {
        this.logger.log(`Invoice paid event: ${invoice.id}, Subscription: ${invoice.subscription}`);
        try {
            if (!invoice.subscription) {
                this.logger.log(`Invoice ${invoice.id} is not related to a subscription.`);
                return;
            }
            const subscription = await this.paymentsService.stripe.subscriptions.retrieve(invoice.subscription);
            this.logger.log(`Retrieved subscription ${subscription.id} related to invoice ${invoice.id}, Status: ${subscription.status}`);
            const metadata = subscription.metadata || {};
            const { membershipId, subscriberId } = metadata;
            if (!membershipId || !subscriberId) {
                this.logger.warn(`Missing metadata for subscription ${subscription.id} linked to invoice ${invoice.id}. Cannot process update or chat access.`);
                return;
            }
            const updateData = {
                currentPeriodStart: subscription.current_period_start,
                currentPeriodEnd: subscription.current_period_end,
                status: subscription.status,
            };
            await this.membershipsService.updateSubscriptionFromStripe(subscriberId, membershipId, subscription.id, updateData);
            this.logger.log(`Subscription period/status updated for ${subscription.id} from invoice_paid event.`);
            if (subscription.status === 'active') {
                this.logger.log(`Subscription ${subscription.id} is active after invoice payment, ensuring chat access.`);
                try {
                    await this.chatService.handleNewSubscription(subscriberId, membershipId);
                    this.logger.log(`ChatService.handleNewSubscription called for user ${subscriberId}, membership ${membershipId}`);
                }
                catch (chatError) {
                    this.logger.error(`Error calling handleNewSubscription after invoice_paid: ${chatError.message}`, chatError.stack);
                }
            }
            else {
                this.logger.log(`Subscription ${subscription.id} status (${subscription.status}) after invoice payment does not require chat update.`);
            }
        }
        catch (error) {
            this.logger.error(`Error in handleInvoicePaid ${invoice.id}: ${error.message}`, error.stack);
        }
    }
    async handleInvoicePaymentFailed(invoice) {
        this.logger.log(`Invoice payment failed event: ${invoice.id}, Subscription: ${invoice.subscription}`);
        try {
            if (!invoice.subscription) {
                this.logger.log(`Invoice ${invoice.id} is not related to a subscription.`);
                return;
            }
            const subscription = await this.paymentsService.stripe.subscriptions.retrieve(invoice.subscription);
            this.logger.log(`Retrieved subscription ${subscription.id} related to failed invoice ${invoice.id}, Status: ${subscription.status}`);
            const metadata = subscription.metadata || {};
            const { membershipId, subscriberId } = metadata;
            const subscriptionItem = subscription.items?.data[0];
            const priceAmount = subscriptionItem?.price?.unit_amount || 0;
            const updateData = {
                currentPeriodStart: subscription.current_period_start,
                currentPeriodEnd: subscription.current_period_end,
                monthlyRate: priceAmount / 100,
                status: subscription.status,
                cancelAtPeriodEnd: subscription.cancel_at_period_end,
                cancelledAt: subscription.canceled_at,
            };
            if (!membershipId || !subscriberId) {
                this.logger.warn(`Missing metadata for subscription ${subscription.id} linked to failed invoice ${invoice.id}. Updating status only if possible, but full update requires IDs.`);
            }
            await this.membershipsService.updateSubscriptionFromStripe(subscriberId, membershipId, subscription.id, updateData);
            this.logger.log(`Subscription record updated for ${subscription.id} from invoice_payment_failed event.`);
            const isEffectivelyCancelled = subscription.status === 'canceled' ||
                subscription.status === 'incomplete_expired' ||
                subscription.status === 'past_due';
            if (isEffectivelyCancelled && membershipId && subscriberId) {
                this.logger.log(`Subscription ${subscription.id} became inactive (${subscription.status}) after payment failure, calling handleExpiredSubscription.`);
                try {
                    await this.chatService.handleExpiredSubscription(subscriberId, membershipId);
                    this.logger.log(`ChatService.handleExpiredSubscription called for user ${subscriberId}, membership ${membershipId}`);
                }
                catch (chatError) {
                    this.logger.error(`Error calling handleExpiredSubscription after invoice_payment_failed: ${chatError.message}`, chatError.stack);
                }
            }
            else if (isEffectivelyCancelled) {
                this.logger.warn(`Cannot call handleExpiredSubscription for ${subscription.id}: Missing metadata.`);
            }
        }
        catch (error) {
            this.logger.error(`Error in handleInvoicePaymentFailed ${invoice.id}: ${error.message}`, error.stack);
        }
    }
};
exports.StripeWebhookController = StripeWebhookController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Headers)('stripe-signature')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], StripeWebhookController.prototype, "handleStripeWebhook", null);
exports.StripeWebhookController = StripeWebhookController = StripeWebhookController_1 = __decorate([
    (0, common_1.Controller)('webhooks/stripe'),
    __metadata("design:paramtypes", [memberships_service_1.MembershipsService,
        config_1.ConfigService,
        payments_service_1.PaymentsService,
        chat_service_1.ChatService,
        users_service_1.UsersService])
], StripeWebhookController);
//# sourceMappingURL=stripe-webhooks.controller.js.map