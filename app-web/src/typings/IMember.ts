export interface Member {
	id: string;
	name: string;
	email: string;
	discord?: string;
	currentTier: string;
	address?: string;
	pledge: string;
	lifetime?: string;
	status: "Active" | "Inactive" | "Cancelled";
	joinDate: string;
	lastChargeDate?: string;
	nextChargeDate?: string;
	notes?: string;
	complete?: boolean;
	cancelDate?: string;
	accessExpiration?: string;
}

export interface MemberFilterParams {
	page?: number;
	limit?: number;
	search?: string;
	status?: string;
	tier?: string;
	joinDate?: string;
	sortBy?: "name" | "email" | "joinDate" | "currentTier" | "pledge";
	sortOrder?: "asc" | "desc";
}

export interface MembersResponse {
	members: Member[];
	pagination: {
		total: number;
		page: number;
		limit: number;
		totalPages: number;
	};
}
