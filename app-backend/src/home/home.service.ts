import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  User,
  CreatorStatus,
  ContentVisibility,
  GenderPreference,
} from '@/database/schemas/user';
import { Post, PostStatus } from '@/database/schemas/post';
import { Subscription } from '@/database/schemas/subscription';
import { PostsService } from '@/posts/posts.service';
import { MembershipsService } from '@/memberships/memberships.service';

interface RequestingUser {
  userId: string;
  gender?: string;
  genderPreference?: GenderPreference;
}

@Injectable()
export class HomeService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Post.name) private postModel: Model<Post>,
    @InjectModel(Subscription.name)
    private subscriptionModel: Model<Subscription>,
    private readonly postsService: PostsService,
    private readonly membershipsService: MembershipsService,
  ) {}

  private addGenderFilters(
    baseFilter: any,
    requestingUser?: RequestingUser,
  ): any {
    const filter = { ...baseFilter };
    const genderConditions = [];
    console.log(requestingUser?.genderPreference);
    if (
      requestingUser?.genderPreference &&
      requestingUser.genderPreference !== GenderPreference.BOTH
    ) {
      if (requestingUser.genderPreference === GenderPreference.MALE) {
        genderConditions.push({
          $or: [{ gender: 'male' }, { gender: 'Male' }],
        });
      } else if (requestingUser.genderPreference === GenderPreference.FEMALE) {
        genderConditions.push({
          $or: [{ gender: 'female' }, { gender: 'Female' }],
        });
      }
      // No push if BOTH, as it doesn't filter by creator gender
    }

    // Condition 2: Creator visibility matches user gender
    if (requestingUser?.gender) {
      // Convert user gender to lowercase for comparison
      const userGenderLower = requestingUser.gender.toLowerCase();
      if (userGenderLower === 'male' || userGenderLower === 'female') {
        genderConditions.push({
          $or: [
            { contentVisibleTo: ContentVisibility.BOTH },
            { contentVisibleTo: userGenderLower as ContentVisibility }, // Use lowercase gender
          ],
        });
      } else {
        // If user gender is not male/female (or invalid case), only show creators visible to BOTH
        genderConditions.push({ contentVisibleTo: ContentVisibility.BOTH });
      }
    } else {
      // If requesting user has no gender specified, they can only see creators visible to BOTH
      genderConditions.push({ contentVisibleTo: ContentVisibility.BOTH });
    }

    if (genderConditions.length > 0) {
      if (filter.$and) {
        filter.$and = [...filter.$and, ...genderConditions];
      } else {
        filter.$and = genderConditions;
      }
    }

    return filter;
  }

  async getTopCreators(
    limit: number = 10,
    requestingUser?: RequestingUser,
  ): Promise<User[]> {
    const topCreatorIds = await this.subscriptionModel.aggregate([
      { $match: { status: 'active' } },
      { $group: { _id: '$creator', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: limit },
    ]);

    const creatorIds = topCreatorIds.map((item) => item._id);

    const baseFilter: any = {
      _id: { $in: creatorIds },
      isCreator: true,
      creatorStatus: CreatorStatus.PUBLISHED,
    };

    const finalFilter = this.addGenderFilters(baseFilter, requestingUser);
    console.log(finalFilter);
    const creators = await this.userModel
      .find(finalFilter)
      .select(
        'displayName creatorUsername profilePicture creatorHeadline creatorCategory',
      )
      .limit(limit);

    return creators;
  }
  async getPopularThisWeek(
    limit: number = 10,
    requestingUser?: RequestingUser,
  ): Promise<User[]> {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const popularPosts = await this.postModel.aggregate([
      {
        $match: {
          createdAt: { $gte: oneWeekAgo },
          status: PostStatus.PUBLISHED,
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
      { $limit: limit * 2 }, // Fetch more initially to allow for filtering
    ]);

    const creatorIds = popularPosts.map((item) => item._id);

    // Create filter with gender visibility
    const baseFilter: any = {
      _id: { $in: creatorIds },
      isCreator: true,
      creatorStatus: CreatorStatus.PUBLISHED,
    };

    const finalFilter = this.addGenderFilters(baseFilter, requestingUser);

    const creators = await this.userModel
      .find(finalFilter)
      .select(
        'displayName creatorUsername profilePicture creatorHeadline creatorCategory',
      )
      // Re-apply limit after filtering
      .limit(limit);

    // We need to sort based on the original popularity ranking from aggregation
    const creatorMap = new Map(creators.map((c) => [c._id.toString(), c]));
    const sortedCreators = creatorIds
      .map((id) => creatorMap.get(id.toString()))
      .filter(Boolean) // Filter out creators not found after gender filter
      .slice(0, limit); // Ensure final limit

    return sortedCreators as User[];
  }
  async getTopCreatorsByCategory(
    category: string,
    limit: number = 10,
    requestingUser?: RequestingUser,
  ): Promise<User[]> {
    if (!category) {
      return [];
    }

    // Create filter with category and gender visibility
    const baseFilter: any = {
      isCreator: true,
      creatorStatus: CreatorStatus.PUBLISHED,
      creatorCategory: category,
    };

    const finalFilter = this.addGenderFilters(baseFilter, requestingUser);

    const categoryCreators = await this.userModel
      .find(finalFilter)
      .select(
        'displayName creatorUsername profilePicture creatorHeadline creatorCategory _id',
      )
      .limit(limit * 2); // Fetch more to sort by subs before limiting

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

    // Sort based on subscriber count and apply final limit
    const sortedCreators = categoryCreators
      .sort((a, b) => {
        const countA = countMap.get(a._id.toString()) || 0;
        const countB = countMap.get(b._id.toString()) || 0;
        return countB - countA;
      })
      .slice(0, limit);

    return sortedCreators;
  }

  async getCategories(): Promise<string[]> {
    const categories = await this.userModel.distinct('creatorCategory', {
      isCreator: true,
      creatorStatus: CreatorStatus.PUBLISHED,
      creatorCategory: { $ne: null },
    });

    return categories.filter(Boolean) as string[];
  }

  // In home/home.service.ts

  async getRecentlyVisitedCreators(
    userId: string, // Keep userId for fetching history
    limit: number = 10,
    requestingUser?: RequestingUser, // Add requestingUser for filtering
  ): Promise<any[]> {
    // TODO: Need to fetch actual recently visited creator IDs first based on userId
    // This current implementation fetches *any* creators, not recently visited ones.
    // Assuming we have a list of `recentlyVisitedCreatorIds` from CreatorHistoryService...

    // Placeholder: Fetching random creators for now, logic needs update
    // const recentlyVisitedCreatorIds = await this.creatorHistoryService.getVisitedCreatorIds(userId, limit * 2); // Example

    // Create filter with gender visibility
    const baseFilter: any = {
      // _id: { $in: recentlyVisitedCreatorIds }, // Use actual IDs when available
      isCreator: true,
      creatorStatus: CreatorStatus.PUBLISHED,
    };

    const finalFilter = this.addGenderFilters(baseFilter, requestingUser);

    // Fetch creator details based on filtered IDs
    const creators = await this.userModel
      .find(finalFilter) // Use finalFilter here
      .select('displayName creatorUsername profilePicture _id') // Ensure _id is selected
      .limit(limit); // Limit the final result

    // TODO: Associate lastVisitedAt timestamp correctly if needed from history data
    return creators.map((creator) => {
      const randomDays = Math.floor(Math.random() * 7) + 1;
      const lastVisitedAt = new Date();
      lastVisitedAt.setDate(lastVisitedAt.getDate() - randomDays);

      return {
        _id: creator._id,
        displayName: creator.displayName,
        creatorUsername: creator.creatorUsername,
        profilePicture: creator.profilePicture,
        lastVisitedAt: lastVisitedAt.toISOString(), // Placeholder
      };
    });
  }

  async getSubscribedFeed(
    userId: string,
    page: number = 1,
    limit: number = 10,
    gender?: string,
  ): Promise<{
    posts: any[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  }> {
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
            { contentVisibleTo: ContentVisibility.BOTH },
            { contentVisibleTo: gender },
          ],
        })
        .select('_id');

      filteredCreatorIds = creators.map((creator) => creator._id) as any;
    }

    const skip = (page - 1) * limit;

    const [posts, total] = await Promise.all([
      this.postModel
        .find({
          creator: { $in: filteredCreatorIds },
          status: PostStatus.PUBLISHED,
          isDeleted: false,
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate(
          'creator',
          'displayName creatorUsername profilePicture creatorCategory',
        )
        .exec(),

      this.postModel.countDocuments({
        creator: { $in: filteredCreatorIds },
        status: PostStatus.PUBLISHED,
        isDeleted: false,
      }),
    ]);

    const accessPromises = posts.map((post) =>
      this.postsService.checkPostAccessWithId(userId, post),
    );

    const uniqueCreators: string[] = [];

    posts.forEach((post) => {
      const creatorId = (post.creator as User).id;
      if (!uniqueCreators.includes(creatorId)) {
        uniqueCreators.push(creatorId);
      }
    });

    const hasAcccessObj = await Promise.all(accessPromises);

    const membershipTiersPromises = uniqueCreators.map((creator) =>
      this.membershipsService.getCreatorMemberships(creator, {}),
    );
    const membershipTiers = await Promise.all(membershipTiersPromises);

    const formattedPosts = posts.map((post) => {
      const hasAccess = hasAcccessObj.find(
        (p) => p.postId === post.id,
      ).hasAccess!;
      const postObj = post.toObject();
      delete postObj.comments;
      delete postObj.likes;
      let previewText = '';
      if (postObj.textContent) {
        previewText =
          postObj.textContent.substring(0, 150) +
          (postObj.textContent.length > 150 ? '...' : '');
      } else if (postObj.description) {
        previewText = postObj.description;
      }

      const creatorTier = membershipTiers.find(
        (mt) => mt.creatorId === (post.creator as User).id,
      )!;

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
          id: (postObj.creator as User)._id,
          displayName:
            (postObj.creator as User).displayName ||
            (postObj.creator as User).creatorUsername,
          profilePicture: (postObj.creator as User).profilePicture,
          username: (postObj.creator as User).creatorUsername,
          category: (postObj.creator as User).creatorCategory,
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
}
