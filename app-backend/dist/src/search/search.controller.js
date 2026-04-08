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
exports.SearchController = void 0;
const common_1 = require("@nestjs/common");
const search_service_1 = require("./search.service");
const users_service_1 = require("../users/users.service");
let SearchController = class SearchController {
    constructor(searchService, usersService) {
        this.searchService = searchService;
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
            console.error('Error fetching requesting user for search:', error);
            return undefined;
        }
    }
    async search(query, req, category) {
        if ((!query || query.length < 2) && (!category || category === 'all')) {
            throw new common_1.BadRequestException('Search query must be at least 2 characters or a category must be specified');
        }
        const requestingUser = await this.getRequestingUser(req);
        const results = await this.searchService.search(query, category, requestingUser);
        return results;
    }
    async searchCreator(query, req, category) {
        if ((!query || query.length < 2) && (!category || category === 'all')) {
            throw new common_1.BadRequestException('Search query must be at least 2 characters or a category must be specified');
        }
        const requestingUser = await this.getRequestingUser(req);
        const creators = await this.searchService.searchCreators(query, category, requestingUser);
        return { creators };
    }
    async searchPosts(query, category) {
        if (!query || query.length < 2) {
            throw new common_1.BadRequestException('Search query must be at least 2 characters');
        }
        const posts = await this.searchService.searchPosts(query, category);
        return { posts };
    }
};
exports.SearchController = SearchController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('q')),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Query)('category')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String]),
    __metadata("design:returntype", Promise)
], SearchController.prototype, "search", null);
__decorate([
    (0, common_1.Get)('creator'),
    __param(0, (0, common_1.Query)('q')),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Query)('category')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String]),
    __metadata("design:returntype", Promise)
], SearchController.prototype, "searchCreator", null);
__decorate([
    (0, common_1.Get)('posts'),
    __param(0, (0, common_1.Query)('q')),
    __param(1, (0, common_1.Query)('category')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], SearchController.prototype, "searchPosts", null);
exports.SearchController = SearchController = __decorate([
    (0, common_1.Controller)('search'),
    __metadata("design:paramtypes", [search_service_1.SearchService,
        users_service_1.UsersService])
], SearchController);
//# sourceMappingURL=search.controller.js.map