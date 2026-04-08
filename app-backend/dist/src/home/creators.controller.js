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
exports.CreatorsController = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const home_service_1 = require("./home.service");
const users_service_1 = require("../users/users.service");
const optional_auth_guard_1 = require("../auth/optional-auth-guard");
let CreatorsController = class CreatorsController {
    constructor(homeService, usersService) {
        this.homeService = homeService;
        this.usersService = usersService;
    }
    async getRequestingUser(req) {
        console.log(req.user);
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
            console.error('Error fetching requesting user:', error);
            return undefined;
        }
    }
    async getTopCreators(req, limit) {
        const requestingUser = await this.getRequestingUser(req);
        console.log(requestingUser);
        return this.homeService.getTopCreators(limit || 10, requestingUser);
    }
    async getPopularThisWeek(req, limit) {
        const requestingUser = await this.getRequestingUser(req);
        return this.homeService.getPopularThisWeek(limit || 10, requestingUser);
    }
    async getTopCreatorsByCategory(req, category, limit) {
        const requestingUser = await this.getRequestingUser(req);
        return this.homeService.getTopCreatorsByCategory(category, limit || 10, requestingUser);
    }
    async getRecentlyVisitedCreators(req, limit) {
        const requestingUser = await this.getRequestingUser(req);
        if (!requestingUser) {
            console.warn('Unauthenticated access to recently-visited creators.');
            return [];
        }
        return this.homeService.getRecentlyVisitedCreators(req.user.userId, limit || 10, requestingUser);
    }
    async getSubscribedFeed(req, page, limit) {
        if (!req.user?.userId) {
            throw new common_1.UnauthorizedException('Authentication required');
        }
        return this.homeService.getSubscribedFeed(req.user.userId, page || 1, limit || 10);
    }
};
exports.CreatorsController = CreatorsController;
__decorate([
    (0, common_1.Get)('top'),
    (0, common_1.UseGuards)(optional_auth_guard_1.OptionalJwtAuthGuard),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", Promise)
], CreatorsController.prototype, "getTopCreators", null);
__decorate([
    (0, common_1.Get)('popular-this-week'),
    (0, common_1.UseGuards)(optional_auth_guard_1.OptionalJwtAuthGuard),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", Promise)
], CreatorsController.prototype, "getPopularThisWeek", null);
__decorate([
    (0, common_1.Get)('top-by-category/:category'),
    (0, common_1.UseGuards)(optional_auth_guard_1.OptionalJwtAuthGuard),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('category')),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Number]),
    __metadata("design:returntype", Promise)
], CreatorsController.prototype, "getTopCreatorsByCategory", null);
__decorate([
    (0, common_1.Get)('recently-visited'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", Promise)
], CreatorsController.prototype, "getRecentlyVisitedCreators", null);
__decorate([
    (0, common_1.Get)('feed/subscribed'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, Number]),
    __metadata("design:returntype", Promise)
], CreatorsController.prototype, "getSubscribedFeed", null);
exports.CreatorsController = CreatorsController = __decorate([
    (0, common_1.Controller)('creators'),
    __metadata("design:paramtypes", [home_service_1.HomeService,
        users_service_1.UsersService])
], CreatorsController);
//# sourceMappingURL=creators.controller.js.map