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
exports.CollectionsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const collections_schema_1 = require("./collections.schema");
const post_1 = require("../database/schemas/post");
const memberships_service_1 = require("../memberships/memberships.service");
let CollectionsService = class CollectionsService {
    constructor(collectionModel, postModel, membershipsService) {
        this.collectionModel = collectionModel;
        this.postModel = postModel;
        this.membershipsService = membershipsService;
    }
    async create(creatorId, createCollectionDto, coverImageUrl) {
        const existingCollection = await this.collectionModel.findOne({
            creator: new mongoose_2.Types.ObjectId(creatorId),
            title: createCollectionDto.title,
            isDeleted: false,
        });
        if (existingCollection) {
            throw new common_1.ConflictException('Collection with this title already exists');
        }
        const collection = new this.collectionModel({
            ...createCollectionDto,
            creator: new mongoose_2.Types.ObjectId(creatorId),
            coverImage: coverImageUrl,
            posts: [],
        });
        return collection.save();
    }
    async findByCreator(creatorId, includeDeleted = false) {
        const filter = {
            creator: new mongoose_2.Types.ObjectId(creatorId),
        };
        if (!includeDeleted) {
            filter.isDeleted = false;
        }
        const collections = await this.collectionModel
            .find(filter)
            .sort({ createdAt: -1 })
            .populate('creator', 'displayName creatorUsername profilePicture')
            .exec();
        return collections;
    }
    async findById(id, userId) {
        const collection = await this.collectionModel
            .findById(id)
            .populate('creator', 'displayName creatorUsername profilePicture')
            .lean();
        if (!collection) {
            return null;
        }
        if (collection.posts && collection.posts.length > 0) {
            const filter = {
                _id: { $in: collection.posts },
                status: post_1.PostStatus.PUBLISHED,
                isDeleted: false,
            };
            const posts = await this.postModel
                .find(filter)
                .populate('creator')
                .sort({ createdAt: -1 })
                .exec();
            const tierAccessForCreator = await this.membershipsService.getCreatorMemberships(posts[0].creator._id.toString(), {});
            const transformedPosts = await Promise.all(posts.map(async (post) => {
                const hasAccess = await this.checkPostAccess(userId, post);
                const tierAccess = post.tierAccess.map((ta) => tierAccessForCreator.memberships.find((t) => t._id.toString() === ta));
                return {
                    ...this.filterPostForListing(post, hasAccess),
                    hasAccess,
                    tierAccess,
                };
            }));
            collection.posts = transformedPosts;
        }
        return collection;
    }
    async update(creatorId, collectionId, updateCollectionDto) {
        const collection = await this.collectionModel.findOne({
            _id: collectionId,
            creator: new mongoose_2.Types.ObjectId(creatorId),
        });
        if (!collection) {
            throw new common_1.NotFoundException('Collection not found');
        }
        if (updateCollectionDto.title &&
            updateCollectionDto.title !== collection.title) {
            const existingCollection = await this.collectionModel.findOne({
                creator: new mongoose_2.Types.ObjectId(creatorId),
                title: updateCollectionDto.title,
                _id: { $ne: collectionId },
                isDeleted: false,
            });
            if (existingCollection) {
                throw new common_1.ConflictException('Collection with this title already exists');
            }
        }
        return this.collectionModel.findByIdAndUpdate(collectionId, { $set: updateCollectionDto }, { new: true });
    }
    async addPostToCollection(userId, collectionId, postId) {
        const collection = await this.collectionModel.findOne({
            _id: new mongoose_2.Types.ObjectId(collectionId),
            creator: new mongoose_2.Types.ObjectId(userId),
            isDeleted: false,
        });
        if (!collection) {
            throw new common_1.NotFoundException('Collection not found or access denied');
        }
        const post = await this.postModel.findOne({
            _id: new mongoose_2.Types.ObjectId(postId),
            isDeleted: false,
        });
        if (!post) {
            throw new common_1.NotFoundException('Post not found');
        }
        if (post.creator.toString() !== userId) {
            throw new common_1.ForbiddenException('You can only add your own posts to collections');
        }
        const isPostInCollection = collection.posts.some((p) => p.toString() === postId);
        console.log(collectionId, postId, isPostInCollection);
        if (isPostInCollection) {
            return collection;
        }
        const updatedCollection = await this.collectionModel.findByIdAndUpdate(collectionId, {
            $addToSet: { posts: new mongoose_2.Types.ObjectId(postId) },
            $inc: { postCount: 1 },
        }, { new: true });
        await this.postModel.findByIdAndUpdate(postId, {
            $addToSet: { collections: new mongoose_2.Types.ObjectId(collectionId) },
        }, { new: true });
        return updatedCollection;
    }
    async removePostFromCollection(userId, collectionId, postId) {
        const collection = await this.collectionModel.findOne({
            _id: new mongoose_2.Types.ObjectId(collectionId),
            creator: new mongoose_2.Types.ObjectId(userId),
            isDeleted: false,
        });
        if (!collection) {
            throw new common_1.NotFoundException('Collection not found or access denied');
        }
        const isPostInCollection = collection.posts.some((p) => p.toString() === postId);
        if (!isPostInCollection) {
            throw new common_1.NotFoundException('Post is not in this collection');
        }
        const updatedCollection = await this.collectionModel.findByIdAndUpdate(collectionId, {
            $pull: { posts: new mongoose_2.Types.ObjectId(postId) },
            $inc: { postCount: -1 },
        }, { new: true });
        return updatedCollection;
    }
    async getCollectionPosts(collectionId, queryParams, userId) {
        const collection = await this.collectionModel
            .findOne({
            _id: new mongoose_2.Types.ObjectId(collectionId),
            isDeleted: false,
        })
            .populate('creator', 'displayName creatorUsername profilePicture');
        if (!collection) {
            throw new common_1.NotFoundException('Collection not found');
        }
        if (!collection.posts || collection.posts.length === 0) {
            return {
                posts: [],
                total: 0,
                pagination: {
                    page: 1,
                    limit: queryParams.limit || 10,
                    totalPages: 0,
                },
            };
        }
        const filter = {
            _id: { $in: collection.posts },
            status: post_1.PostStatus.PUBLISHED,
            isDeleted: false,
        };
        if (queryParams.types && queryParams.types.length > 0) {
            filter.type = { $in: queryParams.types };
        }
        const sort = {};
        sort[queryParams.sortBy || 'createdAt'] =
            (queryParams.sortOrder || 'desc') === 'desc' ? -1 : 1;
        const page = queryParams.page || 1;
        const limit = queryParams.limit || 10;
        const skip = (page - 1) * limit;
        const total = await this.postModel.countDocuments(filter);
        const posts = await this.postModel
            .find(filter)
            .populate('creator', 'displayName creatorUsername profilePicture isCreator')
            .sort(sort)
            .skip(skip)
            .limit(limit)
            .exec();
        const transformedPosts = await Promise.all(posts.map(async (post) => {
            const hasAccess = await this.checkPostAccess(userId, post);
            return this.filterPostForListing(post, hasAccess);
        }));
        return {
            posts: transformedPosts,
            total,
            pagination: {
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async checkPostAccess(userId, post) {
        if (!post.tierAccess || post.tierAccess.length === 0) {
            return true;
        }
        if (!userId) {
            return false;
        }
        const creatorId = typeof post.creator === 'object'
            ? post.creator._id.toString()
            : post.creator;
        if (creatorId === userId) {
            return true;
        }
        return false;
    }
    filterPostForListing(post, hasFullAccess) {
        const listingPost = post.toObject ? { ...post.toObject() } : { ...post };
        if (listingPost.creator && listingPost.creator instanceof mongoose_2.Types.ObjectId) {
            listingPost.creator = { _id: listingPost.creator };
        }
        else if (!listingPost.creator) {
            listingPost.creator = {};
        }
        if (!hasFullAccess) {
            switch (post.type) {
                case 'text':
                    listingPost.previewText = post.textContent?.substring(0, 150) + '...';
                    delete listingPost.textContent;
                    listingPost.description =
                        post.description?.substring(0, 150) +
                            (post.description?.length > 150 ? '...' : '');
                    break;
                case 'image':
                    if (listingPost.mediaUrls && listingPost.mediaUrls.length > 0) {
                        listingPost.thumbnailUrl = listingPost.mediaUrls[0];
                    }
                    delete listingPost.mediaUrls;
                    break;
                case 'video':
                    delete listingPost.videoUrl;
                    delete listingPost.videoId;
                    break;
                case 'audio':
                    delete listingPost.mediaUrls;
                    break;
                case 'link':
                    delete listingPost.linkUrl;
                    break;
            }
            delete listingPost.attachments;
            listingPost.isRestrictedView = true;
        }
        else {
            listingPost.isRestrictedView = false;
            if (post.textContent) {
                listingPost.previewText = post.textContent?.substring(0, 150) + '...';
            }
            else if (post.description) {
                listingPost.previewText = post.description?.substring(0, 150) + '...';
            }
            if (!listingPost.thumbnailUrl &&
                post.mediaUrls &&
                post.mediaUrls.length > 0 &&
                post.type === 'image') {
                listingPost.thumbnailUrl = post.mediaUrls[0];
            }
            if (post.type === 'video' &&
                post.thumbnailUrl &&
                !listingPost.thumbnailUrl) {
                listingPost.thumbnailUrl = post.thumbnailUrl;
            }
        }
        listingPost.id = listingPost._id?.toString();
        listingPost.publishDate = this.formatDate(listingPost.createdAt);
        listingPost.postType = this.getReadablePostType(listingPost.type);
        listingPost.likesCount = listingPost.likeCount || 0;
        listingPost.commentsCount = listingPost.commentCount || 0;
        listingPost.creator = {
            id: listingPost.creator?._id?.toString() || '',
            displayName: listingPost.creator?.displayName ||
                listingPost.creator?.creatorUsername ||
                'Unknown',
            profilePicture: listingPost.creator?.profilePicture,
            username: listingPost.creator?.creatorUsername || '',
            category: listingPost.creator?.creatorCategory || '',
        };
        delete listingPost.__v;
        return listingPost;
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
    async delete(id, userId) {
        const result = await this.collectionModel.deleteOne({
            _id: id,
            creator: userId,
        });
        if (result.deletedCount === 0) {
            throw new common_1.NotFoundException(`Collection not found or you don't have permission to delete it.`);
        }
        return result;
    }
};
exports.CollectionsService = CollectionsService;
exports.CollectionsService = CollectionsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(collections_schema_1.Collection.name)),
    __param(1, (0, mongoose_1.InjectModel)(post_1.Post.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        memberships_service_1.MembershipsService])
], CollectionsService);
//# sourceMappingURL=collections.service.js.map