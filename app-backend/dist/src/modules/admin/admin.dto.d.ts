import { ReportReason, ReportStatus, UserReportReason } from '@/database/schemas/report/enums';
export declare class CreatePostReportDto {
    postId: string;
    reason: ReportReason;
    description: string;
    additionalContext?: string;
}
export declare class UpdateReportStatusDto {
    status: ReportStatus;
    adminNotes?: string;
}
export declare class GetReportsQueryDto {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    status?: ReportStatus;
    reportedBy?: string;
    postId?: string;
}
export declare class CreateUserReportDto {
    userId: string;
    reason: UserReportReason;
    description: string;
    additionalContext?: string;
}
export declare class UpdateUserReportStatusDto {
    status: ReportStatus;
    adminNotes?: string;
}
export declare class GetUserReportsQueryDto {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    status?: ReportStatus;
    reportedBy?: string;
    userId?: string;
}
export declare class WithholdPostDto {
    reason: string;
    adminNotes?: string;
    relatedReportId?: string;
}
export declare class RestorePostDto {
}
export declare class WithholdUserDto {
    reason: string;
    adminNotes?: string;
    relatedReportId?: string;
}
export declare class RestoreUserDto {
}
