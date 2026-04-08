"use client";
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { useAuth } from "./auth.provider";
import api from "@/lib/api";
import { ISubscription } from "@/typings/ISubscription";

interface SubscriptionContextType {
  subscriptions: ISubscription[];
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
  isSubscribedTo: (creatorId: string) => boolean;
}

const SubscriptionContext = createContext<SubscriptionContextType>({
  subscriptions: [],
  isLoading: false,
  isError: false,
  refetch: () => {},
  isSubscribedTo: () => false,
});

export const useSubscription = () => useContext(SubscriptionContext);

export const SubscriptionProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [subscriptions, setSubscriptions] = useState<ISubscription[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const { user } = useAuth();

  const fetchSubscriptions = useCallback(async () => {
    if (!user) {
      setSubscriptions([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setIsError(false);

    try {
      const response = await api.get("/users/subscriptions");
      if (response.data && response.data.activeSubscriptions) {
        setSubscriptions(response.data.activeSubscriptions);
      } else {
        setSubscriptions([]);
      }
    } catch (error) {
      console.error("Error fetching subscriptions:", error);
      setIsError(true);
      setSubscriptions([]);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchSubscriptions();
  }, [user, fetchSubscriptions]);

  const isSubscribedTo = (creatorId: string): boolean => {
    if (!subscriptions.length) return false;
    console.log(creatorId, subscriptions[0].creator._id);
    return subscriptions.some(
      (subscription) =>
        subscription.creator._id === creatorId &&
        subscription.status === "active"
    );
  };

  return (
    <SubscriptionContext.Provider
      value={{
        subscriptions,
        isLoading,
        isError,
        refetch: fetchSubscriptions,
        isSubscribedTo,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
};
