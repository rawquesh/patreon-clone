import { MembershipsService } from '@/memberships/memberships.service';
import { PaymentsService } from '@/payments/payments.service';
import {
  BadRequestException,
  Controller,
  Headers,
  Post,
  Req,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { ChatService } from '@/chat/chat.service';
import { UsersService } from '@/users/users.service';
import Stripe from 'stripe';

@Controller('webhooks/stripe')
export class StripeWebhookController {
  private readonly logger = new Logger(StripeWebhookController.name);

  constructor(
    private readonly membershipsService: MembershipsService,
    private configService: ConfigService,
    private paymentsService: PaymentsService,
    private readonly chatService: ChatService,
    private readonly usersService: UsersService,
  ) {}

  @Post()
  async handleStripeWebhook(
    @Req() request: Request,
    @Headers('stripe-signature') signature: string,
  ) {
    this.logger.log('Received Stripe webhook request');
    this.logger.log(`Headers: ${JSON.stringify(request.headers)}`);

    if (!signature) {
      this.logger.error('Missing stripe-signature header');
      throw new BadRequestException('Missing stripe-signature header');
    }

    this.logger.log(
      `Stripe signature received: ${signature.substring(0, 10)}...`,
    );

    const webhookSecret = this.configService.get('STRIPE_WEBHOOK_SECRET');
    const connectWebhookSecret = this.configService.get(
      'STRIPE_WEBHOOK_CONNECT_SECRET',
    );

    if (!webhookSecret || !connectWebhookSecret) {
      this.logger.error(
        'Missing STRIPE_WEBHOOK_SECRET or STRIPE_CONNECT_WEBHOOK_SECRET in environment variables',
      );
      throw new BadRequestException('Webhook secrets not configured');
    }

    this.logger.log('Webhook secrets found');

    const rawBody = (request as any).rawBody;

    if (!rawBody) {
      this.logger.error('No raw body found on request');
      this.logger.log(
        `Request properties: ${JSON.stringify(Object.keys(request))}`,
      );
      throw new BadRequestException('No raw body found on request');
    }

    this.logger.log(
      `Raw body type: ${typeof rawBody}, length: ${rawBody.length || (rawBody.toString ? rawBody.toString().length : 'unknown')}`,
    );

    let event;
    try {
      this.logger.log('Attempting to verify webhook signature');
      const tempEvent = JSON.parse(rawBody);
      const secret = tempEvent.account ? connectWebhookSecret : webhookSecret;

      event = this.paymentsService.stripe.webhooks.constructEvent(
        rawBody,
        signature,
        secret,
      );
      this.logger.log('Signature verification successful');
    } catch (err) {
      this.logger.error(
        `Webhook signature verification failed: ${err.message}`,
      );
      this.logger.error(`Error stack: ${err.stack}`);
      throw new BadRequestException(
        `Webhook signature verification failed: ${err.message}`,
      );
    }

    this.logger.log(`Processing webhook event: ${event.type}, id: ${event.id}`);

    try {
      switch (event.type) {
        case 'account.updated':
          this.logger.log('Handling account.updated event');
          await this.handleAccountUpdated(event.data.object as Stripe.Account);
          break;
        case 'checkout.session.completed':
          this.logger.log('Handling checkout.session.completed event');
          // await this.handleCheckoutSessionCompleted(event.data.object);
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
    } catch (error) {
      this.logger.error(
        `Error handling webhook ${event.type}: ${error.message}`,
      );
      this.logger.error(`Error stack: ${error.stack}`);
    }

    this.logger.log('Webhook processing completed');
    return { received: true };
  }

  private async handleAccountUpdated(account: Stripe.Account) {
    this.logger.log(
      `Account updated: ${account.id}, Charges Enabled: ${account.charges_enabled}, Payouts Enabled: ${account.payouts_enabled}`,
    );
    try {
      await this.usersService.updateUserStripeStatusFromWebhook(account);
      this.logger.log(
        `Successfully processed account update for ${account.id}.`,
      );
    } catch (error) {
      this.logger.error(
        `Error processing account update for ${account.id}: ${error.message}`,
        error.stack,
      );
    }
  }

  // private async handleCheckoutSessionCompleted(session: any) {
  //   this.logger.log(`Checkout session completed: ${session.id}`);

  //   try {
  //     if (session.mode !== 'subscription' || !session.subscription) {
  //       this.logger.log(`Not a subscription checkout: mode=${session.mode}`);
  //       return;
  //     }

  //     const subscription =
  //       await this.paymentsService.stripe.subscriptions.retrieve(
  //         session.subscription,
  //       );
  //     this.logger.log(
  //       `Retrieved subscription details: ${subscription.id}, Status: ${subscription.status}`,
  //     );

  //     const metadata = session.metadata || {};
  //     const { membershipId, subscriberId } = metadata;

  //     if (!membershipId || !subscriberId) {
  //       this.logger.warn(
  //         `Missing required metadata in checkout session: ${session.id}`,
  //       );
  //       return;
  //     }

  //     this.logger.log(
  //       `Processing checkout for: memberId=${membershipId}, subscriberId=${subscriberId}`,
  //     );

  //     const subscriptionItem = subscription.items.data[0];
  //     const priceAmount = subscriptionItem?.price?.unit_amount || 0;

  //     await this.membershipsService.createSubscriptionFromStripe(
  //       subscriberId,
  //       membershipId,
  //       subscription.id,
  //       {
  //         currentPeriodStart: subscription.current_period_start,
  //         currentPeriodEnd: subscription.current_period_end,
  //         monthlyRate: priceAmount / 100,
  //         status: subscription.status,
  //       },
  //     );
  //     this.logger.log('Subscription record created/updated from checkout.');

  //     if (
  //       subscription.status === 'active' ||
  //       subscription.status === 'trialing'
  //     ) {
  //       this.logger.log(
  //         `Subscription ${subscription.id} is active/trialing, adding user to chats.`,
  //       );
  //       try {
  //         await this.chatService.handleNewSubscription(
  //           subscriberId,
  //           membershipId,
  //         );
  //         this.logger.log(
  //           `ChatService.handleNewSubscription called for user ${subscriberId}, membership ${membershipId}`,
  //         );
  //       } catch (chatError) {
  //         this.logger.error(
  //           `Error calling handleNewSubscription after checkout: ${chatError.message}`,
  //           chatError.stack,
  //         );
  //       }
  //     } else {
  //       this.logger.log(
  //         `Subscription ${subscription.id} status (${subscription.status}) is not active/trialing, skipping chat update.`,
  //       );
  //     }
  //   } catch (error) {
  //     this.logger.error(
  //       `Error processing checkout session ${session.id}: ${error.message}`,
  //       error.stack,
  //     );
  //   }
  // }

  private async handleSubscriptionCreated(subscription: any) {
    this.logger.log(
      `Subscription created event: ${subscription.id}, Status: ${subscription.status}`,
    );

    try {
      const metadata = subscription.metadata || {};
      const { membershipId, subscriberId } = metadata;

      if (!membershipId || !subscriberId) {
        this.logger.warn(
          `Missing metadata in subscription created event: ${subscription.id}`,
        );
        return;
      }

      this.logger.log(
        `Processing subscription created for: memberId=${membershipId}, subscriberId=${subscriberId}`,
      );

      const subscriptionItem = subscription.items.data[0];
      const priceAmount = subscriptionItem?.price?.unit_amount || 0;

      console.log('subscription', subscription);

      await this.membershipsService.createSubscriptionFromStripe(
        subscriberId,
        membershipId,
        subscription.id,
        {
          currentPeriodStart: subscription.current_period_start,
          currentPeriodEnd: subscription.current_period_end,
          monthlyRate: priceAmount / 100,
          status: subscription.status === 'active' || subscription.status === 'trialing' ? 'active' : 'expired',
        },
      );
      this.logger.log(
        'Subscription record created/updated from subscription_created event.',
      );

      if (
        subscription.status === 'active' ||
        subscription.status === 'trialing'
      ) {
        this.logger.log(
          `Subscription ${subscription.id} is active/trialing, adding user to chats.`,
        );
        try {
          await this.chatService.handleNewSubscription(
            subscriberId,
            membershipId,
          );
          this.logger.log(
            `ChatService.handleNewSubscription called for user ${subscriberId}, membership ${membershipId}`,
          );
        } catch (chatError) {
          this.logger.error(
            `Error calling handleNewSubscription after subscription_created: ${chatError.message}`,
            chatError.stack,
          );
        }
      }
    } catch (error) {
      this.logger.error(
        `Error in handleSubscriptionCreated ${subscription.id}: ${error.message}`,
        error.stack,
      );
    }
  }

  private async handleSubscriptionUpdated(subscription: any) {
    this.logger.log(
      `Subscription updated event: ${subscription.id}, Status: ${subscription.status}`,
    );

    try {
      const metadata = subscription.metadata || {};
      const { membershipId, subscriberId } = metadata;

      if (!membershipId || !subscriberId) {
        this.logger.warn(
          `Missing metadata in subscription updated event: ${subscription.id}. Cannot process update or chat access.`,
        );
        return;
      }

      this.logger.log(
        `Processing subscription update for: memberId=${membershipId}, subscriberId=${subscriberId}`,
      );

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

      await this.membershipsService.updateSubscriptionFromStripe(
        subscriberId,
        membershipId,
        subscription.id,
        updateData,
      );
      this.logger.log(
        'Subscription record updated from subscription_updated event.',
      );

      const isActive =
        subscription.status === 'active' || subscription.status === 'trialing';
      const isEffectivelyCancelled =
        subscription.status === 'canceled' ||
        subscription.status === 'incomplete_expired' ||
        subscription.status === 'past_due';

      if (isActive) {
        this.logger.log(
          `Subscription ${subscription.id} became active/trialing, calling handleNewSubscription.`,
        );
        try {
          await this.chatService.handleNewSubscription(
            subscriberId,
            membershipId,
          );
          this.logger.log(
            `ChatService.handleNewSubscription called for user ${subscriberId}, membership ${membershipId}`,
          );
        } catch (chatError) {
          this.logger.error(
            `Error calling handleNewSubscription after subscription_updated: ${chatError.message}`,
            chatError.stack,
          );
        }
      } else if (isEffectivelyCancelled) {
        this.logger.log(
          `Subscription ${subscription.id} became inactive (${subscription.status}), calling handleExpiredSubscription.`,
        );
        try {
          await this.chatService.handleExpiredSubscription(
            subscriberId,
            membershipId,
          );
          this.logger.log(
            `ChatService.handleExpiredSubscription called for user ${subscriberId}, membership ${membershipId}`,
          );
        } catch (chatError) {
          this.logger.error(
            `Error calling handleExpiredSubscription after subscription_updated: ${chatError.message}`,
            chatError.stack,
          );
        }
      } else {
        this.logger.log(
          `Subscription ${subscription.id} status (${subscription.status}) requires no immediate chat access change.`,
        );
      }
    } catch (error) {
      this.logger.error(
        `Error in handleSubscriptionUpdated ${subscription.id}: ${error.message}`,
        error.stack,
      );
    }
  }

  private async handleSubscriptionDeleted(subscription: any) {
    this.logger.log(
      `Subscription deleted event: ${subscription.id}, Status: ${subscription.status}`,
    );

    try {
      const metadata = subscription.metadata || {};
      const { membershipId, subscriberId } = metadata;

      if (!membershipId || !subscriberId) {
        this.logger.warn(
          `Missing metadata in subscription deleted event: ${subscription.id}. Cannot process update or chat access.`,
        );
        return;
      }

      this.logger.log(
        `Processing subscription deleted for: memberId=${membershipId}, subscriberId=${subscriberId}`,
      );

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
      await this.membershipsService.updateSubscriptionFromStripe(
        subscriberId,
        membershipId,
        subscription.id,
        updateData,
      );
      this.logger.log(
        'Subscription record updated from subscription_deleted event.',
      );

      this.logger.log(
        `Subscription ${subscription.id} deleted, calling handleExpiredSubscription.`,
      );
      try {
        await this.chatService.handleExpiredSubscription(
          subscriberId,
          membershipId,
        );
        this.logger.log(
          `ChatService.handleExpiredSubscription called for user ${subscriberId}, membership ${membershipId}`,
        );
      } catch (chatError) {
        this.logger.error(
          `Error calling handleExpiredSubscription after subscription_deleted: ${chatError.message}`,
          chatError.stack,
        );
      }
    } catch (error) {
      this.logger.error(
        `Error in handleSubscriptionDeleted ${subscription.id}: ${error.message}`,
        error.stack,
      );
    }
  }

  private async handleInvoicePaid(invoice: any) {
    this.logger.log(
      `Invoice paid event: ${invoice.id}, Subscription: ${invoice.subscription}`,
    );

    try {
      if (!invoice.subscription) {
        this.logger.log(
          `Invoice ${invoice.id} is not related to a subscription.`,
        );
        return;
      }

      const subscription =
        await this.paymentsService.stripe.subscriptions.retrieve(
          invoice.subscription,
        );
      this.logger.log(
        `Retrieved subscription ${subscription.id} related to invoice ${invoice.id}, Status: ${subscription.status}`,
      );

      const metadata = subscription.metadata || {};
      const { membershipId, subscriberId } = metadata;

      if (!membershipId || !subscriberId) {
        this.logger.warn(
          `Missing metadata for subscription ${subscription.id} linked to invoice ${invoice.id}. Cannot process update or chat access.`,
        );
        return;
      }

      const updateData = {
        currentPeriodStart: subscription.current_period_start,
        currentPeriodEnd: subscription.current_period_end,
        status: subscription.status,
      };
      await this.membershipsService.updateSubscriptionFromStripe(
        subscriberId,
        membershipId,
        subscription.id,
        updateData,
      );
      this.logger.log(
        `Subscription period/status updated for ${subscription.id} from invoice_paid event.`,
      );

      // Credit the creator for this payment (renewal)
      const subscriptionItem = subscription.items?.data[0];
      const priceAmount = subscriptionItem?.price?.unit_amount || 0;
      const paymentAmount = priceAmount / 100;
      if (paymentAmount > 0) {
        try {
          const creatorShare = this.membershipsService.calculateCreatorShare(paymentAmount);
          const membership = await this.membershipsService.getMembershipById(membershipId);
          if (membership?.creator) {
            const creatorField = membership.creator as any;
            const creatorId = creatorField._id ? creatorField._id.toString() : creatorField.toString();
            await this.membershipsService.creditCreatorForPayment(
              creatorId,
              creatorShare,
            );
            this.logger.log(
              `Credited creator for renewal payment: amount=${paymentAmount}, creatorShare=${creatorShare}, subscription=${subscription.id}`,
            );
          } else {
            this.logger.warn(
              `Could not find creator for membership ${membershipId} to credit payment.`,
            );
          }
        } catch (creditError) {
          this.logger.error(
            `Failed to credit creator for payment on subscription ${subscription.id}: ${creditError.message}`,
            creditError.stack,
          );
        }
      }

      if (subscription.status === 'active') {
        this.logger.log(
          `Subscription ${subscription.id} is active after invoice payment, ensuring chat access.`,
        );
        try {
          await this.chatService.handleNewSubscription(
            subscriberId,
            membershipId,
          );
          this.logger.log(
            `ChatService.handleNewSubscription called for user ${subscriberId}, membership ${membershipId}`,
          );
        } catch (chatError) {
          this.logger.error(
            `Error calling handleNewSubscription after invoice_paid: ${chatError.message}`,
            chatError.stack,
          );
        }
      } else {
        this.logger.log(
          `Subscription ${subscription.id} status (${subscription.status}) after invoice payment does not require chat update.`,
        );
      }
    } catch (error) {
      this.logger.error(
        `Error in handleInvoicePaid ${invoice.id}: ${error.message}`,
        error.stack,
      );
    }
  }

  private async handleInvoicePaymentFailed(invoice: any) {
    this.logger.log(
      `Invoice payment failed event: ${invoice.id}, Subscription: ${invoice.subscription}`,
    );

    try {
      if (!invoice.subscription) {
        this.logger.log(
          `Invoice ${invoice.id} is not related to a subscription.`,
        );
        return;
      }

      const subscription =
        await this.paymentsService.stripe.subscriptions.retrieve(
          invoice.subscription,
        );
      this.logger.log(
        `Retrieved subscription ${subscription.id} related to failed invoice ${invoice.id}, Status: ${subscription.status}`,
      );

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
        this.logger.warn(
          `Missing metadata for subscription ${subscription.id} linked to failed invoice ${invoice.id}. Updating status only if possible, but full update requires IDs.`,
        );
      }

      await this.membershipsService.updateSubscriptionFromStripe(
        subscriberId,
        membershipId,
        subscription.id,
        updateData,
      );
      this.logger.log(
        `Subscription record updated for ${subscription.id} from invoice_payment_failed event.`,
      );

      const isEffectivelyCancelled =
        subscription.status === 'canceled' ||
        subscription.status === 'incomplete_expired' ||
        subscription.status === 'past_due';

      if (isEffectivelyCancelled && membershipId && subscriberId) {
        this.logger.log(
          `Subscription ${subscription.id} became inactive (${subscription.status}) after payment failure, calling handleExpiredSubscription.`,
        );
        try {
          await this.chatService.handleExpiredSubscription(
            subscriberId,
            membershipId,
          );
          this.logger.log(
            `ChatService.handleExpiredSubscription called for user ${subscriberId}, membership ${membershipId}`,
          );
        } catch (chatError) {
          this.logger.error(
            `Error calling handleExpiredSubscription after invoice_payment_failed: ${chatError.message}`,
            chatError.stack,
          );
        }
      } else if (isEffectivelyCancelled) {
        this.logger.warn(
          `Cannot call handleExpiredSubscription for ${subscription.id}: Missing metadata.`,
        );
      }
    } catch (error) {
      this.logger.error(
        `Error in handleInvoicePaymentFailed ${invoice.id}: ${error.message}`,
        error.stack,
      );
    }
  }
}
