import api from "@/lib/api";
import {
  NotificationFilterDto,
  NotificationResponseDto,
  MarkReadDto,
} from "@/typings/INotification";

export const fetchNotifications = async (
  filterDto: NotificationFilterDto = {}
): Promise<{
  notifications: NotificationResponseDto[];
  unreadCount: number;
}> => {
  try {
    const params = { ...filterDto };

    const { data } = await api.get("/notifications", { params });
    return data;
  } catch (error) {
    console.error("Error fetching notifications:", error);
    throw error;
  }
};

export const getUnreadCount = async (): Promise<number> => {
  try {
    const { data } = await api.get("/notifications/count");
    return data.count;
  } catch (error) {
    console.error("Error fetching unread count:", error);
    return 0;
  }
};

export const markAsRead = async (ids: string[]): Promise<boolean> => {
  try {
    const { data } = await api.post("/notifications/mark-read", {
      ids,
    } as MarkReadDto);
    return data.success;
  } catch (error) {
    console.error("Error marking notifications as read:", error);
    return false;
  }
};

export const markAllAsRead = async (): Promise<boolean> => {
  try {
    const { data } = await api.post("/notifications/mark-all-read");
    return data.success;
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    return false;
  }
};

export const deleteNotification = async (id: string): Promise<boolean> => {
  try {
    const { data } = await api.delete(`/notifications/${id}`);
    return data.success;
  } catch (error) {
    console.error("Error deleting notification:", error);
    return false;
  }
};
