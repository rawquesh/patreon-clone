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
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentsService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const stripe_1 = require("stripe");
const user_1 = require("../database/schemas/user");
const config_2 = require("../config");
let PaymentsService = class PaymentsService {
    constructor(userModel, configService) {
        this.userModel = userModel;
        this.configService = configService;
        this.stripe = new stripe_1.default(this.configService.get('STRIPE_SECRET_KEY'), {
            apiVersion: '2025-02-24.acacia',
        });
    }
    async createCustomerForSubscriber(userId, email) {
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
    async createConnectAccount(userId, email) {
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
            refresh_url: `${config_2.branding.frontendUrl}/creator/stripe/refresh`,
            return_url: `${config_2.branding.frontendUrl}/creator/stripe/complete`,
            type: 'account_onboarding',
            collect: 'currently_due',
        });
        return {
            accountId: account.id,
            accountLinkUrl: accountLink.url,
        };
    }
    async getConnectAccountStatus(userId) {
        const user = await this.userModel.findById(userId);
        if (!user?.stripeConnectAccountId) {
            throw new common_1.BadRequestException('Creator has not started Stripe onboarding');
        }
        const account = await this.stripe.accounts.retrieve(user.stripeConnectAccountId);
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
    async generateNewOnboardingLink(userId) {
        const user = await this.userModel.findById(userId);
        if (!user?.stripeConnectAccountId) {
            throw new common_1.BadRequestException('No Stripe Connect account found');
        }
        const accountLink = await this.stripe.accountLinks.create({
            account: user.stripeConnectAccountId,
            refresh_url: `${config_2.branding.frontendUrl}/creator/stripe/refresh`,
            return_url: `${config_2.branding.frontendUrl}/creator/stripe/complete`,
            type: 'account_onboarding',
            collect: 'eventually_due',
        });
        return accountLink.url;
    }
    async getPayoutBalance(userId) {
        const user = await this.userModel.findById(userId);
        if (!user?.stripeConnectAccountId) {
            throw new common_1.BadRequestException('No Stripe Connect account found');
        }
        const balance = await this.stripe.balance.retrieve({
            stripeAccount: user.stripeConnectAccountId,
        });
        return {
            available: balance.available.reduce((sum, bal) => sum + bal.amount, 0) / 100,
            pending: balance.pending.reduce((sum, bal) => sum + bal.amount, 0) / 100,
        };
    }
    async initiatePayoutToBank(userId, amount) {
        const user = await this.userModel.findById(userId);
        if (!user?.stripeConnectAccountId) {
            throw new common_1.BadRequestException('No Stripe Connect account found');
        }
        await this.stripe.payouts.create({
            amount: Math.round(amount * 100),
            currency: 'usd',
        }, {
            stripeAccount: user.stripeConnectAccountId,
        });
    }
    async getPayoutHistory(userId) {
        const user = await this.userModel.findById(userId);
        if (!user?.stripeConnectAccountId) {
            throw new common_1.BadRequestException('No Stripe Connect account found');
        }
        try {
            const payouts = await this.stripe.payouts.list({ limit: 25 }, { stripeAccount: user.stripeConnectAccountId });
            return payouts.data.map((payout) => ({
                id: payout.id,
                amount: payout.amount / 100,
                status: payout.status,
                createdAt: new Date(payout.created * 1000).toISOString(),
                arrivalDate: payout.arrival_date
                    ? new Date(payout.arrival_date * 1000).toISOString()
                    : null,
                description: payout.description || 'Payout to bank account',
                method: payout.method,
                type: payout.type,
            }));
        }
        catch (error) {
            throw new common_1.BadRequestException(`Failed to retrieve payout history: ${error.message}`);
        }
    }
};
exports.PaymentsService = PaymentsService;
exports.PaymentsService = PaymentsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(user_1.User.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        config_1.ConfigService])
], PaymentsService);
//# sourceMappingURL=payments.service.js.map