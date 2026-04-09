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
exports.PostsController = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const platform_express_1 = require("@nestjs/platform-express");
const posts_service_1 = require("./posts.service");
const s3_service_1 = require("../s3/s3.service");
const config_1 = require("../config");
const posts_dto_1 = require("./posts.dto");
const post_1 = require("../database/schemas/post");
const memberships_service_1 = require("../memberships/memberships.service");
const notification_generator_service_1 = require("../notifications/notification-generator.service");
const cheerio = require("cheerio");
const optional_auth_guard_1 = require("../auth/optional-auth-guard");
const sharp = require("sharp");
let PostsController = class PostsController {
    constructor(postsService, s3Service, membershipsService, notificationGenerator) {
        this.postsService = postsService;
        this.s3Service = s3Service;
        this.membershipsService = membershipsService;
        this.notificationGenerator = notificationGenerator;
    }
    async findPublishedPostsByCreator(creatorId, fetchPostsDto, req) {
        console.log('findPublishedPostsByCreator');
        const userId = fetchPostsDto.userId || req.user?.userId;
        const { posts, total } = await this.postsService.findPublishedPostsByCreator(creatorId, fetchPostsDto, userId);
        const { memberships } = await this.membershipsService.getCreatorMemberships(creatorId, {});
        const transformedPosts = await Promise.all(posts.map(async (post) => {
            const tierAccess = post.tierAccess
                .map((ta) => memberships.find((m) => m.id === ta))
                .filter((ta) => Boolean(ta));
            try {
                const hasAccess = await this.postsService.checkPostAccess(userId, post);
                const postObj = post instanceof Object && typeof post.toObject === 'function'
                    ? post.toObject()
                    : { ...post };
                let previewText = '';
                if (postObj.textContent) {
                    const $ = cheerio.load(postObj.textContent);
                    const plainText = $.root().text();
                    if (plainText.length <= 150) {
                        previewText = postObj.textContent;
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
                else if (postObj.description) {
                    previewText = postObj.description;
                }
                const thumbnail = postObj.thumbnailUrl;
                const creator = postObj.creator || {};
                const creatorIdStr = typeof creator === 'object'
                    ? creator._id?.toString()
                    : creator?.toString();
                postObj.description = previewText;
                const formattedPost = {
                    ...postObj,
                    previewText,
                    thumbnail,
                    creator: {
                        id: creatorIdStr || '',
                        displayName: creator.displayName || creator.creatorUsername || 'Unknown',
                        profilePicture: creator.profilePicture,
                        username: creator.creatorUsername || '',
                        category: creator.creatorCategory || '',
                    },
                    likesCount: postObj.likeCount || 0,
                    commentsCount: postObj.commentCount || 0,
                    publishDate: this.postsService.formatDate(postObj.createdAt),
                    postType: this.postsService.getReadablePostType(postObj.type),
                    isRestrictedView: !hasAccess,
                    videoUrl: postObj.videoUrl,
                    tierAccess,
                };
                if (!hasAccess) {
                    return {
                        ...this.postsService.filterPostForListing(formattedPost, false),
                        hasAccess,
                    };
                }
                return { ...formattedPost, hasAccess };
            }
            catch (error) {
                console.error(`Error processing post ${post._id || post.id}:`, error);
                return {
                    id: post._id?.toString() || post.id || 'unknown',
                    title: post.title || 'Error loading post',
                    isRestrictedView: true,
                    error: true,
                };
            }
        }));
        return {
            posts: transformedPosts.filter((post) => !post.error),
            pagination: {
                total,
                page: fetchPostsDto.page || 1,
                limit: fetchPostsDto.limit || 10,
                totalPages: Math.ceil(total / (fetchPostsDto.limit || 10)),
            },
        };
    }
    async findAllPublishedPosts(fetchPostsDto, req) {
        const userId = req.user?.userId;
        const { posts, total } = await this.postsService.findPublishedPosts(fetchPostsDto, userId);
        const transformedPosts = await Promise.all(posts.map(async (post) => {
            const tierAccessDetails = await Promise.all((post.tierAccess || []).map(async (memberId) => {
                try {
                    const membership = await this.membershipsService.getMembershipById(memberId);
                    return {
                        id: memberId,
                        name: membership.name,
                    };
                }
                catch (error) {
                    return {
                        id: memberId,
                        name: 'Unknown Tier',
                    };
                }
            }));
            return {
                id: post._id,
                title: post.title,
                publishDate: this.formatDate(post.createdAt),
                tierAccess: tierAccessDetails,
                postType: this.getReadablePostType(post.type),
                thumbnail: this.getThumbnailForPost(post),
                description: post.description ||
                    post.previewText ||
                    post.textContent?.substring(0, 150),
                creator: {
                    id: post.creator._id,
                    name: post.creator.displayName ||
                        post.creator.creatorUsername,
                    profilePicture: post.creator.profilePicture,
                },
                isRestrictedView: post.isRestrictedView,
            };
        }));
        return {
            posts: transformedPosts,
            pagination: {
                total,
                page: fetchPostsDto.page || 1,
                limit: fetchPostsDto.limit || 10,
                totalPages: Math.ceil(total / (fetchPostsDto.limit || 10)),
            },
        };
    }
    async findMyDrafts(req) {
        const drafts = await this.postsService.findByCreator(req.user.userId, {
            status: post_1.PostStatus.DRAFT,
        });
        const transformedDrafts = await Promise.all(drafts.map(async (draft) => {
            const tierAccessDetails = await Promise.all((draft.tierAccess || []).map(async (memberId) => {
                try {
                    const membership = await this.membershipsService.getMembershipById(memberId);
                    return {
                        id: memberId,
                        name: membership.name,
                    };
                }
                catch (error) {
                    return {
                        id: memberId,
                        name: 'Unknown Tier',
                    };
                }
            }));
            return {
                id: draft._id,
                title: draft.title,
                createdAt: draft.createdAt,
                updatedAt: draft.updatedAt,
                type: draft.type,
                postType: this.getReadablePostType(draft.type),
                tierAccess: tierAccessDetails,
                status: draft.status,
            };
        }));
        return {
            drafts: transformedDrafts,
        };
    }
    async findMyPosts(req, fetchPostsDto) {
        const { posts, total } = await this.postsService.findPublishedPostsByCreator(req.user.userId, fetchPostsDto);
        const transformedPosts = await Promise.all(posts.map(async (post) => {
            const tierAccessDetails = await Promise.all((post.tierAccess || []).map(async (memberId) => {
                try {
                    const membership = await this.membershipsService.getMembershipById(memberId);
                    return {
                        id: memberId,
                        name: membership.name,
                    };
                }
                catch (error) {
                    return {
                        id: memberId,
                        name: 'Unknown Tier',
                    };
                }
            }));
            return {
                id: post.id,
                title: post.title,
                publishDate: this.formatDate(post.createdAt),
                tierAccess: tierAccessDetails,
                postType: this.getReadablePostType(post.type),
                thumbnail: this.getThumbnailForPost(post),
                status: post.status,
                collections: post.collections,
                createdAt: post.createdAt,
                updatedAt: post.updatedAt,
            };
        }));
        return {
            posts: transformedPosts,
            pagination: {
                total,
                page: fetchPostsDto.page || 1,
                limit: fetchPostsDto.limit || 10,
                totalPages: Math.ceil(total / (fetchPostsDto.limit || 10)),
            },
        };
    }
    async getPostById(req, id, query) {
        const userId = query.userId || req.user?.userId;
        return await this.postsService.getPostById(id, userId);
    }
    async createTextPost(req, createTextPostDto, files = []) {
        const attachments = [];
        if (files && files.length > 0) {
            for (const file of files) {
                try {
                    const fileUrl = await this.s3Service.uploadFile(file, 'attachments', config_1.business.s3.defaultBucket);
                    attachments.push({
                        url: fileUrl,
                        fileName: file.originalname,
                        fileType: file.mimetype,
                        fileSize: file.size,
                        uploadedAt: new Date(),
                    });
                }
                catch (error) {
                    console.error(`Failed to upload file ${file.originalname}:`, error);
                }
            }
        }
        const post = await this.postsService.createTextPost({
            type: post_1.PostType.TEXT,
            creator: req.user.userId,
            title: createTextPostDto.title,
            textContent: createTextPostDto.textContent,
            tags: createTextPostDto.tags,
            collections: createTextPostDto.collections,
            status: createTextPostDto.isDraft
                ? post_1.PostStatus.DRAFT
                : post_1.PostStatus.PUBLISHED,
            tierAccess: createTextPostDto.tierAccess || [],
            attachments,
        });
        return post;
    }
    async updateTextPost(req, id, updateTextPostDto, files = []) {
        const post = await this.postsService.findById(id);
        if (!post || post.creator._id.toString() !== req.user.userId) {
            throw new common_1.NotFoundException('Post not found or unauthorized');
        }
        const newAttachments = [];
        if (files && files.length > 0) {
            for (const file of files) {
                try {
                    const fileUrl = await this.s3Service.uploadFile(file, 'attachments', config_1.business.s3.defaultBucket);
                    newAttachments.push({
                        url: fileUrl,
                        fileName: file.originalname,
                        fileType: file.mimetype,
                        fileSize: file.size,
                        uploadedAt: new Date(),
                    });
                }
                catch (error) {
                    console.error(`Failed to upload file ${file.originalname}:`, error);
                }
            }
        }
        let existingAttachments = [];
        if (post.attachments && post.attachments.length > 0) {
            if (updateTextPostDto.existingAttachments) {
                existingAttachments = post.attachments.filter((attachment) => updateTextPostDto.existingAttachments.includes(attachment._id.toString() || ''));
            }
        }
        const attachments = [...existingAttachments, ...newAttachments];
        const updatedPost = await this.postsService.updatePost(id, {
            title: updateTextPostDto.title,
            textContent: updateTextPostDto.textContent,
            tags: updateTextPostDto.tags,
            collections: updateTextPostDto.collections,
            status: updateTextPostDto.isDraft
                ? post_1.PostStatus.DRAFT
                : post_1.PostStatus.PUBLISHED,
            tierAccess: updateTextPostDto.tierAccess || [],
            attachments,
        });
        return updatedPost;
    }
    async createVideoPost(req, createVideoPostDto, files) {
        console.log('createVideoPost - Request received:', {
            userId: req.user?.userId,
            hasVideoUrl: !!createVideoPostDto.videoUrl,
            hasVideoFile: !!files?.videoFile?.[0],
            attachmentsCount: files?.attachments?.length || 0,
        });
        console.log('createVideoPostDto:', createVideoPostDto);
        let finalVideoUrl = createVideoPostDto.videoUrl;
        if (!finalVideoUrl && files?.videoFile?.[0]) {
            const video = files.videoFile[0];
            if (!video.mimetype.startsWith('video/')) {
                throw new common_1.BadRequestException('Invalid video file format');
            }
            const uploadStartTime = Date.now();
            const fileSizeMB = (video.size / (1024 * 1024)).toFixed(2);
            console.log('Video upload started:', {
                fileName: video.originalname,
                fileSize: `${fileSizeMB} MB (${video.size} bytes)`,
                mimeType: video.mimetype,
                bucket: config_1.business.s3.defaultBucket,
                folder: 'videos',
                timestamp: new Date().toISOString(),
                uploadStartTime,
            });
            try {
                finalVideoUrl = await this.s3Service.uploadFile(video, 'videos', config_1.business.s3.defaultBucket);
                const uploadEndTime = Date.now();
                const uploadDuration = uploadEndTime - uploadStartTime;
                const uploadDurationSeconds = (uploadDuration / 1000).toFixed(2);
                const uploadSpeedMBps = (parseFloat(fileSizeMB) /
                    (uploadDuration / 1000)).toFixed(2);
                console.log('Video upload completed:', {
                    fileName: video.originalname,
                    fileSize: `${fileSizeMB} MB (${video.size} bytes)`,
                    uploadDuration: `${uploadDurationSeconds} seconds (${uploadDuration}ms)`,
                    uploadSpeed: `${uploadSpeedMBps} MB/s`,
                    finalVideoUrl,
                    timestamp: new Date().toISOString(),
                    uploadEndTime,
                });
            }
            catch (error) {
                const uploadEndTime = Date.now();
                const uploadDuration = uploadEndTime - uploadStartTime;
                console.error('Video upload failed:', {
                    fileName: video.originalname,
                    fileSize: `${fileSizeMB} MB (${video.size} bytes)`,
                    uploadDuration: `${(uploadDuration / 1000).toFixed(2)} seconds (${uploadDuration}ms)`,
                    error: error.message,
                    timestamp: new Date().toISOString(),
                });
                throw new common_1.BadRequestException(`Failed to upload video file: ${error.message}`);
            }
        }
        if (!finalVideoUrl) {
            throw new common_1.BadRequestException('Provide a videoUrl or upload a videoFile');
        }
        const attachments = [];
        if (files?.attachments?.length) {
            console.log(`Starting upload of ${files.attachments.length} attachment(s)`);
            for (let i = 0; i < files.attachments.length; i++) {
                const file = files.attachments[i];
                const attachmentStartTime = Date.now();
                const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
                console.log(`Attachment ${i + 1}/${files.attachments.length} upload started:`, {
                    fileName: file.originalname,
                    fileSize: `${fileSizeMB} MB (${file.size} bytes)`,
                    mimeType: file.mimetype,
                    timestamp: new Date().toISOString(),
                });
                try {
                    const fileUrl = await this.s3Service.uploadFile(file, 'video-post-attachments', config_1.business.s3.defaultBucket);
                    const attachmentEndTime = Date.now();
                    const attachmentDuration = attachmentEndTime - attachmentStartTime;
                    const attachmentDurationSeconds = (attachmentDuration / 1000).toFixed(2);
                    console.log(`Attachment ${i + 1}/${files.attachments.length} upload completed:`, {
                        fileName: file.originalname,
                        fileSize: `${fileSizeMB} MB (${file.size} bytes)`,
                        uploadDuration: `${attachmentDurationSeconds} seconds (${attachmentDuration}ms)`,
                        fileUrl,
                        timestamp: new Date().toISOString(),
                    });
                    attachments.push({
                        url: fileUrl,
                        fileName: file.originalname,
                        fileType: file.mimetype,
                        fileSize: file.size,
                        uploadedAt: new Date(),
                    });
                }
                catch (error) {
                    const attachmentEndTime = Date.now();
                    const attachmentDuration = attachmentEndTime - attachmentStartTime;
                    console.error(`Attachment ${i + 1}/${files.attachments.length} upload failed:`, {
                        fileName: file.originalname,
                        fileSize: `${fileSizeMB} MB (${file.size} bytes)`,
                        uploadDuration: `${(attachmentDuration / 1000).toFixed(2)} seconds (${attachmentDuration}ms)`,
                        error: error.message,
                        timestamp: new Date().toISOString(),
                    });
                    throw new common_1.BadRequestException(`Failed to upload attachment: ${error.message}`);
                }
            }
            console.log(`All ${attachments.length} attachment(s) uploaded successfully`);
        }
        const postCreationStartTime = Date.now();
        console.log('Creating video post in database:', {
            userId: req.user.userId,
            title: createVideoPostDto.title,
            videoUrl: finalVideoUrl,
            status: createVideoPostDto.isDraft
                ? post_1.PostStatus.DRAFT
                : post_1.PostStatus.PUBLISHED,
            attachmentsCount: attachments.length,
            timestamp: new Date().toISOString(),
        });
        const post = await this.postsService.createVideoPost(req.user.userId, {
            ...createVideoPostDto,
            videoUrl: finalVideoUrl,
            status: createVideoPostDto.isDraft
                ? post_1.PostStatus.DRAFT
                : post_1.PostStatus.PUBLISHED,
        }, attachments);
        const postCreationEndTime = Date.now();
        const postCreationDuration = postCreationEndTime - postCreationStartTime;
        console.log('Video post created successfully:', {
            postId: post._id?.toString() || post.id,
            title: post.title,
            videoUrl: post.videoUrl,
            status: post.status,
            creationDuration: `${(postCreationDuration / 1000).toFixed(2)} seconds (${postCreationDuration}ms)`,
            timestamp: new Date().toISOString(),
        });
        return post;
    }
    async updateVideoPost(req, id, updateVideoPostDto, files = []) {
        const post = await this.postsService.findById(id);
        if (!post || post.creator._id.toString() !== req.user.userId) {
            throw new common_1.NotFoundException('Post not found or unauthorized');
        }
        const newAttachments = [];
        if (files && files.length > 0) {
            for (const file of files) {
                try {
                    const fileUrl = await this.s3Service.uploadFile(file, 'video-post-attachments', config_1.business.s3.defaultBucket);
                    newAttachments.push({
                        url: fileUrl,
                        fileName: file.originalname,
                        fileType: file.mimetype,
                        fileSize: file.size,
                        uploadedAt: new Date(),
                    });
                }
                catch (error) {
                    console.error(`Failed to upload file ${file.originalname}:`, error);
                }
            }
        }
        let existingAttachments = [];
        if (post.attachments && post.attachments.length > 0) {
            if (updateVideoPostDto.existingAttachments) {
                existingAttachments = post.attachments.filter((attachment) => updateVideoPostDto.existingAttachments.includes(attachment._id.toString() || ''));
            }
        }
        const videoInfo = updateVideoPostDto.videoUrl
            ? this.postsService.extractVideoInfo(updateVideoPostDto.videoUrl)
            : {
                platform: post.videoProvider,
                videoId: post.videoId,
                thumbnailUrl: post.thumbnailUrl,
            };
        const attachments = [...existingAttachments, ...newAttachments];
        const updatedPost = await this.postsService.updatePost(id, {
            title: updateVideoPostDto.title,
            description: updateVideoPostDto.description,
            videoUrl: updateVideoPostDto.videoUrl || post.videoUrl,
            videoId: videoInfo.videoId,
            videoProvider: videoInfo.platform,
            thumbnailUrl: videoInfo.thumbnailUrl,
            tags: updateVideoPostDto.tags,
            collections: updateVideoPostDto.collections,
            status: updateVideoPostDto.isDraft
                ? post_1.PostStatus.DRAFT
                : post_1.PostStatus.PUBLISHED,
            tierAccess: updateVideoPostDto.tierAccess || [],
            attachments,
        });
        return updatedPost;
    }
    async createAudioPost(req, createAudioPostDto, files) {
        if (!files.audioFile?.[0]) {
            throw new common_1.BadRequestException('Audio file is required');
        }
        const audioFile = files.audioFile[0];
        if (!audioFile.mimetype.startsWith('audio/')) {
            throw new common_1.BadRequestException('Invalid audio file format');
        }
        let audioFileUrl;
        try {
            audioFileUrl = await this.s3Service.uploadFile(audioFile, 'audio', config_1.business.s3.defaultBucket);
        }
        catch (error) {
            throw new common_1.BadRequestException(`Failed to upload audio file: ${error.message}`);
        }
        const attachments = [];
        if (files.attachments?.length > 0) {
            for (const file of files.attachments) {
                try {
                    const fileUrl = await this.s3Service.uploadFile(file, 'audio-post-attachments', config_1.business.s3.defaultBucket);
                    attachments.push({
                        url: fileUrl,
                        fileName: file.originalname,
                        fileType: file.mimetype,
                        fileSize: file.size,
                        uploadedAt: new Date(),
                    });
                }
                catch (error) {
                    console.error(`Failed to upload attachment ${file.originalname}:`, error);
                }
            }
        }
        return this.postsService.createAudioPost(req.user.userId, {
            ...createAudioPostDto,
            status: createAudioPostDto.isDraft
                ? post_1.PostStatus.DRAFT
                : post_1.PostStatus.PUBLISHED,
        }, audioFileUrl, attachments);
    }
    async updateAudioPost(req, id, updateAudioPostDto, files) {
        const post = await this.postsService.findById(id);
        if (!post || post.creator._id.toString() !== req.user.userId) {
            throw new common_1.NotFoundException('Post not found or unauthorized');
        }
        let audioFileUrl = undefined;
        if (files.audioFile?.[0]) {
            const audioFile = files.audioFile[0];
            if (!audioFile.mimetype.startsWith('audio/')) {
                throw new common_1.BadRequestException('Invalid audio file format');
            }
            try {
                audioFileUrl = await this.s3Service.uploadFile(audioFile, 'audio', config_1.business.s3.defaultBucket);
            }
            catch (error) {
                throw new common_1.BadRequestException(`Failed to upload audio file: ${error.message}`);
            }
        }
        if (!audioFileUrl) {
            audioFileUrl =
                updateAudioPostDto.existingAudioFileUrl || post.mediaUrls?.[0];
        }
        const newAttachments = [];
        if (files.attachments?.length > 0) {
            for (const file of files.attachments) {
                try {
                    const fileUrl = await this.s3Service.uploadFile(file, 'audio-post-attachments', config_1.business.s3.defaultBucket);
                    newAttachments.push({
                        url: fileUrl,
                        fileName: file.originalname,
                        fileType: file.mimetype,
                        fileSize: file.size,
                        uploadedAt: new Date(),
                    });
                }
                catch (error) {
                    console.error(`Failed to upload attachment ${file.originalname}:`, error);
                }
            }
        }
        let existingAttachments = [];
        if (post.attachments && post.attachments.length > 0) {
            if (updateAudioPostDto.existingAttachments) {
                existingAttachments = post.attachments.filter((attachment) => updateAudioPostDto.existingAttachments.includes(attachment._id.toString() || ''));
            }
        }
        const attachments = [...existingAttachments, ...newAttachments];
        const updatedPost = await this.postsService.updatePost(id, {
            title: updateAudioPostDto.title,
            description: updateAudioPostDto.description,
            mediaUrls: [audioFileUrl],
            tags: updateAudioPostDto.tags,
            collections: updateAudioPostDto.collections,
            status: updateAudioPostDto.isDraft
                ? post_1.PostStatus.DRAFT
                : post_1.PostStatus.PUBLISHED,
            tierAccess: updateAudioPostDto.tierAccess || [],
            attachments,
        });
        return updatedPost;
    }
    async createImagePost(req, createImagePostDto, files) {
        if (!files?.images?.length) {
            throw new common_1.BadRequestException('At least one image is required');
        }
        const firstImage = files.images[0];
        let blurredThumbnailUrl = '';
        try {
            const blurredImageBuffer = await sharp(firstImage.buffer)
                .blur(20)
                .toBuffer();
            const blurredImageFile = {
                ...firstImage,
                buffer: blurredImageBuffer,
                originalname: `thumbnail-blurred-${firstImage.originalname}`,
            };
            blurredThumbnailUrl = await this.s3Service.uploadFile(blurredImageFile, 'images/thumbnails', config_1.business.s3.defaultBucket);
        }
        catch (error) {
            console.error('Failed to create or upload blurred thumbnail:', error);
        }
        const imageUrls = [];
        for (const image of files.images) {
            try {
                const imageUrl = await this.s3Service.uploadFile(image, 'images', config_1.business.s3.defaultBucket);
                imageUrls.push(imageUrl);
            }
            catch (error) {
                console.error(`Failed to upload image ${image.originalname}:`, error);
                throw new common_1.BadRequestException(`Failed to upload image: ${error.message}`);
            }
        }
        const attachments = [];
        if (files.attachments?.length) {
            for (const file of files.attachments) {
                try {
                    const fileUrl = await this.s3Service.uploadFile(file, 'image-post-attachments', config_1.business.s3.defaultBucket);
                    attachments.push({
                        url: fileUrl,
                        fileName: file.originalname,
                        fileType: file.mimetype,
                        fileSize: file.size,
                        uploadedAt: new Date(),
                    });
                }
                catch (error) {
                    console.error(`Failed to upload attachment ${file.originalname}:`, error);
                }
            }
        }
        return this.postsService.createImagePost(req.user.userId, {
            ...createImagePostDto,
            status: createImagePostDto.isDraft
                ? post_1.PostStatus.DRAFT
                : post_1.PostStatus.PUBLISHED,
            thumbnailUrl: blurredThumbnailUrl || imageUrls[0],
        }, imageUrls, attachments);
    }
    async updateImagePost(req, id, updateImagePostDto, files) {
        const post = await this.postsService.findById(id);
        if (!post || post.creator._id.toString() !== req.user.userId) {
            throw new common_1.NotFoundException('Post not found or unauthorized');
        }
        const newImageUrls = [];
        if (files.images?.length) {
            for (const image of files.images) {
                try {
                    const imageUrl = await this.s3Service.uploadFile(image, 'images', config_1.business.s3.defaultBucket);
                    newImageUrls.push(imageUrl);
                }
                catch (error) {
                    console.error(`Failed to upload image ${image.originalname}:`, error);
                }
            }
        }
        let existingImageUrls = [];
        if (post.mediaUrls && post.mediaUrls.length > 0) {
            if (updateImagePostDto.existingImages) {
                existingImageUrls = post.mediaUrls.filter((url) => updateImagePostDto.existingImages.includes(url));
            }
        }
        const newAttachments = [];
        if (files.attachments?.length) {
            for (const file of files.attachments) {
                try {
                    const fileUrl = await this.s3Service.uploadFile(file, 'image-post-attachments', config_1.business.s3.defaultBucket);
                    newAttachments.push({
                        url: fileUrl,
                        fileName: file.originalname,
                        fileType: file.mimetype,
                        fileSize: file.size,
                        uploadedAt: new Date(),
                    });
                }
                catch (error) {
                    console.error(`Failed to upload attachment ${file.originalname}:`, error);
                }
            }
        }
        let existingAttachments = [];
        if (post.attachments && post.attachments.length > 0) {
            if (updateImagePostDto.existingAttachments) {
                existingAttachments = post.attachments.filter((attachment) => updateImagePostDto.existingAttachments.includes(attachment._id.toString() || ''));
            }
        }
        const imageUrls = [...existingImageUrls, ...newImageUrls];
        const attachments = [...existingAttachments, ...newAttachments];
        if (imageUrls.length === 0) {
            throw new common_1.BadRequestException('At least one image is required');
        }
        const updatedPost = await this.postsService.updatePost(id, {
            title: updateImagePostDto.title,
            description: updateImagePostDto.description,
            mediaUrls: imageUrls,
            tags: updateImagePostDto.tags,
            collections: updateImagePostDto.collections,
            status: updateImagePostDto.isDraft
                ? post_1.PostStatus.DRAFT
                : post_1.PostStatus.PUBLISHED,
            tierAccess: updateImagePostDto.tierAccess || [],
            attachments,
        });
        return updatedPost;
    }
    async createLinkPost(req, createLinkPostDto, attachmentFiles = []) {
        const attachments = [];
        if (attachmentFiles.length > 0) {
            for (const file of attachmentFiles) {
                try {
                    const fileUrl = await this.s3Service.uploadFile(file, 'link-post-attachments', config_1.business.s3.defaultBucket);
                    attachments.push({
                        url: fileUrl,
                        fileName: file.originalname,
                        fileType: file.mimetype,
                        fileSize: file.size,
                        uploadedAt: new Date(),
                    });
                }
                catch (error) {
                    console.error(`Failed to upload attachment ${file.originalname}:`, error);
                }
            }
        }
        try {
            return this.postsService.createLinkPost(req.user.userId, {
                ...createLinkPostDto,
                status: createLinkPostDto.isDraft
                    ? post_1.PostStatus.DRAFT
                    : post_1.PostStatus.PUBLISHED,
            }, attachments);
        }
        catch (error) {
            throw new common_1.BadRequestException(`Failed to create link post: ${error.message}`);
        }
    }
    async updateLinkPost(req, id, updateLinkPostDto, attachmentFiles = []) {
        const post = await this.postsService.findById(id);
        if (!post || post.creator._id.toString() !== req.user.userId) {
            throw new common_1.NotFoundException('Post not found or unauthorized');
        }
        const newAttachments = [];
        if (attachmentFiles.length > 0) {
            for (const file of attachmentFiles) {
                try {
                    const fileUrl = await this.s3Service.uploadFile(file, 'link-post-attachments', config_1.business.s3.defaultBucket);
                    newAttachments.push({
                        url: fileUrl,
                        fileName: file.originalname,
                        fileType: file.mimetype,
                        fileSize: file.size,
                        uploadedAt: new Date(),
                    });
                }
                catch (error) {
                    console.error(`Failed to upload attachment ${file.originalname}:`, error);
                }
            }
        }
        let existingAttachments = [];
        if (post.attachments && post.attachments.length > 0) {
            if (updateLinkPostDto.existingAttachments) {
                existingAttachments = post.attachments.filter((attachment) => updateLinkPostDto.existingAttachments.includes(attachment._id.toString() || ''));
            }
        }
        const attachments = [...existingAttachments, ...newAttachments];
        const updatedPost = await this.postsService.updatePost(id, {
            title: updateLinkPostDto.title,
            description: updateLinkPostDto.description,
            linkUrl: updateLinkPostDto.linkUrl,
            tags: updateLinkPostDto.tags,
            collections: updateLinkPostDto.collections,
            status: updateLinkPostDto.isDraft
                ? post_1.PostStatus.DRAFT
                : post_1.PostStatus.PUBLISHED,
            tierAccess: updateLinkPostDto.tierAccess || [],
            attachments,
        });
        return updatedPost;
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
            [post_1.PostType.TEXT]: 'Text',
            [post_1.PostType.IMAGE]: 'Picture',
            [post_1.PostType.AUDIO]: 'Audio',
            [post_1.PostType.VIDEO]: 'Video',
            [post_1.PostType.LINK]: 'Link',
        };
        return typeMap[type] || type;
    }
    getThumbnailForPost(post) {
        if (post.type === post_1.PostType.IMAGE && post.mediaUrls?.length) {
            return post.mediaUrls[0];
        }
        if (post.type === post_1.PostType.VIDEO && post.thumbnailUrl) {
            return post.thumbnailUrl;
        }
        return post.thumbnailUrl || '/default-thumbnail.png';
    }
    async deletePost(req, id) {
        const post = await this.postsService.findById(id);
        if (!post) {
            throw new common_1.NotFoundException('Post not found');
        }
        if (post.creator._id.toString() !== req.user.userId) {
            throw new common_1.UnauthorizedException('You can only delete your own posts');
        }
        const deletedPost = await this.postsService.softDelete(id);
        return { message: 'Post deleted successfully', id: deletedPost._id };
    }
    async permanentDeletePost(req, id) {
        const post = await this.postsService.findById(id);
        if (!post) {
            throw new common_1.NotFoundException('Post not found');
        }
        if (post.creator._id.toString() !== req.user.userId) {
            throw new common_1.UnauthorizedException('You can only delete your own posts');
        }
        if (post.attachments && post.attachments.length > 0) {
            for (const attachment of post.attachments) {
                try {
                    await this.s3Service.deleteFile(attachment.url, this.getBucketNameForPostType(post.type));
                }
                catch (error) {
                    console.error(`Failed to delete attachment ${attachment.url}:`, error);
                }
            }
        }
        if (post.mediaUrls && post.mediaUrls.length > 0) {
            for (const mediaUrl of post.mediaUrls) {
                try {
                    await this.s3Service.deleteFile(mediaUrl, this.getBucketNameForPostType(post.type));
                }
                catch (error) {
                    console.error(`Failed to delete media ${mediaUrl}:`, error);
                }
            }
        }
        await this.postsService.permanentDelete(id);
        return { message: 'Post permanently deleted', id };
    }
    getBucketNameForPostType(type) {
        const bucketMap = {
            [post_1.PostType.TEXT]: config_1.business.s3.defaultBucket,
            [post_1.PostType.IMAGE]: config_1.business.s3.defaultBucket,
            [post_1.PostType.AUDIO]: config_1.business.s3.defaultBucket,
            [post_1.PostType.VIDEO]: config_1.business.s3.defaultBucket,
            [post_1.PostType.LINK]: config_1.business.s3.defaultBucket,
        };
        return bucketMap[type] || config_1.business.s3.defaultBucket;
    }
    async publishPost(req, id) {
        const post = await this.postsService.findById(id);
        if (!post) {
            throw new common_1.NotFoundException('Post not found');
        }
        if (post.creator._id.toString() !== req.user.userId) {
            throw new common_1.UnauthorizedException('You can only publish your own posts');
        }
        if (post.status === post_1.PostStatus.PUBLISHED) {
            return { message: 'Post is already published', id: post._id };
        }
        const updatedPost = await this.postsService.updatePost(id, {
            status: post_1.PostStatus.PUBLISHED,
        });
        const tierAccessDetails = await Promise.all((updatedPost.tierAccess || []).map(async (memberId) => {
            try {
                const membership = await this.membershipsService.getMembershipById(memberId);
                return {
                    id: memberId,
                    name: membership.name,
                };
            }
            catch (error) {
                return {
                    id: memberId,
                    name: 'Unknown Tier',
                };
            }
        }));
        try {
            await this.notificationGenerator.generateNewPostNotification(req.user.userId, updatedPost._id.toString(), updatedPost.title);
        }
        catch (error) {
            console.error('Failed to generate post notifications:', error);
        }
        return {
            message: 'Post published successfully',
            post: {
                ...updatedPost.toObject(),
                tierAccess: tierAccessDetails,
            },
        };
    }
    async unpublishPost(req, id) {
        const post = await this.postsService.findById(id);
        if (!post) {
            throw new common_1.NotFoundException('Post not found');
        }
        if (post.creator._id.toString() !== req.user.userId) {
            throw new common_1.UnauthorizedException('You can only unpublish your own posts');
        }
        if (post.status === post_1.PostStatus.DRAFT) {
            return { message: 'Post is already unpublished', id: post._id };
        }
        const updatedPost = await this.postsService.updatePost(id, {
            status: post_1.PostStatus.DRAFT,
        });
        const tierAccessDetails = await Promise.all((updatedPost.tierAccess || []).map(async (memberId) => {
            try {
                const membership = await this.membershipsService.getMembershipById(memberId);
                return {
                    id: memberId,
                    name: membership.name,
                };
            }
            catch (error) {
                return {
                    id: memberId,
                    name: 'Unknown Tier',
                };
            }
        }));
        return {
            message: 'Post unpublished and moved to drafts',
            post: {
                ...updatedPost.toObject(),
                tierAccess: tierAccessDetails,
            },
        };
    }
    async likePost(req, postId) {
        try {
            const userId = req.user.userId;
            const post = await this.postsService.findById(postId);
            if (!post) {
                throw new common_1.NotFoundException('Post not found');
            }
            const alreadyLiked = await this.postsService.hasUserLikedPost(userId, postId);
            if (alreadyLiked) {
                return { message: 'Post already liked', liked: true };
            }
            await this.postsService.likePost(userId, postId);
            if (userId !== post.creator._id.toString()) {
                await this.notificationGenerator.generateLikeNotification(postId, userId, post.creator._id.toString());
            }
            return { message: 'Post liked successfully', liked: true };
        }
        catch (error) {
            throw new common_1.BadRequestException(`Failed to like post: ${error.message}`);
        }
    }
    async unlikePost(req, postId) {
        try {
            const userId = req.user.userId;
            const post = await this.postsService.findById(postId);
            if (!post) {
                throw new common_1.NotFoundException('Post not found');
            }
            const hasLiked = await this.postsService.hasUserLikedPost(userId, postId);
            if (!hasLiked) {
                return { message: 'Post not liked', liked: false };
            }
            await this.postsService.unlikePost(userId, postId);
            return { message: 'Post unliked successfully', liked: false };
        }
        catch (error) {
            throw new common_1.BadRequestException(`Failed to unlike post: ${error.message}`);
        }
    }
    async addComment(req, postId, commentData) {
        try {
            const userId = req.user.userId;
            const comment = await this.postsService.addComment(userId, postId, commentData.text, commentData.parentId);
            const response = {
                id: comment._id.toString(),
                text: comment.text,
                user: {
                    id: userId,
                    displayName: req.user.displayName || 'User',
                    profilePicture: req.user.profilePicture,
                },
                createdAt: comment.createdAt,
                parentId: comment.parentComment?.toString(),
                likesCount: 0,
                isLiked: false,
            };
            if (commentData.parentId) {
                try {
                    const post = await this.postsService.findById(postId);
                    if (post) {
                        const parentComment = post.comments?.find((c) => c._id.toString() === commentData.parentId);
                        if (parentComment && parentComment.user) {
                            await this.notificationGenerator.generateCommentReplyNotification(postId, comment._id.toString(), userId, parentComment.user.toString(), commentData.text);
                        }
                    }
                }
                catch (error) {
                    console.error('Failed to generate comment reply notification:', error);
                }
            }
            else {
                try {
                    const post = await this.postsService.findById(postId);
                    console.log('GENERATING COMMENT NOTIFICATION');
                    console.log(post &&
                        post.creator &&
                        post.creator._id.toString() !== userId);
                    if (post &&
                        post.creator &&
                        post.creator._id.toString() !== userId) {
                        await this.notificationGenerator.generateCommentNotification(postId, userId, post.creator._id.toString(), commentData.text);
                    }
                }
                catch (error) {
                    console.error('Failed to generate comment notification:', error);
                }
            }
            return response;
        }
        catch (error) {
            throw new common_1.BadRequestException(`Failed to add comment: ${error.message}`);
        }
    }
    async getPostComments(postId, query, req) {
        try {
            const userId = req.user?.userId;
            const allComments = await this.postsService.getPostComments(postId, userId);
            const startIndex = (query.page - 1) * query.limit;
            const endIndex = startIndex + query.limit;
            const paginatedComments = allComments.slice(startIndex, endIndex);
            return {
                comments: paginatedComments,
                pagination: {
                    total: allComments.length,
                    page: query.page,
                    limit: query.limit,
                    totalPages: Math.ceil(allComments.length / query.limit),
                },
            };
        }
        catch (error) {
            console.error('Error fetching comments:', error);
            throw new common_1.BadRequestException(`Failed to fetch comments: ${error.message}`);
        }
    }
    async getPostLikes(postId, query) {
        try {
            const allLikes = await this.postsService.getPostLikes(postId);
            return {
                likes: allLikes,
                pagination: {
                    total: allLikes.length,
                    page: query.page,
                    limit: query.limit,
                    totalPages: Math.ceil(allLikes.length / query.limit),
                },
            };
        }
        catch (error) {
            console.error('Error fetching likes:', error);
            throw new common_1.BadRequestException(`Failed to fetch likes: ${error.message}`);
        }
    }
    async hasUserLikedPost(postId, req) {
        try {
            const userId = req.user.userId;
            const hasLiked = await this.postsService.hasUserLikedPost(userId, postId);
            return {
                liked: hasLiked,
            };
        }
        catch (error) {
            throw new common_1.BadRequestException(`Failed to check like status: ${error.message}`);
        }
    }
    transformPostForFrontend(post, isRestricted) {
        return {
            id: post._id.toString(),
            title: post.title,
            publishDate: this.formatDate(post.createdAt),
            type: this.getPostType(post.type).toLowerCase(),
            postType: this.getReadablePostType(post.type),
            thumbnail: this.getThumbnailForPost(post),
            mediaUrl: isRestricted ? undefined : this.getMediaUrlForPost(post),
            description: post.description ||
                post.previewText ||
                (post.textContent ? post.textContent.substring(0, 150) : ''),
            body: isRestricted ? '' : post.textContent || post.description || '',
            tierAccess: post.tierAccess || [],
            isLocked: isRestricted,
            likes: Math.floor(Math.random() * 100),
            comments: Math.floor(Math.random() * 30),
            createdAt: post.createdAt.toISOString(),
        };
    }
    getPostType(type) {
        switch (type) {
            case post_1.PostType.TEXT:
                return 'text';
            case post_1.PostType.IMAGE:
                return 'image';
            case post_1.PostType.VIDEO:
                return 'video';
            case post_1.PostType.AUDIO:
                return 'audio';
            case post_1.PostType.LINK:
                return 'link';
            default:
                return 'text';
        }
    }
    getMediaUrlForPost(post) {
        switch (post.type) {
            case post_1.PostType.IMAGE:
                return post.mediaUrls && post.mediaUrls.length > 0
                    ? post.mediaUrls[0]
                    : undefined;
            case post_1.PostType.VIDEO:
                return post.videoUrl;
            case post_1.PostType.AUDIO:
                return post.mediaUrls && post.mediaUrls.length > 0
                    ? post.mediaUrls[0]
                    : undefined;
            default:
                return undefined;
        }
    }
    async likeComment(req, postId, commentId) {
        try {
            const userId = req.user.userId;
            return await this.postsService.likeComment(userId, postId, commentId);
        }
        catch (error) {
            throw new common_1.BadRequestException(`Failed to like comment: ${error.message}`);
        }
    }
    async unlikeComment(req, postId, commentId) {
        try {
            const userId = req.user.userId;
            return await this.postsService.unlikeComment(userId, postId, commentId);
        }
        catch (error) {
            throw new common_1.BadRequestException(`Failed to unlike comment: ${error.message}`);
        }
    }
    async getCommentLikes(postId, commentId, query) {
        try {
            const likes = await this.postsService.getCommentLikes(postId, commentId);
            const startIndex = (query.page - 1) * query.limit;
            const endIndex = startIndex + query.limit;
            const paginatedLikes = likes.slice(startIndex, endIndex);
            return {
                likes: paginatedLikes,
                pagination: {
                    total: likes.length,
                    page: query.page,
                    limit: query.limit,
                    totalPages: Math.ceil(likes.length / query.limit),
                },
            };
        }
        catch (error) {
            throw new common_1.BadRequestException(`Failed to fetch comment likes: ${error.message}`);
        }
    }
    async hasUserLikedComment(req, postId, commentId) {
        try {
            const userId = req.user.userId;
            const hasLiked = await this.postsService.isCommentLiked(userId, postId, commentId);
            return {
                liked: hasLiked,
            };
        }
        catch (error) {
            throw new common_1.BadRequestException(`Failed to check like status: ${error.message}`);
        }
    }
    async deleteComment(req, postId, commentId) {
        try {
            const userId = req.user.userId;
            const result = await this.postsService.deleteComment(userId, postId, commentId);
            return {
                success: result.success,
                message: `Successfully deleted ${result.deletedCount} comment(s)`,
                deletedCount: result.deletedCount,
            };
        }
        catch (error) {
            if (error instanceof common_1.UnauthorizedException) {
                throw error;
            }
            throw new common_1.BadRequestException(`Failed to delete comment: ${error.message}`);
        }
    }
    async editComment(req, postId, commentId, body) {
        try {
            const userId = req.user.userId;
            const updatedComment = await this.postsService.editComment(userId, postId, commentId, body.text);
            return updatedComment;
        }
        catch (error) {
            if (error instanceof common_1.UnauthorizedException) {
                throw error;
            }
            throw new common_1.BadRequestException(`Failed to edit comment: ${error.message}`);
        }
    }
};
exports.PostsController = PostsController;
__decorate([
    (0, common_1.Get)('by-creator/:creatorId'),
    (0, common_1.UseGuards)(optional_auth_guard_1.OptionalJwtAuthGuard),
    __param(0, (0, common_1.Param)('creatorId')),
    __param(1, (0, common_1.Query)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, posts_dto_1.FetchPostsDto, Object]),
    __metadata("design:returntype", Promise)
], PostsController.prototype, "findPublishedPostsByCreator", null);
__decorate([
    (0, common_1.Get)(),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [posts_dto_1.FetchPostsDto, Object]),
    __metadata("design:returntype", Promise)
], PostsController.prototype, "findAllPublishedPosts", null);
__decorate([
    (0, common_1.Get)('drafts'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PostsController.prototype, "findMyDrafts", null);
__decorate([
    (0, common_1.Get)('my-posts'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, posts_dto_1.FetchPostsDto]),
    __metadata("design:returntype", Promise)
], PostsController.prototype, "findMyPosts", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, common_1.UseGuards)(optional_auth_guard_1.OptionalJwtAuthGuard),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], PostsController.prototype, "getPostById", null);
__decorate([
    (0, common_1.Post)('text'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, common_1.UseInterceptors)((0, platform_express_1.FilesInterceptor)('attachments', 10)),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.UploadedFiles)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, posts_dto_1.CreateTextPostDto, Array]),
    __metadata("design:returntype", Promise)
], PostsController.prototype, "createTextPost", null);
__decorate([
    (0, common_1.Put)('text/:id'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, common_1.UseInterceptors)((0, platform_express_1.FilesInterceptor)('attachments', 10)),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __param(3, (0, common_1.UploadedFiles)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, posts_dto_1.UpdateTextPostDto, Array]),
    __metadata("design:returntype", Promise)
], PostsController.prototype, "updateTextPost", null);
__decorate([
    (0, common_1.Post)('video'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileFieldsInterceptor)([
        { name: 'videoFile', maxCount: 1 },
        { name: 'attachments', maxCount: 10 },
    ])),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.UploadedFiles)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, posts_dto_1.CreateVideoPostDto, Object]),
    __metadata("design:returntype", Promise)
], PostsController.prototype, "createVideoPost", null);
__decorate([
    (0, common_1.Put)('video/:id'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, common_1.UseInterceptors)((0, platform_express_1.FilesInterceptor)('attachments', 10)),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __param(3, (0, common_1.UploadedFiles)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, posts_dto_1.UpdateVideoPostDto, Array]),
    __metadata("design:returntype", Promise)
], PostsController.prototype, "updateVideoPost", null);
__decorate([
    (0, common_1.Post)('audio'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileFieldsInterceptor)([
        { name: 'audioFile', maxCount: 1 },
        { name: 'attachments', maxCount: 10 },
    ])),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.UploadedFiles)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, posts_dto_1.CreateAudioPostDto, Object]),
    __metadata("design:returntype", Promise)
], PostsController.prototype, "createAudioPost", null);
__decorate([
    (0, common_1.Put)('audio/:id'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileFieldsInterceptor)([
        { name: 'audioFile', maxCount: 1 },
        { name: 'attachments', maxCount: 10 },
    ])),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __param(3, (0, common_1.UploadedFiles)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, posts_dto_1.UpdateAudioPostDto, Object]),
    __metadata("design:returntype", Promise)
], PostsController.prototype, "updateAudioPost", null);
__decorate([
    (0, common_1.Post)('image'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileFieldsInterceptor)([
        { name: 'images', maxCount: 10 },
        { name: 'attachments', maxCount: 10 },
    ], {
        limits: {
            fileSize: 10 * 1024 * 1024,
        },
        fileFilter: (req, file, cb) => {
            if (file.fieldname === 'images' &&
                !file.mimetype.startsWith('image/')) {
                return cb(new common_1.BadRequestException('Invalid image format'), false);
            }
            cb(null, true);
        },
    })),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.UploadedFiles)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, posts_dto_1.CreateImagePostDto, Object]),
    __metadata("design:returntype", Promise)
], PostsController.prototype, "createImagePost", null);
__decorate([
    (0, common_1.Put)('image/:id'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileFieldsInterceptor)([
        { name: 'images', maxCount: 10 },
        { name: 'attachments', maxCount: 10 },
    ], {
        limits: {
            fileSize: 10 * 1024 * 1024,
        },
        fileFilter: (req, file, cb) => {
            if (file.fieldname === 'images' &&
                !file.mimetype.startsWith('image/')) {
                return cb(new common_1.BadRequestException('Invalid image format'), false);
            }
            cb(null, true);
        },
    })),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __param(3, (0, common_1.UploadedFiles)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, posts_dto_1.UpdateImagePostDto, Object]),
    __metadata("design:returntype", Promise)
], PostsController.prototype, "updateImagePost", null);
__decorate([
    (0, common_1.Post)('link'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, common_1.UseInterceptors)((0, platform_express_1.FilesInterceptor)('attachments', 10, {
        limits: {
            fileSize: 10 * 1024 * 1024,
        },
    })),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.UploadedFiles)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, posts_dto_1.CreateLinkPostDto, Array]),
    __metadata("design:returntype", Promise)
], PostsController.prototype, "createLinkPost", null);
__decorate([
    (0, common_1.Put)('link/:id'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, common_1.UseInterceptors)((0, platform_express_1.FilesInterceptor)('attachments', 10, {
        limits: {
            fileSize: 10 * 1024 * 1024,
        },
    })),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __param(3, (0, common_1.UploadedFiles)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, posts_dto_1.UpdateLinkPostDto, Array]),
    __metadata("design:returntype", Promise)
], PostsController.prototype, "updateLinkPost", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], PostsController.prototype, "deletePost", null);
__decorate([
    (0, common_1.Delete)('permanent/:id'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], PostsController.prototype, "permanentDeletePost", null);
__decorate([
    (0, common_1.Post)(':id/publish'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], PostsController.prototype, "publishPost", null);
__decorate([
    (0, common_1.Post)(':id/unpublish'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], PostsController.prototype, "unpublishPost", null);
__decorate([
    (0, common_1.Post)(':id/like'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], PostsController.prototype, "likePost", null);
__decorate([
    (0, common_1.Delete)(':id/like'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], PostsController.prototype, "unlikePost", null);
__decorate([
    (0, common_1.Post)(':id/comments'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], PostsController.prototype, "addComment", null);
__decorate([
    (0, common_1.Get)(':id/comments'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, posts_dto_1.CommentsQueryDto, Object]),
    __metadata("design:returntype", Promise)
], PostsController.prototype, "getPostComments", null);
__decorate([
    (0, common_1.Get)(':id/likes'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, posts_dto_1.CommentsQueryDto]),
    __metadata("design:returntype", Promise)
], PostsController.prototype, "getPostLikes", null);
__decorate([
    (0, common_1.Get)(':id/liked'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PostsController.prototype, "hasUserLikedPost", null);
__decorate([
    (0, common_1.Post)(':postId/comments/:commentId/like'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('postId')),
    __param(2, (0, common_1.Param)('commentId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], PostsController.prototype, "likeComment", null);
__decorate([
    (0, common_1.Delete)(':postId/comments/:commentId/like'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('postId')),
    __param(2, (0, common_1.Param)('commentId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], PostsController.prototype, "unlikeComment", null);
__decorate([
    (0, common_1.Get)(':postId/comments/:commentId/likes'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __param(0, (0, common_1.Param)('postId')),
    __param(1, (0, common_1.Param)('commentId')),
    __param(2, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, posts_dto_1.CommentsQueryDto]),
    __metadata("design:returntype", Promise)
], PostsController.prototype, "getCommentLikes", null);
__decorate([
    (0, common_1.Get)(':postId/comments/:commentId/liked'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('postId')),
    __param(2, (0, common_1.Param)('commentId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], PostsController.prototype, "hasUserLikedComment", null);
__decorate([
    (0, common_1.Delete)(':postId/comments/:commentId'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('postId')),
    __param(2, (0, common_1.Param)('commentId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], PostsController.prototype, "deleteComment", null);
__decorate([
    (0, common_1.Put)(':postId/comments/:commentId'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('postId')),
    __param(2, (0, common_1.Param)('commentId')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, Object]),
    __metadata("design:returntype", Promise)
], PostsController.prototype, "editComment", null);
exports.PostsController = PostsController = __decorate([
    (0, common_1.Controller)('posts'),
    __metadata("design:paramtypes", [posts_service_1.PostsService,
        s3_service_1.S3Service,
        memberships_service_1.MembershipsService,
        notification_generator_service_1.NotificationGeneratorService])
], PostsController);
//# sourceMappingURL=posts.controller.js.map