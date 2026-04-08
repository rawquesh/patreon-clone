import {
  Injectable,
  ConflictException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Collection } from './collections.schema';
import { Post, PostStatus } from '@/schemas/posts.schema';
import { CreateCollectionDto, GetCollectionPostsDto } from './collections.dto';
import { MembershipsService } from '@/memberships/memberships.service';

@Injectable()
export class CollectionsService {
  constructor(
    @InjectModel(Collection.name) private collectionModel: Model<Collection>,
    @InjectModel(Post.name) private postModel: Model<Post>,
    private readonly membershipsService: MembershipsService,
  ) {}

  async create(
    creatorId: string,
    createCollectionDto: CreateCollectionDto,
    coverImageUrl?: string,
  ): Promise<Collection> {
    const existingCollection = await this.collectionModel.findOne({
      creator: new Types.ObjectId(creatorId),
      title: createCollectionDto.title,
      isDeleted: false,
    });

    if (existingCollection) {
      throw new ConflictException('Collection with this title already exists');
    }

    const collection = new this.collectionModel({
      ...createCollectionDto,
      creator: new Types.ObjectId(creatorId),
      coverImage: coverImageUrl,
      posts: [],
    });
    return collection.save();
  }

  async findByCreator(
    creatorId: string,
    includeDeleted: boolean = false,
  ): Promise<Collection[]> {
    const filter: any = {
      creator: new Types.ObjectId(creatorId),
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

  async findById(id: string, userId?: string): Promise<any> {
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
        status: PostStatus.PUBLISHED,
        isDeleted: false,
      };

      const posts = await this.postModel
        .find(filter)
        .populate('creator')
        .sort({ createdAt: -1 })
        .exec();

      const tierAccessForCreator =
        await this.membershipsService.getCreatorMemberships(
          posts[0].creator._id.toString(),
          {},
        );

      const transformedPosts = await Promise.all(
        posts.map(async (post) => {
          const hasAccess = await this.checkPostAccess(userId, post);
          const tierAccess = post.tierAccess.map((ta) =>
            tierAccessForCreator.memberships.find(
              (t) => t._id.toString() === ta,
            ),
          );
          return {
            ...this.filterPostForListing(post, hasAccess),
            hasAccess,
            tierAccess,
          };
        }),
      );

      collection.posts = transformedPosts;
    }

    return collection;
  }

  async update(
    creatorId: string,
    collectionId: string,
    updateCollectionDto: Partial<Collection>,
  ): Promise<Collection> {
    const collection = await this.collectionModel.findOne({
      _id: collectionId,
      creator: new Types.ObjectId(creatorId),
    });

    if (!collection) {
      throw new NotFoundException('Collection not found');
    }

    if (
      updateCollectionDto.title &&
      updateCollectionDto.title !== collection.title
    ) {
      const existingCollection = await this.collectionModel.findOne({
        creator: new Types.ObjectId(creatorId),
        title: updateCollectionDto.title,
        _id: { $ne: collectionId },
        isDeleted: false,
      });

      if (existingCollection) {
        throw new ConflictException(
          'Collection with this title already exists',
        );
      }
    }

    return this.collectionModel.findByIdAndUpdate(
      collectionId,
      { $set: updateCollectionDto },
      { new: true },
    );
  }

  async addPostToCollection(
    userId: string,
    collectionId: string,
    postId: string,
  ): Promise<Collection> {
    // Verify the collection exists and user owns it
    const collection = await this.collectionModel.findOne({
      _id: new Types.ObjectId(collectionId),
      creator: new Types.ObjectId(userId),
      isDeleted: false,
    });

    if (!collection) {
      throw new NotFoundException('Collection not found or access denied');
    }

    // Verify the post exists
    const post = await this.postModel.findOne({
      _id: new Types.ObjectId(postId),
      isDeleted: false,
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    // Verify the user owns the post
    if (post.creator.toString() !== userId) {
      throw new ForbiddenException(
        'You can only add your own posts to collections',
      );
    }

    // Check if post is already in the collection
    const isPostInCollection = collection.posts.some(
      (p) => p.toString() === postId,
    );
    console.log(collectionId, postId, isPostInCollection);

    if (isPostInCollection) {
      // throw new ConflictException('Post is already in this collection');
      return collection;
    }

    // Add post to collection
    const updatedCollection = await this.collectionModel.findByIdAndUpdate(
      collectionId,
      {
        $addToSet: { posts: new Types.ObjectId(postId) },
        $inc: { postCount: 1 },
      },
      { new: true },
    );
    await this.postModel.findByIdAndUpdate(
      postId,
      {
        $addToSet: { collections: new Types.ObjectId(collectionId) },
      },
      { new: true },
    );

    return updatedCollection;
  }

  async removePostFromCollection(
    userId: string,
    collectionId: string,
    postId: string,
  ): Promise<Collection> {
    // Verify the collection exists and user owns it
    const collection = await this.collectionModel.findOne({
      _id: new Types.ObjectId(collectionId),
      creator: new Types.ObjectId(userId),
      isDeleted: false,
    });

    if (!collection) {
      throw new NotFoundException('Collection not found or access denied');
    }

    // Check if post is in the collection
    const isPostInCollection = collection.posts.some(
      (p) => p.toString() === postId,
    );

    if (!isPostInCollection) {
      throw new NotFoundException('Post is not in this collection');
    }

    // Remove post from collection
    const updatedCollection = await this.collectionModel.findByIdAndUpdate(
      collectionId,
      {
        $pull: { posts: new Types.ObjectId(postId) },
        $inc: { postCount: -1 },
      },
      { new: true },
    );

    return updatedCollection;
  }

  async getCollectionPosts(
    collectionId: string,
    queryParams: GetCollectionPostsDto,
    userId?: string,
  ): Promise<{ posts: any[]; total: number; pagination: any }> {
    // Verify the collection exists
    const collection = await this.collectionModel
      .findOne({
        _id: new Types.ObjectId(collectionId),
        isDeleted: false,
      })
      .populate('creator', 'displayName creatorUsername profilePicture');

    if (!collection) {
      throw new NotFoundException('Collection not found');
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

    // Prepare filter
    const filter: any = {
      _id: { $in: collection.posts },
      status: PostStatus.PUBLISHED,
      isDeleted: false,
    };

    // Add type filter if specified
    if (queryParams.types && queryParams.types.length > 0) {
      filter.type = { $in: queryParams.types };
    }

    // Prepare sort
    const sort: any = {};
    sort[queryParams.sortBy || 'createdAt'] =
      (queryParams.sortOrder || 'desc') === 'desc' ? -1 : 1;

    // Calculate pagination values
    const page = queryParams.page || 1;
    const limit = queryParams.limit || 10;
    const skip = (page - 1) * limit;

    // First count total matching posts
    const total = await this.postModel.countDocuments(filter);

    // Fetch posts with pagination
    const posts = await this.postModel
      .find(filter)
      .populate(
        'creator',
        'displayName creatorUsername profilePicture isCreator',
      )
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .exec();

    // Transform posts based on access rights
    const transformedPosts = await Promise.all(
      posts.map(async (post) => {
        const hasAccess = await this.checkPostAccess(userId, post);
        return this.filterPostForListing(post, hasAccess);
      }),
    );

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

  // Check if user has access to the post based on membership tiers
  private async checkPostAccess(
    userId: string | undefined,
    post: Post,
  ): Promise<boolean> {
    // If post has no tier restrictions, everyone has access
    if (!post.tierAccess || post.tierAccess.length === 0) {
      return true;
    }

    // If no user is logged in, no access
    if (!userId) {
      return false;
    }

    // Post creator always has access
    const creatorId =
      typeof post.creator === 'object'
        ? post.creator._id.toString()
        : post.creator;

    if (creatorId === userId) {
      return true;
    }

    // Check if user is subscribed to any of the required tiers
    // This is a placeholder - the actual implementation depends on your subscription model
    // You would typically check against your subscription database here
    return false;
  }

  // Filter post content based on access permissions
  private filterPostForListing(post: any, hasFullAccess: boolean): any {
    const listingPost = post.toObject ? { ...post.toObject() } : { ...post };

    // Ensure creator is populated correctly
    if (listingPost.creator && listingPost.creator instanceof Types.ObjectId) {
      listingPost.creator = { _id: listingPost.creator };
    } else if (!listingPost.creator) {
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
    } else {
      listingPost.isRestrictedView = false;
      if (post.textContent) {
        listingPost.previewText = post.textContent?.substring(0, 150) + '...';
      } else if (post.description) {
        listingPost.previewText = post.description?.substring(0, 150) + '...';
      }
      if (
        !listingPost.thumbnailUrl &&
        post.mediaUrls &&
        post.mediaUrls.length > 0 &&
        post.type === 'image'
      ) {
        listingPost.thumbnailUrl = post.mediaUrls[0];
      }
      if (
        post.type === 'video' &&
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
    listingPost.creator = {
      id: listingPost.creator?._id?.toString() || '',
      displayName:
        listingPost.creator?.displayName ||
        listingPost.creator?.creatorUsername ||
        'Unknown',
      profilePicture: listingPost.creator?.profilePicture,
      username: listingPost.creator?.creatorUsername || '',
      category: listingPost.creator?.creatorCategory || '',
    };

    // Remove sensitive or unnecessary fields for listing
    delete listingPost.__v;

    return listingPost;
  }

  private formatDate(date: Date): string {
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

  private getReadablePostType(type: string): string {
    const typeMap = {
      text: 'Text',
      image: 'Picture',
      audio: 'Audio',
      video: 'Video',
      link: 'Link',
    };
    return typeMap[type] || type;
  }

  async delete(
    id: string,
    userId: string,
  ): Promise<{ acknowledged: boolean; deletedCount: number }> {
    const result = await this.collectionModel.deleteOne({
      _id: id,
      creator: userId,
    });

    if (result.deletedCount === 0) {
      throw new NotFoundException(
        `Collection not found or you don't have permission to delete it.`,
      );
    }

    return result;
  }
}
