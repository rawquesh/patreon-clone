import { UserNotificationsProvider } from "@/context/user-notifications.provider";
import NotificationsPage from "@/page-components/notifications-page";
import React from "react";

const Notifications: React.FC = () => {
  return (
    <UserNotificationsProvider>
      <NotificationsPage />
    </UserNotificationsProvider>
  );
};

export default Notifications;
