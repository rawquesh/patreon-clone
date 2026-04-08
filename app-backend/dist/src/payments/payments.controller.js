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
exports.PayoutsController = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const payments_service_1 = require("../payments/payments.service");
let PayoutsController = class PayoutsController {
    constructor(paymentsService) {
        this.paymentsService = paymentsService;
    }
    async getAvailableAmount(req) {
        try {
            const creatorId = req.user.userId;
            const balance = await this.paymentsService.getPayoutBalance(creatorId);
            return {
                available: balance.available,
                pending: balance.pending,
            };
        }
        catch (error) {
            throw new common_1.BadRequestException(`Failed to fetch available balance: ${error.message}`);
        }
    }
    async createPayout(req) {
        try {
            const creatorId = req.user.userId;
            const balance = await this.paymentsService.getPayoutBalance(creatorId);
            if (balance.available <= 0) {
                throw new common_1.BadRequestException('No funds available for payout');
            }
            await this.paymentsService.initiatePayoutToBank(creatorId, balance.available);
            return {
                success: true,
                message: 'Payout initiated successfully',
                amount: balance.available,
                timestamp: new Date().toISOString(),
            };
        }
        catch (error) {
            throw new common_1.BadRequestException(`Failed to create payout: ${error.message}`);
        }
    }
    async getPayoutHistory(req) {
        try {
            const creatorId = req.user.userId;
            const payouts = await this.paymentsService.getPayoutHistory(creatorId);
            return {
                payouts,
                total: payouts.length,
            };
        }
        catch (error) {
            throw new common_1.BadRequestException(`Failed to fetch payout history: ${error.message}`);
        }
    }
};
exports.PayoutsController = PayoutsController;
__decorate([
    (0, common_1.Get)('available'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PayoutsController.prototype, "getAvailableAmount", null);
__decorate([
    (0, common_1.Post)('transfer'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PayoutsController.prototype, "createPayout", null);
__decorate([
    (0, common_1.Get)('history'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PayoutsController.prototype, "getPayoutHistory", null);
exports.PayoutsController = PayoutsController = __decorate([
    (0, common_1.Controller)('payments'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __metadata("design:paramtypes", [payments_service_1.PaymentsService])
], PayoutsController);
//# sourceMappingURL=payments.controller.js.map