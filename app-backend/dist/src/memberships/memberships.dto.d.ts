export declare class CreateMembershipDto {
    name: string;
    description: string;
    monthlyRate: number;
    benefits?: string[];
    isActive?: boolean;
    isFeatured?: boolean;
}
export declare class CreateMembershipWithFileDto extends CreateMembershipDto {
    coverImage?: string;
}
export declare class UpdateMembershipDto {
    name?: string;
    description?: string;
    monthlyRate?: number;
    benefits?: string[];
    isActive?: boolean;
    isFeatured?: boolean;
    coverImage?: string;
}
export declare class CreatePayoutRequestDto {
    amount: number;
}
export declare class GetMembershipsQueryDto {
    page?: number;
    limit?: number;
    activeOnly?: boolean;
}
