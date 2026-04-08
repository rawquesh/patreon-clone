import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Subscription } from '@/database/schemas/subscription';
import { User } from '@/database/schemas/user';
import { Membership } from '@/database/schemas/membership';
import { GetMembersDto, MembersResponseDto } from './members.dto';

@Injectable()
export class MembersService {
  constructor(
    @InjectModel(Subscription.name)
    private subscriptionModel: Model<Subscription>,
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Membership.name) private membershipModel: Model<Membership>,
  ) {}

  async getMembers(
    creatorId: string,
    filters: GetMembersDto,
  ): Promise<MembersResponseDto> {
    const creator = await this.userModel.findById(creatorId);
    if (!creator) {
      throw new NotFoundException('Creator not found');
    }

    const filter: any = {
      creator: new Types.ObjectId(creatorId),
    };

    if (filters.status) {
      filter.status = filters.status;
    }

    if (filters.tier) {
      filter.membership = new Types.ObjectId(filters.tier);
    }

    if (filters.joinDate) {
      const date = new Date(filters.joinDate);
      if (!isNaN(date.getTime())) {
        const startDate = new Date(date);
        startDate.setHours(0, 0, 0, 0);

        const endDate = new Date(date);
        endDate.setHours(23, 59, 59, 999);

        filter.createdAt = {
          $gte: startDate,
          $lte: endDate,
        };
      }
    }

    const sort: any = {};

    const sortFieldMap = {
      name: 'subscriberInfo.displayName',
      email: 'subscriberInfo.email',
      joinDate: 'createdAt',
      totalPaid: 'totalPaid',
      tier: 'membershipInfo.name',
      status: 'status',
    };

    const sortField = sortFieldMap[filters.sortBy] || 'createdAt';
    sort[sortField] = filters.sortOrder === 'asc' ? 1 : -1;

    const pipeline = [];

    pipeline.push({ $match: filter });

    pipeline.push({
      $lookup: {
        from: 'users',
        localField: 'subscriber',
        foreignField: '_id',
        as: 'subscriberInfo',
      },
    });

    pipeline.push({
      $unwind: { path: '$subscriberInfo', preserveNullAndEmptyArrays: true },
    });

    pipeline.push({
      $lookup: {
        from: 'memberships',
        localField: 'membership',
        foreignField: '_id',
        as: 'membershipInfo',
      },
    });

    pipeline.push({
      $unwind: { path: '$membershipInfo', preserveNullAndEmptyArrays: true },
    });

    if (filters.search) {
      pipeline.push({
        $match: {
          $or: [
            {
              'subscriberInfo.displayName': {
                $regex: filters.search,
                $options: 'i',
              },
            },
            {
              'subscriberInfo.email': { $regex: filters.search, $options: 'i' },
            },
            {
              'membershipInfo.name': { $regex: filters.search, $options: 'i' },
            },
          ],
        },
      });
    }

    const countPipeline = [...pipeline];
    countPipeline.push({ $count: 'total' });
    const countResult = await this.subscriptionModel.aggregate(countPipeline);
    const total = countResult.length > 0 ? countResult[0].total : 0;

    pipeline.push({ $sort: sort });

    const skip = (filters.page - 1) * filters.limit;
    pipeline.push({ $skip: skip });
    pipeline.push({ $limit: filters.limit });

    pipeline.push({
      $project: {
        _id: 0,
        id: { $toString: '$_id' },
        name: '$subscriberInfo.displayName',
        email: '$subscriberInfo.email',
        profilePicture: '$subscriberInfo.profilePicture',
        tier: {
          id: { $toString: '$membershipInfo._id' },
          name: '$membershipInfo.name',
          monthlyRate: '$membershipInfo.monthlyRate',
        },
        joinDate: '$createdAt',
        status: 1,
        currentPeriodEnd: 1,
        totalPaid: {
          $multiply: [
            { $ifNull: ['$monthlyRate', 0] },
            {
              $divide: [
                {
                  $subtract: [new Date(), '$createdAt'],
                },
                2592000000, // 30 days in milliseconds
              ],
            },
          ],
        },
      },
    });

    const members = await this.subscriptionModel.aggregate(pipeline);

    const totalPages = Math.ceil(total / filters.limit);

    return {
      members,
      pagination: {
        total,
        page: filters.page,
        limit: filters.limit,
        totalPages,
      },
    };
  }
}
