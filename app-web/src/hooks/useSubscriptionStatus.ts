import { useSubscription } from "@/context/subscription.provider";

export const useSubscriptionStatus = (creatorId: string) => {
  const { isSubscribedTo, isLoading, isError, refetch } = useSubscription();
  return {
    isSubscribed: isSubscribedTo(creatorId),
    isLoading,
    isError,
    refetch,
  };
};
