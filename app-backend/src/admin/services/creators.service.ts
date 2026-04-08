import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '@/database/schemas/user';
import { CreatorStatus } from '@/database/schemas/user';
import { Subscription } from '@/database/schemas/subscription/subscription.schema';
import { Post } from '@/database/schemas/post';
import {
  GetCreatorsQueryDto,
  CreatorActionDto,
} from '../dto/creators.dto';

@Injectable()
export class CreatorsService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Subscription.name)
    private subscriptionModel: Model<Subscription>,
    @InjectModel(Post.name) private postModel: Model<Post>,
  ) {}

  async getCreators(
    query: GetCreatorsQueryDto,
  ): Promise<{ creators: any[]; total: number }> {
    const {
      page = 1,
      limit = 20,
      search,
      status,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = query;

    const filter: any = { isCreator: true };
    if (status) filter.creatorStatus = status;
    if (search) {
      filter.$or = [
        { displayName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { creatorUsername: { $regex: search, $options: 'i' } },
      ];
    }

    const sortObj: any = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };
    const skip = (page - 1) * limit;

    const [creators, total] = await Promise.all([
      this.userModel
        .find(filter)
        .select(
          'email displayName firstName lastName profilePicture profileCover creatorUsername creatorStatus creatorHeadline creatorCategory bio hasCompletedStripeOnboarding stripeConnectAccountId availableBalance pendingBalance lifetimeEarnings createdAt isDeactivated',
        )
        .sort(sortObj)
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      this.userModel.countDocuments(filter),
    ]);

    // Enrich with subscription count
    const enrichedCreators = await Promise.all(
      creators.map(async (creator: any) => {
        const subscriberCount = await this.subscriptionModel
          .countDocuments({ creator: creator._id, status: 'active' })
          .exec();
        const postCount = await this.postModel
          .countDocuments({ creator: creator._id, status: 'published' })
          .exec();
        return {
          ...creator,
          id: creator._id.toString(),
          subscriberCount,
          postCount,
        };
      }),
    );

    return { creators: enrichedCreators, total };
  }

  async getCreatorById(id: string): Promise<any> {
    const creator = await this.userModel
      .findById(id)
      .select(
        'email displayName firstName lastName profilePicture profileCover creatorUsername creatorStatus creatorHeadline creatorCategory bio hasCompletedStripeOnboarding stripeConnectAccountId availableBalance pendingBalance lifetimeEarnings createdAt isDeactivated introVideoUrl socialLinks countryOfResidence gender creatorNotifyOnNewMember creatorNotifyOnComments creatorNotifyOnDirectMessages memberNotifyOnNewPost memberNotifyOnDirectMessages',
      )
      .lean()
      .exec();

    if (!creator) throw new NotFoundException('Creator not found');

    const [subscriberCount, totalSubscribers, postCount] = await Promise.all([
      this.subscriptionModel
        .countDocuments({ creator: id, status: 'active' })
        .exec(),
      this.subscriptionModel.countDocuments({ creator: id }).exec(),
      this.postModel.countDocuments({ creator: id, status: 'published' }).exec(),
    ]);

    const subscriptions = await this.subscriptionModel
      .find({ creator: id })
      .populate('subscriber', 'displayName email profilePicture firstName lastName')
      .populate('membership', 'name monthlyRate')
      .sort({ createdAt: -1 })
      .limit(10)
      .lean()
      .exec();

    return {
      ...creator,
      id: creator._id.toString(),
      subscriberCount,
      totalSubscribers,
      postCount,
      recentSubscriptions: subscriptions.map((s: any) => ({
        ...s,
        id: s._id.toString(),
        subscriber: s.subscriber
          ? {
              ...s.subscriber,
              id: s.subscriber._id?.toString(),
            }
          : null,
        membership: s.membership
          ? {
              ...s.membership,
              id: s.membership._id?.toString(),
            }
          : null,
      })),
    };
  }

  async approveCreator(id: string, dto: CreatorActionDto): Promise<any> {
    const creator = await this.userModel.findById(id);
    if (!creator) throw new NotFoundException('Creator not found');
    if (!creator.isCreator) throw new BadRequestException('User is not a creator');

    creator.creatorStatus = CreatorStatus.PUBLISHED;
    await creator.save();
    return {
      message: 'Creator approved successfully',
      creator: this.sanitizeCreator(creator),
    };
  }

  async rejectCreator(id: string, dto: CreatorActionDto): Promise<any> {
    const creator = await this.userModel.findById(id);
    if (!creator) throw new NotFoundException('Creator not found');
    if (!creator.isCreator) throw new BadRequestException('User is not a creator');

    creator.creatorStatus = CreatorStatus.ARCHIVED;
    creator.isCreator = false;
    await creator.save();
    return {
      message: 'Creator rejected successfully',
      creator: this.sanitizeCreator(creator),
    };
  }

  async suspendCreator(id: string, dto: CreatorActionDto): Promise<any> {
    const creator = await this.userModel.findById(id);
    if (!creator) throw new NotFoundException('Creator not found');
    if (!creator.isCreator) throw new BadRequestException('User is not a creator');
    if (creator.isAdmin) throw new BadRequestException('Cannot suspend admin users');

    creator.creatorStatus = CreatorStatus.ARCHIVED;
    await creator.save();
    return {
      message: 'Creator suspended successfully',
      creator: this.sanitizeCreator(creator),
    };
  }

  async activateCreator(id: string): Promise<any> {
    const creator = await this.userModel.findById(id);
    if (!creator) throw new NotFoundException('Creator not found');

    creator.creatorStatus = CreatorStatus.PUBLISHED;
    creator.isCreator = true;
    await creator.save();
    return {
      message: 'Creator activated successfully',
      creator: this.sanitizeCreator(creator),
    };
  }

  private sanitizeCreator(user: User): any {
    return {
      id: (user._id as any).toString(),
      displayName: user.displayName,
      email: user.email,
      creatorStatus: user.creatorStatus,
      isCreator: user.isCreator,
    };
  }
}
