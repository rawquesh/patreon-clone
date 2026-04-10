import api from "@/lib/api";
import { ApiEndpoints } from "./api_endpoints";
import {
  TimeRange,
  EarningsFilter,
  MembershipInsightsResponse,
  EarningsInsightsResponse,
  PostsInsightsResponse,
} from "@/typings/insights";

export const fetchMembershipInsights = async (
  timeRange: TimeRange | string = TimeRange.THIRTY_DAYS
): Promise<MembershipInsightsResponse> => {
  try {
    const { data } = await api.get(
      `${ApiEndpoints.analyticsMemberships}?timeRange=${timeRange}`
    );
    return data;
  } catch (error) {
    console.error("Error fetching membership insights:", error);
    throw error;
  }
};

export const fetchEarningsInsights = async (
  timeRange: TimeRange | string = TimeRange.SIX_MONTHS,
  filter: EarningsFilter = EarningsFilter.ALL
): Promise<EarningsInsightsResponse> => {
  try {
    const { data } = await api.get(
      `${ApiEndpoints.analyticsEarnings}?timeRange=${timeRange}&filter=${filter}`
    );
    console.log(`/analytics/earnings?timeRange=${timeRange}&filter=${filter}`);
    console.log(data);
    return data;
  } catch (error) {
    console.error("Error fetching earnings insights:", error);
    throw error;
  }
};

export const fetchPostsInsights = async (
  timeRange: TimeRange | string = TimeRange.FOURTEEN_DAYS
): Promise<PostsInsightsResponse> => {
  try {
    const { data } = await api.get(`${ApiEndpoints.analyticsPosts}?timeRange=${timeRange}`);
    return data;
  } catch (error) {
    console.error("Error fetching posts insights:", error);
    throw error;
  }
};
