import api from "@/lib/api";
import { ApiEndpoints } from "./api_endpoints";

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
  tier: {
    id: string;
    name: string;
    monthlyPrice: number;
  };
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

export const buildMemberQueryParams = (
  params: MemberFilterParams
): URLSearchParams => {
  const queryParams = new URLSearchParams();

  if (params.page) queryParams.append("page", params.page.toString());
  if (params.limit) queryParams.append("limit", params.limit.toString());
  if (params.search) queryParams.append("search", params.search);
  if (params.status) queryParams.append("status", params.status);
  if (params.tier) queryParams.append("tier", params.tier);
  if (params.joinDate) queryParams.append("joinDate", params.joinDate);
  if (params.sortBy) queryParams.append("sortBy", params.sortBy);
  if (params.sortOrder) queryParams.append("sortOrder", params.sortOrder);

  return queryParams;
};

export const fetchMembers = async (
  params: MemberFilterParams = {}
): Promise<MembersResponse> => {
  try {
    const queryParams = buildMemberQueryParams(params);
    const { data } = await api.get(`${ApiEndpoints.members}?${queryParams}`);
    return data;
  } catch (error) {
    console.error("Error fetching members:", error);

    return getMockMembersData(params);
  }
};

export const exportMembersToCSV = async (
  params: MemberFilterParams = {}
): Promise<Blob> => {
  try {
    const queryParams = buildMemberQueryParams(params);
    const response = await api.get(`${ApiEndpoints.membersExport}?${queryParams}`, {
      responseType: "blob",
    });
    return new Blob([response.data], { type: "text/csv" });
  } catch (error) {
    console.error("Error exporting members to CSV:", error);
    throw error;
  }
};

const getMockMembersData = (params: MemberFilterParams): MembersResponse => {
  const allMembers: Member[] = [];

  let filteredMembers = [...allMembers];
  if (params.search) {
    const search = params.search.toLowerCase();
    filteredMembers = filteredMembers.filter(
      (member) =>
        member.name.toLowerCase().includes(search) ||
        member.email.toLowerCase().includes(search)
    );
  }

  if (params.status) {
    filteredMembers = filteredMembers.filter(
      (member) => member.status === params.status
    );
  }

  if (params.tier) {
    filteredMembers = filteredMembers.filter(
      (member) => member.currentTier === params.tier
    );
  }

  if (params.joinDate === "thisMonth") {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    filteredMembers = filteredMembers.filter((member) => {
      const joinDate = new Date(member.joinDate);
      return (
        joinDate.getMonth() === currentMonth &&
        joinDate.getFullYear() === currentYear
      );
    });
  }

  if (params.sortBy) {
    filteredMembers.sort((a, b) => {
      let aValue = a[params.sortBy!] || "";
      let bValue = b[params.sortBy!] || "";

      if (params.sortBy === "joinDate") {
        return new Date(aValue).getTime() - new Date(bValue).getTime();
      }

      if (typeof aValue === "string") aValue = aValue.toLowerCase();
      if (typeof bValue === "string") bValue = bValue.toLowerCase();

      if (aValue < bValue) return params.sortOrder === "desc" ? 1 : -1;
      if (aValue > bValue) return params.sortOrder === "desc" ? -1 : 1;
      return 0;
    });
  }

  const page = params.page || 1;
  const limit = params.limit || 10;
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedMembers = filteredMembers.slice(startIndex, endIndex);

  return {
    members: paginatedMembers,
    pagination: {
      total: filteredMembers.length,
      page,
      limit,
      totalPages: Math.ceil(filteredMembers.length / limit),
    },
  };
};
