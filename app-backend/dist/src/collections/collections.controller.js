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
exports.CollectionsController = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const platform_express_1 = require("@nestjs/platform-express");
const collections_service_1 = require("./collections.service");
const s3_service_1 = require("../s3/s3.service");
const config_1 = require("../config");
const collections_dto_1 = require("./collections.dto");
const optional_auth_guard_1 = require("../auth/optional-auth-guard");
let CollectionsController = class CollectionsController {
    constructor(collectionsService, s3Service) {
        this.collectionsService = collectionsService;
        this.s3Service = s3Service;
    }
    async getMyCollections(req) {
        try {
            const collections = await this.collectionsService.findByCreator(req.user.userId);
            return {
                collections,
                total: collections.length,
            };
        }
        catch (error) {
            throw new common_1.BadRequestException(`Failed to fetch collections: ${error.message}`);
        }
    }
    async updateCollection(req, id, updateCollectionDto, coverImage) {
        try {
            const collection = await this.collectionsService.findById(id);
            if (!collection) {
                throw new common_1.NotFoundException('Collection not found');
            }
            if (collection.creator._id.toString() !== req.user.userId) {
                throw new common_1.ForbiddenException('You can only update your own collections');
            }
            let coverImageUrl = collection.coverImage;
            if (coverImage) {
                try {
                    coverImageUrl = await this.s3Service.uploadFile(coverImage, 'collections', config_1.business.s3.defaultBucket);
                    if (collection.coverImage &&
                        collection.coverImage !== coverImageUrl) {
                        try {
                            await this.s3Service.deleteFile(collection.coverImage, 'patreon-clone-collections');
                        }
                        catch (error) {
                            console.error('Failed to delete old cover image:', error);
                        }
                    }
                }
                catch (error) {
                    throw new common_1.BadRequestException(`Failed to upload cover image: ${error.message}`);
                }
            }
            return this.collectionsService.update(req.user.userId, id, {
                ...updateCollectionDto,
                coverImage: coverImageUrl,
            });
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException ||
                error instanceof common_1.ForbiddenException) {
                throw error;
            }
            throw new common_1.BadRequestException(`Failed to update collection: ${error.message}`);
        }
    }
    async deleteCollection(req, id) {
        try {
            const collection = await this.collectionsService.findById(id);
            if (!collection) {
                throw new common_1.NotFoundException('Collection not found');
            }
            if (collection.creator._id.toString() !== req.user.userId) {
                throw new common_1.ForbiddenException('You can only delete your own collections');
            }
            await this.collectionsService.delete(id, req.user.userId);
            return { success: true, message: 'Collection deleted successfully' };
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException ||
                error instanceof common_1.ForbiddenException) {
                throw error;
            }
            throw new common_1.BadRequestException(`Failed to delete collection: ${error.message}`);
        }
    }
    async getCollectionsByCreator(creatorId) {
        try {
            const collections = await this.collectionsService.findByCreator(creatorId);
            return {
                collections,
                total: collections.length,
            };
        }
        catch (error) {
            throw new common_1.BadRequestException(`Failed to fetch collections: ${error.message}`);
        }
    }
    async getCreatorCollections(creatorId) {
        try {
            const collections = await this.collectionsService.findByCreator(creatorId);
            const formattedCollections = collections.map((collection) => ({
                id: collection._id.toString(),
                title: collection.title,
                description: collection.description || '',
                coverImage: collection.coverImage,
                postCount: collection.postCount,
                createdAt: collection.createdAt,
            }));
            return {
                collections: formattedCollections,
                total: collections.length,
            };
        }
        catch (error) {
            throw new common_1.BadRequestException(`Failed to fetch creator collections: ${error.message}`);
        }
    }
    async create(req, createCollectionDto, coverImage) {
        let coverImageUrl;
        if (coverImage) {
            try {
                coverImageUrl = await this.s3Service.uploadFile(coverImage, 'collections', config_1.business.s3.defaultBucket);
            }
            catch (error) {
                throw new common_1.BadRequestException(`Failed to upload cover image: ${error.message}`);
            }
        }
        return this.collectionsService.create(req.user.userId, createCollectionDto, coverImageUrl);
    }
    async getCollectionById(req, id) {
        try {
            const userId = req.user?.userId;
            const collection = await this.collectionsService.findById(id, userId);
            if (!collection) {
                throw new common_1.NotFoundException('Collection not found');
            }
            return collection;
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            throw new common_1.BadRequestException(`Failed to fetch collection: ${error.message}`);
        }
    }
    async addPostToCollection(req, id, addPostDto) {
        try {
            const result = await this.collectionsService.addPostToCollection(req.user.userId, id, addPostDto.postId);
            return {
                success: true,
                message: 'Post added to collection',
                collection: result,
            };
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException ||
                error instanceof common_1.ForbiddenException) {
                throw error;
            }
            throw new common_1.BadRequestException(`Failed to add post to collection: ${error.message}`);
        }
    }
    async removePostFromCollection(req, id, removePostDto) {
        try {
            const result = await this.collectionsService.removePostFromCollection(req.user.userId, id, removePostDto.postId);
            return {
                success: true,
                message: 'Post removed from collection',
                collection: result,
            };
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException ||
                error instanceof common_1.ForbiddenException) {
                throw error;
            }
            throw new common_1.BadRequestException(`Failed to remove post from collection: ${error.message}`);
        }
    }
    async getCollectionPosts(req, id, queryParams) {
        try {
            const userId = req.user?.userId;
            const result = await this.collectionsService.getCollectionPosts(id, queryParams, userId);
            return result;
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            throw new common_1.BadRequestException(`Failed to fetch collection posts: ${error.message}`);
        }
    }
};
exports.CollectionsController = CollectionsController;
__decorate([
    (0, common_1.Get)(),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CollectionsController.prototype, "getMyCollections", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('coverImage', {
        limits: {
            fileSize: 2 * 1024 * 1024,
        },
        fileFilter: (req, file, cb) => {
            if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
                return cb(new common_1.BadRequestException('Only image files are allowed!'), false);
            }
            cb(null, true);
        },
    })),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __param(3, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, collections_dto_1.UpdateCollectionDto, Object]),
    __metadata("design:returntype", Promise)
], CollectionsController.prototype, "updateCollection", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], CollectionsController.prototype, "deleteCollection", null);
__decorate([
    (0, common_1.Get)('by-creator/:creatorId'),
    __param(0, (0, common_1.Param)('creatorId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CollectionsController.prototype, "getCollectionsByCreator", null);
__decorate([
    (0, common_1.Get)('creator/:creatorId'),
    __param(0, (0, common_1.Param)('creatorId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CollectionsController.prototype, "getCreatorCollections", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('coverImage', {
        limits: {
            fileSize: 2 * 1024 * 1024,
        },
        fileFilter: (req, file, cb) => {
            if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
                return cb(new common_1.BadRequestException('Only image files are allowed!'), false);
            }
            cb(null, true);
        },
    })),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, collections_dto_1.CreateCollectionDto, Object]),
    __metadata("design:returntype", Promise)
], CollectionsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, common_1.UseGuards)(optional_auth_guard_1.OptionalJwtAuthGuard),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], CollectionsController.prototype, "getCollectionById", null);
__decorate([
    (0, common_1.Post)(':id/posts'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, collections_dto_1.AddPostToCollectionDto]),
    __metadata("design:returntype", Promise)
], CollectionsController.prototype, "addPostToCollection", null);
__decorate([
    (0, common_1.Delete)(':id/posts'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, collections_dto_1.RemovePostFromCollectionDto]),
    __metadata("design:returntype", Promise)
], CollectionsController.prototype, "removePostFromCollection", null);
__decorate([
    (0, common_1.Get)(':id/posts'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, collections_dto_1.GetCollectionPostsDto]),
    __metadata("design:returntype", Promise)
], CollectionsController.prototype, "getCollectionPosts", null);
exports.CollectionsController = CollectionsController = __decorate([
    (0, common_1.Controller)('collections'),
    __metadata("design:paramtypes", [collections_service_1.CollectionsService,
        s3_service_1.S3Service])
], CollectionsController);
//# sourceMappingURL=collections.controller.js.map