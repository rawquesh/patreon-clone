"use client";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  fetchNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
} from "@/lib/backend-services/notifications-service";
import {
  NotificationFilterDto,
  NotificationResponseDto,
} from "@/typings/INotification";
import { useAuth } from "@/context/auth.provider";

interface UserNotificationsContextType {
  notifications: NotificationResponseDto[];
  unreadCount: number;
  isLoading: boolean;
  error: Error | null;
  fetchMoreNotifications: (filters?: NotificationFilterDto) => Promise<void>;
  markNotificationAsRead: (id: string) => Promise<void>;
  markAllNotificationsAsRead: () => Promise<void>;
  refetchNotifications: (filters?: NotificationFilterDto) => Promise<void>;
}

const UserNotificationsContext = createContext<
  UserNotificationsContextType | undefined
>(undefined);

export function UserNotificationsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [notifications, setNotifications] = useState<NotificationResponseDto[]>(
    []
  );
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const { user } = useAuth();

  const [currentFilters, setCurrentFilters] = useState<NotificationFilterDto>(
    {}
  );

  const fetchUserNotifications = useCallback(
    async (filters: NotificationFilterDto = {}) => {
      if (!user) return;
      setIsLoading(true);
      setError(null);

      const mergedFilters = {
        ...currentFilters,
        ...filters,
        page: filters.page || currentPage,
        limit: 10,
        userMode: "member",
      };

      if (filters.type !== undefined) {
        setCurrentFilters((prev) => ({ ...prev, type: filters.type }));
      } else if (filters.type === undefined && "type" in filters) {
        setCurrentFilters((prev) => {
          const updated = { ...prev };
          delete updated.type;
          return updated;
        });
      }

      try {
        const data = await fetchNotifications(mergedFilters);

        setNotifications((prevNotifications) =>
          mergedFilters.page === 1
            ? data.notifications
            : [...prevNotifications, ...data.notifications]
        );

        setUnreadCount(data.unreadCount);
        setHasMore(data.notifications.length === 10);
      } catch (err: any) {
        setError(err);
        console.error("Error fetching notifications:", err);
      } finally {
        setIsLoading(false);
      }
    },
    [currentFilters, currentPage, user]
  );

  const fetchMoreNotifications = async (
    filters: NotificationFilterDto = {}
  ) => {
    if (!hasMore || isLoading) return;
    const nextPage = currentPage + 1;
    setCurrentPage(nextPage);
    await fetchUserNotifications({
      ...currentFilters,
      ...filters,
      page: nextPage,
    });
  };

  const markNotificationAsRead = async (id: string) => {
    try {
      const success = await markAsRead([id]);
      if (success) {
        setNotifications((prev) =>
          prev.map((notif) =>
            notif.id === id ? { ...notif, isRead: true } : notif
          )
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error("Error marking notification as read:", err);
    }
  };

  const markAllNotificationsAsRead = async () => {
    try {
      const success = await markAllAsRead();
      if (success) {
        setNotifications((prev) =>
          prev.map((notif) => ({ ...notif, isRead: true }))
        );
        setUnreadCount(0);
      }
    } catch (err) {
      console.error("Error marking all notifications as read:", err);
    }
  };

  const refetchNotifications = useCallback(
    async (filters: NotificationFilterDto = {}) => {
      setCurrentPage(1);
      await fetchUserNotifications({
        ...filters,
        page: 1,
        userMode: "member",
      });
    },
    [fetchUserNotifications]
  );

  useEffect(() => {
    if (user) {
      fetchUserNotifications();
    }
  }, [user, fetchUserNotifications]);

  useEffect(() => {
    if (!user) return;

    const fetchUnreadCount = async () => {
      try {
        const count = await getUnreadCount();
        if (count > unreadCount) {
          refetchNotifications();
        } else {
          setUnreadCount(count);
        }
      } catch (err) {
        console.error("Error polling notifications:", err);
      }
    };

    const intervalId = setInterval(fetchUnreadCount, 60000);
    return () => clearInterval(intervalId);
  }, [user, unreadCount, refetchNotifications]);

  const value = {
    notifications,
    unreadCount,
    isLoading,
    error,
    fetchMoreNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    refetchNotifications,
  };

  return (
    <UserNotificationsContext.Provider value={value}>
      {children}
    </UserNotificationsContext.Provider>
  );
}

export function useUserNotifications() {
  const context = useContext(UserNotificationsContext);
  if (context === undefined) {
    throw new Error(
      "useUserNotifications must be used within a UserNotificationsProvider"
    );
  }
  return context;
}
