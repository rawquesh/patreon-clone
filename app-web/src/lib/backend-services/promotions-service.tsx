import api from "@/lib/api";
import { ApiEndpoints } from "./api_endpoints";
import {
	CreateDiscountDto,
	CreateGiftDto,
	IDiscount,
	IGift,
	UpdateDiscountDto,
	UpdateGiftDto,
} from "@/typings/IDiscount";

export const fetchDiscounts = async (): Promise<IDiscount[]> => {
	try {
		const { data } = await api.get(ApiEndpoints.promotionsDiscounts);
		return data.discounts;
	} catch (error) {
		console.error("Error fetching discounts:", error);
		throw error;
	}
};

export const fetchDiscount = async (id: string): Promise<IDiscount> => {
	try {
		const { data } = await api.get(ApiEndpoints.discountById(id));
		return data;
	} catch (error) {
		console.error(`Error fetching discount ${id}:`, error);
		throw error;
	}
};

export const createDiscount = async (
	discount: CreateDiscountDto
): Promise<IDiscount> => {
	try {
		const { data } = await api.post(ApiEndpoints.promotionsDiscounts, discount);
		return data;
	} catch (error) {
		console.error("Error creating discount:", error);
		throw error;
	}
};

export const updateDiscount = async (
	id: string,
	discount: UpdateDiscountDto
): Promise<IDiscount> => {
	try {
		const { data } = await api.put(ApiEndpoints.discountById(id), discount);
		return data;
	} catch (error) {
		console.error(`Error updating discount ${id}:`, error);
		throw error;
	}
};

export const deleteDiscount = async (
	id: string
): Promise<{ success: boolean }> => {
	try {
		const { data } = await api.delete(ApiEndpoints.discountById(id));
		return data;
	} catch (error) {
		console.error(`Error deleting discount ${id}:`, error);
		throw error;
	}
};

export const generateDiscountCode = async (): Promise<string> => {
	try {
		const { data } = await api.post(ApiEndpoints.promotionsDiscountsGenerateCode);
		return data.code;
	} catch (error) {
		console.error("Error generating discount code:", error);
		return generateRandomCode();
	}
};

export const fetchGifts = async (): Promise<IGift[]> => {
	try {
		const { data } = await api.get(ApiEndpoints.promotionsGifts);
		return data.gifts;
	} catch (error) {
		console.error("Error fetching gifts:", error);
		throw error;
	}
};

export const fetchGift = async (id: string): Promise<IGift> => {
	try {
		const { data } = await api.get(ApiEndpoints.giftById(id));
		return data;
	} catch (error) {
		console.error(`Error fetching gift ${id}:`, error);
		throw error;
	}
};

export const createGift = async (gift: CreateGiftDto): Promise<IGift> => {
	try {
		const { data } = await api.post(ApiEndpoints.promotionsGifts, gift);
		return data;
	} catch (error) {
		console.error("Error creating gift:", error);
		throw error;
	}
};

export const updateGift = async (
	id: string,
	gift: UpdateGiftDto
): Promise<IGift> => {
	try {
		const { data } = await api.put(ApiEndpoints.giftById(id), gift);
		return data;
	} catch (error) {
		console.error(`Error updating gift ${id}:`, error);
		throw error;
	}
};

export const deleteGift = async (id: string): Promise<{ success: boolean }> => {
	try {
		const { data } = await api.delete(ApiEndpoints.giftById(id));
		return data;
	} catch (error) {
		console.error(`Error deleting gift ${id}:`, error);
		throw error;
	}
};

export const generateGiftCode = async (): Promise<string> => {
	try {
		const { data } = await api.post(ApiEndpoints.promotionsGiftsGenerateCode);
		return data.code;
	} catch (error) {
		console.error("Error generating gift code:", error);
		return generateRandomCode();
	}
};

export const validatePromotion = async (
	code: string
): Promise<{
	isValid: boolean;
	message: string;
	promotion?: IDiscount | IGift;
}> => {
	try {
		const { data } = await api.post(ApiEndpoints.promotionsDiscountsValidate, { code });
		return data;
	} catch (error) {
		console.error(`Error validating promotion code ${code}:`, error);
		throw error;
	}
};

export const redeemPromotion = async (
	code: string,
	membershipId: string
): Promise<any> => {
	try {
		const { data } = await api.post(ApiEndpoints.promotionsDiscountsRedeem, {
			code,
			membershipId,
		});
		return data;
	} catch (error) {
		console.error(`Error redeeming promotion code ${code}:`, error);
		throw error;
	}
};

const generateRandomCode = (length: number = 8): string => {
	const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
	let result = "";
	for (let i = 0; i < length; i++) {
		result += characters.charAt(Math.floor(Math.random() * characters.length));
	}
	return result;
};
