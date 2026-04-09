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
exports.PostsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const post_1 = require("../database/schemas/post");
const posts_dto_1 = require("./posts.dto");
const subscription_1 = require("../database/schemas/subscription");
const s3_service_1 = require("../s3/s3.service");
const cheerio = require("cheerio");
const analytics_1 = require("../database/schemas/analytics");
const memberships_service_1 = require("../memberships/memberships.service");
const user_1 = require("../database/schemas/user");
const config_1 = require("../config");
let PostsService = class PostsService {
    constructor(postModel, userModel, subscriptionModel, postInsightModel, s3Service, membershipsService) {
        this.postModel = postModel;
        this.userModel = userModel;
        this.subscriptionModel = subscriptionModel;
        this.postInsightModel = postInsightModel;
        this.s3Service = s3Service;
        this.membershipsService = membershipsService;
    }
    async _processRichTextImages(htmlContent, creatorId, postId) {
        if (!htmlContent)
            return htmlContent;
        const $ = cheerio.load(htmlContent);
        const imgElements = $('img');
        const uploadPromises = [];
        imgElements.each((index, element) => {
            const img = $(element);
            const src = img.attr('src');
            if (src && src.startsWith('data:image/')) {
                const match = src.match(/^data:(image\/(png|jpeg|jpg|gif));base64,(.+)$/);
                if (match) {
                    const mimeType = match[1];
                    const fileExtension = match[2];
                    const base64Data = match[3];
                    const uploadPromise = (async () => {
                        try {
                            const buffer = Buffer.from(base64Data, 'base64');
                            const fileName = `rte-image-${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExtension}`;
                            const simulatedFile = {
                                fieldname: 'rte-image',
                                originalname: fileName,
                                encoding: 'base64',
                                mimetype: mimeType,
                                size: buffer.length,
                                buffer: buffer,
                                stream: null,
                                destination: '',
                                filename: '',
                                path: '',
                            };
                            const s3Folder = `posts/${postId || 'new'}/content-images`;
                            const s3Bucket = config_1.business.s3.defaultBucket;
                            const s3Url = await this.s3Service.uploadFile(simulatedFile, s3Folder, s3Bucket);
                            img.attr('src', s3Url);
                        }
                        catch (error) {
                            console.error(`Failed to upload embedded image to S3: ${error.message}. Keeping original base64.`);
                        }
                    })();
                    uploadPromises.push(uploadPromise);
                }
            }
        });
        await Promise.all(uploadPromises);
        return $('body').html();
    }
    async findById(id) {
        return this.postModel.findById(id).exec();
    }
    async findByCreator(creatorId, options = {}) {
        const query = this.postModel.find({
            creator: creatorId,
            isDeleted: false,
            ...(options.type && { type: options.type }),
            ...(options.status && { status: options.status }),
        });
        if (options.limit) {
            query.limit(options.limit);
        }
        if (options.offset) {
            query.skip(options.offset);
        }
        return query.sort({ createdAt: -1 }).exec();
    }
    async updatePost(id, updateData) {
        if (updateData.tags) {
            updateData.tags = this.processTags(updateData.tags);
        }
        if (updateData.collections) {
            updateData.collections = this.processTags(updateData.collections);
        }
        if (updateData.tierAccess) {
            updateData.tierAccess = this.processTags(updateData.tierAccess);
        }
        if (updateData.type === post_1.PostType.TEXT &&
            updateData.textContent !== undefined) {
            const existingPost = await this.findById(id);
            if (!existingPost)
                throw new common_1.NotFoundException('Post not found for update');
            const creatorId = existingPost.creator?._id?.toString() ||
                existingPost.creator?.toString();
            if (!creatorId) {
                throw new Error('Cannot process images without creator ID.');
            }
            updateData.textContent = await this._processRichTextImages(updateData.textContent, creatorId, id);
        }
        const post = await this.postModel
            .findByIdAndUpdate(id, { $set: updateData }, { new: true })
            .populate('creator', 'displayName creatorUsername profilePicture status type')
            .exec();
        if (!post) {
            throw new common_1.NotFoundException('Post not found');
        }
        return post;
    }
    async softDelete(id) {
        return this.postModel
            .findByIdAndUpdate(id, { isDeleted: true }, { new: true })
            .exec();
    }
    async createTextPost(createPostData) {
        if (createPostData.type === post_1.PostType.TEXT && !createPostData.textContent) {
            throw new common_1.BadRequestException('Text content is required for text posts');
        }
        let processedTextContent = createPostData.textContent;
        if (processedTextContent) {
            processedTextContent = await this._processRichTextImages(processedTextContent, createPostData.creator, `creator-${createPostData.creator}`);
        }
        const processedTags = this.processTags(createPostData.tags);
        const processedCollections = this.processTags(createPostData.collections);
        const processedTierAccess = this.processTags(createPostData.tierAccess);
        const postData = {
            ...createPostData,
            creator: new mongoose_2.Types.ObjectId(createPostData.creator),
            textContent: processedTextContent,
            tags: processedTags,
            collections: processedCollections,
            tierAccess: processedTierAccess,
            attachments: createPostData.attachments,
            status: createPostData.status || post_1.PostStatus.PUBLISHED,
        };
        const post = new this.postModel(postData);
        const savedPost = await post.save();
        if (processedTextContent !== createPostData.textContent) {
            try {
                const finalContent = await this._processRichTextImages(processedTextContent, createPostData.creator, savedPost._id.toString());
                if (finalContent !== processedTextContent) {
                    savedPost.textContent = finalContent;
                    await savedPost.save();
                }
            }
            catch (reprocessError) {
                console.error(`Post ${savedPost._id}: Failed to re-process/update S3 paths after save: ${reprocessError.message}`);
            }
        }
        return savedPost;
    }
    async createVideoPost(userId, createVideoPostDto, attachments) {
        const { videoUrl, title, description, tags, collections, tierAccess, status, } = createVideoPostDto;
        if (!videoUrl) {
            throw new common_1.BadRequestException('Video URL is required');
        }
        let videoInfo = this.extractVideoInfo(videoUrl);
        if (!videoInfo.isValid) {
            const isS3Upload = videoUrl.includes('amazonaws.com/') ||
                videoUrl.includes(config_1.business.s3.defaultBucket);
            if (isS3Upload) {
                videoInfo = {
                    isValid: true,
                    platform: 'upload',
                    videoId: undefined,
                    thumbnailUrl: undefined,
                };
            }
            else {
                throw new common_1.BadRequestException('Invalid video URL. Supported platforms: YouTube, Vimeo, or upload a video file.');
            }
        }
        const processedTags = this.processTags(tags);
        const processedCollections = this.processTags(collections);
        const processedTierAccess = this.processTags(tierAccess);
        const post = new this.postModel({
            type: post_1.PostType.VIDEO,
            creator: new mongoose_2.Types.ObjectId(userId),
            title,
            description,
            videoUrl,
            videoId: videoInfo.videoId,
            videoProvider: videoInfo.platform,
            thumbnailUrl: videoInfo.thumbnailUrl,
            tags: processedTags,
            collections: processedCollections,
            tierAccess: processedTierAccess,
            attachments: attachments?.map((attachment) => ({
                ...attachment,
                uploadedAt: attachment.uploadedAt || new Date(),
            })),
            status: status || post_1.PostStatus.PUBLISHED,
        });
        return post.save();
    }
    extractVideoInfo(url) {
        try {
            if (url.includes('youtube.com') || url.includes('youtu.be')) {
                let videoId = '';
                if (url.includes('youtube.com/watch?v=')) {
                    videoId = url.split('watch?v=')[1].split('&')[0];
                }
                else if (url.includes('youtu.be/')) {
                    videoId = url.split('youtu.be/')[1].split('?')[0];
                }
                if (!videoId) {
                    return { isValid: false };
                }
                return {
                    isValid: true,
                    platform: 'youtube',
                    videoId,
                    thumbnailUrl: `${config_1.branding.video.youtubeThumbnailBase}/${videoId}/maxresdefault.jpg`,
                };
            }
            else if (url.includes('vimeo.com')) {
                const videoId = url.split('vimeo.com/')[1].split('?')[0];
                if (!videoId) {
                    return { isValid: false };
                }
                return {
                    isValid: true,
                    platform: 'vimeo',
                    videoId,
                    thumbnailUrl: '',
                };
            }
            return { isValid: false };
        }
        catch (error) {
            console.error('Error extracting video info:', error);
            return { isValid: false };
        }
    }
    async createAudioPost(userId, createAudioPostDto, audioFileUrl, attachments) {
        const { title, description, collections, tags, tierAccess, status } = createAudioPostDto;
        const processedTags = this.processTags(tags);
        const processedCollections = this.processTags(collections);
        const processedTierAccess = this.processTags(tierAccess);
        const post = new this.postModel({
            type: post_1.PostType.AUDIO,
            creator: new mongoose_2.Types.ObjectId(userId),
            title,
            description,
            mediaUrls: [audioFileUrl],
            attachments: attachments?.map((attachment) => ({
                ...attachment,
                uploadedAt: attachment.uploadedAt || new Date(),
            })),
            collections: processedCollections,
            tags: processedTags,
            tierAccess: processedTierAccess,
            status: status || post_1.PostStatus.PUBLISHED,
        });
        return post.save();
    }
    async createImagePost(userId, createImagePostDto, imageUrls, attachments) {
        const { title, description, collections, tags, tierAccess, status, thumbnailUrl, } = createImagePostDto;
        const processedTags = this.processTags(tags);
        const processedCollections = this.processTags(collections);
        const processedTierAccess = this.processTags(tierAccess);
        const post = new this.postModel({
            type: post_1.PostType.IMAGE,
            creator: new mongoose_2.Types.ObjectId(userId),
            title,
            description,
            mediaUrls: imageUrls,
            attachments: attachments?.map((attachment) => ({
                ...attachment,
                uploadedAt: attachment.uploadedAt || new Date(),
            })),
            collections: processedCollections,
            tags: processedTags,
            tierAccess: processedTierAccess,
            status: status || post_1.PostStatus.PUBLISHED,
            thumbnailUrl,
        });
        return post.save();
    }
    async createLinkPost(userId, createLinkPostDto, attachments) {
        const { title, linkUrl, description, collections, tags, tierAccess, status, } = createLinkPostDto;
        const processedTags = this.processTags(tags);
        const processedCollections = this.processTags(collections);
        const processedTierAccess = this.processTags(tierAccess);
        const post = new this.postModel({
            type: post_1.PostType.LINK,
            creator: new mongoose_2.Types.ObjectId(userId),
            title,
            description,
            linkUrl,
            attachments: attachments?.map((attachment) => ({
                ...attachment,
                uploadedAt: attachment.uploadedAt || new Date(),
            })),
            collections: processedCollections,
            tags: processedTags,
            tierAccess: processedTierAccess,
            status: status || post_1.PostStatus.PUBLISHED,
        });
        return post.save();
    }
    async findPublishedPosts(fetchPostsDto, userId, creatorId) {
        const { page = 1, limit = 10, sortBy = posts_dto_1.SortBy.CREATED_AT, sortOrder = posts_dto_1.SortOrder.DESC, types: postTypes, tierAccess, search, collections, tags, datePublished, } = fetchPostsDto;
        let types;
        if (typeof postTypes === 'string') {
            try {
                types = JSON.parse(postTypes);
            }
            catch (e) {
                types = postTypes ? [postTypes] : undefined;
            }
        }
        else {
            types = postTypes;
        }
        const skip = (page - 1) * limit;
        const filter = {
            status: post_1.PostStatus.PUBLISHED,
            isDeleted: false,
            isActive: true,
        };
        if (creatorId) {
            filter.creator = new mongoose_2.Types.ObjectId(creatorId);
        }
        if (types?.length) {
            filter.type = { $in: types };
        }
        if (datePublished && datePublished !== 'All time') {
            const now = new Date();
            let startDate;
            switch (datePublished) {
                case 'week':
                    startDate = new Date(now);
                    startDate.setDate(now.getDate() - now.getDay());
                    startDate.setHours(0, 0, 0, 0);
                    break;
                case 'month':
                    startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                    break;
                case 'year':
                    startDate = new Date(now.getFullYear(), 0, 1);
                    break;
            }
            if (startDate) {
                filter.createdAt = { $gte: startDate };
            }
        }
        if (tierAccess?.length) {
            const specialFilter = typeof tierAccess === 'string'
                ? JSON.parse(tierAccess)[0]
                : tierAccess[0];
            if (specialFilter === 'Free Members') {
                filter.tierAccess = { $size: 0 };
            }
            else if (specialFilter === 'Paid only') {
                filter.tierAccess = { $not: { $size: 0 } };
            }
        }
        if (collections?.length) {
            const parsedCollections = this.processTags(collections);
            filter.collections = { $in: parsedCollections };
        }
        if (tags?.length) {
            const parsedTags = this.processTags(tags);
            filter.tags = { $in: parsedTags };
        }
        if (search) {
            filter.$text = { $search: search };
        }
        const sort = {};
        sort[sortBy] = sortOrder === posts_dto_1.SortOrder.ASC ? 1 : -1;
        const [posts, total] = await Promise.all([
            this.postModel
                .find(filter)
                .populate('creator', 'displayName profilePicture creatorUsername type status textContent')
                .sort(sort)
                .skip(skip)
                .limit(limit)
                .exec(),
            this.postModel.countDocuments(filter),
        ]);
        return { posts, total };
    }
    async findPublishedPostsByCreator(creatorId, fetchPostsDto, userId) {
        return this.findPublishedPosts(fetchPostsDto, userId, creatorId);
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
                case post_1.PostType.TEXT:
                    listingPost.previewText = post.previewText;
                    delete listingPost.textContent;
                    listingPost.description = post.description;
                    break;
                case post_1.PostType.IMAGE:
                    listingPost.mediaUrls = [];
                    post.mediaUrls = [];
                    listingPost.textContent = (post.textContent ||
                        post.description ||
                        '').slice(0, 100);
                    post.textContent = (post.textContent || post.description || '').slice(0, 100);
                    listingPost.description = (post.textContent ||
                        post.description ||
                        '').slice(0, 100);
                    post.description = (post.textContent || post.description || '').slice(0, 100);
                    listingPost.previewText = (post.textContent ||
                        post.description ||
                        '').slice(0, 100);
                    post.previewText = (post.textContent || post.description || '').slice(0, 100);
                    break;
                case post_1.PostType.VIDEO:
                    delete listingPost.videoUrl;
                    delete listingPost.videoId;
                    listingPost.textContent =
                        (post.textContent || post.description || '').slice(0, 100) + '...';
                    post.textContent =
                        (post.textContent || post.description || '').slice(0, 100) + '...';
                    listingPost.description =
                        (post.textContent || post.description || '').slice(0, 100) + '...';
                    post.description = (post.textContent || post.description || '').slice(0, 100);
                    listingPost.previewText =
                        (post.textContent || post.description || '').slice(0, 100) + '...';
                    post.previewText =
                        (post.textContent || post.description || '').slice(0, 100) + '...';
                    break;
                case post_1.PostType.AUDIO:
                    delete listingPost.mediaUrls;
                    delete post.mediaUrls;
                    delete listingPost.audioUrl;
                    listingPost.textContent =
                        (post.textContent || post.description || '').slice(0, 100) + '...';
                    post.textContent =
                        (post.textContent || post.description || '').slice(0, 100) + '...';
                    listingPost.description =
                        (post.textContent || post.description || '').slice(0, 100) + '...';
                    post.description =
                        (post.textContent || post.description || '').slice(0, 100) + '...';
                    listingPost.previewText =
                        (post.textContent || post.description || '').slice(0, 100) + '...';
                    post.previewText =
                        (post.textContent || post.description || '').slice(0, 100) + '...';
                    break;
                case post_1.PostType.LINK:
                    delete listingPost.linkUrl;
                    console.log('Slicing text content');
                    console.log({ post });
                    listingPost.textContent =
                        (post.textContent || post.description || '').slice(0, 100) + '...';
                    post.textContent =
                        (post.textContent || post.description || '').slice(0, 100) + '...';
                    listingPost.description =
                        (post.textContent || post.description || '').slice(0, 100) + '...';
                    post.description =
                        (post.textContent || post.description || '').slice(0, 100) + '...';
                    listingPost.previewText =
                        (post.textContent || post.description || '').slice(0, 100) + '...';
                    post.previewText =
                        (post.textContent || post.description || '').slice(0, 100) + '...';
                    console.log(listingPost);
                    break;
            }
            delete listingPost.attachments;
            listingPost.isRestrictedView = true;
        }
        else {
            listingPost.isRestrictedView = false;
            if (post.textContent) {
                listingPost.previewText = post.previewText;
            }
            else if (post.description) {
                listingPost.previewText = post.previewText;
            }
            if (post.mediaUrls &&
                post.mediaUrls.length > 0 &&
                post.type === post_1.PostType.IMAGE) {
                listingPost.thumbnailUrl = post.mediaUrls[0];
            }
            if (post.type === post_1.PostType.VIDEO &&
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
        listingPost.mediaUrls = post.mediaUrls || [];
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
        delete listingPost.likes;
        return listingPost;
    }
    async permanentDelete(id) {
        console.log('permanentDelete', id);
        await this.postModel.deleteOne({ _id: id });
    }
    async hasUserLikedPost(userId, postId) {
        const post = await this.postModel.findOne({
            _id: new mongoose_2.Types.ObjectId(postId),
            'likes.user': new mongoose_2.Types.ObjectId(userId),
        });
        return !!post;
    }
    async likePost(userId, postId) {
        const post = await this.postModel.findById(postId);
        if (!post)
            throw new common_1.NotFoundException('Post not found');
        const hasLiked = await this.hasUserLikedPost(userId, postId);
        if (hasLiked)
            return;
        await this.postModel.updateOne({ _id: new mongoose_2.Types.ObjectId(postId) }, {
            $push: {
                likes: { user: new mongoose_2.Types.ObjectId(userId), createdAt: new Date() },
            },
            $inc: { likeCount: 1 },
        });
        try {
            const now = new Date();
            now.setHours(0, 0, 0, 0);
            const existingInsight = await this.postInsightModel.findOne({
                post: new mongoose_2.Types.ObjectId(postId),
                date: now,
            });
            if (existingInsight) {
                await this.postInsightModel.updateOne({ _id: existingInsight._id }, { $inc: { engagements: 1 } });
            }
            else {
                await this.postInsightModel.create({
                    post: new mongoose_2.Types.ObjectId(postId),
                    creator: post.creator,
                    date: now,
                    impressions: 0,
                    engagements: 1,
                });
            }
        }
        catch (error) {
            console.error('Error updating analytics for like:', error);
        }
    }
    async unlikePost(userId, postId) {
        const post = await this.postModel.findById(postId);
        if (!post)
            throw new common_1.NotFoundException('Post not found');
        const hasLiked = await this.hasUserLikedPost(userId, postId);
        if (!hasLiked)
            return;
        await this.postModel.updateOne({ _id: new mongoose_2.Types.ObjectId(postId) }, {
            $pull: { likes: { user: new mongoose_2.Types.ObjectId(userId) } },
            $inc: { likeCount: -1 },
        });
    }
    async addComment(userId, postId, commentText, parentId) {
        const post = await this.postModel.findById(postId);
        if (!post)
            throw new common_1.NotFoundException('Post not found');
        const commentId = new mongoose_2.Types.ObjectId();
        const now = new Date();
        const comment = {
            _id: commentId,
            user: new mongoose_2.Types.ObjectId(userId),
            text: commentText,
            createdAt: now,
            likes: [],
        };
        if (parentId) {
            const parentComment = post.comments?.find((c) => c._id.toString() === parentId);
            if (!parentComment)
                throw new common_1.NotFoundException('Parent comment not found');
            comment.parentComment = new mongoose_2.Types.ObjectId(parentId);
        }
        await this.postModel.updateOne({ _id: new mongoose_2.Types.ObjectId(postId) }, {
            $push: { comments: comment },
            $inc: { commentCount: 1 },
        });
        return comment;
    }
    async getComments(postId) {
        const post = await this.postModel
            .findById(postId)
            .populate('comments.user', 'displayName profilePicture');
        if (!post)
            throw new common_1.NotFoundException('Post not found');
        return post.comments || [];
    }
    async getPostLikes(postId) {
        const post = await this.postModel
            .findById(postId)
            .populate('likes.user', 'displayName firstName lastName profilePicture');
        if (!post) {
            throw new common_1.NotFoundException('Post not found');
        }
        const likes = post.likes || [];
        return likes.map((like) => ({
            id: like._id.toString(),
            user: {
                id: like.user._id.toString(),
                displayName: like.user.displayName ||
                    `${like.user.firstName || ''} ${like.user.lastName || ''}`.trim() ||
                    'User',
                profilePicture: like.user.profilePicture,
            },
            createdAt: like.createdAt,
        }));
    }
    async getPostComments(postId, userId) {
        const post = await this.postModel
            .findById(postId)
            .populate('comments.user', 'displayName firstName lastName profilePicture')
            .populate('comments.likes.user', 'displayName firstName lastName profilePicture');
        if (!post) {
            throw new common_1.NotFoundException('Post not found');
        }
        const comments = post.comments || [];
        comments.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        return comments.map((comment) => {
            const isLiked = userId
                ? comment.likes?.some((like) => like.user._id.toString() === userId)
                : false;
            const likesCount = comment.likes?.length || 0;
            return {
                id: comment._id.toString(),
                text: comment.text,
                user: {
                    id: comment.user._id.toString(),
                    displayName: comment.user.displayName ||
                        `${comment.user.firstName || ''} ${comment.user.lastName || ''}`.trim() ||
                        'User',
                    profilePicture: comment.user.profilePicture,
                },
                createdAt: comment.createdAt,
                updatedAt: comment.updatedAt || comment.createdAt,
                likesCount,
                isLiked,
                parentId: comment.parentComment?.toString(),
            };
        });
    }
    async getPostCount(creatorId, status = post_1.PostStatus.PUBLISHED) {
        return this.postModel.countDocuments({
            creator: new mongoose_2.Types.ObjectId(creatorId),
            status,
            isDeleted: false,
        });
    }
    async checkPostAccess(userId, post) {
        try {
            console.log(post.tierAccess);
            if (!userId) {
                return false;
            }
            let creatorId;
            if (typeof post.creator === 'object' && post.creator !== null) {
                creatorId =
                    post.creator._id?.toString() || post.creator.id;
            }
            else {
                creatorId = post.creator?.toString();
            }
            console.log({ creatorId });
            if (creatorId === userId) {
                return true;
            }
            if (!post.tierAccess || post.tierAccess.length === 0) {
                return true;
            }
            if (post.title === 'Thumbnailtest') {
            }
            if (!creatorId) {
                return false;
            }
            const requiredTierObjectIds = post.tierAccess
                .map((id) => {
                try {
                    return new mongoose_2.Types.ObjectId(id);
                }
                catch (e) {
                    console.error(`Invalid tier ID format in post ${post._id}: ${id}`);
                    return null;
                }
            })
                .filter((id) => id !== null);
            if (requiredTierObjectIds.length === 0 && post.tierAccess.length > 0) {
                console.warn(`Post ${post._id} has tierAccess defined but contains invalid IDs.`);
                return false;
            }
            if (requiredTierObjectIds.length === 0)
                return true;
            const subscription = await this.subscriptionModel.findOne({
                subscriber: new mongoose_2.Types.ObjectId(userId),
                creator: new mongoose_2.Types.ObjectId(creatorId),
                status: 'active',
                membership: { $in: requiredTierObjectIds },
            });
            return !!subscription;
        }
        catch (error) {
            console.error(`Error in checkPostAccess for post ${post._id}:`, error);
            return false;
        }
    }
    async checkPostAccessWithId(userId, post) {
        try {
            console.log(post.tierAccess);
            if (!userId) {
                return {
                    hasAccess: false,
                    postId: post.id,
                };
            }
            let creatorId;
            if (typeof post.creator === 'object' && post.creator !== null) {
                creatorId =
                    post.creator._id?.toString() || post.creator.id;
            }
            else {
                creatorId = post.creator?.toString();
            }
            console.log({ creatorId });
            if (creatorId === userId) {
                return {
                    hasAccess: true,
                    postId: post.id,
                };
            }
            if (!post.tierAccess || post.tierAccess.length === 0) {
                return {
                    hasAccess: true,
                    postId: post.id,
                };
            }
            if (post.title === 'Thumbnailtest') {
            }
            if (!creatorId) {
                return {
                    hasAccess: false,
                    postId: post.id,
                };
            }
            const requiredTierObjectIds = post.tierAccess
                .map((id) => {
                try {
                    return new mongoose_2.Types.ObjectId(id);
                }
                catch (e) {
                    console.error(`Invalid tier ID format in post ${post._id}: ${id}`);
                    return null;
                }
            })
                .filter((id) => id !== null);
            if (requiredTierObjectIds.length === 0 && post.tierAccess.length > 0) {
                console.warn(`Post ${post._id} has tierAccess defined but contains invalid IDs.`);
                return {
                    hasAccess: false,
                    postId: post.id,
                };
            }
            if (requiredTierObjectIds.length === 0)
                return {
                    hasAccess: true,
                    postId: post.id,
                };
            const subscription = await this.subscriptionModel.findOne({
                subscriber: new mongoose_2.Types.ObjectId(userId),
                creator: new mongoose_2.Types.ObjectId(creatorId),
                status: 'active',
                membership: { $in: requiredTierObjectIds },
            });
            return { hasAccess: !!subscription, postId: post.id };
        }
        catch (error) {
            console.error(`Error in checkPostAccess for post ${post._id}:`, error);
            return {
                hasAccess: false,
                postId: post.id,
            };
        }
    }
    async hasUserLikedComment(userId, commentId) {
        const post = await this.postModel.findOne({
            'comments._id': new mongoose_2.Types.ObjectId(commentId),
        });
        if (!post)
            return false;
        const comment = post.comments.find((c) => c._id.toString() === commentId);
        if (!comment || !comment.likes)
            return false;
        return comment.likes.some((like) => like.user.toString() === userId);
    }
    async likeComment(userId, postId, commentId) {
        const post = await this.postModel.findById(postId);
        if (!post)
            throw new common_1.NotFoundException('Post not found');
        const commentIndex = post.comments?.findIndex((c) => c._id.toString() === commentId);
        if (commentIndex === -1 || commentIndex === undefined)
            throw new common_1.NotFoundException('Comment not found');
        const comment = post.comments[commentIndex];
        const hasLiked = comment.likes?.some((like) => like.user.toString() === userId);
        if (hasLiked)
            return {
                message: 'Comment already liked',
                liked: true,
                likesCount: comment.likes.length,
            };
        const updateResult = await this.postModel.updateOne({
            _id: new mongoose_2.Types.ObjectId(postId),
            'comments._id': new mongoose_2.Types.ObjectId(commentId),
        }, {
            $push: {
                'comments.$.likes': {
                    user: new mongoose_2.Types.ObjectId(userId),
                    createdAt: new Date(),
                },
            },
        });
        if (updateResult.modifiedCount === 0) {
            const checkPost = await this.postModel.findById(postId);
            const checkComment = checkPost?.comments?.find((c) => c._id.toString() === commentId);
            if (checkComment?.likes?.some((like) => like.user.toString() === userId)) {
                return {
                    message: 'Comment already liked',
                    liked: true,
                    likesCount: checkComment.likes.length,
                };
            }
            throw new Error('Failed to like comment');
        }
        const likesCount = (comment.likes?.length || 0) + 1;
        return { message: 'Comment liked successfully', liked: true, likesCount };
    }
    async unlikeComment(userId, postId, commentId) {
        const post = await this.postModel.findById(postId);
        if (!post)
            throw new common_1.NotFoundException('Post not found');
        const commentIndex = post.comments?.findIndex((c) => c._id.toString() === commentId);
        if (commentIndex === -1 || commentIndex === undefined)
            throw new common_1.NotFoundException('Comment not found');
        const comment = post.comments[commentIndex];
        const likeIndex = comment.likes?.findIndex((like) => like.user.toString() === userId);
        if (likeIndex === -1 || likeIndex === undefined)
            return {
                message: 'Comment not liked',
                liked: false,
                likesCount: comment.likes?.length || 0,
            };
        const updateResult = await this.postModel.updateOne({
            _id: new mongoose_2.Types.ObjectId(postId),
            'comments._id': new mongoose_2.Types.ObjectId(commentId),
        }, { $pull: { 'comments.$.likes': { user: new mongoose_2.Types.ObjectId(userId) } } });
        if (updateResult.modifiedCount === 0) {
            const checkPost = await this.postModel.findById(postId);
            const checkComment = checkPost?.comments?.find((c) => c._id.toString() === commentId);
            const stillLiked = checkComment?.likes?.some((like) => like.user.toString() === userId);
            if (stillLiked)
                throw new Error('Failed to unlike comment');
            return {
                message: 'Comment not liked',
                liked: false,
                likesCount: checkComment?.likes?.length || 0,
            };
        }
        const likesCount = (comment.likes?.length || 1) - 1;
        return {
            message: 'Comment unliked successfully',
            liked: false,
            likesCount,
        };
    }
    async getCommentLikes(postId, commentId) {
        const post = await this.postModel
            .findOne({
            _id: new mongoose_2.Types.ObjectId(postId),
            'comments._id': new mongoose_2.Types.ObjectId(commentId),
        }, { 'comments.$': 1 })
            .populate('comments.likes.user', 'displayName firstName lastName profilePicture');
        if (!post)
            throw new common_1.NotFoundException('Post or comment not found');
        const comment = post.comments?.[0];
        if (!comment)
            throw new common_1.NotFoundException('Comment not found');
        const likes = comment.likes || [];
        return likes.map((like) => ({
            id: like._id.toString(),
            user: {
                id: like.user._id.toString(),
                displayName: like.user.displayName ||
                    `${like.user.firstName || ''} ${like.user.lastName || ''}`.trim() ||
                    'User',
                profilePicture: like.user.profilePicture,
            },
            createdAt: like.createdAt,
        }));
    }
    async isCommentLiked(userId, postId, commentId) {
        const post = await this.postModel.findOne({
            _id: new mongoose_2.Types.ObjectId(postId),
            'comments._id': new mongoose_2.Types.ObjectId(commentId),
            'comments.likes.user': new mongoose_2.Types.ObjectId(userId),
        }, { _id: 1 });
        return !!post;
    }
    async editComment(userId, postId, commentId, text) {
        const post = await this.postModel.findById(postId);
        if (!post)
            throw new common_1.NotFoundException('Post not found');
        const commentIndex = post.comments?.findIndex((c) => c._id.toString() === commentId);
        if (commentIndex === -1 || commentIndex === undefined)
            throw new common_1.NotFoundException('Comment not found');
        if (post.comments[commentIndex].user.toString() !== userId) {
            throw new common_1.UnauthorizedException('You can only edit your own comments');
        }
        const updateResult = await this.postModel.updateOne({
            _id: new mongoose_2.Types.ObjectId(postId),
            'comments._id': new mongoose_2.Types.ObjectId(commentId),
        }, { $set: { 'comments.$.text': text, 'comments.$.updatedAt': new Date() } });
        if (updateResult.matchedCount === 0) {
            throw new common_1.NotFoundException('Comment not found during update');
        }
        const updatedPost = await this.postModel
            .findById(postId)
            .populate('comments.user', 'displayName firstName lastName profilePicture');
        const updatedComment = updatedPost?.comments?.find((c) => c._id.toString() === commentId);
        if (!updatedComment) {
            throw new Error('Failed to retrieve updated comment');
        }
        return {
            id: updatedComment._id.toString(),
            text: updatedComment.text,
            user: {
                id: updatedComment.user._id.toString(),
                displayName: updatedComment.user.displayName ||
                    `${updatedComment.user.firstName || ''} ${updatedComment.user.lastName || ''}`.trim() ||
                    'User',
                profilePicture: updatedComment.user.profilePicture,
            },
            createdAt: updatedComment.createdAt,
            updatedAt: updatedComment.updatedAt,
            parentId: updatedComment.parentComment?.toString(),
            likesCount: updatedComment.likes?.length || 0,
        };
    }
    async deleteComment(userId, postId, commentId) {
        const post = await this.postModel
            .findById(postId)
            .populate('creator', '_id');
        if (!post)
            throw new common_1.NotFoundException('Post not found');
        const comment = post.comments?.find((c) => c._id.toString() === commentId);
        if (!comment)
            throw new common_1.NotFoundException('Comment not found');
        const isCommentAuthor = comment.user.toString() === userId;
        const isPostCreator = post.creator && post.creator._id.toString() === userId;
        if (!isCommentAuthor && !isPostCreator) {
            throw new common_1.UnauthorizedException('You can only delete your own comments or comments on your posts');
        }
        const childCommentIds = new Set();
        this.findAllChildComments(post.comments, commentId, childCommentIds);
        childCommentIds.add(commentId);
        const commentIdsToDelete = Array.from(childCommentIds).map((id) => new mongoose_2.Types.ObjectId(id));
        const result = await this.postModel.updateOne({ _id: new mongoose_2.Types.ObjectId(postId) }, {
            $pull: { comments: { _id: { $in: commentIdsToDelete } } },
            $inc: { commentCount: -commentIdsToDelete.length },
        });
        const success = result.modifiedCount > 0 ||
            (result.matchedCount > 0 && commentIdsToDelete.length > 0);
        return { success, deletedCount: commentIdsToDelete.length };
    }
    findAllChildComments(comments, parentId, childIds) {
        if (!comments)
            return;
        for (const comment of comments) {
            if (comment.parentComment?.toString() === parentId) {
                const commentId = comment._id.toString();
                childIds.add(commentId);
                this.findAllChildComments(comments, commentId, childIds);
            }
        }
    }
    processTags(tags) {
        if (!tags)
            return [];
        let processed;
        if (typeof tags === 'string') {
            try {
                const parsed = JSON.parse(tags);
                processed = Array.isArray(parsed) ? parsed.map(String) : [String(tags)];
            }
            catch {
                processed = tags
                    .split(',')
                    .map((tag) => tag.trim())
                    .filter((tag) => tag.length > 0);
                if (processed.length === 1 && tags.includes(',')) {
                    processed = [tags];
                }
                else if (processed.length === 0 && tags.trim().length > 0) {
                    processed = [tags.trim()];
                }
            }
        }
        else if (Array.isArray(tags)) {
            processed = tags.map(String);
        }
        else {
            processed = [String(tags)];
        }
        return [...new Set(processed)].filter((tag) => tag.length > 0);
    }
    formatDate(date) {
        if (!date || !(date instanceof Date))
            return '';
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
    async recordPostView(postId, userId) {
        try {
            await this.postModel.updateOne({ _id: new mongoose_2.Types.ObjectId(postId) }, { $inc: { viewCount: 1 } });
            const now = new Date();
            now.setHours(0, 0, 0, 0);
            const post = await this.postModel.findById(postId);
            if (!post)
                return;
            const existingInsight = await this.postInsightModel.findOne({
                post: new mongoose_2.Types.ObjectId(postId),
                date: now,
            });
            if (existingInsight) {
                await this.postInsightModel.updateOne({ _id: existingInsight._id }, { $inc: { impressions: 1 } });
            }
            else {
                await this.postInsightModel.create({
                    post: new mongoose_2.Types.ObjectId(postId),
                    creator: post.creator,
                    date: now,
                    impressions: 1,
                    engagements: 0,
                });
            }
        }
        catch (error) {
            console.error('Error recording post view:', error);
        }
    }
    async getPostById(id, userId) {
        const post = await this.postModel.findById(id);
        if (!post) {
            throw new common_1.NotFoundException('Post not found');
        }
        if (post.status === post_1.PostStatus.PUBLISHED) {
            this.recordPostView(id, userId).catch((error) => {
                console.error('Failed to record post view:', error);
            });
        }
        const hasFullAccess = await this.checkPostAccess(userId, post);
        const memberTiers = await this.membershipsService.getCreatorMemberships(post.creator._id.toString(), {});
        const tierAccessDetails = (post.tierAccess || []).map((id) => memberTiers.memberships.find((m) => m._id.toString() === id));
        const postWithMemberships = {
            ...post.toObject(),
            tierAccess: tierAccessDetails,
        };
        let hasLiked = false;
        if (userId) {
            hasLiked = Boolean(postWithMemberships.likes.find((like) => like.user._id.toString() === userId));
        }
        const filteredPost = this.filterPostForListing(postWithMemberships, hasFullAccess);
        const creator = await this.userModel.findById(post.creator.toString());
        let previewText = '';
        if (post.textContent) {
            const $ = cheerio.load(post.textContent);
            const plainText = $.root().text();
            if (plainText.length <= 150) {
                previewText = post.textContent;
            }
            else {
                let truncatedHtml = '';
                let currentLength = 0;
                const limit = 150;
                $('body')
                    .children()
                    .each((i, el) => {
                    if (currentLength >= limit) {
                        return false;
                    }
                    const element = $(el);
                    const elementText = element.text();
                    if (currentLength + elementText.length <= limit) {
                        truncatedHtml += $.html(element);
                        currentLength += elementText.length;
                    }
                    else {
                        const remainingLength = limit - currentLength;
                        let truncatedText = elementText.substring(0, remainingLength);
                        const lastSpace = truncatedText.lastIndexOf(' ');
                        if (lastSpace > 0) {
                            truncatedText = truncatedText.substring(0, lastSpace);
                        }
                        const clonedElement = element.clone();
                        clonedElement.text(truncatedText + '...');
                        truncatedHtml += $.html(clonedElement);
                        currentLength = limit;
                    }
                });
                previewText = truncatedHtml;
            }
        }
        else if (post.description) {
            previewText = post.description;
        }
        const response = {
            ...filteredPost,
            previewText,
            creator: {
                id: creator._id,
                displayName: creator.displayName || creator.creatorUsername,
                profilePicture: creator.profilePicture,
                username: creator.creatorUsername,
                category: creator.creatorCategory,
            },
            hasLiked,
            hasAccess: hasFullAccess,
            tierAccess: tierAccessDetails,
        };
        return response;
    }
};
exports.PostsService = PostsService;
exports.PostsService = PostsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(post_1.Post.name)),
    __param(1, (0, mongoose_1.InjectModel)(user_1.User.name)),
    __param(2, (0, mongoose_1.InjectModel)(subscription_1.Subscription.name)),
    __param(3, (0, mongoose_1.InjectModel)(analytics_1.PostInsight.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        s3_service_1.S3Service,
        memberships_service_1.MembershipsService])
], PostsService);
//# sourceMappingURL=posts.service.js.map