import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Post } from '@/database/schemas/post';
import { User } from '@/database/schemas/user';
import {
  WithheldPost,
  WithheldUser,
} from '@/database/schemas/report/withheld.schema';
import { WithholdPostDto, WithholdUserDto } from '../dto/moderation.dto';

@Injectable()
export class ModerationService {
  constructor(
    @InjectModel(Post.name)
    private readonly postModel: Model<Post>,
    @InjectModel(User.name)
    private readonly userModel: Model<User>,
    @InjectModel(WithheldPost.name)
    private readonly withheldPostModel: Model<WithheldPost>,
    @InjectModel(WithheldUser.name)
    private readonly withheldUserModel: Model<WithheldUser>,
  ) {}

  // ==================== WITHHELD POSTS ====================

  async withholdPost(
    postId: string,
    adminId: string,
    dto: WithholdPostDto,
  ): Promise<WithheldPost> {
    const post = await this.postModel.findById(postId).lean();
    if (!post) throw new NotFoundException('Post not found');

    const existing = await this.withheldPostModel.findOne({
      originalPostId: postId,
    });
    if (existing) throw new ConflictException('Post is already withheld');

    const withheldPost = new this.withheldPostModel({
      postData: post,
      originalPostId: postId,
      withheldBy: adminId,
      reason: dto.reason,
      adminNotes: dto.adminNotes,
      relatedReport: dto.relatedReportId,
    });
    await withheldPost.save();

    await this.postModel.findByIdAndDelete(postId);

    await withheldPost.populate({
      path: 'withheldBy',
      select: 'displayName email',
    });
    return withheldPost;
  }

  async restorePost(withheldPostId: string): Promise<Post> {
    const withheldPost = await this.withheldPostModel.findById(withheldPostId);
    if (!withheldPost) throw new NotFoundException('Withheld post not found');

    const existing = await this.postModel.findById(withheldPost.originalPostId);
    if (existing) throw new ConflictException('Post has already been restored');

    const postData = withheldPost.postData;
    const restoredPost = new this.postModel({
      ...postData,
      _id: withheldPost.originalPostId,
    });
    await restoredPost.save();

    await this.withheldPostModel.findByIdAndDelete(withheldPostId);
    return restoredPost;
  }

  async getWithheldPosts(
    page: number = 1,
    limit: number = 10,
  ): Promise<{ posts: WithheldPost[]; total: number }> {
    const skip = (page - 1) * limit;
    const [posts, total] = await Promise.all([
      this.withheldPostModel
        .find()
        .populate({ path: 'withheldBy', select: 'displayName email' })
        .sort({ withheldAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.withheldPostModel.countDocuments(),
    ]);
    return { posts, total };
  }

  async getWithheldPostById(id: string): Promise<WithheldPost> {
    const post = await this.withheldPostModel.findById(id).populate({
      path: 'withheldBy',
      select: 'displayName email',
    });
    if (!post) throw new NotFoundException('Withheld post not found');
    return post;
  }

  async getWithheldPostsCount(): Promise<number> {
    return this.withheldPostModel.countDocuments();
  }

  // ==================== WITHHELD USERS ====================

  async withholdUser(
    userId: string,
    adminId: string,
    dto: WithholdUserDto,
  ): Promise<WithheldUser> {
    if (userId === adminId)
      throw new BadRequestException('Cannot withhold yourself');

    const user = await this.userModel.findById(userId).lean();
    if (!user) throw new NotFoundException('User not found');
    if (user.isAdmin)
      throw new BadRequestException('Cannot withhold admin users');

    const existing = await this.withheldUserModel.findOne({
      originalUserId: userId,
    });
    if (existing) throw new ConflictException('User is already withheld');

    const withheldUser = new this.withheldUserModel({
      userData: user,
      originalUserId: userId,
      withheldBy: adminId,
      reason: dto.reason,
      adminNotes: dto.adminNotes,
      relatedReport: dto.relatedReportId,
    });
    await withheldUser.save();

    await this.userModel.findByIdAndDelete(userId);

    await withheldUser.populate({
      path: 'withheldBy',
      select: 'displayName email',
    });
    return withheldUser;
  }

  async restoreUser(withheldUserId: string): Promise<User> {
    const withheldUser = await this.withheldUserModel.findById(withheldUserId);
    if (!withheldUser) throw new NotFoundException('Withheld user not found');

    const existing = await this.userModel.findById(withheldUser.originalUserId);
    if (existing) throw new ConflictException('User has already been restored');

    const userData = withheldUser.userData;
    const restoredUser = new this.userModel({
      ...userData,
      _id: withheldUser.originalUserId,
    });
    await restoredUser.save();

    await this.withheldUserModel.findByIdAndDelete(withheldUserId);
    return restoredUser;
  }

  async getWithheldUsers(
    page: number = 1,
    limit: number = 10,
  ): Promise<{ users: WithheldUser[]; total: number }> {
    const skip = (page - 1) * limit;
    const [users, total] = await Promise.all([
      this.withheldUserModel
        .find()
        .populate({ path: 'withheldBy', select: 'displayName email' })
        .sort({ withheldAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.withheldUserModel.countDocuments(),
    ]);
    return { users, total };
  }

  async getWithheldUserById(id: string): Promise<WithheldUser> {
    const user = await this.withheldUserModel.findById(id).populate({
      path: 'withheldBy',
      select: 'displayName email',
    });
    if (!user) throw new NotFoundException('Withheld user not found');
    return user;
  }

  async getWithheldUsersCount(): Promise<number> {
    return this.withheldUserModel.countDocuments();
  }
}
