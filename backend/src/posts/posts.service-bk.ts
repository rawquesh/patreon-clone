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
} from '@/schemas/posts.schema';
import {
  CreateAudioPostDto,
  CreateImagePostDto,
  CreateLinkPostDto,
  CreateVideoPostDto,
  FetchPostsDto,
  SortBy,
  SortOrder,
} from './posts.dto';
import { Subscription } from '@/schemas/subscribers.schema';

export interface PostLike {
  _id?: string;
  user: Types.ObjectId | string;
  createdAt: Date;
}

// export interface PostComment {
//   _id: string | Types.ObjectId;
//   user: Types.ObjectId | string;
//   text: string;
//   createdAt: Date;
//   updatedAt?: Date;
//   parentComment?: string;
// }

@Injectable()
export class PostsService {
  constructor(
    @InjectModel(Post.name) private postModel: Model<Post>,
    @InjectModel(Subscription.name)
    private subscriptionModel: Model<Subscription>,
  ) {}

  async findById(id: string): Promise<Post> {
    return this.postModel
      .findById(id)
      .populate('creator', 'displayName creatorUsername profilePicture')
      .exec();
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
    if (updateData.tags) {
      updateData.tags = this.processTags(updateData.tags);
    }

    if (updateData.collections) {
      updateData.collections = this.processTags(updateData.collections);
    }

    if (updateData.tierAccess) {
      if (typeof updateData.tierAccess === 'string') {
        try {
          updateData.tierAccess = JSON.parse(
            updateData.tierAccess as unknown as string,
          );
        } catch (e) {
          console.error('Error parsing tierAccess:', e);
        }
      }
    }

    const post = await this.postModel
      .findByIdAndUpdate(id, updateData, { new: true })
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
    attachments?: Array<{
      url: string;
      fileName: string;
      fileType: string;
      fileSize: number;
      uploadedAt: Date;
    }>;
  }): Promise<Post> {
    if (createPostData.type === PostType.TEXT && !createPostData.textContent) {
      throw new BadRequestException('Text content is required for text posts');
    }

    // Process tags as array of strings
    const processedTags = this.processTags(createPostData.tags);

    // Process collections
    let processedCollections = [];
    if (createPostData.collections) {
      processedCollections = this.processTags(createPostData.collections);
    }

    // Process tierAccess
    let processedTierAccess = [];
    if (createPostData.tierAccess) {
      if (typeof createPostData.tierAccess === 'string') {
        try {
          processedTierAccess = JSON.parse(createPostData.tierAccess);
        } catch (e) {
          console.error('Error parsing tierAccess:', e);
          processedTierAccess = [];
        }
      } else if (Array.isArray(createPostData.tierAccess)) {
        processedTierAccess = createPostData.tierAccess;
      }
    }

    const post = new this.postModel({
      ...createPostData,
      creator: new Types.ObjectId(createPostData.creator),
      tags: processedTags,
      collections: processedCollections,
      tierAccess: processedTierAccess,
    });

    return post.save();
  }

  async createVideoPost(
    userId: string,
    createVideoPostDto: CreateVideoPostDto & { status?: string },
    attachments?: Array<{
      url: string;
      fileName: string;
      fileType: string;
      fileSize: number;
      uploadedAt?: Date;
    }>,
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

    const videoInfo = this.extractVideoInfo(videoUrl);
    if (!videoInfo.isValid) {
      throw new BadRequestException(
        'Invalid video URL. Supported platforms: YouTube, Vimeo',
      );
    }

    // Process tags as array of strings
    const processedTags = this.processTags(tags);

    // Process collections
    const processedCollections = this.processTags(collections);

    // Process tierAccess
    let processedTierAccess = [];
    if (tierAccess) {
      processedTierAccess = this.processTags(tierAccess);
    }

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
          thumbnailUrl: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
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
          thumbnailUrl: '',
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
    attachments?: Array<{
      url: string;
      fileName: string;
      fileType: string;
      fileSize: number;
      uploadedAt?: Date;
    }>,
  ): Promise<Post> {
    const { title, description, collections, tags, tierAccess, status } =
      createAudioPostDto;

    // Process tags as array of strings
    const processedTags = this.processTags(tags);

    // Process collections
    const processedCollections = this.processTags(collections);

    // Process tierAccess
    let processedTierAccess = [];
    if (tierAccess) {
      processedTierAccess = this.processTags(tierAccess);
    }

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
    createImagePostDto: CreateImagePostDto & { status?: string },
    imageUrls: string[],
    attachments?: Array<{
      url: string;
      fileName: string;
      fileType: string;
      fileSize: number;
      uploadedAt?: Date;
    }>,
  ): Promise<Post> {
    const { title, description, collections, tags, tierAccess, status } =
      createImagePostDto;

    // Process tags as array of strings
    const processedTags = this.processTags(tags);

    // Process collections
    const processedCollections = this.processTags(collections);

    // Process tierAccess
    let processedTierAccess = [];
    if (tierAccess) {
      processedTierAccess = this.processTags(tierAccess);
    }

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
    });

    return post.save();
  }

  async createLinkPost(
    userId: string,
    createLinkPostDto: CreateLinkPostDto & { status?: string },
    attachments?: Array<{
      url: string;
      fileName: string;
      fileType: string;
      fileSize: number;
      uploadedAt?: Date;
    }>,
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

    // Process tags as array of strings
    const processedTags = this.processTags(tags);

    // Process collections
    const processedCollections = this.processTags(collections);

    // Process tierAccess
    let processedTierAccess = [];
    if (tierAccess) {
      processedTierAccess = this.processTags(tierAccess);
    }

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
    } = fetchPostsDto;

    let types;
    if (typeof postTypes === 'string') {
      try {
        types = JSON.parse(postTypes);
      } catch (e) {
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

    if (tierAccess?.length) {
      let parsedTierAccess = tierAccess;
      if (typeof tierAccess === 'string') {
        try {
          parsedTierAccess = JSON.parse(tierAccess);
        } catch (e) {
          console.error('Error parsing tierAccess filter:', e);
          parsedTierAccess = [];
        }
      }

      if (parsedTierAccess.length) {
        filter.$or = [
          { tierAccess: { $in: parsedTierAccess } },
          { tierAccess: { $size: 0 } },
        ];
      }
    }

    if (collections?.length) {
      let parsedCollections = collections;
      if (typeof collections === 'string') {
        try {
          parsedCollections = JSON.parse(collections);
        } catch (e) {
          parsedCollections = [collections];
        }
      }
      filter.collections = { $in: parsedCollections };
    }

    if (tags?.length) {
      let parsedTags = tags;
      if (typeof tags === 'string') {
        try {
          parsedTags = JSON.parse(tags);
        } catch (e) {
          parsedTags = [tags];
        }
      }
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
          'displayName profilePicture creatorUsername type status',
        )
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .exec(),
      this.postModel.countDocuments(filter),
    ]);

    const postsWithRestrictedContent = await Promise.all(
      posts.map(async (post) => {
        const hasAccess = userId
          ? await this.checkPostAccess(userId, post)
          : false;
        return this.filterPostForListing(post, hasAccess);
      }),
    );
    return { posts: postsWithRestrictedContent, total };
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
    const posts = await this.findPublishedPosts(
      fetchPostsDto,
      userId,
      creatorId,
    );
    return posts;
  }

  filterPostForListing(post: any, hasFullAccess: boolean): any {
    const listingPost = { ...post.toObject() };

    if (!hasFullAccess) {
      switch (post.type) {
        case PostType.TEXT:
          delete listingPost.textContent;
          delete listingPost.description;
          listingPost.previewText = post.textContent?.substring(0, 150) + '...';
          break;

        case PostType.IMAGE:
          if (listingPost.mediaUrls && listingPost.mediaUrls.length > 0) {
            listingPost.thumbnailUrl = listingPost.mediaUrls[0];
            listingPost.mediaUrls = listingPost.mediaUrls.map((url) => {
              return url.includes('?')
                ? `${url}&blur=true`
                : `${url}?blur=true`;
            });
          }
          break;

        case PostType.VIDEO:
          delete listingPost.videoUrl;
          delete listingPost.videoId;
          break;

        case PostType.AUDIO:
          delete listingPost.mediaUrls;
          break;

        case PostType.LINK:
          delete listingPost.linkUrl;
          break;
      }

      listingPost.isRestrictedView = true;
    }

    return listingPost;
  }

  async permanentDelete(id: string): Promise<void> {
    await this.postModel.findByIdAndDelete(id).exec();
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

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    const hasLiked = await this.hasUserLikedPost(userId, postId);
    if (hasLiked) {
      return;
    }

    await this.postModel.updateOne(
      { _id: new Types.ObjectId(postId) },
      {
        $push: {
          likes: {
            user: new Types.ObjectId(userId),
            createdAt: new Date(),
          },
        },
        $inc: { likeCount: 1 },
      },
    );
  }

  async unlikePost(userId: string, postId: string): Promise<void> {
    const post = await this.postModel.findById(postId);

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    const hasLiked = await this.hasUserLikedPost(userId, postId);
    if (!hasLiked) {
      return;
    }

    await this.postModel.updateOne(
      { _id: new Types.ObjectId(postId) },
      {
        $pull: {
          likes: {
            user: new Types.ObjectId(userId),
          },
        },
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

    if (!post) {
      throw new NotFoundException('Post not found');
    }

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
      if (!parentComment) {
        throw new NotFoundException('Parent comment not found');
      }

      comment.parentComment = new Types.ObjectId(parentId);
    }

    await this.postModel.updateOne(
      { _id: new Types.ObjectId(postId) },
      {
        $push: {
          comments: comment,
        },
        $inc: { commentCount: 1 },
      },
    );

    return comment;
  }

  async getComments(postId: string) {
    const post = await this.postModel
      .findById(postId)
      .populate('comments.user', 'displayName profilePicture');

    if (!post) {
      throw new NotFoundException('Post not found');
    }

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
        id: like.user._id.toString(),
        displayName:
          like.user.displayName ||
          `${like.user.firstName || ''} ${like.user.lastName || ''}`.trim() ||
          'User',
        profilePicture: like.user.profilePicture,
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
      );

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    const comments = post.comments || [];

    return comments.map((comment) => {
      // Calculate if the requesting user has liked this comment
      const isLiked = userId
        ? comment.likes?.some((like) => like.user._id.toString() === userId)
        : false;

      // Get the likes count
      const likesCount = comment.likes?.length || 0;

      return {
        id: comment._id.toString(),
        text: comment.text,
        user: {
          id: comment.user._id.toString(),
          displayName:
            comment.user.displayName ||
            `${comment.user.firstName || ''} ${comment.user.lastName || ''}`.trim() ||
            'User',
          profilePicture: comment.user.profilePicture,
        },
        createdAt: comment.createdAt,
        updatedAt: comment.updatedAt || comment.createdAt,
        likesCount,
        isLiked,
        parentId: comment.parentComment?.toString(), // Include parentId if it exists
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

  async checkPostAccess(userId: string, post: Post): Promise<boolean> {
    if (!userId) {
      return false;
    }

    if (post.creator._id.toString() === userId) {
      return true;
    }

    if (!post.tierAccess || post.tierAccess.length === 0) {
      return true;
    }

    const subscriptions = await this.subscriptionModel.find({
      subscriber: new Types.ObjectId(userId),
      creator: post.creator._id,
      status: 'active',
      membership: { $in: post.tierAccess.map((id) => new Types.ObjectId(id)) },
    });

    return subscriptions.length > 0;
  }

  async hasUserLikedComment(
    userId: string,
    commentId: string,
  ): Promise<boolean> {
    const post = await this.postModel.findOne({
      'comments._id': new Types.ObjectId(commentId),
    });

    if (!post) {
      return false;
    }

    const comment = post.comments.find((c) => c._id.toString() === commentId);

    if (!comment || !comment.likes) {
      return false;
    }

    return comment.likes.some((like) => like.user.toString() === userId);
  }

  async likeComment(
    userId: string,
    postId: string,
    commentId: string,
  ): Promise<any> {
    const post = await this.postModel.findById(postId);

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    const comment = post.comments?.find((c) => c._id.toString() === commentId);

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }
    console.log('comment exists');
    const hasLiked = await this.hasUserLikedComment(userId, commentId);
    console.log({ hasLiked });
    if (hasLiked) {
      return { message: 'Comment already liked', liked: true };
    }
    // Add the like to the comment
    await this.postModel.updateOne(
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

    console.log('Comment liked successfully');

    // Get the updated comment for response
    const updatedPost = await this.postModel.findOne(
      {
        _id: new Types.ObjectId(postId),
        'comments._id': new Types.ObjectId(commentId),
      },
      { 'comments.$': 1 },
    );

    console.log('Updated post:');
    JSON.stringify(updatedPost, null, 2);

    const updatedComment = updatedPost?.comments?.[0];
    const likesCount = updatedComment?.likes?.length || 0;

    return {
      message: 'Comment liked successfully',
      liked: true,
      likesCount,
    };
  }

  async unlikeComment(
    userId: string,
    postId: string,
    commentId: string,
  ): Promise<any> {
    const post = await this.postModel.findById(postId);

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    const comment = post.comments?.find((c) => c._id.toString() === commentId);

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    const hasLiked = await this.hasUserLikedComment(userId, commentId);
    if (!hasLiked) {
      return { message: 'Comment not liked', liked: false };
    }

    // Remove the like from the comment
    await this.postModel.updateOne(
      {
        _id: new Types.ObjectId(postId),
        'comments._id': new Types.ObjectId(commentId),
      },
      {
        $pull: {
          'comments.$.likes': {
            user: new Types.ObjectId(userId),
          },
        },
      },
    );

    // Get the updated comment for response
    const updatedPost = await this.postModel.findOne(
      {
        _id: new Types.ObjectId(postId),
        'comments._id': new Types.ObjectId(commentId),
      },
      { 'comments.$': 1 },
    );

    const updatedComment = updatedPost?.comments?.[0];
    const likesCount = updatedComment?.likes?.length || 0;

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

    if (!post) {
      throw new NotFoundException('Post or comment not found');
    }

    const comment = post.comments?.[0];
    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    const likes = comment.likes || [];

    return likes.map((like) => ({
      id: like._id.toString(),
      user: {
        id: like.user._id.toString(),
        displayName:
          like.user.displayName ||
          `${like.user.firstName || ''} ${like.user.lastName || ''}`.trim() ||
          'User',
        profilePicture: like.user.profilePicture,
      },
      createdAt: like.createdAt,
    }));
  }

  async isCommentLiked(
    userId: string,
    postId: string,
    commentId: string,
  ): Promise<boolean> {
    return this.hasUserLikedComment(userId, commentId);
  }

  async editComment(
    userId: string,
    postId: string,
    commentId: string,
    text: string,
  ): Promise<any> {
    const post = await this.postModel.findById(postId);

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    const comment = post.comments?.find((c) => c._id.toString() === commentId);

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    // Check if the user is the comment author
    if (comment.user.toString() !== userId) {
      throw new UnauthorizedException('You can only edit your own comments');
    }

    // Update the comment
    await this.postModel.updateOne(
      {
        _id: new Types.ObjectId(postId),
        'comments._id': new Types.ObjectId(commentId),
      },
      {
        $set: {
          'comments.$.text': text,
          'comments.$.updatedAt': new Date(),
        },
      },
    );

    // Get the updated comment
    const updatedPost = await this.postModel
      .findOne(
        {
          _id: new Types.ObjectId(postId),
          'comments._id': new Types.ObjectId(commentId),
        },
        { 'comments.$': 1 },
      )
      .populate(
        'comments.user',
        'displayName firstName lastName profilePicture',
      );

    const updatedComment = updatedPost?.comments?.[0];

    if (!updatedComment) {
      throw new NotFoundException('Failed to retrieve updated comment');
    }

    return {
      id: updatedComment._id.toString(),
      text: updatedComment.text,
      user: {
        id: updatedComment.user._id.toString(),
        displayName:
          updatedComment.user.displayName ||
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

  async deleteComment(
    userId: string,
    postId: string,
    commentId: string,
  ): Promise<{ success: boolean; deletedCount: number }> {
    const post = await this.postModel.findById(postId);

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    const comment = post.comments?.find((c) => c._id.toString() === commentId);

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    const isCommentAuthor = comment.user.toString() === userId;
    const isPostCreator = post.creator.toString() === userId;

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

    // Update the post to remove the comments
    const result = await this.postModel.updateOne(
      { _id: new Types.ObjectId(postId) },
      {
        $pull: {
          comments: { _id: { $in: commentIdsToDelete } },
        },
        $inc: { commentCount: -commentIdsToDelete.length },
      },
    );

    return {
      success: result.modifiedCount > 0,
      deletedCount: commentIdsToDelete.length,
    };
  }

  private findAllChildComments(
    comments: PostComment[],
    parentId: string,
    childIds: Set<string>,
  ): void {
    for (const comment of comments) {
      if (comment.parentComment?.toString() === parentId) {
        const commentId = comment._id.toString();
        childIds.add(commentId);
        this.findAllChildComments(comments, commentId, childIds);
      }
    }
  }

  private processTags(tags: string | string[] | any): string[] {
    if (!tags) {
      return [];
    }

    if (Array.isArray(tags) && tags.every((tag) => typeof tag === 'string')) {
      return tags;
    }

    if (typeof tags === 'string') {
      try {
        const parsedTags = JSON.parse(tags);
        if (Array.isArray(parsedTags)) {
          return parsedTags.map((tag) => String(tag));
        }
        return [tags];
      } catch (e) {
        return [tags];
      }
    }

    if (!Array.isArray(tags)) {
      return [String(tags)];
    }

    return tags.map((tag) => String(tag));
  }

  formatDate(date: Date): string {
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

  filterPostContent(post: any, hasFullAccess: boolean): any {
    if (hasFullAccess) {
      return post;
    }

    const filteredPost = { ...post };

    switch (post.type) {
      case 'text':
        delete filteredPost.textContent;
        delete filteredPost.description;
        filteredPost.previewText = post.textContent?.substring(0, 150) + '...';
        break;

      case 'image':
        if (filteredPost.mediaUrls && filteredPost.mediaUrls.length > 0) {
          filteredPost.mediaUrls = filteredPost.mediaUrls.map((url) => {
            return url.includes('?') ? `${url}&blur=true` : `${url}?blur=true`;
          });
        }
        break;

      case 'video':
        delete filteredPost.videoUrl;
        delete filteredPost.videoId;
        break;

      case 'audio':
        delete filteredPost.mediaUrls;
        break;

      case 'link':
        delete filteredPost.linkUrl;
        break;
    }

    filteredPost.isRestrictedView = true;

    return filteredPost;
  }
}
