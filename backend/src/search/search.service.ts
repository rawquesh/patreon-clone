import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  User,
  CreatorStatus,
  ContentVisibility,
  GenderPreference,
} from '@/schemas/users.schema';
import { Post, PostStatus } from '@/schemas/posts.schema';

// Add the interface (can be moved to a shared types file later)
interface RequestingUser {
  userId: string;
  gender?: string;
  genderPreference?: GenderPreference;
}

@Injectable()
export class SearchService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Post.name) private postModel: Model<Post>,
  ) {}

  // Re-use the same helper function (consider moving to a shared utility)
  private addGenderFilters(
    baseFilter: any,
    requestingUser?: RequestingUser,
  ): any {
    const filter = { ...baseFilter };
    const genderConditions = [];

    // Condition 1: User preference matches creator gender (Case-insensitive)
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
      // Ensure $and condition is properly combined with existing filters
      if (filter.$and) {
        filter.$and = Array.isArray(filter.$and)
          ? [...filter.$and, ...genderConditions]
          : [filter.$and, ...genderConditions];
      } else {
        filter.$and = genderConditions;
      }
    }

    return filter;
  }

  async search(
    query: string,
    category?: string,
    requestingUser?: RequestingUser, // Changed parameter
    fullSearch: boolean = true,
  ) {
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

  async searchCreators(
    query: string,
    category?: string,
    requestingUser?: RequestingUser, // Changed parameter
  ) {
    let baseFilter: any = {
      isCreator: true,
      creatorStatus: CreatorStatus.PUBLISHED,
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
          { creatorCategory: { $regex: query, $options: 'i' } }, // Consider if searching category text makes sense here
        ],
      };
      baseFilter = { $and: [baseFilter, searchQuery] };
    }

    // const finalFilter = baseFilter;
    const finalFilter = this.addGenderFilters(baseFilter, requestingUser);

    // console.log('Search Creator Filter:', JSON.stringify(finalFilter, null, 2)); // For debugging
    // console.log(finalFilter);
    // Handle the specific case where ONLY category is provided (no query text)
    // This was handled separately before, ensure it still works.
    // The combined filter should handle this correctly now.

    const creators = await this.userModel
      .find(finalFilter)
      .select(
        '_id displayName creatorUsername profilePicture creatorHeadline creatorCategory',
      )
      .limit(20);

    console.log({
      creators,
      finalFilter: JSON.stringify(finalFilter, null, 2),
    });

    return creators;
  }

  async searchPosts(query: string, category?: string) {
    if (!query || query.trim() === '') {
      return [];
    }

    const filter: any = {
      status: PostStatus.PUBLISHED,
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
      .select(
        '_id title description textContent thumbnailUrl mediaUrls createdAt type tags',
      )
      .sort({ createdAt: -1 })
      .limit(20);

    return posts.map((post) => {
      let content = '';
      if (post.textContent) {
        content =
          post.textContent.substring(0, 150) +
          (post.textContent.length > 150 ? '...' : '');
      } else if (post.description) {
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
}
