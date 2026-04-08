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
exports.DiscountsController = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const promotions_service_1 = require("./promotions.service");
const promotions_dto_1 = require("./promotions.dto");
let DiscountsController = class DiscountsController {
    constructor(promotionsService) {
        this.promotionsService = promotionsService;
    }
    async createDiscount(req, createDiscountDto) {
        return this.promotionsService.createDiscount(req.user.userId, createDiscountDto);
    }
    async getDiscounts(req) {
        return {
            discounts: await this.promotionsService.getDiscounts(req.user.userId),
        };
    }
    async getDiscount(req, id) {
        return this.promotionsService.getDiscount(req.user.userId, id);
    }
    async updateDiscount(req, id, updateDiscountDto) {
        return this.promotionsService.updateDiscount(req.user.userId, id, updateDiscountDto);
    }
    async deleteDiscount(req, id) {
        return this.promotionsService.deleteDiscount(req.user.userId, id);
    }
    async generateCode() {
        return {
            code: this.promotionsService.generateRandomCode(),
        };
    }
    async validatePromotion(code) {
        return this.promotionsService.validatePromotion(code);
    }
    async redeemPromotion(req, redeemDto) {
        return this.promotionsService.redeemPromotion(req.user.userId, redeemDto);
    }
};
exports.DiscountsController = DiscountsController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)(new common_1.ValidationPipe())),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, promotions_dto_1.CreateDiscountDto]),
    __metadata("design:returntype", Promise)
], DiscountsController.prototype, "createDiscount", null);
__decorate([
    (0, common_1.Get)(),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DiscountsController.prototype, "getDiscounts", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], DiscountsController.prototype, "getDiscount", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)(new common_1.ValidationPipe())),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, promotions_dto_1.UpdateDiscountDto]),
    __metadata("design:returntype", Promise)
], DiscountsController.prototype, "updateDiscount", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], DiscountsController.prototype, "deleteDiscount", null);
__decorate([
    (0, common_1.Post)('generate-code'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], DiscountsController.prototype, "generateCode", null);
__decorate([
    (0, common_1.Post)('validate'),
    __param(0, (0, common_1.Body)('code')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DiscountsController.prototype, "validatePromotion", null);
__decorate([
    (0, common_1.Post)('redeem'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)(new common_1.ValidationPipe())),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, promotions_dto_1.RedeemPromotionDto]),
    __metadata("design:returntype", Promise)
], DiscountsController.prototype, "redeemPromotion", null);
exports.DiscountsController = DiscountsController = __decorate([
    (0, common_1.Controller)('promotions/discounts'),
    __metadata("design:paramtypes", [promotions_service_1.PromotionsService])
], DiscountsController);
//# sourceMappingURL=discounts.controller.js.map