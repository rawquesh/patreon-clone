/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  Post,
  PostComment,
  PostStatus,
  PostType,
  Attachment,
} from '@/database/schemas/post';
import {
  CreateAudioPostDto,
  CreateImagePostDto,
  CreateLinkPostDto,
  CreateVideoPostDto,
  FetchPostsDto,
  SortBy,
  SortOrder,
} from './posts.dto';
import { Subscription } from '@/database/schemas/subscription';
import { S3Service } from '@/s3/s3.service';
import * as cheerio from 'cheerio'; // Import cheerio
import { PostInsight } from '@/database/schemas/analytics';
import { MembershipsService } from '@/memberships/memberships.service';
import { User, CreatorStatus } from '@/database/schemas/user';
import { branding, business } from '@/config';
import { SettingsService } from '@/admin/services/settings.service';

export interface PostLike {
  _id?: string;
  user: Types.ObjectId | string;
  createdAt: Date;
}

@Injectable()
export class PostsService {
  constructor(
    @InjectModel(Post.name) private postModel: Model<Post>,
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Subscription.name)
    private subscriptionModel: Model<Subscription>,
    @InjectModel(PostInsight.name) private postInsightModel: Model<PostInsight>,
    private readonly s3Service: S3Service,
    private readonly membershipsService: MembershipsService,
    private readonly settingsService: SettingsService,
  ) {}

  private async validateCreatorPostAction(creatorId: string, requestedStatus?: string): Promise<void> {
    const creator = await this.userModel.findById(creatorId);
    if (!creator) throw new UnauthorizedException('Creator not found');
    if (creator.creatorStatus === CreatorStatus.SUSPENDED) {
       throw new UnauthorizedException('Your creator account is suspended. You cannot create or modify posts.');
    }
    if (requestedStatus === PostStatus.PUBLISHED && creator.creatorStatus !== CreatorStatus.PUBLISHED) {
       throw new BadRequestException('Your creator profile must be fully approved and published to post publicly. Drafts are allowed.');
    }
  }

  private async validatePostContent(textContent?: string): Promise<void> {
    if (!textContent) return;
    const maxLength = await this.settingsService.get<number>('maxPostLength', 50000);
    if (textContent.length > maxLength) {
      throw new BadRequestException(
        `Post content exceeds maximum length of ${maxLength} characters. Current length: ${textContent.length}`,
      );
    }
  }

  private async validateAttachments(attachments?: Attachment[]): Promise<void> {
    if (!attachments || attachments.length === 0) return;
    const maxSizeMB = await this.settingsService.get<number>('maxMediaUploadSize', 10);
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    for (const attachment of attachments) {
      if (attachment.fileSize && attachment.fileSize > maxSizeBytes) {
        throw new BadRequestException(
          `File "${attachment.fileName}" exceeds maximum upload size of ${maxSizeMB}MB`,
        );
      }
    }
  }

  private async _processRichTextImages(
    htmlContent: string,
    creatorId: string,
    postId?: string,
  ): Promise<string> {
    if (!htmlContent) return htmlContent;
    ////console.log(htmlContent);
    const $ = cheerio.load(htmlContent);
    const imgElements = $('img');
    const uploadPromises: Promise<void>[] = [];

    imgElements.each((index, element) => {
      const img = $(element);
      const src = img.attr('src');

      if (src && src.startsWith('data:image/')) {
        // Example src: "data:image/png;base64,iVBORw0KGgo..."
        const match = src.match(
          /^data:(image\/(png|jpeg|jpg|gif));base64,(.+)$/,
        );
        if (match) {
          const mimeType = match[1];
          const fileExtension = match[2];
          const base64Data = match[3];

          const uploadPromise = (async () => {
            try {
              const buffer = Buffer.from(base64Data, 'base64');
              const fileName = `rte-image-${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExtension}`;

              const simulatedFile: Express.Multer.File = {
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
              const s3Bucket = business.s3.defaultBucket;

              const s3Url = await this.s3Service.uploadFile(
                simulatedFile,
                s3Folder,
                s3Bucket,
              );

              // IMPORTANT: Update the src attribute in the cheerio object
              img.attr('src', s3Url);
            } catch (error) {
              console.error(
                `Failed to upload embedded image to S3: ${error.message}. Keeping original base64.`,
              );
              // Optionally remove the image or keep base64: img.remove(); or keep as is
            }
          })();
          uploadPromises.push(uploadPromise);
        }
      }
    });

    // Wait for all uploads to complete before serializing
    await Promise.all(uploadPromises);

    // Return the modified HTML
    ////console.log('Processed HTML:', $('body').html());
    // return $.html();
    return $('body').html();
  }
  // --- End Helper ---

  async findById(id: string): Promise<Post> {
    return this.postModel.findById(id).exec();
  }

  async findByCreator(
    creatorId: string,
    options: {
      type?: PostType;
      status?: string;
      limit?: number;
      offset?: number;
    } = {},
  ): Promise<Post[]> {
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

  async updatePost(id: string, updateData: Partial<Post>): Promise<Post> {
    const existingPost = await this.findById(id);
    if (!existingPost) throw new NotFoundException('Post not found for update');
    const existingCreatorId = (existingPost.creator as any)._id?.toString() || existingPost.creator.toString();
    await this.validateCreatorPostAction(existingCreatorId, updateData.status);

    if (updateData.tags) {
      updateData.tags = this.processTags(updateData.tags);
    }

    if (updateData.collections) {
      updateData.collections = this.processTags(updateData.collections);
    }

    if (updateData.tierAccess) {
      updateData.tierAccess = this.processTags(updateData.tierAccess);
    }

    // --- Process rich text images for TEXT posts on update ---
    if (
      updateData.type === PostType.TEXT &&
      updateData.textContent !== undefined // Only process if textContent is being updated
    ) {
      ////console.log(`Processing rich text for update on post ${id}`);
      const existingPost = await this.findById(id); // Ensure creatorId is available
      if (!existingPost)
        throw new NotFoundException('Post not found for update');
      // Ensure creator is loaded if needed, though findById should populate it
      const creatorId =
        (existingPost.creator as User)?._id?.toString() ||
        (existingPost.creator as User)?.toString();
      if (!creatorId) {
        // console.error(
        //   'Creator ID missing on post object during update processing.',
        // );
        throw new Error('Cannot process images without creator ID.');
      }
      updateData.textContent = await this._processRichTextImages(
        updateData.textContent,
        creatorId,
        id, // Pass postId for S3 organization
      );
    }
    // --- End processing ---

    const post = await this.postModel
      .findByIdAndUpdate(id, { $set: updateData }, { new: true }) // Use $set for safety
      .populate(
        'creator',
        'displayName creatorUsername profilePicture status type',
      )
      .exec();

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    return post;
  }

  // ... (softDelete remains the same) ...
  async softDelete(id: string): Promise<Post> {
    return this.postModel
      .findByIdAndUpdate(id, { isDeleted: true }, { new: true })
      .exec();
  }

  async createTextPost(createPostData: {
    type: PostType.TEXT;
    creator: string;
    title: string;
    textContent?: string;
    mediaUrls?: string[];
    tags?: string[] | string;
    collections?: string[] | string;
    status?: string;
    tierAccess?: string[] | string;
    attachments?: Attachment[];
  }): Promise<Post> {
    if (createPostData.type === PostType.TEXT && !createPostData.textContent) {
      throw new BadRequestException('Text content is required for text posts');
    }

    await this.validateCreatorPostAction(createPostData.creator, createPostData.status || PostStatus.PUBLISHED);
    await this.validatePostContent(createPostData.textContent);

    // Process rich text images before saving
    let processedTextContent = createPostData.textContent;
    if (processedTextContent) {
      ////console.log('Processing rich text for new post');
      processedTextContent = await this._processRichTextImages(
        processedTextContent,
        createPostData.creator,
        // Post ID isn't available yet, use 'new' or creatorId
        // Let's use creatorId for initial path organization
        `creator-${createPostData.creator}`,
      );
    }

    const processedTags = this.processTags(createPostData.tags);
    const processedCollections = this.processTags(createPostData.collections);
    const processedTierAccess = this.processTags(createPostData.tierAccess);

    const postData = {
      ...createPostData,
      creator: new Types.ObjectId(createPostData.creator),
      textContent: processedTextContent,
      tags: processedTags,
      collections: processedCollections,
      tierAccess: processedTierAccess,
      attachments: createPostData.attachments, // Keep separate attachments
      status: createPostData.status || PostStatus.PUBLISHED, // Default status
    };

    const post = new this.postModel(postData);
    const savedPost = await post.save();

    // --- Optional: Re-process/Update S3 paths if using 'new' ---
    // If you used 'new' in the S3 path and want to update it with the real postId:
    if (processedTextContent !== createPostData.textContent) {
      try {
        // //console.log(
        //   `Post ${savedPost._id}: Re-processing rich text to update S3 paths if needed.`,
        // );
        const finalContent = await this._processRichTextImages(
          processedTextContent, // Process the content *already containing initial S3 links*
          createPostData.creator,
          savedPost._id.toString(), // Now we have the actual post ID
        );

        // Check if the content actually changed (e.g., if 'new' was in the path)
        // This check might be complex depending on how _processRichTextImages handles already-S3 links.
        // A simpler approach might be to *always* re-process and update if base64 was present initially.
        if (finalContent !== processedTextContent) {
          // Basic check, might need refinement
          ////console.log(
          // `Post ${savedPost._id}: Updating textContent with final S3 paths.`,
          // );
          savedPost.textContent = finalContent;
          await savedPost.save(); // Save the update
          // Note: This doesn't delete the 'new' path images. Manual cleanup might be needed.
        }
      } catch (reprocessError) {
        console.error(
          `Post ${savedPost._id}: Failed to re-process/update S3 paths after save: ${reprocessError.message}`,
        );
        // Decide how to handle this - log, alert, etc. The post is saved with initial S3 links.
      }
    }
    // --- End optional update ---

    return savedPost; // Return the potentially updated post
  }

  // ... (createVideoPost, extractVideoInfo, createAudioPost, createImagePost, createLinkPost remain the same) ...
  async createVideoPost(
    userId: string,
    createVideoPostDto: CreateVideoPostDto & { status?: string },
    attachments?: Attachment[], // Use Attachment type
  ): Promise<Post> {
    const {
      videoUrl,
      title,
      description,
      tags,
      collections,
      tierAccess,
      status,
    } = createVideoPostDto;

    if (!videoUrl) {
      throw new BadRequestException('Video URL is required');
    }

    await this.validateCreatorPostAction(userId, status || PostStatus.PUBLISHED);
    await this.validateAttachments(attachments);

    let videoInfo = this.extractVideoInfo(videoUrl);
    // Allow direct uploads (e.g., S3 URLs) by treating them as a valid "upload" platform
    if (!videoInfo.isValid) {
      // Basic acceptance for uploaded/self-hosted URLs
      const isS3Upload =
        videoUrl.includes('amazonaws.com/') ||
        videoUrl.includes(business.s3.defaultBucket);
      if (isS3Upload) {
        videoInfo = {
          isValid: true,
          platform: 'upload',
          videoId: undefined,
          thumbnailUrl: undefined,
        };
      } else {
        throw new BadRequestException(
          'Invalid video URL. Supported platforms: YouTube, Vimeo, or upload a video file.',
        );
      }
    }

    const processedTags = this.processTags(tags);
    const processedCollections = this.processTags(collections);
    const processedTierAccess = this.processTags(tierAccess);

    const post = new this.postModel({
      type: PostType.VIDEO,
      creator: new Types.ObjectId(userId),
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
      status: status || PostStatus.PUBLISHED,
    });

    return post.save();
  }

  extractVideoInfo(url: string): {
    isValid: boolean;
    platform?: string;
    videoId?: string;
    thumbnailUrl?: string;
  } {
    try {
      if (url.includes('youtube.com') || url.includes('youtu.be')) {
        let videoId = '';
        if (url.includes('youtube.com/watch?v=')) {
          videoId = url.split('watch?v=')[1].split('&')[0];
        } else if (url.includes('youtu.be/')) {
          videoId = url.split('youtu.be/')[1].split('?')[0];
        }
        if (!videoId) {
          return { isValid: false };
        }
        return {
          isValid: true,
          platform: 'youtube',
          videoId,
          thumbnailUrl: `${branding.video.youtubeThumbnailBase}/${videoId}/maxresdefault.jpg`,
        };
      } else if (url.includes('vimeo.com')) {
        const videoId = url.split('vimeo.com/')[1].split('?')[0];
        if (!videoId) {
          return { isValid: false };
        }
        return {
          isValid: true,
          platform: 'vimeo',
          videoId,
          thumbnailUrl: '', // Vimeo requires API call for thumbnail
        };
      }
      return { isValid: false };
    } catch (error) {
      console.error('Error extracting video info:', error);
      return { isValid: false };
    }
  }

  async createAudioPost(
    userId: string,
    createAudioPostDto: CreateAudioPostDto & { status?: string },
    audioFileUrl: string,
    attachments?: Attachment[], // Use Attachment type
  ): Promise<Post> {
    const { title, description, collections, tags, tierAccess, status } =
      createAudioPostDto;

    await this.validateCreatorPostAction(userId, status || PostStatus.PUBLISHED);
    await this.validateAttachments(attachments);

    const processedTags = this.processTags(tags);
    const processedCollections = this.processTags(collections);
    const processedTierAccess = this.processTags(tierAccess);

    const post = new this.postModel({
      type: PostType.AUDIO,
      creator: new Types.ObjectId(userId),
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
      status: status || PostStatus.PUBLISHED,
    });

    return post.save();
  }

  async createImagePost(
    userId: string,
    createImagePostDto: CreateImagePostDto & {
      status?: string;
      thumbnailUrl: string;
    },
    imageUrls: string[],
    attachments?: Attachment[],
  ): Promise<Post> {
    const {
      title,
      description,
      collections,
      tags,
      tierAccess,
      status,
      thumbnailUrl,
    } = createImagePostDto;

    await this.validateCreatorPostAction(userId, status || PostStatus.PUBLISHED);
    await this.validateAttachments(attachments);

    const processedTags = this.processTags(tags);
    const processedCollections = this.processTags(collections);
    const processedTierAccess = this.processTags(tierAccess);

    const post = new this.postModel({
      type: PostType.IMAGE,
      creator: new Types.ObjectId(userId),
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
      status: status || PostStatus.PUBLISHED,
      thumbnailUrl,
    });

    return post.save();
  }

  async createLinkPost(
    userId: string,
    createLinkPostDto: CreateLinkPostDto & { status?: string },
    attachments?: Attachment[], // Use Attachment type
  ): Promise<Post> {
    const {
      title,
      linkUrl,
      description,
      collections,
      tags,
      tierAccess,
      status,
    } = createLinkPostDto;

    await this.validateCreatorPostAction(userId, status || PostStatus.PUBLISHED);

    const processedTags = this.processTags(tags);
    const processedCollections = this.processTags(collections);
    const processedTierAccess = this.processTags(tierAccess);

    const post = new this.postModel({
      type: PostType.LINK,
      creator: new Types.ObjectId(userId),
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
      status: status || PostStatus.PUBLISHED,
    });

    return post.save();
  }

  // ... (findPublishedPosts, findPublishedPostsByCreator, filterPostForListing, permanentDelete, like/unlike, comments, etc. remain the same) ...

  async findPublishedPosts(
    fetchPostsDto: FetchPostsDto,
    userId?: string,
    creatorId?: string,
  ): Promise<{
    posts: (Post & {
      isRestrictedView?: boolean;
      previewText?: string;
      thumbnailUrl?: string;
    })[];
    total: number;
  }> {
    const {
      page = 1,
      limit = 10,
      sortBy = SortBy.CREATED_AT,
      sortOrder = SortOrder.DESC,
      types: postTypes,
      tierAccess,
      search,
      collections,
      tags,
      datePublished,
    } = fetchPostsDto;

    let types;
    if (typeof postTypes === 'string') {
      try {
        types = JSON.parse(postTypes);
      } catch (e) {
        // //console.log(e);
        types = postTypes ? [postTypes] : undefined;
      }
    } else {
      types = postTypes;
    }

    const skip = (page - 1) * limit;
    const filter: any = {
      status: PostStatus.PUBLISHED,
      isDeleted: false,
      isActive: true,
    };

    if (creatorId) {
      filter.creator = new Types.ObjectId(creatorId);
    }

    if (types?.length) {
      filter.type = { $in: types };
    }

    if (datePublished && datePublished !== 'All time') {
      const now = new Date();
      let startDate: Date;

      switch (datePublished) {
        case 'week':
          startDate = new Date(now);
          // Set to the beginning of the week (assuming Sunday is the first day)
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
      //@ts-ignore
      const specialFilter =
        typeof tierAccess === 'string'
          ? JSON.parse(tierAccess)[0]
          : tierAccess[0];

      if (specialFilter === 'Free Members') {
        filter.tierAccess = { $size: 0 };
      } else if (specialFilter === 'Paid only') {
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

    const sort: any = {};
    sort[sortBy] = sortOrder === SortOrder.ASC ? 1 : -1;

    const [posts, total] = await Promise.all([
      this.postModel
        .find(filter)
        .populate(
          'creator',
          'displayName profilePicture creatorUsername type status textContent',
        )
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .exec(),
      this.postModel.countDocuments(filter),
    ]);

    return { posts, total };
  }

  async findPublishedPostsByCreator(
    creatorId: string,
    fetchPostsDto: FetchPostsDto,
    userId?: string,
  ): Promise<{
    posts: (Post & {
      isRestrictedView?: boolean;
      previewText?: string;
      thumbnailUrl?: string;
    })[];
    total: number;
  }> {
    return this.findPublishedPosts(fetchPostsDto, userId, creatorId);
  }

  filterPostForListing(
    post: Post & { previewText?: string },
    hasFullAccess: boolean,
  ): any {
    const listingPost = post.toObject ? { ...post.toObject() } : { ...post };
    if (listingPost.creator && listingPost.creator instanceof Types.ObjectId) {
      listingPost.creator = { _id: listingPost.creator };
    } else if (!listingPost.creator) {
      listingPost.creator = {};
    }
    // if (listingPost.title === 'Thumbnailtest') {
    //   //console.log('log 2 ==> ', listingPost.title, hasFullAccess);
    // }
    if (!hasFullAccess) {
      switch (post.type) {
        case PostType.TEXT:
          listingPost.previewText = post.previewText;
          delete listingPost.textContent;
          listingPost.description = post.description;
          break;
        case PostType.IMAGE:
          // if (listingPost.mediaUrls && listingPost.mediaUrls.length > 0) {
          //   listingPost.thumbnailUrl = listingPost.mediaUrls[0];
          // }
          listingPost.mediaUrls = [];
          post.mediaUrls = [];
          listingPost.textContent = (
            post.textContent ||
            post.description ||
            ''
          ).slice(0, 100);
          post.textContent = (post.textContent || post.description || '').slice(
            0,
            100,
          );
          listingPost.description = (
            post.textContent ||
            post.description ||
            ''
          ).slice(0, 100);
          post.description = (post.textContent || post.description || '').slice(
            0,
            100,
          );
          listingPost.previewText = (
            post.textContent ||
            post.description ||
            ''
          ).slice(0, 100);
          post.previewText = (post.textContent || post.description || '').slice(
            0,
            100,
          );
          break;
        case PostType.VIDEO:
          delete listingPost.videoUrl;
          delete listingPost.videoId;
          listingPost.textContent =
            (post.textContent || post.description || '').slice(0, 100) + '...';
          post.textContent =
            (post.textContent || post.description || '').slice(0, 100) + '...';
          listingPost.description =
            (post.textContent || post.description || '').slice(0, 100) + '...';
          post.description = (post.textContent || post.description || '').slice(
            0,
            100,
          );
          listingPost.previewText =
            (post.textContent || post.description || '').slice(0, 100) + '...';
          post.previewText =
            (post.textContent || post.description || '').slice(0, 100) + '...';
          break;
        case PostType.AUDIO:
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
          // delete post.audioUrl;
          break;
        case PostType.LINK:
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
    } else {
      listingPost.isRestrictedView = false;
      if (post.textContent) {
        listingPost.previewText = post.previewText;
      } else if (post.description) {
        listingPost.previewText = post.previewText;
      }
      if (
        // !listingPost.thumbnailUrl &&
        post.mediaUrls &&
        post.mediaUrls.length > 0 &&
        post.type === PostType.IMAGE
      ) {
        listingPost.thumbnailUrl = post.mediaUrls[0];
      }
      if (
        post.type === PostType.VIDEO &&
        post.thumbnailUrl &&
        !listingPost.thumbnailUrl
      ) {
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
      displayName:
        listingPost.creator?.displayName ||
        listingPost.creator?.creatorUsername ||
        'Unknown',
      profilePicture: listingPost.creator?.profilePicture,
      username: listingPost.creator?.creatorUsername || '',
      category: listingPost.creator?.creatorCategory || '',
      // displayName:
      //   postObj.creator.displayName || postObj.creator.creatorUsername,
      // profilePicture: postObj.creator.profilePicture,
      // username: postObj.creator.creatorUsername,
      // category: postObj.creator.creatorCategory,
    };

    delete listingPost.__v;

    delete listingPost.likes;
    // //console.log('listingPost', listingPost, post);
    //console.log({ listingPost });
    return listingPost;
  }

  async permanentDelete(id: string): Promise<void> {
    console.log('permanentDelete', id);
    await this.postModel.deleteOne({ _id: id });
  }

  async hasUserLikedPost(userId: string, postId: string): Promise<boolean> {
    const post = await this.postModel.findOne({
      _id: new Types.ObjectId(postId),
      'likes.user': new Types.ObjectId(userId),
    });
    return !!post;
  }

  async likePost(userId: string, postId: string): Promise<void> {
    const post = await this.postModel.findById(postId);
    if (!post) throw new NotFoundException('Post not found');
    const hasLiked = await this.hasUserLikedPost(userId, postId);
    if (hasLiked) return;

    await this.postModel.updateOne(
      { _id: new Types.ObjectId(postId) },
      {
        $push: {
          likes: { user: new Types.ObjectId(userId), createdAt: new Date() },
        },
        $inc: { likeCount: 1 },
      },
    );

    // Update analytics
    try {
      const now = new Date();
      now.setHours(0, 0, 0, 0); // Start of the day

      const existingInsight = await this.postInsightModel.findOne({
        post: new Types.ObjectId(postId),
        date: now,
      });

      if (existingInsight) {
        // Update existing insight
        await this.postInsightModel.updateOne(
          { _id: existingInsight._id },
          { $inc: { engagements: 1 } },
        );
      } else {
        // Create new insight
        await this.postInsightModel.create({
          post: new Types.ObjectId(postId),
          creator: post.creator,
          date: now,
          impressions: 0,
          engagements: 1,
        });
      }
    } catch (error) {
      console.error('Error updating analytics for like:', error);
    }
  }

  async unlikePost(userId: string, postId: string): Promise<void> {
    const post = await this.postModel.findById(postId);
    if (!post) throw new NotFoundException('Post not found');
    const hasLiked = await this.hasUserLikedPost(userId, postId);
    if (!hasLiked) return;

    await this.postModel.updateOne(
      { _id: new Types.ObjectId(postId) },
      {
        $pull: { likes: { user: new Types.ObjectId(userId) } },
        $inc: { likeCount: -1 },
      },
    );
  }

  async addComment(
    userId: string,
    postId: string,
    commentText: string,
    parentId?: string,
  ): Promise<PostComment> {
    const post = await this.postModel.findById(postId);
    if (!post) throw new NotFoundException('Post not found');

    const commentId = new Types.ObjectId();
    const now = new Date();
    const comment: any = {
      _id: commentId,
      user: new Types.ObjectId(userId),
      text: commentText,
      createdAt: now,
      likes: [],
    };

    if (parentId) {
      const parentComment = post.comments?.find(
        (c) => c._id.toString() === parentId,
      );
      if (!parentComment)
        throw new NotFoundException('Parent comment not found');
      comment.parentComment = new Types.ObjectId(parentId);
    }

    await this.postModel.updateOne(
      { _id: new Types.ObjectId(postId) },
      {
        $push: { comments: comment },
        $inc: { commentCount: 1 },
      },
    );
    return comment; // Return the newly created comment structure
  }

  async getComments(postId: string) {
    const post = await this.postModel
      .findById(postId)
      .populate('comments.user', 'displayName profilePicture');
    if (!post) throw new NotFoundException('Post not found');
    return post.comments || [];
  }

  async getPostLikes(postId: string): Promise<any[]> {
    const post = await this.postModel
      .findById(postId)
      .populate('likes.user', 'displayName firstName lastName profilePicture');

    if (!post) {
      throw new NotFoundException('Post not found');
    }
    const likes = post.likes || [];
    return likes.map((like) => ({
      id: like._id.toString(),
      user: {
        id: (like.user as User)._id.toString(),
        displayName:
          (like.user as User).displayName ||
          `${(like.user as User).firstName || ''} ${(like.user as User).lastName || ''}`.trim() ||
          'User',
        profilePicture: (like.user as User).profilePicture,
      },
      createdAt: like.createdAt,
    }));
  }

  async getPostComments(postId: string, userId?: string): Promise<any[]> {
    const post = await this.postModel
      .findById(postId)
      .populate(
        'comments.user',
        'displayName firstName lastName profilePicture',
      )
      .populate(
        'comments.likes.user',
        'displayName firstName lastName profilePicture',
      ); // Populate likers too

    if (!post) {
      throw new NotFoundException('Post not found');
    }
    const comments = post.comments || [];
    // Sort comments, e.g., newest first
    comments.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    return comments.map((comment) => {
      const isLiked = userId
        ? comment.likes?.some(
            (like) => (like.user as User)._id.toString() === userId,
          )
        : false;
      const likesCount = comment.likes?.length || 0;
      return {
        id: comment._id.toString(),
        text: comment.text,
        user: {
          id: (comment.user as User)._id.toString(),
          displayName:
            (comment.user as User).displayName ||
            `${(comment.user as User).firstName || ''} ${(comment.user as User).lastName || ''}`.trim() ||
            'User',
          profilePicture: (comment.user as User).profilePicture,
        },
        createdAt: comment.createdAt,
        updatedAt: comment.updatedAt || comment.createdAt,
        likesCount,
        isLiked,
        parentId: comment.parentComment?.toString(),
      };
    });
  }

  async getPostCount(
    creatorId: string,
    status: PostStatus = PostStatus.PUBLISHED,
  ): Promise<number> {
    return this.postModel.countDocuments({
      creator: new Types.ObjectId(creatorId),
      status,
      isDeleted: false,
    });
  }

  async checkPostAccess(
    userId: string | undefined | null,
    post: Post,
  ): Promise<boolean> {
    try {
      console.log(post.tierAccess);
      if (!userId) {
        return false;
      }
      let creatorId: string;
      if (typeof post.creator === 'object' && post.creator !== null) {
        creatorId =
          (post.creator as User)._id?.toString() || (post.creator as User).id;
      } else {
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
        //console.log(post.creator);
      }

      if (!creatorId) {
        return false;
      }

      const requiredTierObjectIds = post.tierAccess
        .map((id) => {
          try {
            return new Types.ObjectId(id);
          } catch (e) {
            ////console.log(e);
            console.error(`Invalid tier ID format in post ${post._id}: ${id}`);
            return null;
          }
        })
        .filter((id) => id !== null);

      if (requiredTierObjectIds.length === 0 && post.tierAccess.length > 0) {
        console.warn(
          `Post ${post._id} has tierAccess defined but contains invalid IDs.`,
        );
        return false;
      }

      if (requiredTierObjectIds.length === 0) return true;

      const subscription = await this.subscriptionModel.findOne({
        subscriber: new Types.ObjectId(userId),
        creator: new Types.ObjectId(creatorId),
        status: 'active',
        membership: { $in: requiredTierObjectIds },
      });

      return !!subscription;
    } catch (error) {
      console.error(`Error in checkPostAccess for post ${post._id}:`, error);
      return false;
    }
  }

  async checkPostAccessWithId(
    userId: string | undefined | null,
    post: Post,
  ): Promise<{
    hasAccess: boolean;
    postId: string;
  }> {
    try {
      console.log(post.tierAccess);
      if (!userId) {
        return {
          hasAccess: false,
          postId: post.id,
        };
      }
      let creatorId: string;
      if (typeof post.creator === 'object' && post.creator !== null) {
        creatorId =
          (post.creator as User)._id?.toString() || (post.creator as User).id;
      } else {
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
        //console.log(post.creator);
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
            return new Types.ObjectId(id);
          } catch (e) {
            ////console.log(e);
            console.error(`Invalid tier ID format in post ${post._id}: ${id}`);
            return null;
          }
        })
        .filter((id) => id !== null);

      if (requiredTierObjectIds.length === 0 && post.tierAccess.length > 0) {
        console.warn(
          `Post ${post._id} has tierAccess defined but contains invalid IDs.`,
        );
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
        subscriber: new Types.ObjectId(userId),
        creator: new Types.ObjectId(creatorId),
        status: 'active',
        membership: { $in: requiredTierObjectIds },
      });

      return { hasAccess: !!subscription, postId: post.id };
    } catch (error) {
      console.error(`Error in checkPostAccess for post ${post._id}:`, error);
      return {
        hasAccess: false,
        postId: post.id,
      };
    }
  }

  async hasUserLikedComment(
    userId: string,
    commentId: string,
  ): Promise<boolean> {
    const post = await this.postModel.findOne({
      'comments._id': new Types.ObjectId(commentId),
    });
    if (!post) return false;
    const comment = post.comments.find((c) => c._id.toString() === commentId);
    if (!comment || !comment.likes) return false;
    return comment.likes.some((like) => like.user.toString() === userId);
  }

  async likeComment(
    userId: string,
    postId: string,
    commentId: string,
  ): Promise<any> {
    const post = await this.postModel.findById(postId);
    if (!post) throw new NotFoundException('Post not found');
    const commentIndex = post.comments?.findIndex(
      (c) => c._id.toString() === commentId,
    );
    if (commentIndex === -1 || commentIndex === undefined)
      throw new NotFoundException('Comment not found');

    const comment = post.comments[commentIndex];
    const hasLiked = comment.likes?.some(
      (like) => like.user.toString() === userId,
    );
    if (hasLiked)
      return {
        message: 'Comment already liked',
        liked: true,
        likesCount: comment.likes.length,
      };

    const updateResult = await this.postModel.updateOne(
      {
        _id: new Types.ObjectId(postId),
        'comments._id': new Types.ObjectId(commentId),
      },
      {
        $push: {
          'comments.$.likes': {
            user: new Types.ObjectId(userId),
            createdAt: new Date(),
          },
        },
      },
    );

    if (updateResult.modifiedCount === 0) {
      // Maybe check if already liked in a race condition?
      const checkPost = await this.postModel.findById(postId);
      const checkComment = checkPost?.comments?.find(
        (c) => c._id.toString() === commentId,
      );
      if (
        checkComment?.likes?.some((like) => like.user.toString() === userId)
      ) {
        return {
          message: 'Comment already liked',
          liked: true,
          likesCount: checkComment.likes.length,
        };
      }
      throw new Error('Failed to like comment');
    }

    const likesCount = (comment.likes?.length || 0) + 1; // Estimate count after push
    return { message: 'Comment liked successfully', liked: true, likesCount };
  }

  async unlikeComment(
    userId: string,
    postId: string,
    commentId: string,
  ): Promise<any> {
    const post = await this.postModel.findById(postId);
    if (!post) throw new NotFoundException('Post not found');
    const commentIndex = post.comments?.findIndex(
      (c) => c._id.toString() === commentId,
    );
    if (commentIndex === -1 || commentIndex === undefined)
      throw new NotFoundException('Comment not found');

    const comment = post.comments[commentIndex];
    const likeIndex = comment.likes?.findIndex(
      (like) => like.user.toString() === userId,
    );
    if (likeIndex === -1 || likeIndex === undefined)
      return {
        message: 'Comment not liked',
        liked: false,
        likesCount: comment.likes?.length || 0,
      };

    const updateResult = await this.postModel.updateOne(
      {
        _id: new Types.ObjectId(postId),
        'comments._id': new Types.ObjectId(commentId),
      },
      { $pull: { 'comments.$.likes': { user: new Types.ObjectId(userId) } } },
    );

    if (updateResult.modifiedCount === 0) {
      const checkPost = await this.postModel.findById(postId);
      const checkComment = checkPost?.comments?.find(
        (c) => c._id.toString() === commentId,
      );
      const stillLiked = checkComment?.likes?.some(
        (like) => like.user.toString() === userId,
      );
      if (stillLiked) throw new Error('Failed to unlike comment');
      // If not still liked, it means unlike already happened or like never existed
      return {
        message: 'Comment not liked',
        liked: false,
        likesCount: checkComment?.likes?.length || 0,
      };
    }

    const likesCount = (comment.likes?.length || 1) - 1; // Estimate count after pull
    return {
      message: 'Comment unliked successfully',
      liked: false,
      likesCount,
    };
  }

  async getCommentLikes(postId: string, commentId: string): Promise<any[]> {
    const post = await this.postModel
      .findOne(
        {
          _id: new Types.ObjectId(postId),
          'comments._id': new Types.ObjectId(commentId),
        },
        { 'comments.$': 1 },
      )
      .populate(
        'comments.likes.user',
        'displayName firstName lastName profilePicture',
      );
    if (!post) throw new NotFoundException('Post or comment not found');
    const comment = post.comments?.[0];
    if (!comment) throw new NotFoundException('Comment not found');
    const likes = comment.likes || [];
    return likes.map((like) => ({
      id: like._id.toString(),
      user: {
        id: (like.user as User)._id.toString(),
        displayName:
          (like.user as User).displayName ||
          `${(like.user as User).firstName || ''} ${(like.user as User).lastName || ''}`.trim() ||
          'User',
        profilePicture: (like.user as User).profilePicture,
      },
      createdAt: like.createdAt,
    }));
  }

  async isCommentLiked(
    userId: string,
    postId: string,
    commentId: string,
  ): Promise<boolean> {
    const post = await this.postModel.findOne(
      {
        _id: new Types.ObjectId(postId),
        'comments._id': new Types.ObjectId(commentId),
        'comments.likes.user': new Types.ObjectId(userId),
      },
      { _id: 1 },
    );
    return !!post;
  }

  async editComment(
    userId: string,
    postId: string,
    commentId: string,
    text: string,
  ): Promise<any> {
    const post = await this.postModel.findById(postId);
    if (!post) throw new NotFoundException('Post not found');

    const commentIndex = post.comments?.findIndex(
      (c) => c._id.toString() === commentId,
    );
    if (commentIndex === -1 || commentIndex === undefined)
      throw new NotFoundException('Comment not found');

    if (post.comments[commentIndex].user.toString() !== userId) {
      throw new UnauthorizedException('You can only edit your own comments');
    }

    const updateResult = await this.postModel.updateOne(
      {
        _id: new Types.ObjectId(postId),
        'comments._id': new Types.ObjectId(commentId),
      },
      { $set: { 'comments.$.text': text, 'comments.$.updatedAt': new Date() } },
    );

    if (updateResult.matchedCount === 0) {
      throw new NotFoundException('Comment not found during update');
    }

    // Fetch the updated comment to return, ensuring user details are populated
    const updatedPost = await this.postModel
      .findById(postId)
      .populate(
        'comments.user',
        'displayName firstName lastName profilePicture',
      );

    const updatedComment = updatedPost?.comments?.find(
      (c) => c._id.toString() === commentId,
    );
    if (!updatedComment) {
      throw new Error('Failed to retrieve updated comment');
    }

    return {
      id: updatedComment._id.toString(),
      text: updatedComment.text,
      user: {
        // Return populated user details
        id: (updatedComment.user as User)._id.toString(),
        displayName:
          (updatedComment.user as User).displayName ||
          `${(updatedComment.user as User).firstName || ''} ${(updatedComment.user as User).lastName || ''}`.trim() ||
          'User',
        profilePicture: (updatedComment.user as User).profilePicture,
      },
      createdAt: updatedComment.createdAt,
      updatedAt: updatedComment.updatedAt,
      parentId: updatedComment.parentComment?.toString(),
      likesCount: updatedComment.likes?.length || 0,
    };
  }

  async deleteComment(
    userId: string,
    postId: string,
    commentId: string,
  ): Promise<{ success: boolean; deletedCount: number }> {
    const post = await this.postModel
      .findById(postId)
      .populate('creator', '_id'); // Ensure creator ID is available
    if (!post) throw new NotFoundException('Post not found');

    const comment = post.comments?.find((c) => c._id.toString() === commentId);
    if (!comment) throw new NotFoundException('Comment not found');

    const isCommentAuthor = comment.user.toString() === userId;
    const isPostCreator =
      post.creator && (post.creator as User)._id.toString() === userId;

    if (!isCommentAuthor && !isPostCreator) {
      throw new UnauthorizedException(
        'You can only delete your own comments or comments on your posts',
      );
    }

    const childCommentIds = new Set<string>();
    this.findAllChildComments(post.comments, commentId, childCommentIds);
    childCommentIds.add(commentId);
    const commentIdsToDelete = Array.from(childCommentIds).map(
      (id) => new Types.ObjectId(id),
    );

    const result = await this.postModel.updateOne(
      { _id: new Types.ObjectId(postId) },
      {
        $pull: { comments: { _id: { $in: commentIdsToDelete } } },
        $inc: { commentCount: -commentIdsToDelete.length },
      },
    );

    // Check if any modification happened or if the comment was already gone
    const success =
      result.modifiedCount > 0 ||
      (result.matchedCount > 0 && commentIdsToDelete.length > 0);

    return { success, deletedCount: commentIdsToDelete.length };
  }

  private findAllChildComments(
    comments: PostComment[],
    parentId: string,
    childIds: Set<string>,
  ): void {
    if (!comments) return; // Guard against null/undefined comments array
    for (const comment of comments) {
      if (comment.parentComment?.toString() === parentId) {
        const commentId = comment._id.toString();
        childIds.add(commentId);
        // Recursively find children of this child comment
        this.findAllChildComments(comments, commentId, childIds);
      }
    }
  }

  private processTags(tags: string | string[] | any): string[] {
    if (!tags) return [];
    let processed: string[];
    if (typeof tags === 'string') {
      try {
        const parsed = JSON.parse(tags);
        processed = Array.isArray(parsed) ? parsed.map(String) : [String(tags)];
      } catch {
        processed = tags
          .split(',')
          .map((tag) => tag.trim())
          .filter((tag) => tag.length > 0);
        // If JSON parsing fails, treat as comma-separated or single tag
        if (processed.length === 1 && tags.includes(',')) {
          // Check if it was meant to be JSON but failed
          // console.warn("Failed to parse tags string as JSON, treating as single tag:", tags);
          processed = [tags];
        } else if (processed.length === 0 && tags.trim().length > 0) {
          processed = [tags.trim()]; // Handle single tag without comma
        }
      }
    } else if (Array.isArray(tags)) {
      processed = tags.map(String);
    } else {
      processed = [String(tags)]; // Handle unexpected types
    }
    return [...new Set(processed)].filter((tag) => tag.length > 0); // Ensure unique and non-empty
  }

  formatDate(date: Date): string {
    if (!date || !(date instanceof Date)) return '';
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

  getReadablePostType(type: string): string {
    const typeMap = {
      text: 'Text',
      image: 'Picture',
      audio: 'Audio',
      video: 'Video',
      link: 'Link',
    };
    return typeMap[type] || type;
  }

  async recordPostView(postId: string, userId?: string): Promise<void> {
    try {
      await this.postModel.updateOne(
        { _id: new Types.ObjectId(postId) },
        { $inc: { viewCount: 1 } },
      );

      const now = new Date();
      now.setHours(0, 0, 0, 0);

      const post = await this.postModel.findById(postId);
      if (!post) return;

      const existingInsight = await this.postInsightModel.findOne({
        post: new Types.ObjectId(postId),
        date: now,
      });

      if (existingInsight) {
        await this.postInsightModel.updateOne(
          { _id: existingInsight._id },
          { $inc: { impressions: 1 } },
        );
      } else {
        await this.postInsightModel.create({
          post: new Types.ObjectId(postId),
          creator: post.creator,
          date: now,
          impressions: 1,
          engagements: 0,
        });
      }
    } catch (error) {
      console.error('Error recording post view:', error);
    }
  }

  async getPostById(id: string, userId?: string) {
    const post = await this.postModel.findById(id);
    if (!post) {
      throw new NotFoundException('Post not found');
    }
    if (post.status === PostStatus.PUBLISHED) {
      this.recordPostView(id, userId).catch((error) => {
        console.error('Failed to record post view:', error);
      });
    }

    const hasFullAccess = await this.checkPostAccess(userId, post);

    // const tierAccessDetails = await Promise.all(
    //   (post.tierAccess || []).map(async (memberId) => {
    //     try {
    //       const membership =
    //         await this.membershipsService.getMembershipById(memberId);
    //       return {
    //         id: memberId,
    //         name: membership.name,
    //       };
    //     } catch (error) {
    //       ////console.log(error);
    //       return {
    //         id: memberId,
    //         name: 'Unknown Tier',
    //       };
    //     }
    //   }),
    // );
    const memberTiers = await this.membershipsService.getCreatorMemberships(
      (post.creator as User)._id.toString(),
      {},
    );

    const tierAccessDetails = (post.tierAccess || []).map((id) =>
      memberTiers.memberships.find((m) => m._id.toString() === id),
    );

    const postWithMemberships = {
      ...post.toObject(),
      tierAccess: tierAccessDetails,
    };

    let hasLiked = false;
    if (userId) {
      hasLiked = Boolean(
        postWithMemberships.likes.find(
          (like) => (like.user as User)._id.toString() === userId,
        ),
      );
    }

    const filteredPost = this.filterPostForListing(
      postWithMemberships as unknown as Post,
      hasFullAccess,
    );
    const creator = await this.userModel.findById(post.creator.toString());
    let previewText = '';
    if (post.textContent) {
      const $ = cheerio.load(post.textContent);
      const plainText = $.root().text();

      if (plainText.length <= 150) {
        previewText = post.textContent;
      } else {
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
            } else {
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
    } else if (post.description) {
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
}
