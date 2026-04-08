import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../api";
import {
  IMembership,
  SubscriptionResponse,
  SubscriptionsResponse,
  ICheckSubscriptionResponse,
  SubscriptionFilterParams,
  IPromotionValidationResponse,
  IPromotionRedemptionResponse,
} from "@/typings/ISubscription";
import { toastHandlers, getErrorMessage } from "@/lib/toasts";
import { useSubscription } from "@/context/subscription.provider";

export const useCreatorMemberships = (creatorId: string) => {
  return useQuery({
    queryKey: ["creatorMemberships", creatorId],
    queryFn: async () => {
      const { data } = await api.get<IMembership[]>(
        `/memberships/creator/${creatorId}`
      );
      return data;
    },
    enabled: !!creatorId,
  });
};

/**
 * Hook to get a specific membership by ID
 */
export const useMembershipDetails = (membershipId: string) => {
  return useQuery({
    queryKey: ["membership", membershipId],
    queryFn: async () => {
      try {
        if (membershipId === "free") {
          return {
            id: "free",
            name: "Free Membership",
            description: "Access to free content from this creator",
            monthlyRate: 0,
            isActive: true,
            benefits: ["Access to public posts", "Join the community"],
            isTrial: false,
          } as IMembership;
        }

        const { data } = await api.get<IMembership>(
          `/memberships/${membershipId}`
        );

        // If we got an array of memberships, return the first one
        if (Array.isArray(data)) {
          return data[0];
        }

        return data;
      } catch (error) {
        console.error("Error fetching membership:", error);
        throw error;
      }
    },
    enabled: !!membershipId,
  });
};

/**
 * Hook to check if the current user is subscribed to a creator
 * Uses the subscription context for efficiency
 */
export const useSubscriptionStatus = (creatorId: string) => {
  const { isSubscribedTo, isLoading, isError, subscriptions } =
    useSubscription();

  // Find subscription for this creator if it exists
  const subscription = subscriptions.find(
    (sub) => sub.creator._id === creatorId && sub.status === "active"
  );

  return {
    data: {
      isSubscribed: isSubscribedTo(creatorId),
      subscription: subscription,
    },
    isLoading,
    isError,
  };
};

/**
 * Hook to get all of the current user's active subscriptions
 */
export const useUserSubscriptions = (filters?: SubscriptionFilterParams) => {
  return useQuery({
    queryKey: ["userSubscriptions", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.page) params.append("page", filters.page.toString());
      if (filters?.limit) params.append("limit", filters.limit.toString());
      if (filters?.status) params.append("status", filters.status);

      const { data } = await api.get<SubscriptionsResponse>(
        `/memberships/subscriber?${params}`
      );
      return data;
    },
  });
};

/**
 * Hook to validate a promotion code
 */
export const useValidatePromotion = () => {
  return useMutation({
    mutationFn: async ({
      code,
      membershipId,
    }: {
      code: string;
      membershipId: string;
    }) => {
      const { data } = await api.post<IPromotionValidationResponse>(
        "/promotions/validate",
        {
          code,
          membershipId,
        }
      );
      return data;
    },
  });
};

export const useSubscribeToPaidMembership = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      membershipId,
      promotionCode,
    }: {
      membershipId: string;
      promotionCode?: string;
    }) => {
      const payload = promotionCode ? { promotionCode } : {};
      const { data } = await api.post<SubscriptionResponse>(
        `memberships/checkout/${membershipId}`,
        payload
      );
      return data;
    },
    onSuccess: (data) => {
      console.log("data", data);
      queryClient.invalidateQueries({
        queryKey: ["userSubscriptions", "active"],
      });
      // queryClient.invalidateQueries({
      //   queryKey: ["subscriptionStatus", data.subscription.creatorId],
      // });

      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        toastHandlers.subscriptionSuccess();
      }
    },
    onError: (error: unknown) => {
      toastHandlers.subscriptionError(getErrorMessage(error, "Failed to subscribe to membership"));
    },
  });
};

/**
 * Hook to subscribe to a free membership
 */
export const useSubscribeToFreeMembership = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (creatorId: string) => {
      // For free memberships, we just add a subscription without a specific membership
      // Find the free membership ID for this creator first
      const { data: memberships } = await api.get<IMembership[]>(
        `/memberships/creator/${creatorId}`
      );

      // Get the free membership or use a default ID
      const freeMembership = memberships.find((m) => m.monthlyRate === 0) || {
        id: "free",
      };

      // Use the regular subscription endpoint
      const { data } = await api.post<SubscriptionResponse>(
        `/memberships/subscribe/${freeMembership.id}`
      );

      return data;
    },
    onSuccess: (data) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({
        queryKey: ["userSubscriptions", "active"],
      });
      queryClient.invalidateQueries({
        queryKey: ["subscriptionStatus", data.subscription.creator._id],
      });
      toastHandlers.joinedSuccess();
    },
    onError: (error: unknown) => {
      toastHandlers.subscriptionError(getErrorMessage(error, "Failed to join as a free member"));
    },
  });
};

/**
 * Hook to cancel a subscription
 */
export const useCancelSubscription = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (subscriptionId: string) => {
      const { data } = await api.delete<{ success: boolean }>(
        `/memberships/subscribe/${subscriptionId}`
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userSubscriptions"] });
      toastHandlers.subscriptionCancelled();
    },
    onError: (error: unknown) => {
      toastHandlers.cancellationError(getErrorMessage(error, "Failed to cancel subscription"));
    },
  });
};

export const useRedeemPromotion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      code,
      membershipId,
    }: {
      code: string;
      membershipId: string;
    }) => {
      const { data } = await api.post<IPromotionRedemptionResponse>(
        "/promotions/redeem",
        { code, membershipId }
      );
      return data;
    },
    onSuccess: (data) => {
      if (data.subscription) {
        queryClient.invalidateQueries({ queryKey: ["userSubscriptions"] });
        queryClient.invalidateQueries({
          queryKey: ["subscriptionStatus", data.subscription.creator._id],
        });

        // Handle checkout if needed
        if (data.checkoutUrl) {
          window.location.href = data.checkoutUrl;
        } else {
          toastHandlers.promotionRedeemed(data.message);
        }
      } else {
        toastHandlers.promotionRedeemed(data.message);
      }
    },
    onError: (error: unknown) => {
      toastHandlers.redemptionError(getErrorMessage(error, "Failed to redeem promotion code"));
    },
  });
};

// ================ DIRECT API FUNCTIONS ================

/**
 * Get all memberships for a creator
 */
export const getCreatorMemberships = async (
  creatorId: string
): Promise<IMembership[]> => {
  try {
    const { data } = await api.get<IMembership[]>(
      `/memberships/creator/${creatorId}`
    );
    return data;
  } catch (error) {
    console.error("Error fetching creator memberships:", error);
    throw error;
  }
};

/**
 * Check if a user is subscribed to a creator
 */
export const checkSubscription = async (
  creatorId: string
): Promise<ICheckSubscriptionResponse> => {
  try {
    const { data } = await api.get<ICheckSubscriptionResponse>(
      `/memberships/check/${creatorId}`
    );
    return data;
  } catch (error) {
    console.error("Error checking subscription:", error);
    return { isSubscribed: false };
  }
};

/**
 * Get all of a user's subscriptions
 */
export const getUserSubscriptions = async (
  filters?: SubscriptionFilterParams
): Promise<SubscriptionsResponse> => {
  try {
    const params = new URLSearchParams();
    if (filters?.page) params.append("page", filters.page.toString());
    if (filters?.limit) params.append("limit", filters.limit.toString());
    if (filters?.status) params.append("status", filters.status);

    const { data } = await api.get<SubscriptionsResponse>(
      `/memberships/subscriber?${params}`
    );
    return data;
  } catch (error) {
    console.error("Error fetching user subscriptions:", error);
    throw error;
  }
};

/**
 * Subscribe to a paid membership
 */
export const subscribeToPaidMembership = async (
  membershipId: string,
  promotionCode?: string
): Promise<SubscriptionResponse> => {
  try {
    const payload = promotionCode ? { promotionCode } : {};
    const { data } = await api.post<SubscriptionResponse>(
      `memberships/checkout/${membershipId}`,
      payload
    );
    return data;
  } catch (error) {
    console.error("Error subscribing to paid membership:", error);
    throw error;
  }
};

/**
 * Subscribe to a free membership
 */
export const subscribeToFreeMembership = async (
  creatorId: string
): Promise<SubscriptionResponse> => {
  try {
    const { data } = await api.post<SubscriptionResponse>(
      `/memberships/subscribe/free/${creatorId}`
    );
    return data;
  } catch (error) {
    console.error("Error subscribing to free membership:", error);
    throw error;
  }
};

/**
 * Cancel a subscription
 */
export const cancelSubscription = async (
  subscriptionId: string
): Promise<{ success: boolean }> => {
  try {
    const { data } = await api.delete<{ success: boolean }>(
      `/memberships/subscribe/${subscriptionId}`
    );
    return data;
  } catch (error) {
    console.error("Error cancelling subscription:", error);
    throw error;
  }
};

/**
 * Validate a promotion code
 */
export const validatePromotion = async (
  code: string,
  membershipId: string
): Promise<IPromotionValidationResponse> => {
  try {
    const { data } = await api.post<IPromotionValidationResponse>(
      "/promotions/validate",
      { code, membershipId }
    );
    return data;
  } catch (error) {
    console.error("Error validating promotion:", error);
    throw error;
  }
};

/**
 * Redeem a promotion code
 */
export const redeemPromotion = async (
  code: string,
  membershipId: string
): Promise<IPromotionRedemptionResponse> => {
  try {
    const { data } = await api.post<IPromotionRedemptionResponse>(
      "/promotions/redeem",
      { code, membershipId }
    );
    return data;
  } catch (error) {
    console.error("Error redeeming promotion:", error);
    throw error;
  }
};
