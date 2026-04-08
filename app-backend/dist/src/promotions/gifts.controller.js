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
exports.GiftsController = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const promotions_service_1 = require("./promotions.service");
const promotions_dto_1 = require("./promotions.dto");
let GiftsController = class GiftsController {
    constructor(promotionsService) {
        this.promotionsService = promotionsService;
    }
    async createGift(req, createGiftDto) {
        return this.promotionsService.createGift(req.user.userId, createGiftDto);
    }
    async getGifts(req) {
        return {
            gifts: await this.promotionsService.getGifts(req.user.userId),
        };
    }
    async getGift(req, id) {
        return this.promotionsService.getGift(req.user.userId, id);
    }
    async updateGift(req, id, updateGiftDto) {
        return this.promotionsService.updateGift(req.user.userId, id, updateGiftDto);
    }
    async deleteGift(req, id) {
        return this.promotionsService.deleteGift(req.user.userId, id);
    }
    async generateCode() {
        return {
            code: this.promotionsService.generateRandomCode(),
        };
    }
};
exports.GiftsController = GiftsController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)(new common_1.ValidationPipe())),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, promotions_dto_1.CreateGiftDto]),
    __metadata("design:returntype", Promise)
], GiftsController.prototype, "createGift", null);
__decorate([
    (0, common_1.Get)(),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], GiftsController.prototype, "getGifts", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], GiftsController.prototype, "getGift", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)(new common_1.ValidationPipe())),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, promotions_dto_1.UpdateGiftDto]),
    __metadata("design:returntype", Promise)
], GiftsController.prototype, "updateGift", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], GiftsController.prototype, "deleteGift", null);
__decorate([
    (0, common_1.Post)('generate-code'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], GiftsController.prototype, "generateCode", null);
exports.GiftsController = GiftsController = __decorate([
    (0, common_1.Controller)('promotions/gifts'),
    __metadata("design:paramtypes", [promotions_service_1.PromotionsService])
], GiftsController);
//# sourceMappingURL=gifts.controller.js.map