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
exports.SearchService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const user_1 = require("../database/schemas/user");
const post_1 = require("../database/schemas/post");
let SearchService = class SearchService {
    constructor(userModel, postModel) {
        this.userModel = userModel;
        this.postModel = postModel;
    }
    addGenderFilters(baseFilter, requestingUser) {
        const filter = { ...baseFilter };
        const genderConditions = [];
        if (requestingUser?.genderPreference &&
            requestingUser.genderPreference !== user_1.GenderPreference.BOTH) {
            if (requestingUser.genderPreference === user_1.GenderPreference.MALE) {
                genderConditions.push({
                    $or: [{ gender: 'male' }, { gender: 'Male' }],
                });
            }
            else if (requestingUser.genderPreference === user_1.GenderPreference.FEMALE) {
                genderConditions.push({
                    $or: [{ gender: 'female' }, { gender: 'Female' }],
                });
            }
        }
        if (requestingUser?.gender) {
            const userGenderLower = requestingUser.gender.toLowerCase();
            if (userGenderLower === 'male' || userGenderLower === 'female') {
                genderConditions.push({
                    $or: [
                        { contentVisibleTo: user_1.ContentVisibility.BOTH },
                        { contentVisibleTo: userGenderLower },
                    ],
                });
            }
            else {
                genderConditions.push({ contentVisibleTo: user_1.ContentVisibility.BOTH });
            }
        }
        else {
            genderConditions.push({ contentVisibleTo: user_1.ContentVisibility.BOTH });
        }
        if (genderConditions.length > 0) {
            if (filter.$and) {
                filter.$and = Array.isArray(filter.$and)
                    ? [...filter.$and, ...genderConditions]
                    : [filter.$and, ...genderConditions];
            }
            else {
                filter.$and = genderConditions;
            }
        }
        return filter;
    }
    async search(query, category, requestingUser, fullSearch = true) {
        console.log(fullSearch);
        if (category && category !== 'all') {
            const creators = await this.searchCreators('', category, requestingUser);
            return { creators, posts: [] };
        }
        const [creators, posts] = await Promise.all([
            this.searchCreators(query, undefined, requestingUser),
            this.searchPosts(query),
        ]);
        return {
            creators,
            posts,
        };
    }
    async searchCreators(query, category, requestingUser) {
        let baseFilter = {
            isCreator: true,
            creatorStatus: user_1.CreatorStatus.PUBLISHED,
        };
        if (category && category !== 'all') {
            baseFilter.creatorCategory = category;
        }
        if (query && query.trim()) {
            const searchQuery = {
                $or: [
                    { displayName: { $regex: query, $options: 'i' } },
                    { creatorUsername: { $regex: query, $options: 'i' } },
                    { creatorHeadline: { $regex: query, $options: 'i' } },
                    { creatorCategory: { $regex: query, $options: 'i' } },
                ],
            };
            baseFilter = { $and: [baseFilter, searchQuery] };
        }
        const finalFilter = this.addGenderFilters(baseFilter, requestingUser);
        const creators = await this.userModel
            .find(finalFilter)
            .select('_id displayName creatorUsername profilePicture creatorHeadline creatorCategory')
            .limit(20);
        console.log({
            creators,
            finalFilter: JSON.stringify(finalFilter, null, 2),
        });
        return creators;
    }
    async searchPosts(query, category) {
        if (!query || query.trim() === '') {
            return [];
        }
        const filter = {
            status: post_1.PostStatus.PUBLISHED,
            isDeleted: false,
            isActive: true,
        };
        filter.$or = [
            { title: { $regex: query, $options: 'i' } },
            { description: { $regex: query, $options: 'i' } },
            { textContent: { $regex: query, $options: 'i' } },
            { tags: { $regex: query, $options: 'i' } },
        ];
        if (category && category !== 'all') {
            const creatorsWithCategory = await this.userModel
                .find({ creatorCategory: category })
                .select('_id');
            const creatorIds = creatorsWithCategory.map((creator) => creator._id);
            filter.creator = { $in: creatorIds };
        }
        const posts = await this.postModel
            .find(filter)
            .populate({
            path: 'creator',
            select: 'displayName creatorUsername profilePicture creatorCategory',
        })
            .select('_id title description textContent thumbnailUrl mediaUrls createdAt type tags')
            .sort({ createdAt: -1 })
            .limit(20);
        return posts.map((post) => {
            let content = '';
            if (post.textContent) {
                content =
                    post.textContent.substring(0, 150) +
                        (post.textContent.length > 150 ? '...' : '');
            }
            else if (post.description) {
                content = post.description;
            }
            let coverImage = post.thumbnailUrl;
            if (!coverImage && post.mediaUrls && post.mediaUrls.length > 0) {
                coverImage = post.mediaUrls[0];
            }
            return {
                _id: post._id,
                title: post.title,
                content,
                coverImage,
                type: post.type,
                creator: post.creator,
                createdAt: post.createdAt.toISOString(),
                tags: post.tags || [],
            };
        });
    }
};
exports.SearchService = SearchService;
exports.SearchService = SearchService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(user_1.User.name)),
    __param(1, (0, mongoose_1.InjectModel)(post_1.Post.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model])
], SearchService);
//# sourceMappingURL=search.service.js.map