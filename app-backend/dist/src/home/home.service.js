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
exports.HomeService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const user_1 = require("../database/schemas/user");
const post_1 = require("../database/schemas/post");
const subscription_1 = require("../database/schemas/subscription");
const posts_service_1 = require("../posts/posts.service");
const memberships_service_1 = require("../memberships/memberships.service");
let HomeService = class HomeService {
    constructor(userModel, postModel, subscriptionModel, postsService, membershipsService) {
        this.userModel = userModel;
        this.postModel = postModel;
        this.subscriptionModel = subscriptionModel;
        this.postsService = postsService;
        this.membershipsService = membershipsService;
    }
    addGenderFilters(baseFilter, requestingUser) {
        const filter = { ...baseFilter };
        const genderConditions = [];
        console.log(requestingUser?.genderPreference);
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
                filter.$and = [...filter.$and, ...genderConditions];
            }
            else {
                filter.$and = genderConditions;
            }
        }
        return filter;
    }
    async getTopCreators(limit = 10, requestingUser) {
        const topCreatorIds = await this.subscriptionModel.aggregate([
            { $match: { status: 'active' } },
            { $group: { _id: '$creator', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: limit },
        ]);
        const creatorIds = topCreatorIds.map((item) => item._id);
        const baseFilter = {
            _id: { $in: creatorIds },
            isCreator: true,
            creatorStatus: user_1.CreatorStatus.PUBLISHED,
        };
        const finalFilter = this.addGenderFilters(baseFilter, requestingUser);
        console.log(finalFilter);
        const creators = await this.userModel
            .find(finalFilter)
            .select('displayName creatorUsername profilePicture creatorHeadline creatorCategory')
            .limit(limit);
        return creators;
    }
    async getPopularThisWeek(limit = 10, requestingUser) {
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        const popularPosts = await this.postModel.aggregate([
            {
                $match: {
                    createdAt: { $gte: oneWeekAgo },
                    status: post_1.PostStatus.PUBLISHED,
                    isDeleted: false,
                },
            },
            {
                $addFields: {
                    totalEngagement: {
                        $add: [
                            '$viewCount',
                            '$likeCount',
                            { $multiply: ['$commentCount', 2] },
                            { $multiply: ['$shareCount', 3] },
                        ],
                    },
                },
            },
            { $sort: { totalEngagement: -1 } },
            { $group: { _id: '$creator', engagement: { $sum: '$totalEngagement' } } },
            { $sort: { engagement: -1 } },
            { $limit: limit * 2 },
        ]);
        const creatorIds = popularPosts.map((item) => item._id);
        const baseFilter = {
            _id: { $in: creatorIds },
            isCreator: true,
            creatorStatus: user_1.CreatorStatus.PUBLISHED,
        };
        const finalFilter = this.addGenderFilters(baseFilter, requestingUser);
        const creators = await this.userModel
            .find(finalFilter)
            .select('displayName creatorUsername profilePicture creatorHeadline creatorCategory')
            .limit(limit);
        const creatorMap = new Map(creators.map((c) => [c._id.toString(), c]));
        const sortedCreators = creatorIds
            .map((id) => creatorMap.get(id.toString()))
            .filter(Boolean)
            .slice(0, limit);
        return sortedCreators;
    }
    async getTopCreatorsByCategory(category, limit = 10, requestingUser) {
        if (!category) {
            return [];
        }
        const baseFilter = {
            isCreator: true,
            creatorStatus: user_1.CreatorStatus.PUBLISHED,
            creatorCategory: category,
        };
        const finalFilter = this.addGenderFilters(baseFilter, requestingUser);
        const categoryCreators = await this.userModel
            .find(finalFilter)
            .select('displayName creatorUsername profilePicture creatorHeadline creatorCategory _id')
            .limit(limit * 2);
        const creatorIds = categoryCreators.map((creator) => creator._id);
        const subscriptionCounts = await this.subscriptionModel.aggregate([
            {
                $match: {
                    creator: { $in: creatorIds },
                    status: 'active',
                },
            },
            { $group: { _id: '$creator', count: { $sum: 1 } } },
        ]);
        const countMap = new Map();
        subscriptionCounts.forEach((item) => {
            countMap.set(item._id.toString(), item.count);
        });
        const sortedCreators = categoryCreators
            .sort((a, b) => {
            const countA = countMap.get(a._id.toString()) || 0;
            const countB = countMap.get(b._id.toString()) || 0;
            return countB - countA;
        })
            .slice(0, limit);
        return sortedCreators;
    }
    async getCategories() {
        const categories = await this.userModel.distinct('creatorCategory', {
            isCreator: true,
            creatorStatus: user_1.CreatorStatus.PUBLISHED,
            creatorCategory: { $ne: null },
        });
        return categories.filter(Boolean);
    }
    async getRecentlyVisitedCreators(userId, limit = 10, requestingUser) {
        const baseFilter = {
            isCreator: true,
            creatorStatus: user_1.CreatorStatus.PUBLISHED,
        };
        const finalFilter = this.addGenderFilters(baseFilter, requestingUser);
        const creators = await this.userModel
            .find(finalFilter)
            .select('displayName creatorUsername profilePicture _id')
            .limit(limit);
        return creators.map((creator) => {
            const randomDays = Math.floor(Math.random() * 7) + 1;
            const lastVisitedAt = new Date();
            lastVisitedAt.setDate(lastVisitedAt.getDate() - randomDays);
            return {
                _id: creator._id,
                displayName: creator.displayName,
                creatorUsername: creator.creatorUsername,
                profilePicture: creator.profilePicture,
                lastVisitedAt: lastVisitedAt.toISOString(),
            };
        });
    }
    async getSubscribedFeed(userId, page = 1, limit = 10, gender) {
        const subscriptions = await this.subscriptionModel.find({
            subscriber: userId,
            status: 'active',
        });
        const creatorIds = subscriptions.map((sub) => sub.creator);
        let filteredCreatorIds = creatorIds;
        if (gender) {
            const creators = await this.userModel
                .find({
                _id: { $in: creatorIds },
                $or: [
                    { contentVisibleTo: user_1.ContentVisibility.BOTH },
                    { contentVisibleTo: gender },
                ],
            })
                .select('_id');
            filteredCreatorIds = creators.map((creator) => creator._id);
        }
        const skip = (page - 1) * limit;
        const [posts, total] = await Promise.all([
            this.postModel
                .find({
                creator: { $in: filteredCreatorIds },
                status: post_1.PostStatus.PUBLISHED,
                isDeleted: false,
            })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .populate('creator', 'displayName creatorUsername profilePicture creatorCategory')
                .exec(),
            this.postModel.countDocuments({
                creator: { $in: filteredCreatorIds },
                status: post_1.PostStatus.PUBLISHED,
                isDeleted: false,
            }),
        ]);
        const accessPromises = posts.map((post) => this.postsService.checkPostAccessWithId(userId, post));
        const uniqueCreators = [];
        posts.forEach((post) => {
            const creatorId = post.creator.id;
            if (!uniqueCreators.includes(creatorId)) {
                uniqueCreators.push(creatorId);
            }
        });
        const hasAcccessObj = await Promise.all(accessPromises);
        const membershipTiersPromises = uniqueCreators.map((creator) => this.membershipsService.getCreatorMemberships(creator, {}));
        const membershipTiers = await Promise.all(membershipTiersPromises);
        const formattedPosts = posts.map((post) => {
            const hasAccess = hasAcccessObj.find((p) => p.postId === post.id).hasAccess;
            const postObj = post.toObject();
            delete postObj.comments;
            delete postObj.likes;
            let previewText = '';
            if (postObj.textContent) {
                previewText =
                    postObj.textContent.substring(0, 150) +
                        (postObj.textContent.length > 150 ? '...' : '');
            }
            else if (postObj.description) {
                previewText = postObj.description;
            }
            const creatorTier = membershipTiers.find((mt) => mt.creatorId === post.creator.id);
            const tierAccess = post.tierAccess
                .map((ta) => creatorTier.memberships.find((mt) => mt.id === ta))
                .filter((ta) => Boolean(ta));
            let thumbnail = postObj.thumbnailUrl;
            if (!thumbnail && postObj.mediaUrls && postObj.mediaUrls.length > 0) {
                thumbnail = postObj.mediaUrls[0];
            }
            const formattedPost = {
                ...postObj,
                hasAccess,
                tierAccess,
                id: postObj._id.toString(),
                previewText: hasAccess
                    ? previewText
                    : previewText.slice(0, 100) + '...',
                description: hasAccess
                    ? post.description || previewText
                    : (post.description || previewText).slice(0, 100) + '...',
                thumbnail,
                creator: {
                    id: postObj.creator._id,
                    displayName: postObj.creator.displayName ||
                        postObj.creator.creatorUsername,
                    profilePicture: postObj.creator.profilePicture,
                    username: postObj.creator.creatorUsername,
                    category: postObj.creator.creatorCategory,
                },
                likesCount: postObj.likeCount || 0,
                commentsCount: postObj.commentCount || 0,
                publishDate: this.formatDate(postObj.createdAt),
                postType: this.getReadablePostType(postObj.type),
                isRestrictedView: false,
            };
            return formattedPost;
        });
        return {
            posts: formattedPosts,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    formatDate(date) {
        const months = [
            'Jan',
            'Feb',
            'Mar',
            'Apr',
            'May',
            'Jun',
            'Jul',
            'Aug',
            'Sep',
            'Oct',
            'Nov',
            'Dec',
        ];
        const d = new Date(date);
        return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
    }
    getReadablePostType(type) {
        const typeMap = {
            text: 'Text',
            image: 'Picture',
            audio: 'Audio',
            video: 'Video',
            link: 'Link',
        };
        return typeMap[type] || type;
    }
};
exports.HomeService = HomeService;
exports.HomeService = HomeService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(user_1.User.name)),
    __param(1, (0, mongoose_1.InjectModel)(post_1.Post.name)),
    __param(2, (0, mongoose_1.InjectModel)(subscription_1.Subscription.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        posts_service_1.PostsService,
        memberships_service_1.MembershipsService])
], HomeService);
//# sourceMappingURL=home.service.js.map