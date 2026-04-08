export declare enum MemberSortBy {
    NAME = "name",
    EMAIL = "email",
    JOIN_DATE = "joinDate",
    TOTAL_PAID = "totalPaid",
    TIER = "tier",
    STATUS = "status"
}
export declare enum SortOrder {
    ASC = "asc",
    DESC = "desc"
}
export declare enum SubscriptionStatus {
    ACTIVE = "active",
    CANCELLED = "cancelled",
    EXPIRED = "expired"
}
export declare class GetMembersDto {
    page?: number;
    limit?: number;
    search?: string;
    status?: SubscriptionStatus;
    tier?: string;
    joinDate?: string;
    sortBy?: MemberSortBy;
    sortOrder?: SortOrder;
}
export declare class MemberTierDto {
    id: string;
    name: string;
    monthlyRate: number;
}
export declare class MemberDto {
    id: string;
    name: string;
    email: string;
    profilePicture?: string;
    tier: MemberTierDto;
    joinDate: Date;
    status: SubscriptionStatus;
    currentPeriodEnd: Date;
    totalPaid: number;
}
export declare class PaginationDto {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}
export declare class MembersResponseDto {
    members: MemberDto[];
    pagination: PaginationDto;
}
