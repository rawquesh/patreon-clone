import { Model } from 'mongoose';
import { PostReport } from '@/database/schemas/report/post-report.schema';
import { UserReport } from '@/database/schemas/report/user-report.schema';
import { Post } from '@/database/schemas/post';
import { User } from '@/database/schemas/user';
import { WithheldPost, WithheldUser } from '@/database/schemas/report/withheld.schema';
import { CreatePostReportDto, CreateUserReportDto, UpdateReportStatusDto, UpdateUserReportStatusDto, WithholdPostDto, WithholdUserDto, GetReportsQueryDto, GetUserReportsQueryDto } from './admin.dto';
export { CreatePostReportDto, CreateUserReportDto, UpdateReportStatusDto, UpdateUserReportStatusDto, WithholdPostDto, WithholdUserDto, RestorePostDto, RestoreUserDto, GetReportsQueryDto, GetUserReportsQueryDto, } from './admin.dto';
export declare class AdminService {
    private readonly postReportModel;
    private readonly userReportModel;
    private readonly postModel;
    private readonly userModel;
    private readonly withheldPostModel;
    private readonly withheldUserModel;
    constructor(postReportModel: Model<PostReport>, userReportModel: Model<UserReport>, postModel: Model<Post>, userModel: Model<User>, withheldPostModel: Model<WithheldPost>, withheldUserModel: Model<WithheldUser>);
    createPostReport(reportedBy: string, dto: CreatePostReportDto): Promise<PostReport>;
    createUserReport(reportedBy: string, dto: CreateUserReportDto): Promise<UserReport>;
    getPostReports(query: GetReportsQueryDto): Promise<{
        reports: PostReport[];
        total: number;
    }>;
    getPostReportById(reportId: string): Promise<PostReport>;
    updatePostReportStatus(reportId: string, reviewerId: string, dto: UpdateReportStatusDto): Promise<PostReport>;
    deletePostReport(reportId: string): Promise<void>;
    getPostReportsByPostId(postId: string): Promise<PostReport[]>;
    getPostReportsCount(postId: string): Promise<number>;
    getUserReports(query: GetUserReportsQueryDto): Promise<{
        reports: UserReport[];
        total: number;
    }>;
    getUserReportById(reportId: string): Promise<UserReport>;
    updateUserReportStatus(reportId: string, reviewerId: string, dto: UpdateUserReportStatusDto): Promise<UserReport>;
    deleteUserReport(reportId: string): Promise<void>;
    getUserReportsByUserId(userId: string): Promise<UserReport[]>;
    getUserReportsCount(userId: string): Promise<number>;
    getReportStatistics(): Promise<any>;
    withholdPost(postId: string, adminId: string, dto: WithholdPostDto): Promise<WithheldPost>;
    restorePost(withheldPostId: string): Promise<Post>;
    getWithheldPosts(page?: number, limit?: number): Promise<{
        posts: WithheldPost[];
        total: number;
    }>;
    getWithheldPostById(id: string): Promise<WithheldPost>;
    withholdUser(userId: string, adminId: string, dto: WithholdUserDto): Promise<WithheldUser>;
    restoreUser(withheldUserId: string): Promise<User>;
    getWithheldUsers(page?: number, limit?: number): Promise<{
        users: WithheldUser[];
        total: number;
    }>;
    getWithheldUserById(id: string): Promise<WithheldUser>;
}
