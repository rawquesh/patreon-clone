import { AdminService } from './admin.service';
import { CreatePostReportDto, CreateUserReportDto, UpdateReportStatusDto, UpdateUserReportStatusDto, GetReportsQueryDto, GetUserReportsQueryDto, WithholdPostDto, WithholdUserDto } from './admin.dto';
export declare class AdminController {
    private readonly adminService;
    constructor(adminService: AdminService);
    createPostReport(req: any, createPostReportDto: CreatePostReportDto): Promise<{
        message: string;
        report: import("../../database").PostReport;
    }>;
    createUserReport(req: any, createUserReportDto: CreateUserReportDto): Promise<{
        message: string;
        report: import("../../database").UserReport;
    }>;
    getPostReports(query: GetReportsQueryDto): Promise<{
        reports: import("../../database").PostReport[];
        pagination: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    getReportsByPostId(postId: string): Promise<{
        reports: import("../../database").PostReport[];
        count: number;
    }>;
    getPostReportById(id: string): Promise<{
        report: import("../../database").PostReport;
    }>;
    updatePostReportStatus(req: any, id: string, updateStatusDto: UpdateReportStatusDto): Promise<{
        message: string;
        report: import("../../database").PostReport;
    }>;
    deletePostReport(id: string): Promise<{
        message: string;
    }>;
    getUserReports(query: GetUserReportsQueryDto): Promise<{
        reports: import("../../database").UserReport[];
        pagination: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    getReportsByUserId(userId: string): Promise<{
        reports: import("../../database").UserReport[];
        count: number;
    }>;
    getUserReportById(id: string): Promise<{
        report: import("../../database").UserReport;
    }>;
    updateUserReportStatus(req: any, id: string, updateStatusDto: UpdateUserReportStatusDto): Promise<{
        message: string;
        report: import("../../database").UserReport;
    }>;
    deleteUserReport(id: string): Promise<{
        message: string;
    }>;
    getReportStatistics(): Promise<{
        statistics: any;
    }>;
    withholdPost(req: any, postId: string, withholdDto: WithholdPostDto): Promise<{
        message: string;
        withheldPost: import("../../database").WithheldPost;
    }>;
    restorePost(withheldPostId: string): Promise<{
        message: string;
        post: import("../../database").Post;
    }>;
    getWithheldPosts(page?: number, limit?: number): Promise<{
        posts: import("../../database").WithheldPost[];
        pagination: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    getWithheldPostById(id: string): Promise<{
        post: import("../../database").WithheldPost;
    }>;
    withholdUser(req: any, userId: string, withholdDto: WithholdUserDto): Promise<{
        message: string;
        withheldUser: import("../../database").WithheldUser;
    }>;
    restoreUser(withheldUserId: string): Promise<{
        message: string;
        user: import("../../database").User;
    }>;
    getWithheldUsers(page?: number, limit?: number): Promise<{
        users: import("../../database").WithheldUser[];
        pagination: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    getWithheldUserById(id: string): Promise<{
        user: import("../../database").WithheldUser;
    }>;
}
