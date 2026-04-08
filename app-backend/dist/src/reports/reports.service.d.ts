import { Model } from 'mongoose';
import { PostReport } from '@/database/schemas/report/post-report.schema';
import { UserReport } from '@/database/schemas/report/user-report.schema';
import { Post } from '@/database/schemas/post';
import { User } from '@/database/schemas/user';
import { WithheldPost } from '@/database/schemas/report/withheld.schema';
import { WithheldUser } from '@/database/schemas/report/withheld.schema';
import { CreatePostReportDto, CreateUserReportDto, UpdateReportStatusDto, UpdateUserReportStatusDto, GetReportsQueryDto, GetUserReportsQueryDto, WithholdPostDto, WithholdUserDto, RestorePostDto, RestoreUserDto } from './reports.dto';
export declare class ReportsService {
    private readonly postReportModel;
    private readonly userReportModel;
    private readonly postModel;
    private readonly userModel;
    private readonly withheldPostModel;
    private readonly withheldUserModel;
    constructor(postReportModel: Model<PostReport>, userReportModel: Model<UserReport>, postModel: Model<Post>, userModel: Model<User>, withheldPostModel: Model<WithheldPost>, withheldUserModel: Model<WithheldUser>);
    createPostReport(reportedBy: string, createPostReportDto: CreatePostReportDto): Promise<PostReport>;
    getPostReports(query: GetReportsQueryDto): Promise<{
        reports: PostReport[];
        total: number;
    }>;
    getPostReportById(reportId: string): Promise<PostReport>;
    updatePostReportStatus(reportId: string, reviewerId: string, updateStatusDto: UpdateReportStatusDto): Promise<PostReport>;
    deletePostReport(reportId: string): Promise<void>;
    getPostReportsByPostId(postId: string): Promise<PostReport[]>;
    getPostReportsCount(postId: string): Promise<number>;
    createUserReport(reportedBy: string, createUserReportDto: CreateUserReportDto): Promise<UserReport>;
    getUserReports(query: GetUserReportsQueryDto): Promise<{
        reports: UserReport[];
        total: number;
    }>;
    getUserReportById(reportId: string): Promise<UserReport>;
    updateUserReportStatus(reportId: string, reviewerId: string, updateStatusDto: UpdateUserReportStatusDto): Promise<UserReport>;
    deleteUserReport(reportId: string): Promise<void>;
    getUserReportsByUserId(userId: string): Promise<UserReport[]>;
    getUserReportsCount(userId: string): Promise<number>;
    getReportStatistics(): Promise<any>;
    withholdPost(postId: string, adminId: string, withholdDto: WithholdPostDto): Promise<WithheldPost>;
    restorePost(withheldPostId: string, adminId: string, restoreDto: RestorePostDto): Promise<Post>;
    getWithheldPosts(page?: number, limit?: number): Promise<{
        posts: WithheldPost[];
        total: number;
    }>;
    getWithheldPostById(withheldPostId: string): Promise<WithheldPost>;
    withholdUser(userId: string, adminId: string, withholdDto: WithholdUserDto): Promise<WithheldUser>;
    restoreUser(withheldUserId: string, adminId: string, restoreDto: RestoreUserDto): Promise<User>;
    getWithheldUsers(page?: number, limit?: number): Promise<{
        users: WithheldUser[];
        total: number;
    }>;
    getWithheldUserById(withheldUserId: string): Promise<WithheldUser>;
}
