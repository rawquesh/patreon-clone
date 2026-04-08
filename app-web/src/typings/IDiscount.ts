export enum DiscountType {
	PERCENTAGE = "percentage",
	FLAT = "flat",
}

export enum DiscountStatus {
	ACTIVE = "active",
	INACTIVE = "inactive",
}

export enum DiscountApplicability {
	ALL = "all",
	SELECTED = "selected",
}

export enum GiftType {
	FREE_TRIAL = "free_trial",
	FREE_CONTENT = "free_content",
}

export interface IDiscount {
	id: string;
	title: string;
	code: string;
	description?: string;
	status: DiscountStatus;
	redeemed: number;
	percentageType: DiscountType;
	discountNumber: number;
	applicableTo: DiscountApplicability;
	applicableTiers?: {
		id: string;
		name: string;
	}[];
	startDate: string;
	endDate: string;
	isPublic: boolean;
	createdAt: string;
	updatedAt: string;
}

export interface IGift {
	id: string;
	title: string;
	code: string;
	description?: string;
	status: DiscountStatus;
	redeemed: number;
	giftType: GiftType;
	durationDays: number;
	applicableTo: DiscountApplicability;
	applicableTiers?: {
		id: string;
		name: string;
	}[];
	startDate: string;
	endDate: string;
	isPublic: boolean;
	createdAt: string;
	updatedAt: string;
}

export interface CreateDiscountDto {
	title: string;
	code: string;
	description?: string;
	percentageType: DiscountType;
	discountNumber: number;
	applicableTo: DiscountApplicability;
	applicableTiers?: string[];
	startDate: string;
	endDate: string;
	isPublic?: boolean;
}

export interface UpdateDiscountDto {
	title?: string;
	description?: string;
	status?: DiscountStatus;
	percentageType?: DiscountType;
	discountNumber?: number;
	applicableTo?: DiscountApplicability;
	applicableTiers?: string[];
	startDate?: string;
	endDate?: string;
	isPublic?: boolean;
}

export interface CreateGiftDto {
	title: string;
	code: string;
	description?: string;
	giftType: GiftType;
	durationDays: number;
	applicableTo: DiscountApplicability;
	applicableTiers?: string[];
	startDate: string;
	endDate: string;
	isPublic?: boolean;
}

export interface UpdateGiftDto {
	title?: string;
	description?: string;
	status?: DiscountStatus;
	giftType?: GiftType;
	durationDays?: number;
	applicableTo?: DiscountApplicability;
	applicableTiers?: string[];
	startDate?: string;
	endDate?: string;
	isPublic?: boolean;
}
