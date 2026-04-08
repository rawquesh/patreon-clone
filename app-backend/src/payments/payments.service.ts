import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import Stripe from 'stripe';
import { User } from '@/schemas/users.schema';

@Injectable()
export class PaymentsService {
  readonly stripe: Stripe;

  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private configService: ConfigService,
  ) {
    this.stripe = new Stripe(this.configService.get('STRIPE_SECRET_KEY'), {
      apiVersion: '2025-02-24.acacia',
    });
  }

  async createCustomerForSubscriber(
    userId: string,
    email: string,
  ): Promise<string> {
    const customer = await this.stripe.customers.create({
      email,
      metadata: {
        userId,
      },
    });

    await this.userModel.findByIdAndUpdate(userId, {
      stripeCustomerId: customer.id,
    });

    return customer.id;
  }

  async createConnectAccount(
    userId: string,
    email: string,
  ): Promise<{
    accountId: string;
    accountLinkUrl: string;
  }> {
    const account = await this.stripe.accounts.create({
      type: 'express',
      email,
      capabilities: {
        transfers: { requested: true },
      },
      business_type: 'individual',
      metadata: {
        userId,
      },
      settings: {
        payouts: {
          schedule: {
            interval: 'manual',
          },
        },
      },
    });

    const accountLink = await this.stripe.accountLinks.create({
      account: account.id,
      refresh_url: `${this.configService.get('FRONTEND_URL')}/creator/stripe/refresh`,
      return_url: `${this.configService.get('FRONTEND_URL')}/creator/stripe/complete`,
      type: 'account_onboarding',
      collect: 'currently_due',
    });

    return {
      accountId: account.id,
      accountLinkUrl: accountLink.url,
    };
  }

  async getConnectAccountStatus(userId: string): Promise<{
    isEnabled: boolean;
    requiresAction: boolean;
    actionNeeded?: string[];
  }> {
    const user = await this.userModel.findById(userId);
    if (!user?.stripeConnectAccountId) {
      throw new BadRequestException(
        'Creator has not started Stripe onboarding',
      );
    }

    const account = await this.stripe.accounts.retrieve(
      user.stripeConnectAccountId,
    );

    const actionNeeded = [];
    if (!account.charges_enabled || !account.payouts_enabled) {
      if (!account.details_submitted) {
        actionNeeded.push('complete_onboarding');
      }
      if (account.requirements?.currently_due?.length > 0) {
        actionNeeded.push('provide_additional_information');
      }
    }

    return {
      isEnabled: account.charges_enabled && account.payouts_enabled,
      requiresAction: actionNeeded.length > 0,
      actionNeeded: actionNeeded.length > 0 ? actionNeeded : undefined,
    };
  }

  async generateNewOnboardingLink(userId: string): Promise<string> {
    const user = await this.userModel.findById(userId);
    if (!user?.stripeConnectAccountId) {
      throw new BadRequestException('No Stripe Connect account found');
    }

    const accountLink = await this.stripe.accountLinks.create({
      account: user.stripeConnectAccountId,
      refresh_url: `${this.configService.get('FRONTEND_URL')}/creator/stripe/refresh`,
      return_url: `${this.configService.get('FRONTEND_URL')}/creator/stripe/complete`,
      type: 'account_onboarding',
      collect: 'eventually_due',
    });

    return accountLink.url;
  }

  async getPayoutBalance(userId: string): Promise<{
    available: number;
    pending: number;
  }> {
    const user = await this.userModel.findById(userId);
    if (!user?.stripeConnectAccountId) {
      throw new BadRequestException('No Stripe Connect account found');
    }

    const balance = await this.stripe.balance.retrieve({
      stripeAccount: user.stripeConnectAccountId,
    });

    return {
      available:
        balance.available.reduce((sum, bal) => sum + bal.amount, 0) / 100,
      pending: balance.pending.reduce((sum, bal) => sum + bal.amount, 0) / 100,
    };
  }

  async initiatePayoutToBank(userId: string, amount: number): Promise<void> {
    const user = await this.userModel.findById(userId);
    if (!user?.stripeConnectAccountId) {
      throw new BadRequestException('No Stripe Connect account found');
    }

    await this.stripe.payouts.create(
      {
        amount: Math.round(amount * 100),
        currency: 'usd',
      },
      {
        stripeAccount: user.stripeConnectAccountId,
      },
    );
  }

  async getPayoutHistory(userId: string): Promise<any[]> {
    const user = await this.userModel.findById(userId);
    if (!user?.stripeConnectAccountId) {
      throw new BadRequestException('No Stripe Connect account found');
    }

    try {
      const payouts = await this.stripe.payouts.list(
        { limit: 25 },
        { stripeAccount: user.stripeConnectAccountId },
      );

      // Transform into a more readable format
      return payouts.data.map((payout) => ({
        id: payout.id,
        amount: payout.amount / 100, // Convert from cents to dollars
        status: payout.status,
        createdAt: new Date(payout.created * 1000).toISOString(),
        arrivalDate: payout.arrival_date
          ? new Date(payout.arrival_date * 1000).toISOString()
          : null,
        description: payout.description || 'Payout to bank account',
        method: payout.method,
        type: payout.type,
      }));
    } catch (error) {
      throw new BadRequestException(
        `Failed to retrieve payout history: ${error.message}`,
      );
    }
  }
}
