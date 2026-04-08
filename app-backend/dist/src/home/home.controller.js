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
exports.HomeController = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const home_service_1 = require("./home.service");
const users_service_1 = require("../users/users.service");
const user_1 = require("../database/schemas/user");
let HomeController = class HomeController {
    constructor(homeService, usersService) {
        this.homeService = homeService;
        this.usersService = usersService;
    }
    async getRequestingUser(req) {
        if (!req.user?.userId) {
            return undefined;
        }
        try {
            const user = await this.usersService.findById(req.user.userId);
            if (!user)
                return undefined;
            return {
                userId: user._id.toString(),
                gender: user.gender,
                genderPreference: user.genderPreference,
            };
        }
        catch (error) {
            console.error('Error fetching requesting user for home:', error);
            return undefined;
        }
    }
    async getTopCreators(req, limit) {
        const requestingUser = await this.getRequestingUser(req);
        return this.homeService.getTopCreators(limit || 10, requestingUser);
    }
    async getPopularThisWeek(req, limit) {
        const requestingUser = await this.getRequestingUser(req);
        return this.homeService.getPopularThisWeek(limit || 10, requestingUser);
    }
    async getCategories() {
        return this.homeService.getCategories();
    }
    async getTopCreatorsByCategory(category, req, limit) {
        const requestingUser = await this.getRequestingUser(req);
        return this.homeService.getTopCreatorsByCategory(category, limit || 10, requestingUser);
    }
    async getRecentlyVisitedCreators(req, limit) {
        const requestingUser = await this.getRequestingUser(req);
        if (!requestingUser) {
            console.warn('Unauthenticated access to /home/recently-visited');
            return [];
        }
        return this.homeService.getRecentlyVisitedCreators(req.user.userId, limit || 10, requestingUser);
    }
    async getRecentlyVisitedCreatorsPublic(req, limit) {
        const genderPreference = req.user?.genderPreference || user_1.GenderPreference.BOTH;
        return this.homeService.getRecentlyVisitedCreators(undefined, limit || 10, genderPreference);
    }
    async getSubscribedFeed(req, page, limit) {
        console.log('SUBSCRIBED FEED');
        if (!req.user?.userId) {
            throw new common_1.UnauthorizedException('Authentication required');
        }
        return this.homeService.getSubscribedFeed(req.user.userId, page || 1, limit || 10);
    }
};
exports.HomeController = HomeController;
__decorate([
    (0, common_1.Get)('top-creators'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", Promise)
], HomeController.prototype, "getTopCreators", null);
__decorate([
    (0, common_1.Get)('popular-this-week'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", Promise)
], HomeController.prototype, "getPopularThisWeek", null);
__decorate([
    (0, common_1.Get)('categories'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], HomeController.prototype, "getCategories", null);
__decorate([
    (0, common_1.Get)('top-by-category'),
    __param(0, (0, common_1.Query)('category')),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Number]),
    __metadata("design:returntype", Promise)
], HomeController.prototype, "getTopCreatorsByCategory", null);
__decorate([
    (0, common_1.Get)('recently-visited'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", Promise)
], HomeController.prototype, "getRecentlyVisitedCreators", null);
__decorate([
    (0, common_1.Get)('recently-visited-public'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", Promise)
], HomeController.prototype, "getRecentlyVisitedCreatorsPublic", null);
__decorate([
    (0, common_1.Get)('subscribed-feed'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, Number]),
    __metadata("design:returntype", Promise)
], HomeController.prototype, "getSubscribedFeed", null);
exports.HomeController = HomeController = __decorate([
    (0, common_1.Controller)('home'),
    __metadata("design:paramtypes", [home_service_1.HomeService,
        users_service_1.UsersService])
], HomeController);
//# sourceMappingURL=home.controller.js.map